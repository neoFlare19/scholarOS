<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'institution' => ['required', 'string', 'max:200'],
            'email' => [
    'required',
    'string',
    'email',
    'max:255',
    Rule::unique('mysql.users', 'email'),
],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ];
    }
}