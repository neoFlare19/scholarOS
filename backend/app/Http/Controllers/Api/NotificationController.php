<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     * GET /api/v1/dashboard/notifications
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Notification::where('user_id', $user->id)
            ->with('sender');

        if ($request->has('filter')) {
            if ($request->filter === 'unread') {
                $query->unread();
            } elseif ($request->filter === 'read') {
                $query->read();
            }
        }

        $notifications = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Notifications retrieved successfully',
            'data' => $notifications,
        ]);
    }

    /**
     * Get notification counts
     * GET /api/v1/dashboard/notifications/count
     */
    public function count(Request $request)
    {
        $user = $request->user();

        $unread = $user->unreadNotifications()->count();
        $total = $user->notifications()->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread' => $unread,
                'total' => $total,
            ],
        ]);
    }

    /**
     * Mark a notification as read
     * PUT /api/v1/dashboard/notifications/{id}/read
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = Notification::where('user_id', $user->id)
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
            'data' => $notification,
        ]);
    }

    /**
     * Mark all notifications as read
     * PUT /api/v1/dashboard/notifications/mark-all-read
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        $count = $user->unreadNotifications()->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marked as read",
            'data' => [
                'marked_count' => $count,
            ],
        ]);
    }

    /**
     * Delete a notification
     * DELETE /api/v1/dashboard/notifications/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $notification = Notification::where('user_id', $user->id)
            ->findOrFail($id);

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted successfully',
        ]);
    }
}