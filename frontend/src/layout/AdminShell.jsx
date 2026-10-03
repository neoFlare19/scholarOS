import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const adminNavigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    to: "/admin",
  },
  {
    label: "Verification Requests",
    icon: ShieldCheck,
    to: "/admin/verification",
  },
];

const systemNavigation = [
  {
    label: "Settings",
    icon: Settings,
    to: "/admin/settings",
  },
];

export default function AdminShell() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname === "/admin") return "Admin Dashboard";
    if (location.pathname === "/admin/verification")
      return "Verification Requests";
    if (location.pathname === "/admin/settings") return "Settings";

    return "Admin Dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("scholaros_user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const navigation = [...adminNavigation, ...systemNavigation];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Desktop Sidebar - always dark, matches DashboardShell sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] bg-[var(--bg-sidebar)] lg:flex lg:flex-col">
        {/* Brand */}
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              S
            </div>

            <div>
              <div className="font-bold text-white text-base tracking-tight">
                ScholarOS
              </div>

              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--sidebar-text)] mt-0.5">
                Administration
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-white/10" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--sidebar-text)]">
            Administration
          </div>

          <div className="space-y-1">
            {adminNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={17}
                        className={
                          isActive ? "text-indigo-300" : "text-[var(--sidebar-text)]"
                        }
                      />

                      <span>{item.label}</span>

                      {item.to === "/admin/verification" && (
                        <span className="ml-auto text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/10">
                          Review
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="px-3 mt-8 mb-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--sidebar-text)]">
            System
          </div>

          <div className="space-y-1">
            {systemNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={17}
                        className={
                          isActive ? "text-indigo-300" : "text-[var(--sidebar-text)]"
                        }
                      />

                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Admin identity / logout */}
        <div className="p-4 border-t border-white/10">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">
                  Administrator
                </div>

                <div className="text-[10px] text-[var(--sidebar-text)] uppercase tracking-wide">
                  Admin
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 bg-[var(--bg-sidebar)] border-b border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
            S
          </div>

          <div>
            <div className="text-sm font-bold text-white">ScholarOS</div>
            <div className="text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--sidebar-text)]">
              Administration
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-[var(--sidebar-text)] hover:bg-white/10"
        >
          <Menu size={19} />
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-[85vw] max-w-[280px] h-full bg-[var(--bg-sidebar)] p-5 flex flex-col shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    S
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white">
                      ScholarOS
                    </div>

                    <div className="text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--sidebar-text)]">
                      Administration
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--sidebar-text)] hover:text-white hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 py-6 overflow-y-auto">
                <div className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--sidebar-text)]">
                  Administration
                </div>

                <div className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/admin"}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              size={17}
                              className={
                                isActive
                                  ? "text-indigo-300"
                                  : "text-[var(--sidebar-text)]"
                              }
                            />

                            <span>{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white transition-colors"
              >
                <LogOut size={17} />
                Logout
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-[260px] min-h-screen">
        <header className="hidden lg:flex h-[72px] items-center justify-between px-8 border-b border-[var(--border)] bg-[var(--bg-page)]/80 backdrop-blur-xl">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Administration
            </div>

            <h1 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              A
            </div>
          </div>
        </header>

        <div className="pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}