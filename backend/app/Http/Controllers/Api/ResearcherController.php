<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ResearcherController extends Controller
{
    /**
     * Get researcher directory
     * GET /api/v1/dashboard/researchers
     */
    public function index(Request $request)
    {
        $query = User::with(['role', 'department']);

        // Apply filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('institution', 'like', "%{$search}%")
                  ->orWhere('research_interests', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->whereHas('role', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $researchers = $query->paginate(10);

        // Transform data
        $researchers->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'profile_picture' => $user->profile_picture,
                'institution' => $user->institution,
                'bio' => $user->bio,
                'research_interests' => $user->research_interests,
                'role' => $user->role ? $user->role->display_name : null,
                'department' => $user->department ? $user->department->name : null,
                'paper_count' => $user->papers()->count(),
                'project_count' => $user->projectMemberships()->count() + $user->supervisedProjects()->count(),
                'followers_count' => $user->followers()->count(),
                'created_at' => $user->created_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Researchers retrieved successfully',
            'data' => $researchers,
        ]);
    }

    /**
     * Get a single researcher
     * GET /api/v1/dashboard/researchers/{id}
     */
    public function show($id)
    {
        $user = User::with(['role', 'department', 'researchAreas'])
            ->findOrFail($id);

        $userData = [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'profile_picture' => $user->profile_picture,
            'institution' => $user->institution,
            'bio' => $user->bio,
            'research_interests' => $user->research_interests,
            'skills' => $user->skills,
            'role' => $user->role ? $user->role->display_name : null,
            'department' => $user->department ? $user->department->name : null,
            'research_areas' => $user->researchAreas->pluck('name'),
            'paper_count' => $user->papers()->count(),
            'project_count' => $user->projectMemberships()->count() + $user->supervisedProjects()->count(),
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'created_at' => $user->created_at->toISOString(),
        ];

        return response()->json([
            'success' => true,
            'data' => $userData,
        ]);
    }

    /**
     * Get researchers for autocomplete
     * GET /api/v1/dashboard/researchers/search
     */
    public function search(Request $request)
    {
        $query = User::query();

        if ($request->has('query')) {
            $search = $request->query;
            $query->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        $users = $query->limit(10)->get(['id', 'full_name', 'email']);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }
}