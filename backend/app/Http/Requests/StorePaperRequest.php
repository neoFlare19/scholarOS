<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaperRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handled by middleware
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:300',
            'abstract' => 'required|string|min:50',
            'keywords' => 'nullable|string|max:500',
            'research_area' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'authors' => 'nullable|string|max:500',
            'google_scholar_url' => 'nullable|url|max:255|regex:/^https?:\/\/scholar\.google\.com\/.*/',
            'doi' => 'nullable|string|max:100|regex:/^10\.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i',
            'publication_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'research_area_id' => 'nullable|exists:research_areas,id',
            'category_id' => 'nullable|exists:categories,id',
            'department_id' => 'nullable|exists:departments,id',
            'submission_status' => ['nullable', Rule::in(['draft', 'submitted'])],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'The paper title is required.',
            'abstract.required' => 'The paper abstract is required.',
            'abstract.min' => 'The abstract must be at least 50 characters.',
            'google_scholar_url.regex' => 'The Google Scholar URL must be a valid Google Scholar link (https://scholar.google.com/...)',
            'doi.regex' => 'The DOI format is invalid. Expected format: 10.xxxx/xxxxx',
            'publication_year.max' => 'The publication year cannot be in the future.',
        ];
    }
}