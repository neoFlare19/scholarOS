import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  BookOpenText,
  ChevronRight,
  FolderKanban,
  Home,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Users2,
  Menu,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import logoMark from "../assets/scholaros-mark.svg";
import { cn } from "../utils/cn.js";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Projects", icon: FolderKanban, to: "/dashboard" },
  { label: "Papers", icon: BookOpenText, to: "/dashboard" },
  { label: "Researchers", icon: Users2, to: "/dashboard" },
  { label: "Workspace", icon: Home, to: "/" },
  { label: "Settings", icon: Settings, to: "/dashboard" },
];

export default function DashboardShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-radial-dashboard text-slate-950 relative overflow-hidden">
      {/* Background Ambient Layers */}
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 noise-overlay" />
      
      <div className="section-shell flex min-h-screen gap-6 py-6 lg:gap-8 relative z-10">
        
        {/* PREMIUM FLOATING GLASS SIDEBAR */}
        <aside className="glass-panel shadow-sidebar sticky top-6 hidden h-[calc(100vh-3rem)] w-80 shrink-0 rounded-[36px] px-6 py-8 lg:flex lg:flex-col border-white/60">
          <Link to="/" className="flex items-center gap-4 px-2">
            <div className="relative">
              <img src={logoMark} alt="ScholarOS" className="h-12 w-12 rounded-2xl shadow-lg shadow-blue-500/20" />
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900">ScholarOS</div>
              <div className="text-xs text-slate-500">Enterprise Suite</div>
            </div>
          </Link>

          <nav className="mt-10 flex-1 space-y-2.5">
            {navItems.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300 ease-out",
                    isActive 
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15" 
                      : "text-slate-500 hover:bg-white/60 hover:text-slate-950 hover:shadow-sm"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Glowing Left Indicator */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 via-violet-500 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      />
                    )}
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                        isActive ? "bg-white/10 text-white" : "bg-slate-100/70 text-slate-600 group-hover:bg-blue-50/80 group-hover:text-blue-600"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{label}</span>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 transition-all duration-300", isActive ? "opacity-100 text-white" : "opacity-0 group-hover:opacity-60")} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Promo Card in Sidebar */}
          <div className="glass-dark-panel relative mt-auto overflow-hidden rounded-[28px] px-5 py-6 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_50%)]" />
            <div className="relative">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">Publish with confidence</h3>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Coordinate literature, datasets, and workflows without context switching.
              </p>
              <Link
                to="/register"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
              >
                Create workspace
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="min-w-0 flex-1 space-y-6">
          
          {/* PREMIUM GLASS TOP NAVBAR */}
          <div className="glass-panel shadow-sm sticky top-6 z-20 rounded-[28px] px-5 py-4 border-white/60">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Left: Breadcrumb & Title */}
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <span>Home</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-slate-600">Dashboard</span>
                </div>
                <div className="mt-0.5 flex items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Welcome back, Dr. Morgan</h1>
                  <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>

              {/* Right: Actions & Profile */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex items-center rounded-full border border-slate-200/80 bg-white/80 px-4 py-2.5 text-sm text-slate-500 shadow-sm backdrop-blur-xl hover:bg-white transition-colors duration-200">
                  <Search className="mr-2 h-4 w-4 text-slate-400" />
                  Search papers, projects...
                  <kbd className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">⌘K</kbd>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <button className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white hover:text-slate-950 transition-all duration-200">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">3</span>
                  </button>
                  
                  {/* Profile Card */}
                  <div className="group flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 p-1.5 pr-4 shadow-sm backdrop-blur-xl hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-semibold text-white shadow-md">
                      LM
                    </div>
                    <div className="hidden sm:block leading-tight">
                      <div className="text-sm font-semibold text-slate-900">Leila Morgan</div>
                      <div className="text-xs text-slate-500">Lead Scientist</div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Menu Toggle */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur-xl lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel fixed inset-4 z-50 rounded-3xl p-6 flex flex-col gap-6 md:hidden"
            >
              <button onClick={() => setIsMobileMenuOpen(false)} className="self-end p-2">Close</button>
              {navItems.map(({ label, icon: Icon, to }) => (
                <NavLink key={label} to={to} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 text-slate-700 hover:bg-slate-50">
                  <Icon className="h-5 w-5" />
                  <span className="text-base font-medium">{label}</span>
                </NavLink>
              ))}
            </motion.div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}