<?php

namespace Tests\Feature;

use App\Services\PaperSummarizationService;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class PaperSummarizationServiceTest extends TestCase
{
    public function test_it_returns_the_requested_structured_summary_from_the_configured_provider(): void
    {
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
                            'summary' => 'A concise paper summary.',
                            'keyFindings' => ['Finding one', 'Finding two'],
                            'mainContribution' => 'A clear primary contribution.',
                            'keywords' => ['Research', 'Analysis'],
                        ]),
                    ],
                ]],
            ], 200),
        ]);

        $summary = app(PaperSummarizationService::class)->summarize(
            'A research paper',
            'The paper abstract describes a study and its findings.',
            'Research'
        );

        $this->assertSame('A concise paper summary.', $summary['summary']);
        $this->assertSame(['Finding one', 'Finding two'], $summary['keyFindings']);
        $this->assertSame('A clear primary contribution.', $summary['mainContribution']);
        $this->assertSame(['Research', 'Analysis'], $summary['keywords']);
        Http::assertSent(fn ($request) =>
            $request->url() === 'https://ai.example.test/v1/chat/completions'
            && $request->hasHeader('Authorization', 'Bearer test-key')
            && $request['model'] === 'test-model'
        );
    }

    public function test_it_fails_clearly_when_ai_provider_credentials_are_missing(): void
    {
        config(['services.ai.api_key' => null]);
        Http::fake();

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('AI summarization is not configured.');

        app(PaperSummarizationService::class)->summarize('A research paper', 'A paper abstract.');
    }
}