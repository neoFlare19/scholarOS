<?php

namespace App\Services;

use App\Models\User;
use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleScholarService
{
    /**
     * Base URL for Google Scholar
     */
    private const BASE_URL = 'https://scholar.google.com/scholar';

    /**
     * Generate a Google Scholar search URL from a paper title
     *
     * @param string $title
     * @return string
     */
    public function generateSearchUrl(string $title): string
    {
        // Clean and encode the title
        $encodedTitle = $this->encodeTitle($title);

        return self::BASE_URL . '?q=' . $encodedTitle;
    }

    /**
     * Fetch and parse papers from Google Scholar search results.
     */
    public function search(string $query, int $limit = 10): array
    {
        $limit = min(max($limit, 1), 20);
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (compatible; ScholarOS/1.0)',
        ])->timeout(15)->get(self::BASE_URL, [
            'q' => trim($query),
            'hl' => 'en',
            'num' => $limit,
        ]);

        $response->throw();
        $html = $response->body();

        if (str_contains($html, 'gs_captcha_ccl') || str_contains($html, 'unusual traffic')) {
            throw new RuntimeException('Google Scholar rejected the search request.');
        }

        $previousErrors = libxml_use_internal_errors(true);
        $document = new DOMDocument();
        $document->loadHTML('<?xml encoding="UTF-8">' . $html);
        libxml_clear_errors();
        libxml_use_internal_errors($previousErrors);

        $xpath = new DOMXPath($document);
        $blocks = $xpath->query("//div[contains(concat(' ', normalize-space(@class), ' '), ' gs_r ')]");
        $papers = [];

        foreach ($blocks as $block) {
            $titleNode = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' gs_rt ')]", $block)->item(0);
            $titleLink = $titleNode ? $xpath->query('.//a', $titleNode)->item(0) : null;
            $title = $titleNode ? $this->cleanText($titleNode->textContent) : '';

            if ($title === '') {
                continue;
            }

            $authorsNode = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' gs_a ')]", $block)->item(0);
            $abstractNode = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' gs_rs ')]", $block)->item(0);
            $metadata = $authorsNode ? $this->cleanText($authorsNode->textContent) : '';
            $citationNode = $xpath->query(".//*[contains(concat(' ', normalize-space(@class), ' '), ' gs_fl ')]", $block)->item(0);
            preg_match('/\b((?:19|20)\d{2})\b/', $metadata, $yearMatch);
            preg_match('/Cited by\s+(\d+)/i', $citationNode?->textContent ?? '', $citationMatch);

            $papers[] = [
                'title' => $title,
                'authors' => $metadata !== '' ? $metadata : null,
                'abstract' => $abstractNode ? $this->cleanText($abstractNode->textContent) : null,
                'url' => $titleLink ? $this->resolveResultUrl($titleLink->getAttribute('href')) : null,
                'publication_year' => isset($yearMatch[1]) ? (int) $yearMatch[1] : null,
                'citations' => isset($citationMatch[1]) ? (int) $citationMatch[1] : 0,
                'google_scholar_search_url' => $this->generateSearchUrl($title),
            ];
        }

        return $papers;
    }

    /**
     * Search the authenticated user's selected areas and merge duplicate papers.
     */
    public function recommendationsForUser(User $user): array
    {
        $interests = $user->researchAreas()
            ->orderBy('research_areas.name')
            ->pluck('research_areas.name')
            ->map(fn (string $interest) => trim($interest))
            ->filter()
            ->unique(fn (string $interest) => mb_strtolower($interest))
            ->values()
            ->all();

        $papers = [];
        $failedInterests = [];

        foreach ($interests as $interest) {
            try {
                $results = $this->search($interest, 5);
            } catch (\Throwable) {
                $failedInterests[] = $interest;
                continue;
            }

            foreach ($results as $paper) {
                $titleKey = mb_strtolower((string) preg_replace('/[^\pL\pN]+/u', ' ', $paper['title']));
                $titleKey = trim((string) preg_replace('/\s+/', ' ', $titleKey));

                if ($titleKey === '') {
                    continue;
                }

                if (isset($papers[$titleKey])) {
                    $papers[$titleKey]['matched_interests'][] = $interest;
                    $papers[$titleKey]['matched_interests'] = array_values(array_unique($papers[$titleKey]['matched_interests']));
                    $papers[$titleKey]['citations'] = max($papers[$titleKey]['citations'], $paper['citations']);
                    continue;
                }

                $paper['matched_interests'] = [$interest];
                $papers[$titleKey] = $paper;
            }
        }

        return [
            'interests' => $interests,
            'papers' => array_slice(array_values($papers), 0, 20),
            'failed_interests' => $failedInterests,
        ];
    }

    /**
     * Encode a title for Google Scholar search
     * - URL encode spaces and special characters
     * - Remove excessive whitespace
     *
     * @param string $title
     * @return string
     */
    private function encodeTitle(string $title): string
    {
        // Trim whitespace
        $title = trim($title);

        // Replace multiple spaces with single space
        $title = preg_replace('/\s+/', ' ', $title);

        // URL encode
        return urlencode($title);
    }

    private function cleanText(string $text): string
    {
        return trim((string) preg_replace('/\s+/', ' ', $text));
    }

    private function resolveResultUrl(string $url): ?string
    {
        if (str_starts_with($url, '/url?')) {
            parse_str((string) parse_url($url, PHP_URL_QUERY), $query);
            $url = $query['q'] ?? '';
        }

        return filter_var($url, FILTER_VALIDATE_URL) ? $url : null;
    }

    /**
     * Get the best available Google Scholar link for a paper
     *
     * @param string|null $exactUrl
     * @param string|null $title
     * @return array
     */
    public function getScholarLinks(?string $exactUrl, ?string $title): array
    {
        $result = [
            'google_scholar_url' => null,
            'google_scholar_search_url' => null,
        ];

        // If exact URL exists, use it
        if ($exactUrl) {
            $result['google_scholar_url'] = $exactUrl;
        }

        // Always generate a search URL if title exists
        if ($title) {
            $result['google_scholar_search_url'] = $this->generateSearchUrl($title);
        }

        return $result;
    }

    /**
     * Validate a Google Scholar URL
     *
     * @param string|null $url
     * @return bool
     */
    public function isValidScholarUrl(?string $url): bool
    {
        if (empty($url)) {
            return false;
        }

        // Must start with https://scholar.google.com/
        if (!preg_match('/^https?:\/\/scholar\.google\.com\/.*/', $url)) {
            return false;
        }

        // Must be a valid URL
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }

        return true;
    }
}