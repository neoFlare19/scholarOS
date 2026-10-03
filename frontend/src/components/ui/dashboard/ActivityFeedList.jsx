import { activityFeed } from "../../../data/dashboardOverview.js";

export default function ActivityFeedList() {
  return (
    <div className="glass-panel rounded-[24px] p-6 shadow-sm">
      <div className="border-b border-[var(--border)] pb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Live Feed
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          Activity
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {activityFeed.map((item) => (
          <div
            key={item.id}
            className="py-2 border-b border-[var(--border-subtle)] last:border-0 last:pb-0"
          >
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">{item.actor}</span>
              {" "}{item.action}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {item.meta ? <span className="mr-1 text-[var(--text-secondary)]">{item.meta} ·</span> : null}
              {item.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}