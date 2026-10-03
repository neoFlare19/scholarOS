import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { cn } from "../../utils/cn.js";
import { getCurrentUser } from "../../services/dashboardService.js";

export default function Settings() {
  const navigate = useNavigate();
  const { selectedTheme, setTheme } = useTheme();

  const [email, setEmail] = useState(() => {
    try {
      const stored = localStorage.getItem("scholaros_user");
      if (stored) {
        const u = JSON.parse(stored);
        return u.email || "user@institution.edu";
      }
    } catch {}
    return "user@institution.edu";
  });

  useEffect(() => {
    let isMounted = true;
    getCurrentUser()
      .then((res) => {
        if (isMounted && res?.data?.email) {
          setEmail(res.data.email);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [password, setPassword] = useState("••••••••");
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [paperReviewNotifications, setPaperReviewNotifications] =
    useState(true);
  const [projectActivityNotifications, setProjectActivityNotifications] =
    useState(true);
  const [projectInvitationNotifications, setProjectInvitationNotifications] =
    useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [publishedVisibility, setPublishedVisibility] = useState(true);
  const [allowProjectInvitations, setAllowProjectInvitations] = useState(true);
  const [language, setLanguage] = useState("English (US)");
  const [timezone, setTimezone] = useState("GMT+6 · Dhaka");
  const [notice, setNotice] = useState(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  };

  const saveChanges = () => showNotice("Settings saved successfully.");
  const handleDeactivate = () => {
    setIsDeactivateModalOpen(false);
    showNotice("Account deactivation request submitted. (Placeholder)");
  };

  const handleThemeSelect = (theme) => {
    setTheme(theme);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-8 w-full relative"
    >
      <div>
        <div className="mb-1 text-xs font-medium text-[var(--text-muted)]">
          Account
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Settings
        </h1>
      </div>

      <div className="space-y-5">
        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-lg)] backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Login
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Account & Security
          </h2>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[var(--text-primary)]">
                Email Address
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface-elevated)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/60"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[var(--text-primary)]">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface-elevated)] px-4 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/60"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => showNotice("Password change flow initiated.")}
              className="h-10 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={() =>
                showNotice("Two-factor authentication setup started.")
              }
              className="h-10 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
            >
              Enable Two-Factor Authentication
            </button>
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Active login sessions
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Chrome on macOS · Dhaka, BD · Current device
            </p>
            <button
              type="button"
              onClick={() => showNotice("All other devices signed out.")}
              className="mt-3 h-10 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
            >
              Sign out everywhere else
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-lg)] backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Appearance
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Theme
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <ThemeButton
              label="Light"
              icon={<Sun size={18} />}
              value="light"
              current={selectedTheme}
              onClick={handleThemeSelect}
            />
            <ThemeButton
              label="Dark"
              icon={<Moon size={18} />}
              value="dark"
              current={selectedTheme}
              onClick={handleThemeSelect}
            />
            <ThemeButton
              label="System"
              icon={<Monitor size={18} />}
              value="system"
              current={selectedTheme}
              onClick={handleThemeSelect}
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-lg)] backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Preferences
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Notification Settings
          </h2>

          <div className="mt-5 divide-y divide-[var(--border)]">
            <ToggleRow
              label="Task assignments"
              description="Get notified when you're assigned a new task."
              checked={taskNotifications}
              onChange={setTaskNotifications}
            />
            <ToggleRow
              label="Paper review comments"
              description="Get notified when someone comments on your paper."
              checked={paperReviewNotifications}
              onChange={setPaperReviewNotifications}
            />
            <ToggleRow
              label="Project activity"
              description="Get notified about updates within your active projects."
              checked={projectActivityNotifications}
              onChange={setProjectActivityNotifications}
            />
            <ToggleRow
              label="Project invitations"
              description="Get notified when you're invited to a project."
              checked={projectInvitationNotifications}
              onChange={setProjectInvitationNotifications}
            />
            <ToggleRow
              label="Weekly digest email"
              description="A summary of activity across your workspace."
              checked={weeklyDigest}
              onChange={setWeeklyDigest}
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-lg)] backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Visibility
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Privacy
          </h2>

          <div className="mt-5 divide-y divide-[var(--border)]">
            <ToggleRow
              label="Public researcher profile"
              description="Allow other researchers to view your profile and publications."
              checked={publicProfile}
              onChange={setPublicProfile}
            />
            <ToggleRow
              label="Show email on profile"
              description="Display your email address to other logged-in researchers."
              checked={showEmail}
              onChange={setShowEmail}
            />
            <ToggleRow
              label="Who can view published research"
              description="Allow everyone or only collaborators to view your published works."
              checked={publishedVisibility}
              onChange={setPublishedVisibility}
            />
            <ToggleRow
              label="Allow project invitations"
              description="Let faculty invite you to new research projects directly."
              checked={allowProjectInvitations}
              onChange={setAllowProjectInvitations}
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-lg)] backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
            General
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Preferences
          </h2>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[var(--text-primary)]">
                Language
              </span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-surface-elevated)] px-4 pr-10 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/60"
              >
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-[var(--text-primary)]">
                Time Zone
              </span>
              <select
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-surface-elevated)] px-4 pr-10 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/60"
              >
                <option>GMT+6 · Dhaka</option>
                <option>GMT-5 · New York</option>
                <option>GMT+0 · London</option>
                <option>GMT+1 · Berlin</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--error)]/30 bg-[var(--bg-surface)] p-7 shadow-[var(--shadow-lg)] backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-500">
            Danger Zone
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Deactivate Account
          </h2>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-red-500">
                Deactivate my account
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                Your profile and data will be hidden from other researchers.
                This can be reversed by contacting your department admin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDeactivateModalOpen(true)}
              className="h-10 shrink-0 rounded-xl border border-[var(--error)]/30 bg-[var(--error-bg)] px-5 text-sm font-bold text-[var(--error)] transition-colors"
            >
              Deactivate
            </button>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 text-sm font-bold text-[var(--text-secondary)] shadow-sm transition-colors hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveChanges}
            className="h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-300/35 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isDeactivateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
            onClick={() => setIsDeactivateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md rounded-[24px] bg-[var(--bg-surface-elevated)] backdrop-blur-xl border border-[var(--border)] p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
                Deactivate account?
              </h2>
              <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                You will lose access to your projects, papers, and collaboration
                data. This action can be reversed by contacting your admin.
              </p>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeactivateModalOpen(false)}
                  className="h-10 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 text-sm font-bold text-[var(--text-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeactivate}
                  className="h-10 rounded-xl bg-red-500 px-6 text-sm font-bold text-white transition-colors shadow-lg shadow-red-500/30"
                >
                  Deactivate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[var(--bg-sidebar)] px-5 py-3 text-sm font-bold text-white shadow-2xl"
        >
          {notice}
        </div>
      )}
    </motion.div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div>
        <div className="text-sm font-bold text-[var(--text-primary)]">
          {label}
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
          checked
            ? "bg-gradient-to-r from-indigo-500 to-cyan-400"
            : "bg-[var(--muted)]"
        }`}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${checked ? "right-1" : "left-1"}`}
        />
      </button>
    </div>
  );
}

function ThemeButton({ label, icon, value, current, onClick }) {
  const isActive = current === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-400/30"
          : "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
