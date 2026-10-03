import AnimatedCounter from "../AnimatedCounter.jsx";

export default function StatCard({ icon: Icon, label, value, suffix = "", description }) {
  return (
    <div className="glass-panel relative rounded-[24px] p-6 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-[24px] bg-linear-to-r from-blue-500 via-violet-500 to-cyan-400" />
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--badge-blue)] text-[var(--badge-blue-text)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}