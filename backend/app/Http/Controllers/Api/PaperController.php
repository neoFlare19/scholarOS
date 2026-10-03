<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchPaper;
use Illuminate\Http\Request;

class PaperController extends Controller
{
    /**
     * Get all papers for the authenticated user
     * GET /api/v1/dashboard/papers
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $papers = ResearchPaper::where('uploaded_by', $user->id)
            ->orWhereHas('authors', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->with(['category', 'researchArea', 'uploadedBy'])
            ->latest();

        // Apply filters
        if ($request->has('status')) {
            $papers->where('status', $request->status);
        }

        if ($request->has('category_id')) {
            $papers->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $papers->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('abstract', 'like', "%{$search}%");
            });
        }

        $papers = $papers->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Papers retrieved successfully',
            'data' => $papers,
        ]);
    }

    /**
     * Get paper statistics
     * GET /api/v1/dashboard/papers/stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total' => $user->papers()->count(),
            'verified' => $user->papers()->where('is_verified', true)->count(),
            'pending' => $user->papers()->where('status', 'pending')->count(),
            'approved' => $user->papers()->where('status', 'approved')->count(),
            'rejected' => $user->papers()->where('status', 'rejected')->count(),
            'total_views' => $user->papers()->sum('views'),
            'total_downloads' => $user->papers()->sum('downloads'),
            'recent' => $user->papers()
                ->latest()
                ->limit(5)
                ->get(['id', 'title', 'status', 'created_at']),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}