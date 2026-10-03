<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use App\Models\ActivityLog;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Get all projects for the authenticated user
     * GET /api/v1/projects
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Project::with([
            'supervisor',
            'creator',
            'researchArea',
            'members.user',
            'tasks'
        ])->forUser($user->id);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('research_area_id')) {
            $query->where('research_area_id', $request->research_area_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $projects = $query->latest()->paginate($request->per_page ?? 10);

        // Transform response
        $projects->getCollection()->transform(function ($project) {
            return $this->transformProject($project);
        });

        return response()->json([
            'success' => true,
            'message' => 'Projects retrieved successfully',
            'data' => $projects,
        ]);
    }

    /**
     * Get a single project
     * GET /api/v1/projects/{id}
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $project = Project::with([
            'supervisor',
            'creator',
            'researchArea',
            'members.user',
            'tasks'
        ])->findOrFail($id);

        // Check if user has access
        if (!$project->isMember($user->id) && !$project->isCreator($user->id) && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this project',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $this->transformProject($project),
        ]);
    }

    /**
     * Create a new project
     * POST /api/v1/projects
     */
    public function store(StoreProjectRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        $project = Project::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'research_area_id' => $validated['research_area_id'],
            'supervisor_id' => $validated['supervisor_id'] ?? $user->id,
            'created_by' => $user->id,
            'start_date' => $validated['start_date'],
            'deadline' => $validated['deadline'] ?? null,
            'status' => $validated['status'] ?? 'planning',
            'progress_pct' => 0,
            'is_public' => $validated['is_public'] ?? false,
        ]);

        // Add creator as admin member
        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'admin',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        // Add supervisor as member if different from creator
        if (($validated['supervisor_id'] ?? null) && $validated['supervisor_id'] !== $user->id) {
            ProjectMember::create([
                'project_id' => $project->id,
                'user_id' => $validated['supervisor_id'],
                'role' => 'supervisor',
                'joined_at' => now(),
                'is_active' => true,
            ]);
        }

        // Add additional members if provided
        if (isset($validated['member_ids']) && is_array($validated['member_ids'])) {
            foreach ($validated['member_ids'] as $memberId) {
                if ($memberId !== $user->id && $memberId !== ($validated['supervisor_id'] ?? null)) {
                    ProjectMember::create([
                        'project_id' => $project->id,
                        'user_id' => $memberId,
                        'role' => 'member',
                        'joined_at' => now(),
                        'is_active' => true,
                    ]);
                }
            }
        }

        // Log activity
        $this->logActivity($user->id, 'created', $project->id, ['title' => $project->title]);

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully',
            'data' => $this->transformProject($project->fresh()),
        ], 201);
    }

    /**
     * Update a project
     * PUT /api/v1/projects/{id}
     */
    public function update(UpdateProjectRequest $request, $id)
    {
        $user = $request->user();

        $project = Project::findOrFail($id);

        // Check if user can edit
        if (!$project->canEdit($user->id) && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit this project',
            ], 403);
        }

        $validated = $request->validated();

        // If status is being set to completed, set completed_at
        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $validated['completed_at'] = now();
        }

        // If status is being changed from completed, remove completed_at
        if (isset($validated['status']) && $validated['status'] !== 'completed') {
            $validated['completed_at'] = null;
        }

        $project->update($validated);

        // Log activity
        $this->logActivity($user->id, 'updated', $project->id, ['title' => $project->title]);

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully',
            'data' => $this->transformProject($project->fresh()),
        ]);
    }

    /**
     * Delete a project
     * DELETE /api/v1/projects/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $project = Project::withTrashed()->findOrFail($id);

        // Check if user can delete
        if (!$project->isCreator($user->id) && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only the project creator or admin can delete this project',
            ], 403);
        }

        // Soft delete
        $project->delete();

        // Log activity
        $this->logActivity($user->id, 'deleted', $project->id, ['title' => $project->title]);

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully',
        ]);
    }

    /**
     * Get project members
     * GET /api/v1/projects/{id}/members
     */
    public function members(Request $request, $id)
    {
        $user = $request->user();

        $project = Project::findOrFail($id);

        // Check if user has access
        if (!$project->isMember($user->id) && !$project->isCreator($user->id) && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this project',
            ], 403);
        }

        $members = ProjectMember::with('user')
            ->where('project_id', $project->id)
            ->where('is_active', true)
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'name' => $member->user->full_name,
                    'email' => $member->user->email,
                    'profile_picture' => $member->user->profile_picture,
                    'role' => $member->role,
                    'role_label' => $member->role_label,
                    'joined_at' => $member->joined_at->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $members,
        ]);
    }

    /**
     * Add a member to a project
     * POST /api/v1/projects/{id}/members
     */
    public function addMember(Request $request, $id)
    {
        $user = $request->user();

        $project = Project::findOrFail($id);

        // Check if user can manage members
        if (!$project->canManageMembers($user->id) && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to add members to this project',
            ], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'nullable|in:supervisor,co_supervisor,member,viewer',
        ]);

        // Check if user is already a member
        $existing = ProjectMember::where('project_id', $project->id)
            ->where('user_id', $validated['user_id'])
            ->first();

        if ($existing) {
            if ($existing->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is already a member of this project',
                ], 422);
            }

            // Reactivate inactive member
            $existing->update([
                'is_active' => true,
                'left_at' => null,
                'joined_at' => now(),
                'role' => $validated['role'] ?? 'member',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Member reactivated successfully',
                'data' => $existing->load('user'),
            ]);
        }

        $member = ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $validated['user_id'],
            'role' => $validated['role'] ?? 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        // Log activity
        $this->logActivity($user->id, 'added_member', $project->id, [
            'project_title' => $project->title,
            'member_id' => $validated['user_id']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member added successfully',
            'data' => $member->load('user'),
        ], 201);
    }

    /**
     * Remove a member from a project
     * DELETE /api/v1/projects/{id}/members/{memberId}
     */
    public function removeMember(Request $request, $id, $memberId)
    {
        $user = $request->user();

        $project = Project::findOrFail($id);

        // Check if user can manage members
        if (!$project->canManageMembers($user->id) && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to remove members from this project',
            ], 403);
        }

        $member = ProjectMember::where('project_id', $project->id)
            ->where('id', $memberId)
            ->where('is_active', true)
            ->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found or already removed',
            ], 404);
        }

        // Prevent removing the creator
        if ($member->user_id === $project->created_by) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot remove the project creator',
            ], 422);
        }

        $member->update([
            'is_active' => false,
            'left_at' => now(),
        ]);

        // Log activity
        $this->logActivity($user->id, 'removed_member', $project->id, [
            'project_title' => $project->title,
            'member_id' => $member->user_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member removed successfully',
        ]);
    }

    /**
     * Transform project data for API response
     */
    private function transformProject($project): array
    {
        return [
            'id' => $project->id,
            'title' => $project->title,
            'description' => $project->description,
            'status' => $project->status,
            'status_label' => $project->status_label,
            'status_color' => $project->status_color,
            'progress' => $project->progress_pct,
            'start_date' => $project->start_date->toDateString(),
            'deadline' => $project->deadline ? $project->deadline->toDateString() : null,
            'is_public' => $project->is_public,
            'created_at' => $project->created_at->toISOString(),
            'updated_at' => $project->updated_at->toISOString(),
            'completed_at' => $project->completed_at ? $project->completed_at->toISOString() : null,
            'supervisor' => $project->supervisor ? [
                'id' => $project->supervisor->id,
                'name' => $project->supervisor->full_name,
                'email' => $project->supervisor->email,
            ] : null,
            'creator' => [
                'id' => $project->creator->id,
                'name' => $project->creator->full_name,
                'email' => $project->creator->email,
            ],
            'research_area' => $project->researchArea ? [
                'id' => $project->researchArea->id,
                'name' => $project->researchArea->name,
            ] : null,
            'members_count' => $project->member_count,
            'tasks_count' => $project->task_count,
            'completed_tasks' => $project->completed_task_count,
            'members' => $project->members->map(function ($member) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'name' => $member->user->full_name,
                    'email' => $member->user->email,
                    'role' => $member->role,
                    'role_label' => $member->role_label,
                    'joined_at' => $member->joined_at->toISOString(),
                ];
            }),
        ];
    }

    /**
     * Log activity
     */
    private function logActivity(int $userId, string $action, int $projectId, array $data = []): void
    {
        ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => 'project',
            'entity_id' => $projectId,
            'new_values' => $data,
        ]);
    }
}