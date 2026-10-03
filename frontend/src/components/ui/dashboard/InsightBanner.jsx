import { ArrowUpRight, Sparkles } from "lucide-react";

export default function InsightBanner() {
  return (
    <div className="glass-dark-panel relative overflow-hidden rounded-[24px] px-6 py-8 text-white shadow-xl sm:px-10 bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-600/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              ScholarOS Insight
            </div>
            <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              Your reviewer turnaround is accelerating.
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Teams using structured paper threads and visible milestone
              ownership are closing feedback loops 3× faster.
            </p>
          </div>
        </div>
        <button className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 sm:self-auto">
          View Analytics
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
