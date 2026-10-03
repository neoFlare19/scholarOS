<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    /**
     * Get all tasks for a project
     * GET /api/v1/projects/{project}/tasks
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

        $query = Task::where('project_id', $projectId)
            ->with(['assignedTo', 'createdBy']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter by assigned user
        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Filter by overdue
        if ($request->boolean('overdue')) {
            $query->where('deadline', '<', now())
                  ->where('status', '!=', 'completed');
        }

        $tasks = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'message' => 'Tasks retrieved successfully',
            'data' => $tasks,
        ]);
    }

    /**
     * Create a task
     * POST /api/v1/projects/{project}/tasks
     */
    public function store(Request $request, $projectId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create tasks',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'status' => ['nullable', Rule::in(['pending', 'in_progress', 'completed'])],
            'deadline' => 'nullable|date|after_or_equal:today',
        ]);

        // Validate that assigned user is a project member
        if (isset($validated['assigned_to'])) {
            if (!$project->isMember($validated['assigned_to'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'The assigned user must be a member of this project',
                ], 422);
            }
        }

        $task = Task::create([
            'project_id' => $projectId,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'assigned_by' => $user->id,
            'created_by' => $user->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'] ?? 'medium',
            'status' => $validated['status'] ?? 'pending',
            'deadline' => $validated['deadline'] ?? null,
        ]);

        // Log activity
        $this->logActivity($user->id, 'created_task', $projectId, [
            'project_title' => $project->title,
            'task_name' => $task->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully',
            'data' => $task->load(['assignedTo', 'createdBy']),
        ], 201);
    }

    /**
     * Get a single task
     * GET /api/v1/projects/{project}/tasks/{task}
     */
    public function show(Request $request, $projectId, $taskId)
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

        $task = Task::where('project_id', $projectId)
            ->with(['assignedTo', 'assignedBy', 'createdBy', 'files'])
            ->findOrFail($taskId);

        return response()->json([
            'success' => true,
            'data' => $task,
        ]);
    }

    /**
     * Update a task
     * PUT /api/v1/projects/{project}/tasks/{task}
     */
    public function update(Request $request, $projectId, $taskId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update tasks',
            ], 403);
        }

        $task = Task::where('project_id', $projectId)->findOrFail($taskId);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:500',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'status' => ['nullable', Rule::in(['pending', 'in_progress', 'completed'])],
            'deadline' => 'nullable|date|after_or_equal:today',
        ]);

        // Validate that assigned user is a project member
        if (isset($validated['assigned_to'])) {
            if (!$project->isMember($validated['assigned_to'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'The assigned user must be a member of this project',
                ], 422);
            }
        }

        // If status is set to completed, set completed_at
        if (isset($validated['status']) && $validated['status'] === 'completed') {
            $validated['completed_at'] = now();
        }

        // If status is changed from completed, remove completed_at
        if (isset($validated['status']) && $validated['status'] !== 'completed') {
            $validated['completed_at'] = null;
        }

        $task->update($validated);

        // Log activity
        $this->logActivity($user->id, 'updated_task', $projectId, [
            'project_title' => $project->title,
            'task_name' => $task->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data' => $task->fresh()->load(['assignedTo', 'createdBy']),
        ]);
    }

    /**
     * Delete a task
     * DELETE /api/v1/projects/{project}/tasks/{task}
     */
    public function destroy(Request $request, $projectId, $taskId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete tasks',
            ], 403);
        }

        $task = Task::where('project_id', $projectId)->findOrFail($taskId);

        // Log before deleting
        $this->logActivity($user->id, 'deleted_task', $projectId, [
            'project_title' => $project->title,
            'task_name' => $task->name,
        ]);

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully',
        ]);
    }

    /**
     * Update task status
     * PATCH /api/v1/projects/{project}/tasks/{task}/status
     */
    public function updateStatus(Request $request, $projectId, $taskId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update tasks',
            ], 403);
        }

        $task = Task::where('project_id', $projectId)->findOrFail($taskId);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'in_progress', 'completed'])],
        ]);

        // Use helper methods
        switch ($validated['status']) {
            case 'completed':
                $task->markAsCompleted();
                break;
            case 'in_progress':
                $task->markAsInProgress();
                break;
            case 'pending':
                $task->markAsPending();
                break;
        }

        // Log activity
        $this->logActivity($user->id, 'updated_task_status', $projectId, [
            'project_title' => $project->title,
            'task_name' => $task->name,
            'new_status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task status updated successfully',
            'data' => $task->fresh(),
        ]);
    }

    /**
     * Assign a task to a user
     * POST /api/v1/projects/{project}/tasks/{task}/assign
     */
    public function assign(Request $request, $projectId, $taskId)
    {
        $user = $request->user();
        $project = Project::findOrFail($projectId);

        // Check if user can manage
        if (!$this->canManage($user, $project)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to assign tasks',
            ], 403);
        }

        $task = Task::where('project_id', $projectId)->findOrFail($taskId);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Validate that user is a project member
        if (!$project->isMember($validated['user_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'The user must be a member of this project',
            ], 422);
        }

        $task->assigned_to = $validated['user_id'];
        $task->assigned_by = $user->id;
        $task->save();

        // Log activity
        $this->logActivity($user->id, 'assigned_task', $projectId, [
            'project_title' => $project->title,
            'task_name' => $task->name,
            'assigned_to' => $validated['user_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task assigned successfully',
            'data' => $task->load(['assignedTo', 'createdBy']),
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