<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\Notification;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the authenticated user
     * GET /api/v1/dashboard/stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        // Get project IDs where user is a member or supervisor
        $projectIds = $user->projectsAsMember()->pluck('projects.id')->toArray();
        $supervisedIds = $user->supervisedProjects()->pluck('id')->toArray();
        $allProjectIds = array_unique(array_merge($projectIds, $supervisedIds));

        // Get task counts
        $totalTasks = Task::whereIn('project_id', $allProjectIds)->count();
        $completedTasks = Task::whereIn('project_id', $allProjectIds)
            ->where('status', 'completed')
            ->count();
        $pendingTasks = Task::whereIn('project_id', $allProjectIds)
            ->where('status', 'pending')
            ->count();
        $inProgressTasks = Task::whereIn('project_id', $allProjectIds)
            ->where('status', 'in_progress')
            ->count();

        // Get project counts
        $totalProjects = count($allProjectIds);
        $activeProjects = Project::whereIn('id', $allProjectIds)
            ->whereIn('status', ['planning', 'in_progress'])
            ->count();
        $completedProjects = Project::whereIn('id', $allProjectIds)
            ->where('status', 'completed')
            ->count();

        // Get paper counts
        $totalPapers = $user->papers()->count();
        $verifiedPapers = $user->papers()->where('is_verified', true)->count();
        $pendingPapers = $user->papers()->where('status', 'pending')->count();

        // Get unread notification count
        $unreadNotifications = $user->unreadNotifications()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'projects' => [
                    'total' => $totalProjects,
                    'active' => $activeProjects,
                    'completed' => $completedProjects,
                ],
                'tasks' => [
                    'total' => $totalTasks,
                    'completed' => $completedTasks,
                    'pending' => $pendingTasks,
                    'in_progress' => $inProgressTasks,
                ],
                'papers' => [
                    'total' => $totalPapers,
                    'verified' => $verifiedPapers,
                    'pending' => $pendingPapers,
                ],
                'notifications' => [
                    'unread' => $unreadNotifications,
                ],
            ]
        ]);
    }

    /**
     * Get recent activity for the authenticated user
     * GET /api/v1/dashboard/recent-activity
     */
    public function recentActivity(Request $request)
    {
        $user = $request->user();

        // Get recent activity logs
        $activities = ActivityLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Also get recent notifications
        $notifications = Notification::where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get();

        // Combine and format
        $activityFeed = [];

        foreach ($activities as $activity) {
            $activityFeed[] = [
                'type' => 'activity',
                'action' => $activity->action,
                'entity_type' => $activity->entity_type,
                'message' => $this->formatActivityMessage($activity),
                'created_at' => $activity->created_at->toISOString(),
            ];
        }

        foreach ($notifications as $notification) {
            $activityFeed[] = [
                'type' => 'notification',
                'id' => $notification->id,
                'message' => $notification->message,
                'is_read' => $notification->is_read,
                'link' => $notification->link,
                'created_at' => $notification->created_at->toISOString(),
            ];
        }

        // Sort by created_at descending
        usort($activityFeed, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        // Limit to 10 items
        $activityFeed = array_slice($activityFeed, 0, 10);

        return response()->json([
            'success' => true,
            'data' => $activityFeed,
        ]);
    }

    /**
     * Format activity message
     */
    private function formatActivityMessage($activity)
    {
        $actionMap = [
            'created' => 'created a new',
            'updated' => 'updated',
            'deleted' => 'deleted',
            'viewed' => 'viewed',
            'uploaded' => 'uploaded',
            'assigned' => 'assigned',
            'completed' => 'completed',
        ];

        $action = $actionMap[$activity->action] ?? $activity->action;
        $entity = str_replace('_', ' ', $activity->entity_type);

        return "You {$action} {$entity}";
    }
}