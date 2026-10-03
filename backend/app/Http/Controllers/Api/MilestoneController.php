<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MilestoneController extends Controller
{
    /**
     * Get all milestones for a project
     * GET /api/v1/projects/{project}/milestones
     */
    public function index(Request $request, $projectId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check access
        if (!$this->canAccess($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this project',
            ], 403);
        }

        $query = Milestone::where('project_id', $projectId);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by overdue
        if ($request->boolean('overdue')) {
            $query->where('due_date', '<', now())
                  ->where('status', '!=', 'completed');
        }

        $milestones = $query->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'message' => 'Milestones retrieved successfully',
            'data' => $milestones,
        ]);
    }

    /**
     * Create a milestone
     * POST /api/v1/projects/{project}/milestones
     */
    public function store(Request $request, $projectId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create milestones',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'due_date' => 'required|date|after_or_equal:today',
            'status' => ['nullable', Rule::in(['pending', 'in_progress', 'completed'])],
            'order' => 'nullable|integer|min:0',
        ]);

        $milestone = Milestone::create([
            'project_id' => $projectId,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'],
            'status' => $validated['status'] ?? 'pending',
            'order' => $validated['order'] ?? 0,
        ]);

        // Log activity
        $this->logActivity($user->id, 'created_milestone', $projectId, [
            'project_title' => $project->title,
            'milestone_title' => $milestone->title,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Milestone created successfully',
            'data' => $milestone,
        ], 201);
    }

    /**
     * Get a single milestone
     * GET /api/v1/projects/{project}/milestones/{milestone}
     */
    public function show(Request $request, $projectId, $milestoneId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check access
        if (!$this->canAccess($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this project',
            ], 403);
        }

        $milestone = Milestone::where('project_id', $projectId)->findOrFail($milestoneId);

        return response()->json([
            'success' => true,
            'data' => $milestone,
        ]);
    }

    /**
     * Update a milestone
     * PUT /api/v1/projects/{project}/milestones/{milestone}
     */
    public function update(Request $request, $projectId, $milestoneId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update milestones',
            ], 403);
        }

        $milestone = Milestone::where('project_id', $projectId)->findOrFail($milestoneId);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:500',
            'due_date' => 'sometimes|required|date|after_or_equal:today',
            'status' => ['nullable', Rule::in(['pending', 'in_progress', 'completed'])],
            'order' => 'nullable|integer|min:0',
        ]);

        // If status is set to completed, set completed_at
        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $validated['completed_at'] = now();
        }

        // If status is changed from completed, remove completed_at
        if (isset($validated['status']) && $validated['status'] !== 'completed') {
            $validated['completed_at'] = null;
        }

        $milestone->update($validated);

        // Log activity
        $this->logActivity($user->id, 'updated_milestone', $projectId, [
            'project_title' => $project->title,
            'milestone_title' => $milestone->title,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Milestone updated successfully',
            'data' => $milestone->fresh(),
        ]);
    }

    /**
     * Delete a milestone
     * DELETE /api/v1/projects/{project}/milestones/{milestone}
     */
    public function destroy(Request $request, $projectId, $milestoneId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete milestones',
            ], 403);
        }

        $milestone = Milestone::where('project_id', $projectId)->findOrFail($milestoneId);

        // Log before deleting
        $this->logActivity($user->id, 'deleted_milestone', $projectId, [
            'project_title' => $project->title,
            'milestone_title' => $milestone->title,
        ]);

        $milestone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Milestone deleted successfully',
        ]);
    }

    /**
     * Update milestone completion status
     * PATCH /api/v1/projects/{project}/milestones/{milestone}/status
     */
    public function updateStatus(Request $request, $projectId, $milestoneId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update milestones',
            ], 403);
        }

        $milestone = Milestone::where('project_id', $projectId)->findOrFail($milestoneId);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'in_progress', 'completed'])],
        ]);

        // Use helper methods
        switch ($validated['status']) {
            case 'completed':
                $milestone->markAsCompleted();
                break;
            case 'in_progress':
                $milestone->markAsInProgress();
                break;
            case 'pending':
                $milestone->markAsPending();
                break;
        }

        // Log activity
        $this->logActivity($user->id, 'updated_milestone_status', $projectId, [
            'project_title' => $project->title,
            'milestone_title' => $milestone->title,
            'new_status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Milestone status updated successfully',
            'data' => $milestone->fresh(),
        ]);
    }

    private function canAccess($user, $project): bool
    {
        return $project->isMember($user->id) || $project->isCreator($user->id) || $user->isAdmin();
    }

    private function canManage($user, $project): bool
    {
        return $project->canEdit($user->id) || $user->isAdmin();
    }

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