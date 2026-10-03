<?php

namespace Tests\Feature;

use App\Models\ResearchArea;
use App\Models\User;
use App\Services\GoogleScholarService;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Http;
use Mockery;
use Tests\TestCase;

class GoogleScholarRecommendationsTest extends TestCase
{
    public function test_it_combines_and_deduplicates_results_for_selected_interests(): void
    {
        $user = $this->mockUserWithInterests(['Artificial Intelligence', 'Health Informatics']);
        Http::fakeSequence('scholar.google.com/scholar*')
            ->push($this->resultHtml('Shared Paper', 12), 200)
            ->push($this->resultHtml(' shared   paper! ', 28) . $this->resultHtml('Health Study', 4), 200);

        $recommendations = app(GoogleScholarService::class)->recommendationsForUser($user);

        $this->assertSame(['Artificial Intelligence', 'Health Informatics'], $recommendations['interests']);
        $this->assertCount(2, $recommendations['papers']);
        $this->assertSame('Shared Paper', $recommendations['papers'][0]['title']);
        $this->assertSame(28, $recommendations['papers'][0]['citations']);
        $this->assertSame(['Artificial Intelligence', 'Health Informatics'], $recommendations['papers'][0]['matched_interests']);
        $this->assertSame([], $recommendations['failed_interests']);
        Http::assertSentCount(2);
    }

    public function test_it_skips_scholar_requests_when_the_user_has_no_interests(): void
    {
        $user = $this->mockUserWithInterests([]);
        Http::fake();

        $recommendations = app(GoogleScholarService::class)->recommendationsForUser($user);

        $this->assertSame([], $recommendations['interests']);
        $this->assertSame([], $recommendations['papers']);
        $this->assertSame([], $recommendations['failed_interests']);
        Http::assertNothingSent();
    }

    public function test_recommendations_route_requires_authentication(): void
    {
        Http::fake();

        $this->getJson('/api/v1/papers/recommendations')->assertUnauthorized();

        Http::assertNothingSent();
    }

    public function test_authenticated_route_returns_recommendations_for_selected_interests(): void
    {
        $user = $this->mockUserWithInterests(['Artificial Intelligence']);
        $this->actingAs($user);
        Http::fake([
            'scholar.google.com/scholar*' => Http::response($this->resultHtml('AI Research', 18), 200),
        ]);

        $this->getJson('/api/v1/papers/recommendations')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.interests.0', 'Artificial Intelligence')
            ->assertJsonPath('meta.count', 1)
            ->assertJsonPath('data.0.title', 'AI Research')
            ->assertJsonPath('data.0.matched_interests.0', 'Artificial Intelligence');
    }

    public function test_authenticated_route_returns_a_distinct_no_interests_state(): void
    {
        $this->actingAs($this->mockUserWithInterests([]));
        Http::fake();

        $this->getJson('/api/v1/papers/recommendations')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.status', 'no_interests')
            ->assertJsonPath('data', []);

        Http::assertNothingSent();
    }

    public function test_authenticated_route_returns_an_empty_result_when_scholar_has_no_matches(): void
    {
        $this->actingAs($this->mockUserWithInterests(['Artificial Intelligence']));
        Http::fake([
            'scholar.google.com/scholar*' => Http::response('<html><body>No results</body></html>', 200),
        ]);

        $this->getJson('/api/v1/papers/recommendations')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.status', 'complete')
            ->assertJsonPath('meta.count', 0)
            ->assertJsonPath('data', []);
    }

    public function test_authenticated_route_reports_an_upstream_error_when_all_interest_searches_fail(): void
    {
        $this->actingAs($this->mockUserWithInterests(['Artificial Intelligence']));
        Http::fake([
            'scholar.google.com/scholar*' => Http::response('Rate limited', 429),
        ]);

        $this->getJson('/api/v1/papers/recommendations')
            ->assertStatus(502)
            ->assertJsonPath('success', false)
            ->assertJsonPath('meta.failed_interests.0', 'Artificial Intelligence');
    }

    private function mockUserWithInterests(array $interestNames): User
    {
        $relation = Mockery::mock(BelongsToMany::class);
        $relation->shouldReceive('orderBy')->once()->with('research_areas.name')->andReturnSelf();
        $relation->shouldReceive('pluck')->once()->with('research_areas.name')->andReturn(collect($interestNames));

        $user = Mockery::mock(User::class)->makePartial();
        $user->shouldReceive('researchAreas')->once()->andReturn($relation);

        return $user;
    }

    private function resultHtml(string $title, int $citations): string
    {
        return '<div class="gs_r"><h3 class="gs_rt"><a href="https://example.org/' . urlencode($title) . '">' . htmlspecialchars($title) . '</a></h3>'
            . '<div class="gs_a">Researcher - Journal, 2025</div><div class="gs_rs">Research abstract.</div>'
            . '<div class="gs_fl">Cited by ' . $citations . '</div></div>';
    }
}