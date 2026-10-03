import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpenText,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Users2,
  Menu,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "../utils/cn.js";
import { useNotifications } from "../contexts/NotificationContext.jsx";
import { getCurrentUser } from "../services/dashboardService.js";

const workspaceItems = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Projects", icon: FolderKanban, to: "/dashboard/projects" },
  { label: "Papers", icon: BookOpenText, to: "/dashboard/papers" },
  { label: "Researchers", icon: Users2, to: "/dashboard/researchers" },
];

const accountItems = [
  { label: "Notifications", icon: Bell, to: "/dashboard/notifications" },
  { label: "Settings", icon: Settings, to: "/dashboard/settings" },
];

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function DashboardShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("scholaros_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const response = await getCurrentUser();
        if (isMounted && response?.data) {
          setCurrentUser(response.data);
          localStorage.setItem("scholaros_user", JSON.stringify(response.data));
        }
      } catch (e) {
        // Fallback to local storage if present
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  useEffect(() => {
    const handleCloseNotif = () => setIsNotifOpen(false);
    window.addEventListener("closeNotif", handleCloseNotif);
    return () => window.removeEventListener("closeNotif", handleCloseNotif);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("scholaros_token");
    localStorage.removeItem("scholaros_user");
    window.location.href = "/";
  };

  const getBreadcrumbTitle = (pathname) => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/dashboard/projects") return "Projects";
    if (pathname === "/dashboard/papers") return "Research Papers";
    if (pathname === "/dashboard/researchers") return "Researchers";
    if (pathname === "/dashboard/notifications") return "Notifications";
    if (pathname === "/dashboard/settings") return "Settings";
    if (pathname === "/dashboard/profile") return "Profile";
    if (pathname === "/dashboard/upload") return "Upload Paper";
    return "Dashboard";
  };

  const userName = currentUser?.full_name || "Dr. Leila Morgan";
  const userInitials = getInitials(userName);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex text-[var(--text-primary)]">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-[260px] shrink-0 bg-[var(--bg-sidebar)] text-white flex-col h-screen sticky top-0 overflow-hidden">
        <div className="px-6 pt-7 pb-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-lg">S</span>
            </div>
            <div>
              <div className="font-bold text-base leading-tight">ScholarOS</div>
              <div className="text-[11px] text-[var(--text-muted)] tracking-[0.15em] uppercase">
                Enterprise Suite
              </div>
            </div>
          </Link>
        </div>

        <nav className="px-4 flex-1 space-y-1 overflow-y-auto pb-4">
          <div className="text-[10px] text-[var(--text-muted)] font-semibold tracking-[0.18em] uppercase mb-3 px-2 mt-4">
            Workspace
          </div>
          {workspaceItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              end={label === "Overview"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/5 ring-1 ring-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center",
                      isActive
                        ? "bg-linear-to-br from-indigo-400 to-violet-400 shadow-md shadow-indigo-400/30"
                        : "bg-transparent",
                    )}
                  >
                    <Icon
                      size={15}
                      className={
                        isActive
                          ? "text-white"
                          : "text-[var(--text-muted)] group-hover:text-white"
                      }
                    />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}

          <div className="text-[10px] text-[var(--text-muted)] font-semibold tracking-[0.18em] uppercase mt-8 mb-3 px-2">
            Account
          </div>
          {accountItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/5 ring-1 ring-white/10 text-white"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isActive ? "bg-indigo-400" : "bg-[var(--text-muted)]",
                    )}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 shrink-0">
          <div className="rounded-2xl bg-linear-to-br from-indigo-600/30 to-violet-600/20 border border-white/5 p-5 backdrop-blur-xl">
            <h4 className="font-bold text-white text-sm mb-1">
              Publish with confidence
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Coordinate literature without context switching.
            </p>
          </div>

          <div className="mt-4 px-3 py-3 rounded-2xl bg-white/5 flex items-center gap-3 border border-white/5">
            <Link
              to="/dashboard/profile"
              className="flex flex-1 items-center gap-3 min-w-0 hover:opacity-90 transition-opacity"
            >
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-indigo-400 to-violet-400 flex items-center justify-center shadow-md shadow-indigo-400/20 text-white text-xs font-bold shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {userName}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative min-w-0">
        <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-center justify-between gap-3 bg-[var(--bg-surface)] backdrop-blur-xl border-b border-[var(--border)]">
          <div className="hidden sm:block text-xs text-[var(--text-muted)] font-medium shrink-0">
            Home /{" "}
            <span className="text-[var(--text-primary)] font-semibold">
              {getBreadcrumbTitle(location.pathname)}
            </span>
          </div>

          <div className="flex-1 max-w-xl sm:mx-6 pl-14 lg:pl-0">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                size={16}
              />
              <input
                type="text"
                placeholder="Search papers, projects..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    navigate(`/dashboard/papers?search=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative shrink-0">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  window.dispatchEvent(new CustomEvent("closeFilter"));
                }}
                className="h-10 w-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center shadow-sm hover:shadow-md transition-shadow text-[var(--text-muted)] cursor-pointer"
              >
                <Bell size={18} />
              </button>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[320px] sm:w-80 bg-[var(--bg-surface-elevated)] rounded-2xl shadow-xl border border-[var(--border)] p-4 z-40"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        Notifications
                      </div>
                      <Link
                        to="/dashboard/notifications"
                        onClick={() => setIsNotifOpen(false)}
                        className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              markAsRead(item.id);
                              if (item.link) {
                                navigate(item.link);
                                setIsNotifOpen(false);
                              }
                            }}
                            className={cn(
                              "p-3 rounded-xl border border-[var(--border)] transition-colors cursor-pointer",
                              item.unread
                                ? "bg-[var(--badge-blue)] hover:bg-[var(--bg-surface)]"
                                : "hover:bg-[var(--bg-surface)] bg-transparent"
                            )}
                          >
                            <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">
                              {item.title}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                              {item.description}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] mt-1.5">
                              {item.time}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/dashboard/profile"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0"
            >
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-400/20 text-sm font-bold shrink-0">
                {userInitials}
              </div>
              <div className="hidden sm:block pl-1">
                <div className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                  {userName}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online
                </div>
              </div>
            </Link>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 space-y-6 lg:space-y-7 max-w-7xl mx-auto">
          <Outlet />
        </div>

        {/* Floating Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-40 lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-sidebar)] text-white shadow-xl"
        >
          <Menu size={18} />
        </button>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="w-[260px] h-full bg-[var(--bg-sidebar)] p-6 flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                      S
                    </div>
                    <span className="font-bold text-white text-base">
                      ScholarOS
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <nav className="mt-6 space-y-1 flex-1 overflow-y-auto">
                  {[...workspaceItems, ...accountItems].map(
                    ({ label, icon: Icon, to }) => (
                      <NavLink
                        key={label}
                        to={to}
                        end={label === "Overview"}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5",
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                isActive ? "bg-indigo-400" : "bg-[var(--text-muted)]",
                              )}
                            />
                            {label}
                          </>
                        )}
                      </NavLink>
                    ),
                  )}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}