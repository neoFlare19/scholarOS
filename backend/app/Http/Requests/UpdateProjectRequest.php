<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handled by middleware
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:200',
            'description' => 'sometimes|required|string|max:1000',
            'research_area_id' => 'sometimes|required|exists:research_areas,id',
            'supervisor_id' => 'nullable|exists:users,id',
            'start_date' => 'sometimes|required|date',
            'deadline' => 'nullable|date|after:start_date',
            'status' => ['nullable', Rule::in(['planning', 'in_progress', 'completed', 'archived'])],
            'progress_pct' => 'nullable|integer|min:0|max:100',
            'is_public' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'research_area_id.exists' => 'Selected research area does not exist.',
            'deadline.after' => 'Deadline must be after start date.',
            'progress_pct.min' => 'Progress cannot be less than 0.',
            'progress_pct.max' => 'Progress cannot exceed 100.',
        ];
    }
}