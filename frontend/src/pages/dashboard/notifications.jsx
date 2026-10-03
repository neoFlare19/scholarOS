import { useState, useMemo } from "react";
import { AlertTriangle, Check, Info, Trash2, ArrowUpRight, RotateCw, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationContext.jsx";
import { cn } from "../../utils/cn.js";

const priorityStyles = {
  High: "bg-red-500/10 text-red-400 border-red-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState("All");

  const tabTotals = useMemo(() => {
    return {
      All: notifications.length,
      Unread: unreadCount,
      Tasks: notifications.filter((n) => n.category === "Tasks").length,
      Papers: notifications.filter((n) => n.category === "Papers").length,
      Mentions: notifications.filter((n) => n.category === "Mentions").length,
    };
  }, [notifications, unreadCount]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "All") return notifications;
    if (activeFilter === "Unread") return notifications.filter((n) => n.unread);
    return notifications.filter((n) => n.category === activeFilter);
  }, [activeFilter, notifications]);

  const today = useMemo(
    () => filteredNotifications.filter((n) => n.group === "Today"),
    [filteredNotifications]
  );
  const yesterday = useMemo(
    () => filteredNotifications.filter((n) => n.group === "Yesterday"),
    [filteredNotifications]
  );
  const older = useMemo(
    () => filteredNotifications.filter((n) => n.group === "Older"),
    [filteredNotifications]
  );

  const handleViewRelated = (item) => {
    markAsRead(item.id);
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-8 w-full relative"
    >
      {/* Header and Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="mb-1 text-xs font-medium text-[var(--text-muted)]">
            Updates
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Notifications
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            disabled={loading}
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 text-sm font-bold text-[var(--text-secondary)] shadow-sm transition hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] active:scale-[0.98] disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCw size={14} className={loading ? "animate-spin" : ""} />
            Sync
          </button>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || loading}
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 text-sm font-bold text-[var(--text-secondary)] shadow-sm transition hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] active:scale-[0.98] disabled:cursor-default disabled:opacity-40 cursor-pointer"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={refetch}
            className="underline font-bold text-rose-300 hover:text-rose-100 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="glass-panel flex items-center rounded-2xl p-1.5 shadow-sm overflow-x-auto max-w-full">
        {Object.keys(tabTotals).map((filter) => {
          const isActive = filter === activeFilter;
          const count = tabTotals[filter];
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex h-10 min-w-[100px] shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-200 active:scale-[0.98] cursor-pointer",
                isActive
                  ? "bg-linear-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-400/30"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
              )}
            >
              <span>{filter}</span>
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications List / Loading / Empty */}
      <section className="glass-panel rounded-[28px] p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl glass-panel">
                <div className="h-11 w-11 rounded-xl skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded skeleton" />
                  <div className="h-3 w-3/4 rounded skeleton" />
                  <div className="h-3 w-20 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-6">
            {today.length > 0 && (
              <NotificationGroup
                title="Today"
                notifications={today}
                onRead={markAsRead}
                onDelete={deleteNotification}
                onView={handleViewRelated}
              />
            )}
            {yesterday.length > 0 && (
              <NotificationGroup
                title="Yesterday"
                notifications={yesterday}
                onRead={markAsRead}
                onDelete={deleteNotification}
                onView={handleViewRelated}
              />
            )}
            {older.length > 0 && (
              <NotificationGroup
                title="Earlier"
                notifications={older}
                onRead={markAsRead}
                onDelete={deleteNotification}
                onView={handleViewRelated}
              />
            )}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center text-center py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Check size={26} strokeWidth={2.5} />
            </div>
            <h2 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
              You're all caught up
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-sm">
              There are no notifications matching the {activeFilter.toLowerCase()} filter.
            </p>
            {activeFilter !== "All" && (
              <button
                onClick={() => setActiveFilter("All")}
                className="mt-5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 cursor-pointer"
              >
                View all notifications
              </button>
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
}

function NotificationGroup({ title, notifications, onRead, onDelete, onView }) {
  return (
    <div className="space-y-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {title}
      </h2>
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onClick={() => onRead(notification.id)}
              className={cn(
                "group glass-panel flex w-full items-start gap-4 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-500/30 cursor-pointer",
                notification.unread
                  ? "border-indigo-500/30 bg-indigo-500/5 shadow-xs"
                  : ""
              )}
            >
              <NotificationIcon icon={notification.icon} />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {notification.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {notification.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {notification.tag && (
                    <span className="inline-flex rounded-lg bg-[var(--bg-surface)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border)]">
                      {notification.tag}
                    </span>
                  )}
                  {notification.priority && (
                    <span
                      className={cn(
                        "inline-flex rounded-lg border px-2.5 py-0.5 text-[10px] font-bold",
                        priorityStyles[notification.priority] || priorityStyles.Medium
                      )}
                    >
                      {notification.priority}
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-muted)]">
                    {notification.time}
                  </span>
                  {notification.unread && (
                    <span className="h-2 w-2 rounded-full bg-linear-to-br from-indigo-500 to-cyan-400" />
                  )}
                </div>
              </div>

              <div
                className="flex shrink-0 flex-col gap-2 pt-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onView(notification)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-indigo-500/10 hover:text-indigo-400 cursor-pointer"
                  title="View related item"
                >
                  <ArrowUpRight size={16} />
                </button>
                <button
                  onClick={() => onDelete(notification.id)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NotificationIcon({ icon }) {
  const baseClass =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs border";

  if (icon === "success") {
    return (
      <span className={`${baseClass} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
        <Check size={18} strokeWidth={3} />
      </span>
    );
  }
  if (icon === "warning") {
    return (
      <span className={`${baseClass} bg-amber-500/10 text-amber-400 border-amber-500/20`}>
        <AlertTriangle size={18} />
      </span>
    );
  }
  if (icon === "info") {
    return (
      <span className={`${baseClass} bg-blue-500/10 text-blue-400 border-blue-500/20`}>
        <Info size={18} />
      </span>
    );
  }

  return (
    <span
      className={`${baseClass} bg-linear-to-br from-indigo-500/15 to-violet-500/15 border-indigo-500/20 text-xs font-extrabold text-indigo-400`}
    >
      {typeof icon === "string" ? icon : "SO"}
    </span>
  );
}