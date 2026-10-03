<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResearchPaper;
use App\Services\GoogleScholarService;
use App\Services\PaperSummarizationService;
use Illuminate\Http\Request;

class ResearchPaperController extends Controller
{
    protected $scholarService;

    public function __construct(GoogleScholarService $scholarService)
    {
        $this->scholarService = $scholarService;
    }

    /**
     * Get all research papers (with search and filters)
     * GET /api/v1/papers
     *
     * Query Params:
     * - search: Search by title, abstract, authors, keywords
     * - category: Filter by category
     * - research_area: Filter by research area
     * - status: Filter by status
     * - per_page: Pagination limit (default: 10)
     */
    public function index(Request $request)
    {
        $query = ResearchPaper::query()
            ->with(['category', 'researchArea', 'uploadedBy']);

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        // Apply category filter
        if ($request->has('category')) {
            $query->where('category', 'like', "%{$request->category}%");
        }

        // Apply research area filter
        if ($request->has('research_area')) {
            $query->where('research_area', 'like', "%{$request->research_area}%");
        }

        // Apply status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Order by latest
        $papers = $query->latest()->paginate($request->per_page ?? 10);

        // Transform response to include Google Scholar links
        $papers->getCollection()->transform(function ($paper) {
            return $this->transformPaperWithScholarLinks($paper);
        });

        return response()->json([
            'success' => true,
            'message' => 'Research papers retrieved successfully',
            'data' => $papers,
            'meta' => [
                'total' => $papers->total(),
                'per_page' => $papers->perPage(),
                'current_page' => $papers->currentPage(),
                'last_page' => $papers->lastPage(),
            ]
        ]);
    }

    /**
     * Get a single research paper
     * GET /api/v1/papers/{id}
     */
    public function show($id)
    {
        $paper = ResearchPaper::with(['category', 'researchArea', 'uploadedBy', 'authors'])
            ->find($id);

        if (!$paper) {
            return response()->json([
                'success' => false,
                'message' => 'Research paper not found',
            ], 404);
        }

        // Increment view count
        $paper->increment('views');

        return response()->json([
            'success' => true,
            'message' => 'Research paper retrieved successfully',
            'data' => $this->transformPaperWithScholarLinks($paper),
        ]);
    }

    /**
     * Search papers by title (dedicated search endpoint)
     * GET /api/v1/papers/search
     *
     * Query Params:
     * - q: Search query (required)
     * - exact: Boolean - if true, search for exact match (default: false)
     * - per_page: Pagination limit (default: 10)
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:1|max:255',
        ]);

        $query = ResearchPaper::query()
            ->with(['category', 'researchArea', 'uploadedBy']);

        // If exact match is requested
        if ($request->boolean('exact')) {
            $query->searchExact($request->q);
        } else {
            // Fuzzy search
            $query->search($request->q);
        }

        $papers = $query->latest()->paginate($request->per_page ?? 10);

        // Transform response to include Google Scholar links
        $papers->getCollection()->transform(function ($paper) {
            return $this->transformPaperWithScholarLinks($paper);
        });

        return response()->json([
            'success' => true,
            'message' => 'Search results retrieved successfully',  // ← FIXED: Added closing quote
            'data' => $papers,
            'meta' => [
                'query' => $request->q,
                'exact_match' => $request->boolean('exact'),
                'total' => $papers->total(),
                'per_page' => $papers->perPage(),
                'current_page' => $papers->currentPage(),
                'last_page' => $papers->lastPage(),
            ]
        ]);
    }

    /**
     * Search Google Scholar for external research papers.
     * GET /api/v1/papers/scholar-search
     */
    public function searchGoogleScholar(Request $request)
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:255',
            'limit' => 'sometimes|integer|min:1|max:20',
        ]);

        try {
            $papers = $this->scholarService->search($validated['q'], (int) ($validated['limit'] ?? 10));
        } catch (\RuntimeException $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Google Scholar is temporarily unavailable. Please try again later.',
            ], 502);
        }

        return response()->json([
            'success' => true,
            'message' => 'Google Scholar results retrieved successfully',
            'data' => $papers,
            'meta' => [
                'query' => $validated['q'],
                'count' => count($papers),
            ],
        ]);
    }

    /**
     * Recommend Google Scholar papers based on the authenticated user's interests.
     * GET /api/v1/papers/recommendations
     */
    public function recommendations(Request $request)
    {
        try {
            $recommendations = $this->scholarService->recommendationsForUser($request->user());
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Google Scholar recommendations are temporarily unavailable.',
            ], 502);
        }

        $interests = $recommendations['interests'];
        $papers = $recommendations['papers'];
        $failedInterests = $recommendations['failed_interests'];

        if ($interests === []) {
            return response()->json([
                'success' => true,
                'message' => 'Select research interests to receive paper recommendations.',
                'data' => [],
                'meta' => [
                    'status' => 'no_interests',
                    'interests' => [],
                    'count' => 0,
                ],
            ]);
        }

        if ($papers === [] && $failedInterests !== []) {
            return response()->json([
                'success' => false,
                'message' => 'Google Scholar recommendations could not be retrieved. Please try again later.',
                'meta' => [
                    'interests' => $interests,
                    'failed_interests' => $failedInterests,
                ],
            ], 502);
        }

        return response()->json([
            'success' => true,
            'message' => $papers === []
                ? 'No Google Scholar papers were found for your research interests.'
                : 'Personalized Google Scholar recommendations retrieved successfully.',
            'data' => $papers,
            'meta' => [
                'status' => $failedInterests === [] ? 'complete' : 'partial_failure',
                'interests' => $interests,
                'failed_interests' => $failedInterests,
                'count' => count($papers),
            ],
        ]);
    }

    /**
     * Generate an AI summary for a selected research paper.
     * POST /api/v1/papers/summarize
     */
    public function summarize(Request $request, PaperSummarizationService $summarizationService)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:300',
            'abstract' => 'required|string|max:30000',
            'category' => 'nullable|string|max:255',
        ]);

        try {
            $summary = $summarizationService->summarize(
                $validated['title'],
                $validated['abstract'],
                $validated['category'] ?? null
            );
        } catch (\Throwable $exception) {
            report($exception);
            $isUnconfigured = $exception->getMessage() === 'AI summarization is not configured.';

            return response()->json([
                'success' => false,
                'message' => $isUnconfigured
                    ? $exception->getMessage()
                    : 'Unable to generate an AI summary right now. Please try again later.',
            ], $isUnconfigured ? 503 : 502);
        }

        return response()->json([
            'success' => true,
            'message' => 'Research paper summary generated successfully.',
            'data' => $summary,
        ]);
    }

    /**
     * Create a new research paper
     * POST /api/v1/papers
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:300',
            'abstract' => 'required|string',
            'keywords' => 'nullable|string',
            'research_area' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'authors' => 'nullable|string|max:255',
            'google_scholar_url' => 'nullable|url|max:255|regex:/^https?:\/\/scholar\.google\.com\/.*/',
            'doi' => 'nullable|string|max:100|regex:/^10\.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i',
            'publication_status' => 'nullable|string|in:draft,submitted,under_review,published',
        ], [
            'google_scholar_url.regex' => 'The Google Scholar URL must be a valid Google Scholar link (https://scholar.google.com/...)',
            'doi.regex' => 'The DOI format is invalid. Expected format: 10.xxxx/xxxxx',
        ]);

        // Validate Google Scholar URL if provided
        if (!empty($validated['google_scholar_url'])) {
            if (!$this->scholarService->isValidScholarUrl($validated['google_scholar_url'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Google Scholar URL',
                    'errors' => [
                        'google_scholar_url' => ['The Google Scholar URL must be a valid Google Scholar link.']
                    ]
                ], 422);
            }
        }

        // Create paper (placeholder - will be replaced with real DB later)
        return response()->json([
            'success' => true,
            'message' => 'Research paper created successfully (placeholder - database integration pending)',
            'data' => $this->transformScholarLinks([
                'id' => rand(1000, 9999),
                'title' => $validated['title'],
                'abstract' => $validated['abstract'],
                'keywords' => $validated['keywords'] ?? null,
                'research_area' => $validated['research_area'] ?? null,
                'category' => $validated['category'] ?? null,
                'authors' => $validated['authors'] ?? null,
                'google_scholar_url' => $validated['google_scholar_url'] ?? null,
                'doi' => $validated['doi'] ?? null,
                'publication_status' => $validated['publication_status'] ?? 'draft',
                'status' => 'pending',
                'is_verified' => false,
                'views' => 0,
                'downloads' => 0,
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString(),
            ])
        ], 201);
    }

    /**
     * Update a research paper
     * PUT /api/v1/papers/{id}
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:300',
            'abstract' => 'sometimes|required|string',
            'keywords' => 'nullable|string',
            'research_area' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'authors' => 'nullable|string|max:255',
            'google_scholar_url' => 'nullable|url|max:255|regex:/^https?:\/\/scholar\.google\.com\/.*/',
            'doi' => 'nullable|string|max:100|regex:/^10\.\d{4,9}\/[-._;()\/:A-Z0-9]+$/i',
            'publication_status' => 'nullable|string|in:draft,submitted,under_review,published',
        ], [
            'google_scholar_url.regex' => 'The Google Scholar URL must be a valid Google Scholar link (https://scholar.google.com/...)',
            'doi.regex' => 'The DOI format is invalid. Expected format: 10.xxxx/xxxxx',
        ]);

        // Validate Google Scholar URL if provided
        if (!empty($validated['google_scholar_url'])) {
            if (!$this->scholarService->isValidScholarUrl($validated['google_scholar_url'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Google Scholar URL',
                    'errors' => [
                        'google_scholar_url' => ['The Google Scholar URL must be a valid Google Scholar link.']
                    ]
                ], 422);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Research paper updated successfully (placeholder - database integration pending)',
            'data' => $this->transformScholarLinks([
                'id' => (int) $id,
                'title' => $validated['title'] ?? 'Updated Research Paper',
                'abstract' => $validated['abstract'] ?? 'Updated abstract',
                'keywords' => $validated['keywords'] ?? null,
                'research_area' => $validated['research_area'] ?? null,
                'category' => $validated['category'] ?? null,
                'authors' => $validated['authors'] ?? null,
                'google_scholar_url' => $validated['google_scholar_url'] ?? null,
                'doi' => $validated['doi'] ?? null,
                'publication_status' => $validated['publication_status'] ?? 'draft',
                'updated_at' => now()->toISOString(),
            ])
        ]);
    }

    /**
     * Delete a research paper
     * DELETE /api/v1/papers/{id}
     */
    public function destroy($id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Research paper deleted successfully (placeholder - database integration pending)',
            'data' => [
                'id' => (int) $id,
                'deleted_at' => now()->toISOString()
            ]
        ]);
    }

    /**
     * Transform a paper array to include Google Scholar links
     *
     * @param array $paper
     * @return array
     */
    private function transformScholarLinks(array $paper): array
    {
        $scholarLinks = $this->scholarService->getScholarLinks(
            $paper['google_scholar_url'] ?? null,
            $paper['title'] ?? null
        );

        return array_merge($paper, $scholarLinks);
    }

    /**
     * Transform a paper model to include Google Scholar links
     *
     * @param \App\Models\ResearchPaper $paper
     * @return \App\Models\ResearchPaper
     */
    private function transformPaperWithScholarLinks(ResearchPaper $paper): ResearchPaper
    {
        $scholarLinks = $paper->getScholarLinks();

        // Add the links as attributes
        $paper->google_scholar_url = $scholarLinks['google_scholar_url'];
        $paper->google_scholar_search_url = $scholarLinks['google_scholar_search_url'];

        return $paper;
    }

    /**
     * Get placeholder papers (for testing)
     */
    private function getPlaceholderPapers()
    {
        return [
            [
                'id' => 1,
                'title' => 'Artificial Intelligence in Modern Healthcare',
                'abstract' => 'This paper explores the applications of artificial intelligence in healthcare systems, focusing on diagnostic tools and patient care optimization.',
                'keywords' => 'AI, Healthcare, Machine Learning, Diagnostics',
                'research_area' => 'Artificial Intelligence',
                'category' => 'Journal Article',
                'authors' => 'Dr. Sarah Johnson, Prof. Michael Chen',
                'google_scholar_url' => 'https://scholar.google.com/citations?user=aihealth123',
                'doi' => '10.1016/j.health.2024.01.001',
                'publication_status' => 'published',
                'status' => 'approved',
                'is_verified' => true,
                'views' => 234,
                'downloads' => 89,
                'created_at' => now()->subDays(15)->toISOString(),
                'updated_at' => now()->subDays(10)->toISOString(),
            ],
            [
                'id' => 2,
                'title' => 'Machine Learning Approaches for Natural Language Processing',
                'abstract' => 'A comprehensive review of machine learning techniques applied to natural language processing tasks, including sentiment analysis and text classification.',
                'keywords' => 'NLP, Machine Learning, Deep Learning, Transformers',
                'research_area' => 'Natural Language Processing',
                'category' => 'Conference Paper',
                'authors' => 'Dr. Emily Brown, Dr. David Wilson',
                'google_scholar_url' => null,
                'doi' => '10.1016/j.nlp.2024.02.003',
                'publication_status' => 'published',
                'status' => 'approved',
                'is_verified' => true,
                'views' => 156,
                'downloads' => 67,
                'created_at' => now()->subDays(20)->toISOString(),
                'updated_at' => now()->subDays(18)->toISOString(),
            ],
            [
                'id' => 3,
                'title' => 'Data Mining Techniques for E-Commerce Analytics',
                'abstract' => 'This research investigates various data mining approaches for analyzing customer behavior and improving e-commerce recommendation systems.',
                'keywords' => 'Data Mining, E-Commerce, Analytics, Recommendations',
                'research_area' => 'Data Mining',
                'category' => 'Journal Article',
                'authors' => 'Prof. Robert Taylor, Dr. Lisa Park',
                'google_scholar_url' => null,
                'doi' => '10.1016/j.dm.2024.03.002',
                'publication_status' => 'under_review',
                'status' => 'pending',
                'is_verified' => false,
                'views' => 45,
                'downloads' => 12,
                'created_at' => now()->subDays(5)->toISOString(),
                'updated_at' => now()->subDays(3)->toISOString(),
            ],
            [
                'id' => 4,
                'title' => 'Cybersecurity Challenges in Internet of Things (IoT)',
                'abstract' => 'An analysis of security vulnerabilities in IoT devices and networks, with proposed solutions for enhancing cybersecurity in smart environments.',
                'keywords' => 'Cybersecurity, IoT, Security, Smart Devices',
                'research_area' => 'Cybersecurity',
                'category' => 'Conference Paper',
                'authors' => 'Dr. James Martinez, Dr. Anna Kim',
                'google_scholar_url' => null,
                'doi' => '10.1016/j.cyber.2024.04.001',
                'publication_status' => 'submitted',
                'status' => 'pending',
                'is_verified' => false,
                'views' => 78,
                'downloads' => 34,
                'created_at' => now()->subDays(8)->toISOString(),
                'updated_at' => now()->subDays(7)->toISOString(),
            ],
            [
                'id' => 5,
                'title' => 'Blockchain Technology for Supply Chain Management',
                'abstract' => 'This paper explores the application of blockchain technology in supply chain management, focusing on traceability, transparency, and efficiency improvements.',
                'keywords' => 'Blockchain, Supply Chain, Traceability, Transparency',
                'research_area' => 'Blockchain',
                'category' => 'Journal Article',
                'authors' => 'Prof. William Chen, Dr. Maria Garcia',
                'google_scholar_url' => 'https://scholar.google.com/citations?user=blockscm654',
                'doi' => '10.1016/j.block.2024.05.001',
                'publication_status' => 'published',
                'status' => 'approved',
                'is_verified' => true,
                'views' => 312,
                'downloads' => 145,
                'created_at' => now()->subDays(25)->toISOString(),
                'updated_at' => now()->subDays(22)->toISOString(),
            ],
        ];
    }
}