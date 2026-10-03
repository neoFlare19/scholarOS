<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handled by middleware
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:200',
            'description' => 'required|string|max:1000',
            'research_area_id' => 'required|exists:research_areas,id',
            'supervisor_id' => 'nullable|exists:users,id',
            'start_date' => 'required|date|after_or_equal:today',
            'deadline' => 'nullable|date|after:start_date',
            'status' => ['nullable', Rule::in(['planning', 'in_progress', 'completed', 'archived'])],
            'is_public' => 'boolean',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Project title is required.',
            'description.required' => 'Project description is required.',
            'research_area_id.required' => 'Research area is required.',
            'research_area_id.exists' => 'Selected research area does not exist.',
            'start_date.required' => 'Start date is required.',
            'start_date.after_or_equal' => 'Start date cannot be in the past.',
            'deadline.after' => 'Deadline must be after start date.',
        ];
    }
}