import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  RotateCw,
  ChevronDown,
  Plus,
  Bookmark,
  BookmarkCheck,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn.js";
import {
  getTrendingTopics,
} from "../../services/dummyAIService.js";
import { summarizePaper } from "../../services/aiService.js";
import {
  getDashboardPapers,
  getPaperStats,
  searchGoogleScholarPapers,
  getGoogleScholarRecommendations,
} from "../../services/dashboardService.js";

function Chip({ label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer",
        active
          ? "bg-linear-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-400/30"
          : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]",
      )}
    >
      {label}
    </button>
  );
}

function getStatusBadgeStyle(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("peer") || s.includes("review")) {
    return "text-[var(--badge-blue-text)] bg-[var(--badge-blue)]";
  }
  if (s.includes("ready") || s.includes("publish") || s.includes("approved")) {
    return "text-[var(--badge-emerald-text)] bg-[var(--badge-emerald)]";
  }
  if (s.includes("draft")) {
    return "text-[var(--badge-slate-text)] bg-[var(--badge-slate)]";
  }
  return "text-[var(--badge-amber-text)] bg-[var(--badge-amber)]";
}

function formatStatus(status) {
  if (!status) return "Draft";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Papers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [category, setCategory] = useState("All");
  const [department, setDepartment] = useState("All");
  const [year, setYear] = useState("All");
  const [status, setStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Most Recent");
  const sortRef = useRef(null);

  // Backend state
  const [papers, setPapers] = useState([]);
  const [scholarPapers, setScholarPapers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scholarLoading, setScholarLoading] = useState(false);
  const [scholarError, setScholarError] = useState("");
  const [scholarRetry, setScholarRetry] = useState(0);

  // AI STATE
  const [aiSummaries, setAiSummaries] = useState({});
  const [summaryErrors, setSummaryErrors] = useState({});
  const [summarizingPaperId, setSummarizingPaperId] = useState(null);
  const [aiError, setAiError] = useState("");

  const [trendingTopics, setTrendingTopics] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState("");

  const [recommendations, setRecommendations] = useState([]);
  const [recommendationMeta, setRecommendationMeta] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState("");
  const [recommendationRetry, setRecommendationRetry] = useState(0);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiPromptLoading, setAiPromptLoading] = useState(false);

  // Fetch papers & stats
  const fetchPapersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [papersRes, statsRes] = await Promise.allSettled([
        getDashboardPapers(),
        getPaperStats(),
      ]);

      if (papersRes.status === "fulfilled" && papersRes.value?.data) {
        const rawPapers = Array.isArray(papersRes.value.data)
          ? papersRes.value.data
          : papersRes.value.data?.data || [];
        setPapers(rawPapers);
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error("Error loading papers:", err);
      setError(err?.data?.message || err?.message || "Failed to load research papers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPapersData();
  }, [fetchPapersData]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setScholarPapers([]);
      setScholarError("");
      setScholarLoading(false);
      return undefined;
    }

    let isCurrentSearch = true;
    setScholarLoading(true);
    setScholarError("");
    setScholarPapers([]);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchGoogleScholarPapers(query, 20);
        const results = Array.isArray(response?.data)
          ? response.data
          : response?.data?.data || [];

        if (isCurrentSearch) {
          setScholarPapers(results.map((paper, index) => ({
            ...paper,
            id: `scholar-${paper.url || `${paper.title || "result"}-${index}`}`,
            isGoogleScholarResult: true,
          })));
        }
      } catch (err) {
        if (isCurrentSearch) {
          setScholarPapers([]);
          setScholarError(
            err?.data?.message || err?.message || "Unable to search Google Scholar. Please try again.",
          );
        }
      } finally {
        if (isCurrentSearch) {
          setScholarLoading(false);
        }
      }
    }, 450);

    return () => {
      isCurrentSearch = false;
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, scholarRetry]);

  // Handle outside click for sort dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load trending topics
  useEffect(() => {
    let isMounted = true;
    async function loadTrendingTopics() {
      try {
        setTrendingLoading(true);
        setTrendingError("");
        const topics = await getTrendingTopics();
        if (isMounted) {
          setTrendingTopics(Array.isArray(topics) ? topics : []);
        }
      } catch (err) {
        if (isMounted) {
          setTrendingError(err?.message || "Unable to load trending research topics.");
        }
      } finally {
        if (isMounted) {
          setTrendingLoading(false);
        }
      }
    }
    loadTrendingTopics();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      try {
        setRecommendationLoading(true);
        setRecommendationError("");
        const response = await getGoogleScholarRecommendations();
        if (isMounted) {
          const results = Array.isArray(response?.data)
            ? response.data
            : response?.data?.data || [];
          setRecommendations(results.map((paper, index) => ({
            ...paper,
            id: `recommendation-${paper.url || `${paper.title || "paper"}-${index}`}`,
          })));
          setRecommendationMeta(response?.meta || null);
        }
      } catch (err) {
        if (isMounted) {
          setRecommendations([]);
          setRecommendationMeta(null);
          setRecommendationError(
            err?.data?.message || err?.message || "Unable to load personalized recommendations.",
          );
        }
      } finally {
        if (isMounted) {
          setRecommendationLoading(false);
        }
      }
    }

    loadRecommendations();
    return () => {
      isMounted = false;
    };
  }, [recommendationRetry]);

  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return papers;

    const matchesQuery = (paper) =>
      [paper.title, paper.abstract, paper.authors]
        .some((value) => value?.toLowerCase().includes(query));
    const localMatches = papers.filter(matchesQuery);
    const localTitles = new Set(
      localMatches.map((paper) => paper.title?.trim().toLowerCase()).filter(Boolean),
    );
    const externalMatches = scholarPapers.filter((paper) =>
      matchesQuery(paper) && !localTitles.has(paper.title?.trim().toLowerCase()),
    );

    return [...externalMatches, ...localMatches];
  }, [papers, scholarPapers, searchQuery]);

  const yearOptions = useMemo(() => {
    const years = new Set(["2026", "2025", "2024"]);
    const availableYears = new Set();
    [...papers, ...scholarPapers].forEach((paper) => {
      const publicationYear = Number(paper.publication_year) ||
        (paper.created_at ? new Date(paper.created_at).getFullYear() : 0);
      if (publicationYear > 0) {
        years.add(String(publicationYear));
        availableYears.add(String(publicationYear));
      }
    });

    const currentYear = new Date().getFullYear();
    const yearRanges = new Map();
    availableYears.forEach((value) => {
      const publicationYear = Number(value);
      const rangeEnd = currentYear - Math.floor((currentYear - publicationYear) / 5) * 5;
      const rangeStart = rangeEnd - 4;
      const range = `${rangeStart}-${rangeEnd}`;
      yearRanges.set(range, [...(yearRanges.get(range) || []), publicationYear]);
    });

    const individualYears = Array.from(years).sort((left, right) => Number(right) - Number(left));
    const ranges = Array.from(yearRanges.entries())
      .filter(([, rangeYears]) => new Set(rangeYears).size > 1)
      .map(([range]) => range)
      .sort((left, right) => Number(right.slice(0, 4)) - Number(left.slice(0, 4)));

    return ["All", ...individualYears, ...ranges];
  }, [papers, scholarPapers]);

  // Filtered & Sorted Papers
  const filteredPapers = useMemo(() => {
    return searchResults.filter((p) => {
      const isScholarResult = p.isGoogleScholarResult;
      const searchableText = `${p.title || ""} ${p.abstract || ""} ${p.authors || ""}`.toLowerCase();

      const catName = p.category?.name || p.research_area?.name || "";
      const categoryMatch =
        category === "All" ||
        (isScholarResult
          ? new RegExp(`\\b${category}\\b`, "i").test(searchableText)
          : catName.toLowerCase().includes(category.toLowerCase()));

      const departmentName = p.department?.name || p.department_name || p.uploaded_by?.department?.name || "";
      const departmentMatch =
        department === "All" ||
        (isScholarResult
          ? new RegExp(`\\b${department}\\b`, "i").test(searchableText)
          : departmentName.toLowerCase().includes(department.toLowerCase()));

      const statusMatch =
        !status ||
        (!isScholarResult && (
        p.status?.toLowerCase() === status.toLowerCase().replace(/ /g, "_") ||
        p.status?.toLowerCase() === status.toLowerCase()));

      const publicationYear = Number(p.publication_year) ||
        (p.created_at ? new Date(p.created_at).getFullYear() : 0);
      const yearRange = year.match(/^(\d{4})-(\d{4})$/);
      const yearMatch = year === "All" || (yearRange
        ? publicationYear >= Number(yearRange[1]) && publicationYear <= Number(yearRange[2])
        : publicationYear.toString() === year);

      return categoryMatch && departmentMatch && statusMatch && yearMatch;
    });
  }, [searchResults, category, department, status, year]);

  const sortedPapers = useMemo(() => {
    const list = [...filteredPapers];
    switch (sortBy) {
      case "Most Recent":
        return list.sort((a, b) => {
          const yearFor = (paper) => Number(paper.publication_year) ||
            (paper.created_at ? new Date(paper.created_at).getFullYear() : 0);
          const yearDifference = yearFor(b) - yearFor(a);
          return yearDifference || new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });
      case "Most Cited":
        return list.sort((a, b) => Number(b.citations || b.views || 0) - Number(a.citations || a.views || 0));
      case "A-Z":
        return list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      default:
        return list;
    }
  }, [filteredPapers, sortBy]);

  // AI Summarization
  const handleSummarize = async (paper) => {
    if (!paper) {
      setAiError("Please select a valid research paper.");
      return;
    }

    try {
      setAiError("");
      setSummaryErrors((previous) => ({ ...previous, [paper.id]: "" }));
      setSummarizingPaperId(paper.id);
      const result = await summarizePaper({
        title: paper.title,
        abstract: paper.abstract,
        category: paper.category?.name || paper.research_area?.name,
      });

      setAiSummaries((previous) => ({
        ...previous,
        [paper.id]: result,
      }));
    } catch (err) {
      setSummaryErrors((previous) => ({
        ...previous,
        [paper.id]: err?.data?.message || err?.message || "Unable to generate an AI summary. Please try again.",
      }));
    } finally {
      setSummarizingPaperId(null);
    }
  };

  const handleAiPrompt = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      setAiError("Please enter a question or request for the AI.");
      return;
    }

    try {
      setAiError("");
      setAiPromptLoading(true);
      const normalizedPrompt = prompt.toLowerCase();

      if (
        normalizedPrompt.includes("topic") ||
        normalizedPrompt.includes("trend") ||
        normalizedPrompt.includes("recommend") ||
        normalizedPrompt.includes("research idea")
      ) {
        const topics = await getTrendingTopics();
        setTrendingTopics(Array.isArray(topics) ? topics : []);
        setAiPrompt("");
        return;
      }

      const paper = sortedPapers[0];
      if (!paper) {
        throw new Error("No research paper is available to summarize.");
      }

      const result = await summarizePaper({
        title: paper.title,
        abstract: paper.abstract,
        category: paper.category?.name || paper.research_area?.name,
      });

      setAiSummaries((previous) => ({
        ...previous,
        [paper.id]: result,
      }));
      setAiPrompt("");
    } catch (err) {
      setAiError(err?.message || "Unable to process your AI request. Please try again.");
    } finally {
      setAiPromptLoading(false);
    }
  };

  const totalPaperCount = searchQuery.trim()
    ? searchResults.length
    : stats?.total ?? papers.length;

  const retryScholarSearch = () => setScholarRetry((retry) => retry + 1);

  return (
    <div className="space-y-6 pb-8 w-full min-w-0 relative">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
        <div>
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1">
            Repository
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Research Papers
          </h1>
        </div>
        <button
          onClick={() => navigate("/dashboard/upload")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-indigo-500 to-cyan-400 text-white text-sm font-bold shadow-lg shadow-indigo-400/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95 w-full sm:w-auto cursor-pointer"
        >
          <Plus size={16} /> Upload Paper
        </button>
      </div>

      {/* AI Hero Banner */}
      <div className="rounded-[28px] bg-linear-to-r from-[#161a35] via-[#1b2a4a] to-[#242145] text-white p-5 sm:p-7 shadow-2xl shadow-indigo-900/20 relative overflow-hidden w-full">
        <div className="absolute -top-20 right-1/4 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          <div className="flex items-start gap-5 min-w-0 flex-1">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-linear-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <Sparkles size={24} className="text-yellow-300" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-[0.2em] text-indigo-300 uppercase mb-1">
                ScholarOS AI
              </div>
              <h2 className="text-xl font-extrabold tracking-tight mb-1">
                Summarize any paper or discover trending topics
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Paste a paper, pick one from your library, or ask what's gaining traction in your field right now.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-[380px]">
            <div className="relative">
              <input
                type="text"
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !aiPromptLoading) {
                    handleAiPrompt();
                  }
                }}
                disabled={aiPromptLoading}
                placeholder="Ask AI to summarize or suggest a topic…"
                className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all disabled:opacity-60"
              />

              <button
                onClick={handleAiPrompt}
                disabled={aiPromptLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-linear-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                aria-label="Submit AI request"
              >
                {aiPromptLoading ? (
                  <RotateCw size={15} className="animate-spin" />
                ) : (
                  <ArrowRight size={15} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Error */}
      <AnimatePresence>
        {aiError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700"
          >
            {aiError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start w-full min-w-0">
        {/* LEFT SIDEBAR */}
        <div className="space-y-6 w-full min-w-0">
          {/* Filters */}
          <div className="glass-panel rounded-[28px] p-7">
            <div className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase mb-5">
              Filter Results
            </div>

            <div className="text-sm font-bold text-[var(--text-primary)] mb-2">
              Search by title
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search papers…"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all mb-6"
            />

            <div className="text-sm font-bold text-[var(--text-primary)] mb-3">
              Category
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {["All", "AI", "Health", "Security", "Systems"].map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                />
              ))}
            </div>

            <div className="text-sm font-bold text-[var(--text-primary)] mb-3">
              Department
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {["All", "CS", "Medicine", "Engineering"].map((d) => (
                <Chip
                  key={d}
                  label={d}
                  active={department === d}
                  onClick={() => setDepartment(d)}
                />
              ))}
            </div>

            <div className="text-sm font-bold text-[var(--text-primary)] mb-3">
              Publication Year
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {yearOptions.map((y) => (
                <Chip
                  key={y}
                  label={y}
                  active={year === y}
                  onClick={() => setYear(y)}
                />
              ))}
            </div>

            <div className="text-sm font-bold text-[var(--text-primary)] mb-3">
              Status
            </div>

            <div className="flex flex-wrap gap-2">
              {["Draft", "In Revision", "Published", "Approved"].map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={status === s}
                  onClick={() => setStatus(status === s ? null : s)}
                />
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-7">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={14} className="text-indigo-500" />
              <span className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase">
                Recommended Papers
              </span>
            </div>

            {recommendationLoading ? (
              <div className="space-y-4" role="status" aria-label="Loading recommendations">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse space-y-2 py-3">
                    <div className="h-3 w-10 bg-[var(--muted)] rounded" />
                    <div className="h-4 w-4/5 bg-[var(--muted)] rounded" />
                    <div className="h-3 w-2/3 bg-[var(--muted)] rounded" />
                  </div>
                ))}
              </div>
            ) : recommendationError ? (
              <div role="alert" className="text-sm text-red-600 leading-relaxed">
                <p>{recommendationError}</p>
                <button
                  onClick={() => setRecommendationRetry((retry) => retry + 1)}
                  className="inline-flex items-center gap-2 mt-3 font-semibold hover:underline cursor-pointer"
                >
                  <RotateCw size={14} /> Retry recommendations
                </button>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-sm text-[var(--text-secondary)]">
                {recommendationMeta?.status === "no_interests"
                  ? "Select research interests in your profile to get personalized paper recommendations."
                  : "No Google Scholar papers were found for your selected research interests."}
              </div>
            ) : (
              <>
                {recommendationMeta?.status === "partial_failure" && (
                  <p className="text-xs text-amber-700 mb-3" role="status">
                    Some research interests could not be searched. Showing the available recommendations.
                  </p>
                )}
                <div className="divide-y divide-[var(--border)]">
                  {recommendations.slice(0, 5).map((paper, index) => {
                    const paperUrl = paper.url || paper.google_scholar_search_url;

                    return (
                      <div
                        key={paper.id}
                        className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="text-sm font-semibold text-[var(--text-muted)] pt-0.5">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <a
                            href={paperUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-bold text-[var(--text-primary)] leading-snug hover:text-indigo-600"
                          >
                            {paper.title}
                          </a>
                          <div className="text-xs text-[var(--text-muted)] mt-1">
                            {paper.authors || "Authors unavailable"}
                            {paper.publication_year ? ` · ${paper.publication_year}` : ""}
                          </div>
                          {Array.isArray(paper.matched_interests) && paper.matched_interests.length > 0 && (
                            <div className="text-[11px] text-indigo-500 font-semibold mt-1">
                              {paper.matched_interests.join(" · ")}
                            </div>
                          )}
                          {paper.abstract && (
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-2 line-clamp-3">
                              {paper.abstract}
                            </p>
                          )}
                        </div>
                        {paper.citations > 0 && (
                          <span className="shrink-0 text-[10px] font-bold text-[var(--text-muted)]">
                            {paper.citations} citations
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {recommendations.length > 5 && (
                  <p className="text-xs text-[var(--text-muted)] mt-4">
                    Showing 5 of {recommendations.length} recommendations
                  </p>
                )}
              </>
            )}
          </div>

          {/* AI TRENDING TOPICS */}
          <div className="glass-panel rounded-[28px] p-7">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase">
                AI Trending Topics
              </span>
            </div>

            {trendingLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse space-y-2 py-3">
                    <div className="h-3 w-10 bg-[var(--muted)] rounded" />
                    <div className="h-4 w-4/5 bg-[var(--muted)] rounded" />
                    <div className="h-3 w-2/3 bg-[var(--muted)] rounded" />
                  </div>
                ))}
              </div>
            ) : trendingError ? (
              <div className="text-sm text-red-600 leading-relaxed">
                {trendingError}
              </div>
            ) : trendingTopics.length === 0 ? (
              <div className="text-sm text-[var(--text-secondary)]">
                No trending research topics available.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={topic.id ?? index}
                    className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="text-sm font-semibold text-[var(--text-muted)] pt-0.5">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                        {topic.title}
                      </div>

                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {topic.trend} mentions this quarter
                      </div>

                      <div className="text-[11px] text-indigo-500 font-semibold mt-1">
                        {topic.researchArea}
                      </div>

                      {Array.isArray(topic.keywords) &&
                        topic.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {topic.keywords.slice(0, 3).map((keyword) => (
                              <span
                                key={keyword}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                        topic.trendLabel === "Hot"
                          ? "text-blue-600 bg-blue-50"
                          : "text-emerald-700 bg-emerald-50",
                      )}
                    >
                      {topic.trendLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CONTENT: PAPER CARDS */}
        <div className="space-y-5 w-full min-w-0">
          {/* Header & Sort */}
          <div
            className="flex items-center justify-between relative"
            ref={sortRef}
          >
            <div className="text-sm text-[var(--text-muted)] font-medium">
              Showing {sortedPapers.length} of {totalPaperCount} papers
            </div>

            <div className="relative z-20">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)] shadow-sm hover:bg-[var(--bg-surface-elevated)] transition-all duration-200 cursor-pointer"
              >
                Sort: {sortBy}{" "}
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-[var(--bg-surface-elevated)] rounded-xl shadow-xl border border-[var(--border)] p-1.5 overflow-hidden z-30"
                  >
                    {["Most Recent", "Most Cited", "A-Z"].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                          sortBy === option
                            ? "bg-[var(--badge-blue)] text-[var(--badge-blue-text)] font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {searchQuery.trim() && scholarLoading && (
            <div role="status" className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <RotateCw size={14} className="animate-spin" />
              Searching Google Scholar...
            </div>
          )}

          {searchQuery.trim() && scholarError && !scholarLoading && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <span>{scholarError}</span>
              <button
                onClick={retryScholarSearch}
                className="inline-flex items-center gap-2 font-semibold hover:underline cursor-pointer"
              >
                <RotateCw size={14} /> Retry search
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-[28px] p-7 space-y-4">
                <div className="h-6 w-1/4 rounded skeleton" />
                <div className="h-5 w-3/4 rounded skeleton" />
                <div className="h-4 w-1/2 rounded skeleton" />
                <div className="h-12 w-full rounded skeleton" />
              </div>
            ))
          ) : error ? (
            <div className="glass-panel rounded-[28px] p-10 text-center">
              <p className="text-rose-500 font-bold mb-4">{error}</p>
              <button
                onClick={fetchPapersData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <RotateCw size={15} /> Retry
              </button>
            </div>
          ) : sortedPapers.length === 0 ? (
            <div className="glass-panel rounded-[28px] p-14 text-center text-[var(--text-secondary)]">
              <FileText className="h-12 w-12 text-indigo-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">No Papers Found</h3>
              <p className="text-sm mt-1">
                {searchQuery.trim()
                  ? `No local or Google Scholar papers match "${searchQuery.trim()}" with the current filters.`
                  : "No research papers match your current filters."}
              </p>
              <button
                onClick={() => {
                  setCategory("All");
                  setDepartment("All");
                  setYear("All");
                  setStatus(null);
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-[var(--badge-blue)] hover:opacity-80 transition-opacity cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            sortedPapers.map((p, idx) => {
              const aiSummary = aiSummaries[p.id];
              const summaryError = summaryErrors[p.id];
              const isSummarizing = summarizingPaperId === p.id;
              const displayId = p.isGoogleScholarResult
                ? "Google Scholar"
                : p.id ? `RP-${String(p.id).padStart(4, "0")}` : `RP-${idx + 1}`;
              const categoryTag = p.isGoogleScholarResult
                ? "Google Scholar"
                : p.category?.name || p.research_area?.name || "Research Systems";
              const displayStatus = p.isGoogleScholarResult
                ? p.publication_year ? `Published ${p.publication_year}` : "Scholar result"
                : formatStatus(p.status);
              const statusStyle = p.isGoogleScholarResult
                ? "text-[var(--badge-blue-text)] bg-[var(--badge-blue)]"
                : getStatusBadgeStyle(p.status);

              const authorsText = p.authors
                ? Array.isArray(p.authors)
                  ? p.authors.map((a) => (typeof a === "string" ? a : a.name || a.full_name)).join(" · ")
                  : p.authors
                : p.uploaded_by?.full_name || "Author";

              return (
                <div
                  key={p.id || idx}
                  className="glass-panel rounded-[28px] p-7 transition-all hover:shadow-lg hover:border-indigo-200/80 group/card w-full"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start w-full">
                    {/* PDF ICON */}
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100/60 flex items-center justify-center text-xs font-extrabold text-indigo-500 shadow-sm">
                      PDF
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      {/* CATEGORY / STATUS */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full text-[var(--muted-foreground)] bg-[var(--muted)]">
                          {categoryTag}
                        </span>

                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle}`}>
                          {displayStatus}
                        </span>
                      </div>

                      {/* TITLE */}
                      <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight leading-snug hover:text-indigo-600 transition-colors duration-200 cursor-pointer">
                        {p.isGoogleScholarResult && p.url ? (
                          <a href={p.url} target="_blank" rel="noreferrer">
                            {p.title}
                          </a>
                        ) : p.title}
                      </h3>

                      {/* AUTHORS */}
                      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
                        <span>{authorsText}</span>
                        <span className="text-[var(--text-muted)]">·</span>
                        <span className="font-mono text-xs">{displayId}</span>
                      </div>

                      {/* ABSTRACT */}
                      <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                        {p.abstract || "No abstract available for this publication."}
                      </p>

                      {/* AI SUMMARY */}
                      {isSummarizing ? (
                        <div className="mt-4 rounded-2xl border-2 border-dashed border-indigo-200/70 bg-linear-to-r from-indigo-50/60 to-violet-50/60 p-5">
                          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                            <RotateCw size={15} className="animate-spin" />
                            Analyzing paper with ScholarOS AI...
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            Generating a summary, key findings, main contribution, and keywords.
                          </p>
                        </div>
                      ) : aiSummary ? (
                        <div className="mt-4 rounded-2xl border-2 border-dashed border-indigo-200/70 bg-linear-to-r from-indigo-50/60 to-violet-50/60 p-5 relative">
                          <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-indigo-400 to-blue-400 text-white text-xs font-bold shadow-md shadow-indigo-300/40">
                              <Sparkles size={12} className="text-yellow-200" />
                              AI Summary
                            </span>

                            <button
                              onClick={() => handleSummarize(p)}
                              disabled={isSummarizing}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-indigo-600 hover:underline transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                            >
                              <RotateCw size={12} className={isSummarizing ? "animate-spin" : ""} />
                              Regenerate
                            </button>
                          </div>

                          <div className="mb-5">
                            <div className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500 mb-2">
                              Summary
                            </div>
                            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                              {aiSummary.summary}
                            </p>
                          </div>

                          {Array.isArray(aiSummary.keyFindings) && aiSummary.keyFindings.length > 0 && (
                            <div className="mb-5">
                              <div className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500 mb-2">
                                Key Findings
                              </div>
                              <ul className="space-y-2">
                                {aiSummary.keyFindings.map((finding, findingIndex) => (
                                  <li
                                    key={findingIndex}
                                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)] leading-relaxed"
                                  >
                                    <span className="text-indigo-400 mt-1">•</span>
                                    <span>{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {aiSummary.mainContribution && (
                            <div className="mb-5">
                              <div className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500 mb-2">
                                Main Contribution
                              </div>
                              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {aiSummary.mainContribution}
                              </p>
                            </div>
                          )}

                          {Array.isArray(aiSummary.keywords) && aiSummary.keywords.length > 0 && (
                            <div>
                              <div className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-500 mb-2">
                                Extracted Keywords
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {aiSummary.keywords.map((keyword) => (
                                  <span
                                    key={keyword}
                                    className="px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)]"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSummarize(p)}
                          disabled={summarizingPaperId !== null}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-indigo-600 hover:underline transition-colors duration-200 mt-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Sparkles size={14} className="text-amber-400" />
                          Summarize with AI
                        </button>
                      )}
                      {summaryError && !isSummarizing && (
                        <div role="alert" className="text-sm text-rose-600 leading-relaxed">
                          <p>{summaryError}</p>
                          {p.abstract?.trim() && (
                            <button
                              onClick={() => handleSummarize(p)}
                              className="inline-flex items-center gap-2 mt-2 font-semibold hover:underline cursor-pointer"
                            >
                              <RotateCw size={13} /> Retry summary
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* STATS / BOOKMARK */}
                    <div className="flex shrink-0 items-center gap-6 pl-0 sm:pl-4">
                      <div className="text-center">
                        <div className="text-xl font-extrabold text-[var(--text-primary)]">
                          {p.citations ?? 0}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] tracking-[0.08em] uppercase">
                          Citations
                        </div>
                      </div>

                      {!p.isGoogleScholarResult && (
                        <div className="text-center">
                          <div className="text-xl font-extrabold text-[var(--text-primary)]">
                            {p.views ?? p.downloads ?? 0}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] tracking-[0.08em] uppercase">
                            Views
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => toggleBookmark(p.id)}
                        className="h-9 w-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center cursor-pointer"
                      >
                        {bookmarkedIds.has(p.id) ? (
                          <BookmarkCheck size={16} className="text-indigo-500" />
                        ) : (
                          <Bookmark
                            size={16}
                            className="text-[var(--text-muted)] hover:text-indigo-500 transition-colors duration-200"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}