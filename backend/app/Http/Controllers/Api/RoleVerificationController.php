<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoleVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RoleVerificationController extends Controller
{
    /**
     * Submit a role verification request.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'role' => [
                'required',
                'string',
                Rule::in(['student', 'faculty']),
            ],
            'id_card' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],
        ]);

        $existingVerification = $user->roleVerification;

        /*
         * A pending or approved verification cannot be submitted again.
         */
        if (
            $existingVerification &&
            in_array($existingVerification->status, ['pending', 'approved'])
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active role verification request.',
                'data' => $existingVerification,
            ], 409);
        }

        /*
         * Delete the previous ID card if the previous request was rejected.
         */
        if (
            $existingVerification &&
            $existingVerification->id_card_path
        ) {
            Storage::disk('local')->delete(
                $existingVerification->id_card_path
            );
        }

        /*
         * Store the ID card in private local storage.
         */
        $idCardPath = $request->file('id_card')->store(
            'role-verifications',
            'local'
        );

        /*
         * Create a new verification request or update
         * the existing rejected request.
         */
        $verification = RoleVerification::updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'role' => $validated['role'],
                'id_card_path' => $idCardPath,
                'status' => 'pending',
                'rejection_reason' => null,
                'submitted_at' => now(),
                'reviewed_at' => null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Role verification request submitted successfully.',
            'data' => $verification,
        ], 201);
    }

    /**
     * Get the authenticated user's role verification status.
     */
        /**
 * Get the authenticated user's role verification status.
 */
public function show(Request $request)
{
    $user = $request->user();

    $verification = RoleVerification::where('user_id', $user->id)->first();

    if (!$verification) {
        return response()->json([
            'success' => true,
            'message' => 'No role verification request has been submitted.',
            'data' => null,
        ]);
    }

    return response()->json([
        'success' => true,
        'data' => $verification,
    ]);
}
}