import { ChevronDown } from "lucide-react";
import { researchPapers } from "../../../data/researchPapers.js";
import { cn } from "../../../utils/cn.js";

const statusStyles = {
  "Peer review": "bg-[var(--badge-blue)] text-[var(--badge-blue-text)] border border-[var(--border)]",
  "Ready to publish": "bg-[var(--badge-emerald)] text-[var(--badge-emerald-text)] border border-[var(--border)]",
  Draft: "bg-[var(--badge-slate)] text-[var(--badge-slate-text)] border border-[var(--border)]",
  "In revision": "bg-[var(--badge-amber)] text-[var(--badge-amber-text)] border border-[var(--border)]",
};

export default function RecentPapersList() {
  return (
    <div className="glass-panel rounded-[24px] p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Research Pipeline
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Recent Papers
          </h2>
        </div>
        <button className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] shadow-sm hover:bg-[var(--bg-surface-elevated)] transition-colors">
          Filter
          <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {researchPapers.map((paper) => (
          <div
            key={paper.id}
            className="flex flex-col gap-1.5 pb-4 border-b border-[var(--border-subtle)] last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[var(--text-muted)] font-medium">{paper.id}</span>
                <span className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-[var(--muted-foreground)]">
                  {paper.domain}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 font-medium",
                    statusStyles[paper.status] || "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  )}
                >
                  {paper.status}
                </span>
              </div>
              <h3 className="mt-1.5 text-base font-semibold leading-snug text-[var(--text-primary)]">
                {paper.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{paper.authors.join(" • ")}</p>
            </div>
            <div className="shrink-0 text-right sm:pl-6 pt-1 sm:pt-0">
              <div className="text-lg font-bold text-[var(--text-primary)]">{paper.citations}</div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Citations
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}