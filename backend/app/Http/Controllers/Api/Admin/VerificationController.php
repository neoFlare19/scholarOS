<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RoleVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class VerificationController extends Controller
{
    /**
     * Retrieve verification requests for administrators.
     *
     * GET /api/v1/admin/verifications
     */
    public function index(Request $request): JsonResponse
    {
        $query = RoleVerification::with([
            'user:id,full_name,email,institution',
        ]);

        // Optional status filter.
        if ($request->filled('status')) {
            $request->validate([
                'status' => [
                    'string',
                    Rule::in(['pending', 'approved', 'rejected']),
                ],
            ]);

            $query->where('status', $request->status);
        }

        $verifications = $query
            ->orderByDesc('submitted_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $verifications->map(function (RoleVerification $verification) {
                return $this->formatVerification($verification);
            })->values(),
        ]);
    }

    /**
     * Retrieve a single verification request.
     *
     * GET /api/v1/admin/verifications/{id}
     */
    public function show(int $id): JsonResponse
    {
        $verification = RoleVerification::with([
            'user:id,full_name,email,institution',
        ])->find($id);

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Verification request not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatVerification($verification),
        ]);
    }

    /**
     * Approve a verification request.
     *
     * POST /api/v1/admin/verifications/{id}/approve
     */
    public function approve(int $id): JsonResponse
    {
        $verification = RoleVerification::with('user')->find($id);

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Verification request not found.',
            ], 404);
        }

        if ($verification->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This verification request has already been processed.',
                'status' => $verification->status,
            ], 409);
        }

        $verification->update([
            'status' => 'approved',
            'rejection_reason' => null,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Verification request approved successfully.',
            'data' => $this->formatVerification($verification->fresh('user')),
        ]);
    }

    /**
     * Reject a verification request.
     *
     * POST /api/v1/admin/verifications/{id}/reject
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'rejection_reason' => [
                'required',
                'string',
                'min:5',
                'max:2000',
            ],
        ]);

        $verification = RoleVerification::with('user')->find($id);

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Verification request not found.',
            ], 404);
        }

        if ($verification->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This verification request has already been processed.',
                'status' => $verification->status,
            ], 409);
        }

        $verification->update([
            'status' => 'rejected',
            'rejection_reason' => $request->input('rejection_reason'),
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Verification request rejected successfully.',
            'data' => $this->formatVerification($verification->fresh('user')),
        ]);
    }

    /**
     * Securely access an uploaded university ID card.
     *
     * GET /api/v1/admin/verifications/{id}/id-card
     */
    public function idCard(int $id)
    {
        $verification = RoleVerification::find($id);

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Verification request not found.',
            ], 404);
        }

        if (!$verification->id_card_path) {
            return response()->json([
                'success' => false,
                'message' => 'No ID card is associated with this verification request.',
            ], 404);
        }

        $disk = Storage::disk('local');

        if (!$disk->exists($verification->id_card_path)) {
            return response()->json([
                'success' => false,
                'message' => 'ID card file could not be found.',
            ], 404);
        }

        return $disk->response(
            $verification->id_card_path,
            null,
            [
                'Content-Disposition' => 'inline',
            ]
        );
    }

    /**
     * Format a verification request for API responses.
     */
    private function formatVerification(
        RoleVerification $verification
    ): array {
        return [
            'id' => $verification->id,

            'user' => [
                'id' => $verification->user?->id,
                'name' => $verification->user?->full_name,
                'email' => $verification->user?->email,
                'institution' => $verification->user?->institution,
            ],

            'role' => $verification->role,

            'status' => $verification->status,

            'submitted_at' => $verification->submitted_at?->toISOString(),

            'reviewed_at' => $verification->reviewed_at?->toISOString(),

            'rejection_reason' => $verification->rejection_reason,

            'id_card' => [
                'available' => !empty($verification->id_card_path),
                'path' => $verification->id_card_path,
            ],
        ];
    }
}