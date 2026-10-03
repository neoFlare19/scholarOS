<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleScholarSearchTest extends TestCase
{
    public function test_it_returns_parsed_google_scholar_search_results(): void
    {
        Http::fake([
            'scholar.google.com/scholar*' => Http::response(<<<'HTML'
                <html><body>
                    <div class="gs_r gs_or gs_scl">
                        <h3 class="gs_rt"><a href="https://example.org/paper">A &amp; B: Research</a></h3>
                        <div class="gs_a">Jane Doe, John Smith - Journal, 2024</div>
                        <div class="gs_rs">A useful abstract about the research.</div>
                        <div class="gs_fl">Cited by 47</div>
                    </div>
                </body></html>
                HTML, 200),
        ]);

        $response = $this->getJson('/api/v1/papers/scholar-search?q=research&limit=5');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.query', 'research')
            ->assertJsonPath('meta.count', 1)
            ->assertJsonPath('data.0.title', 'A & B: Research')
            ->assertJsonPath('data.0.authors', 'Jane Doe, John Smith - Journal, 2024')
            ->assertJsonPath('data.0.abstract', 'A useful abstract about the research.')
            ->assertJsonPath('data.0.publication_year', 2024)
            ->assertJsonPath('data.0.citations', 47)
            ->assertJsonPath('data.0.url', 'https://example.org/paper');

        Http::assertSent(fn ($request) =>
            $request->url() === 'https://scholar.google.com/scholar?q=research&hl=en&num=5'
        );
    }
}