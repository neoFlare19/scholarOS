export default function AdminVerificationPlaceholder() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="glass-panel rounded-3xl p-8 text-center max-w-md">
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <span className="text-xl">✓</span>
        </div>

        <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
          Verification Dashboard
        </h1>

        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Admin verification dashboard is ready for implementation.
        </p>
      </div>
    </div>
  );
}