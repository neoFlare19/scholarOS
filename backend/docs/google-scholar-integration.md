# Google Scholar Integration Documentation

## Overview
Research papers in ScholarOS support Google Scholar links for easy access to academic references.

## Live Search API

`GET /api/v1/papers/scholar-search` fetches external Google Scholar search results. It does not save results as ScholarOS research papers.

Query parameters:

- `q` (required): search terms, up to 255 characters
- `limit` (optional): number of results from 1 to 20 (default: 10)

Each result includes `title`, `authors`, `abstract`, the publication `url` when available, `publication_year` and `citations` when available, and a generated `google_scholar_search_url`. The response includes the query and result count in `meta`.

Google Scholar may rate-limit requests or present a CAPTCHA. In those cases the endpoint returns `502`; retrying later may succeed. The HTML result format is controlled by Google and can change.

`GET /api/v1/papers/recommendations` requires Sanctum authentication. It searches the authenticated user's `user_research_areas`, merges duplicate titles, and returns each paper's `matched_interests`. An account with no selected interests receives an empty `data` array and `meta.status: "no_interests"`; successful searches with no matches return an empty array with `meta.status: "complete"`. Partial interest-search failures are reported in `meta.failed_interests`, and an all-failed request returns `502`.

## API Response Structure

When fetching research papers, the API returns the following fields:

```json
{
    "id": 1,
    "title": "Artificial Intelligence in Modern Healthcare",
    "authors": "Dr. Sarah Johnson, Prof. Michael Chen",
    "google_scholar_url": "https://scholar.google.com/citations?user=aihealth123",
    "doi": "10.1016/j.health.2024.01.001",
    "publication_status": "published",
    "status": "approved",
    "is_verified": true,
    "views": 234,
    "downloads": 89,
    "created_at": "2026-08-01T15:00:00.000000Z",
    "updated_at": "2026-08-10T15:00:00.000000Z"
}