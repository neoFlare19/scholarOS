<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Mockery;
use Tests\TestCase;

class PaperSummarizationTest extends TestCase
{
    public function test_authenticated_users_can_generate_a_structured_paper_summary(): void
    {
        $this->actingAs(Mockery::mock(User::class)->makePartial());
        config([
            'services.ai.base_url' => 'https://ai.example.test/v1',
            'services.ai.api_key' => 'test-key',
            'services.ai.model' => 'test-model',
        ]);
        Http::fake([
            'ai.example.test/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => [
                        'content' => json_encode([
                            'summary' => 'A concise summary.',
                            'keyFindings' => ['Finding one'],
                            'mainContribution' => 'A primary contribution.',
                            'keywords' => ['Research'],
                        ]),
                    ],
                ]],
            ], 200),
        ]);

        $this->postJson('/api/v1/papers/summarize', [
            'title' => 'Research Paper',
            'abstract' => 'A sufficiently detailed abstract for summarization.',
            'category' => 'Science',
        ])
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.summary', 'A concise summary.')
            ->assertJsonPath('data.keyFindings.0', 'Finding one')
            ->assertJsonPath('data.mainContribution', 'A primary contribution.')
            ->assertJsonPath('data.keywords.0', 'Research');
    }

    public function test_summarization_endpoint_requires_authentication(): void
    {
        Http::fake();

        $this->postJson('/api/v1/papers/summarize', [
            'title' => 'Research Paper',
            'abstract' => 'A sufficiently detailed abstract for summarization.',
        ])->assertUnauthorized();

        Http::assertNothingSent();
    }

    public function test_summarization_requires_an_abstract_and_reports_missing_configuration(): void
    {
        $this->actingAs(Mockery::mock(User::class)->makePartial());
        Http::fake();

        $this->postJson('/api/v1/papers/summarize', ['title' => 'Research Paper'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('abstract');

        config(['services.ai.api_key' => null]);
        $this->postJson('/api/v1/papers/summarize', [
            'title' => 'Research Paper',
            'abstract' => 'A sufficiently detailed abstract for summarization.',
        ])
            ->assertStatus(503)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'AI summarization is not configured.');

        Http::assertNothingSent();
    }
}