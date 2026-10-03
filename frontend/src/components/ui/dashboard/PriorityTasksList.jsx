import { priorityTasks } from "../../../data/dashboardOverview.js";
import { cn } from "../../../utils/cn.js";

const dotStyles = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
};

export default function PriorityTasksList() {
  return (
    <div className="glass-panel rounded-[24px] p-6 shadow-sm">
      <div className="border-b border-[var(--border)] pb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Active Workspace
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Priority Tasks
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {priorityTasks.map((task) => (
          <label
            key={task.id}
            className="flex cursor-pointer items-start gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0 last:pb-0 hover:bg-[var(--bg-surface-elevated)] rounded-lg -mx-2 px-2 transition-colors"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--border)] text-blue-600 focus:ring-blue-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-6 text-[var(--text-primary)]">{task.title}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotStyles[task.dot])} />
                <span className="font-medium text-[var(--text-secondary)]">{task.person}</span>
                <span className="text-[var(--text-muted)]">·</span>
                <span>{task.due}</span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}