import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Search } from "lucide-react";
import AuthLayout from "../layout/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import { cn } from "../utils/cn.js";
import { apiRequest } from "../utils/api.js";

const INITIAL_VISIBLE_COUNT = 17;

export default function InterestSetup() {
  const navigate = useNavigate();

  const [researchAreas, setResearchAreas] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Gate: only verified, logged-in users reach this step.
  useEffect(() => {
    const token = localStorage.getItem("scholaros_token");
    const rawUser = localStorage.getItem("scholaros_user");

    if (!token || !rawUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(rawUser);

      if (!user.email_verified_at) {
        sessionStorage.setItem(
          "scholaros_verification_email",
          user.email,
        );
        navigate("/verify-otp", { replace: true });
        return;
      }
    } catch {
      navigate("/login", { replace: true });
      return;
    }

    const fetchResearchAreas = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest("/v1/research-areas");

        setResearchAreas(data.data || []);
      } catch (error) {
        setError(
          error.data?.message ||
            "Unable to load research interests. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResearchAreas();
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!query.trim()) return researchAreas;

    const q = query.trim().toLowerCase();

    return researchAreas.filter((interest) =>
      interest.name.toLowerCase().includes(q),
    );
  }, [query, researchAreas]);

  const visible =
    showAll || query.trim()
      ? filtered
      : filtered.slice(0, INITIAL_VISIBLE_COUNT);

  const hiddenCount = Math.max(
    filtered.length - visible.length,
    0,
  );

  const toggleInterest = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleNext = async () => {
    if (selectedIds.size === 0) {
      setError("Please select at least one research interest to continue.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await apiRequest("/v1/research-areas", {
        method: "POST",
        body: JSON.stringify({
          research_area_ids: Array.from(selectedIds),
        }),
      });

      navigate("/role-setup");
    } catch (error) {
      const backendErrors = error.data?.errors;

      if (backendErrors?.research_area_ids) {
        setError(backendErrors.research_area_ids[0]);
      } else if (backendErrors?.["research_area_ids.0"]) {
        setError(backendErrors["research_area_ids.0"][0]);
      } else {
        setError(
          error.data?.message ||
            "Unable to save your research interests. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="What are you researching?"
      subtitle="Select as many as apply. This helps ScholarOS surface relevant papers and researchers from day one."
      sideTitle="Let's tailor ScholarOS to your research."
      sideDescription="A couple of quick steps and your workspace will be ready — recommended papers, projects, and collaborators, matched to you."
      footerText="Step 1 of 2 —"
      footerAction={
        <button
          type="button"
          onClick={() => navigate("/role-setup")}
          className="font-semibold text-blue-700 hover:text-blue-800"
        >
          Skip for now
        </button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search interests…"
            disabled={loading}
            className="w-full rounded-2xl border border-slate-200/80 bg-white/85 py-3.5 pl-11 pr-4 text-slate-900 shadow-sm outline-none backdrop-blur-xl placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            Research interests
          </span>

          <span className="text-sm font-semibold text-blue-700">
            {selectedIds.size} selected
          </span>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
            Loading research interests…
          </p>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
            No interests match your search. Try a different term.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {visible.map((interest) => {
              const selected = selectedIds.has(interest.id);

              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all",
                    selected
                      ? "border-transparent bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)]"
                      : "border-slate-200/80 bg-white/85 text-slate-700 backdrop-blur-xl hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700",
                  )}
                >
                  {selected && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}

                  {interest.name}
                </button>
              );
            })}

            {!showAll && hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex items-center rounded-full border border-dashed border-blue-300 bg-blue-50/70 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100/70"
              >
                + {hiddenCount} more
              </button>
            )}
          </div>
        )}

        <Button
          type="button"
          onClick={handleNext}
          disabled={loading || submitting}
          className="w-full justify-center py-3.5 text-base"
        >
          {submitting ? "Saving…" : "Next: Select Role →"}
        </Button>
      </div>
    </AuthLayout>
  );
}