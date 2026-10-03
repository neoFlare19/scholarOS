<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchArea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResearchAreaController extends Controller
{
    /**
     * Return all available research areas.
     */
    public function index(): JsonResponse
    {
        $researchAreas = ResearchArea::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'description',
                'department_id',
            ]);

        return response()->json([
            'success' => true,
            'data' => $researchAreas,
        ]);
    }

    /**
     * Save the authenticated user's selected research areas.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'research_area_ids' => ['required', 'array', 'min:1'],
            'research_area_ids.*' => ['integer', 'exists:research_areas,id'],
        ]);

        $user = $request->user();

        $user->researchAreas()->sync($validated['research_area_ids']);

        return response()->json([
            'success' => true,
            'message' => 'Research interests saved successfully.',
            'data' => $user->researchAreas()->get(),
        ]);
    }
}