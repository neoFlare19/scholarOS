<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchPaper;
use App\Http\Requests\StorePaperRequest;
use App\Http\Requests\UpdatePaperRequest;
use App\Services\GoogleScholarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaperSubmissionController extends Controller
{
    protected $scholarService;

    public function __construct(GoogleScholarService $scholarService)
    {
        $this->scholarService = $scholarService;
    }

    /**
     * Get all papers for the authenticated user (with filters)
     * GET /api/v1/submissions
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = ResearchPaper::with([
            'category', 
            'researchArea', 
            'department',
            'uploadedBy',
            'authors',
            'reviewer'
        ])->forUser($user->id);

        // Filter by submission status
        if ($request->has('status')) {
            $query->where('submission_status', $request->status);
        }

        // Filter by search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('abstract', 'LIKE', "%{$search}%");
            });
        }

        $papers = $query->latest()->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'message' => 'Papers retrieved successfully',
            'data' => $papers,
        ]);
    }

    /**
     * Create a new paper draft
     * POST /api/v1/submissions
     */
    public function store(StorePaperRequest $request)
    {
        $user = $request->user();

        $validated = $request->validated();

        // Set default status to draft
        $paper = ResearchPaper::create([
            'title' => $validated['title'],
            'abstract' => $validated['abstract'],
            'keywords' => $validated['keywords'] ?? null,
            'research_area' => $validated['research_area'] ?? null,
            'category' => $validated['category'] ?? null,
            'authors' => $validated['authors'] ?? null,
            'google_scholar_url' => $validated['google_scholar_url'] ?? null,
            'doi' => $validated['doi'] ?? null,
            'publication_year' => $validated['publication_year'] ?? null,
            'research_area_id' => $validated['research_area_id'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'uploaded_by' => $user->id,
            'submission_status' => 'draft',
            'status' => 'pending',
            'is_verified' => false,
        ]);

        // Add the user as an author if not already
        $paper->authors()->syncWithoutDetaching([$user->id]);

        // Log activity
        $this->logActivity($user->id, 'created', $paper->id);

        return response()->json([
            'success' => true,
            'message' => 'Paper draft created successfully',
            'data' => $paper->load(['category', 'researchArea', 'department', 'uploadedBy']),
        ], 201);
    }

    /**
     * Get a single paper
     * GET /api/v1/submissions/{id}
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        $paper = ResearchPaper::with([
            'category', 
            'researchArea', 
            'department',
            'uploadedBy',
            'authors',
            'reviewer',
            'comments'
        ])->findOrFail($id);

        // Check if user has access
        if (!$this->canAccess($user, $paper)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this paper',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $paper,
        ]);
    }

    /**
     * Update a paper draft
     * PUT /api/v1/submissions/{id}
     */
    public function update(UpdatePaperRequest $request, $id)
    {
        $user = $request->user();

        $paper = ResearchPaper::findOrFail($id);

        // Check if user can edit
        if (!$this->canEdit($user, $paper)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit this paper',
            ], 403);
        }

        // Check if paper is editable (only drafts can be edited)
        if (!$paper->isEditable()) {
            return response()->json([
                'success' => false,
                'message' => 'This paper cannot be edited. Only drafts are editable.',
            ], 422);
        }

        $validated = $request->validated();

        $paper->update($validated);

        // Log activity
        $this->logActivity($user->id, 'updated', $paper->id);

        return response()->json([
            'success' => true,
            'message' => 'Paper updated successfully',
            'data' => $paper->load(['category', 'researchArea', 'department', 'uploadedBy']),
        ]);
    }

    /**
     * Submit a paper for approval
     * POST /api/v1/submissions/{id}/submit
     */
    public function submit(Request $request, $id)
    {
        $user = $request->user();

        $paper = ResearchPaper::findOrFail($id);

        // Check if user owns the paper
        if ($paper->uploaded_by !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to submit this paper',
            ], 403);
        }

        // Check if paper is submittable
        if (!$paper->isSubmittable()) {
            return response()->json([
                'success' => false,
                'message' => 'This paper cannot be submitted. Only drafts can be submitted.',
            ], 422);
        }

        // Check if paper is complete
        if (!$paper->isComplete()) {
            return response()->json([
                'success' => false,
                'message' => 'Paper is incomplete. Please fill in all required fields before submitting.',
                'errors' => [
                    'required_fields' => ['title', 'abstract', 'authors']
                ],
            ], 422);
        }

        // Submit the paper
        if ($paper->submit()) {
            // Create notification for admins
            $this->createNotification($paper, 'submitted');

            return response()->json([
                'success' => true,
                'message' => 'Paper submitted successfully for approval',
                'data' => $paper->fresh(),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to submit paper',
        ], 500);
    }

    /**
     * Get papers for review (Admin only)
     * GET /api/v1/submissions/review
     */
    public function reviewIndex(Request $request)
    {
        $user = $request->user();

        // Check if user is admin
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can access this endpoint',
            ], 403);
        }

        $query = ResearchPaper::with([
            'category', 
            'researchArea', 
            'department',
            'uploadedBy',
            'authors'
        ])->needsReview();

        // Filter by status
        if ($request->has('status')) {
            $query->where('submission_status', $request->status);
        }

        $papers = $query->latest('submitted_at')->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'message' => 'Papers for review retrieved successfully',
            'data' => $papers,
        ]);
    }

    /**
     * Approve a paper (Admin only)
     * POST /api/v1/submissions/{id}/approve
     */
    public function approve(Request $request, $id)
    {
        $user = $request->user();

        // Check if user is admin
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can approve papers',
            ], 403);
        }

        $paper = ResearchPaper::findOrFail($id);

        $validated = $request->validate([
            'reviewer_notes' => 'nullable|string|max:1000',
        ]);

        if ($paper->approve($user->id, $validated['reviewer_notes'] ?? null)) {
            // Create notification for author
            $this->createNotification($paper, 'approved');

            return response()->json([
                'success' => true,
                'message' => 'Paper approved successfully',
                'data' => $paper->fresh(),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'This paper cannot be approved',
        ], 422);
    }

    /**
     * Reject a paper (Admin only)
     * POST /api/v1/submissions/{id}/reject
     */
    public function reject(Request $request, $id)
    {
        $user = $request->user();

        // Check if user is admin
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can reject papers',
            ], 403);
        }

        $paper = ResearchPaper::findOrFail($id);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:10|max:500',
            'reviewer_notes' => 'nullable|string|max:1000',
        ]);

        if ($paper->reject($user->id, $validated['rejection_reason'], $validated['reviewer_notes'] ?? null)) {
            // Create notification for author
            $this->createNotification($paper, 'rejected');

            return response()->json([
                'success' => true,
                'message' => 'Paper rejected successfully',
                'data' => $paper->fresh(),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'This paper cannot be rejected',
        ], 422);
    }

    /**
     * Return paper to draft (Admin only)
     * POST /api/v1/submissions/{id}/return-to-draft
     */
    public function returnToDraft(Request $request, $id)
    {
        $user = $request->user();

        // Check if user is admin
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can perform this action',
            ], 403);
        }

        $paper = ResearchPaper::findOrFail($id);

        if ($paper->returnToDraft()) {
            // Create notification for author
            $this->createNotification($paper, 'returned');

            return response()->json([
                'success' => true,
                'message' => 'Paper returned to draft successfully',
                'data' => $paper->fresh(),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'This paper cannot be returned to draft',
        ], 422);
    }

    /**
     * Delete a paper (only if draft or rejected)
     * DELETE /api/v1/submissions/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $paper = ResearchPaper::findOrFail($id);

        // Check if user owns the paper
        if ($paper->uploaded_by !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete this paper',
            ], 403);
        }

        // Check if paper can be deleted (only draft or rejected)
        if (!$paper->isDraft() && !$paper->isRejected()) {
            return response()->json([
                'success' => false,
                'message' => 'Only drafts or rejected papers can be deleted',
            ], 422);
        }

        $paper->delete();

        return response()->json([
            'success' => true,
            'message' => 'Paper deleted successfully',
        ]);
    }

    /**
     * Check if user can access the paper
     */
    private function canAccess($user, $paper): bool
    {
        // Admin can access all
        if ($user->isAdmin()) {
            return true;
        }

        // User can access their own papers
        if ($paper->uploaded_by === $user->id) {
            return true;
        }

        // User can access if they are an author
        return $paper->authors()->where('user_id', $user->id)->exists();
    }

    /**
     * Check if user can edit the paper
     */
    private function canEdit($user, $paper): bool
    {
        // Only the uploader can edit
        return $paper->uploaded_by === $user->id;
    }

    /**
     * Log activity
     */
    private function logActivity(int $userId, string $action, int $paperId): void
    {
        // You can implement activity logging here
        // or use the existing ActivityLog model
    }

    /**
     * Create notification
     */
    private function createNotification($paper, string $action): void
    {
        // Get admin users
        $admins = \App\Models\User::whereHas('role', function ($q) {
            $q->whereIn('name', ['sys_admin', 'dept_admin']);
        })->get();

        $messages = [
            'submitted' => "New paper '{$paper->title}' has been submitted for approval.",
            'approved' => "Your paper '{$paper->title}' has been approved.",
            'rejected' => "Your paper '{$paper->title}' has been rejected.",
            'returned' => "Your paper '{$paper->title}' has been returned to draft.",
        ];

        $message = $messages[$action] ?? "Paper '{$paper->title}' has been updated.";

        // Send notifications
        if ($action === 'submitted') {
            // Notify admins
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'sender_id' => $paper->uploaded_by,
                    'type' => 'paper_submitted',
                    'message' => $message,
                    'data' => ['paper_id' => $paper->id],
                    'link' => '/admin/papers/review',
                ]);
            }
        } else {
            // Notify author
            \App\Models\Notification::create([
                'user_id' => $paper->uploaded_by,
                'sender_id' => auth()->id(),
                'type' => 'paper_reviewed',
                'message' => $message,
                'data' => ['paper_id' => $paper->id],
                'link' => '/dashboard/papers/' . $paper->id,
            ]);
        }
    }
}