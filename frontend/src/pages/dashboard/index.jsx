import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Layers,
  Users,
  Building2,
  ChevronDown,
  CircleDot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedCounter from "../../components/ui/AnimatedCounter.jsx";
import { apiRequest } from "../../utils/api.js";
import {
  getDashboardStats,
  getRecentActivity,
  getDashboardPapers,
  getDashboardProjects,
  getProjectTasks,
} from "../../services/dashboardService.js";

const VERIFICATION_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export default function Overview() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterBy, setFilterBy] = useState("All");
  const filterRef = useRef(null);

  const [verificationStatus, setVerificationStatus] = useState(VERIFICATION_STATUS.NOT_SUBMITTED);
  const [rejectionReason, setRejectionReason] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(true);

  const [statsData, setStatsData] = useState(null);
  const [papersData, setPapersData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [activitiesData, setActivitiesData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("scholaros_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, papersRes, activityRes, projectsRes] = await Promise.allSettled([
        getDashboardStats(),
        getDashboardPapers(),
        getRecentActivity(),
        getDashboardProjects({ per_page: 5 }),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        setStatsData(statsRes.value.data);
      }

      if (papersRes.status === "fulfilled" && papersRes.value?.data) {
        const rawPapers = Array.isArray(papersRes.value.data)
          ? papersRes.value.data
          : papersRes.value.data?.data || [];
        setPapersData(rawPapers);
      }

      if (activityRes.status === "fulfilled" && activityRes.value?.data) {
        setActivitiesData(activityRes.value.data);
      }

      // Fetch tasks from user projects if available
      if (projectsRes.status === "fulfilled" && projectsRes.value?.data) {
        const projectList = Array.isArray(projectsRes.value.data)
          ? projectsRes.value.data
          : projectsRes.value.data?.data || [];
        
        if (projectList.length > 0) {
          try {
            const firstProject = projectList[0];
            const tasksRes = await getProjectTasks(firstProject.id);
            if (tasksRes?.data) {
              const rawTasks = Array.isArray(tasksRes.data)
                ? tasksRes.data
                : tasksRes.data?.data || [];
              setTasksData(rawTasks);
            }
          } catch {
            setTasksData([]);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching overview data:", err);
      setError(err?.data?.message || err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterRef]);

  useEffect(() => {
    const handleCloseFilter = () => setIsFilterOpen(false);
    window.addEventListener("closeFilter", handleCloseFilter);
    return () => window.removeEventListener("closeFilter", handleCloseFilter);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchVerificationStatus = async () => {
      try {
        const response = await apiRequest("/v1/role-verification");
        if (!isMounted) return;
        const verification = response?.data;
        setVerificationStatus(verification?.status || VERIFICATION_STATUS.NOT_SUBMITTED);
        setRejectionReason(verification?.rejection_reason || "");
      } catch (err) {
        if (!isMounted) return;
        if (err?.status === 404) {
          setVerificationStatus(VERIFICATION_STATUS.NOT_SUBMITTED);
          setRejectionReason("");
        } else {
          console.error("Unable to load role verification status:", err);
        }
      } finally {
        if (isMounted) setVerificationLoading(false);
      }
    };
    fetchVerificationStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const statsList = useMemo(() => {
    const papersCount = statsData?.papers?.total ?? 0;
    const activeProjectsCount = statsData?.projects?.active ?? statsData?.projects?.total ?? 0;
    const tasksCount = statsData?.tasks?.total ?? 0;
    const completedTasks = statsData?.tasks?.completed ?? 0;

    return [
      {
        label: "RESEARCH PAPERS",
        value: papersCount,
        suffix: "",
        sub: "Indexed across grants & labs.",
        icon: FileText,
      },
      {
        label: "ACTIVE PROJECTS",
        value: activeProjectsCount,
        suffix: "",
        sub: "Shared timelines & workflows.",
        icon: Layers,
      },
      {
        label: "ASSIGNED TASKS",
        value: tasksCount,
        suffix: "",
        sub: `${completedTasks} completed successfully.`,
        icon: Users,
      },
      {
        label: "UNREAD ALERTS",
        value: statsData?.notifications?.unread ?? 0,
        suffix: "",
        sub: "Pending review notes & tasks.",
        icon: Building2,
      },
    ];
  }, [statsData]);

  const filteredPapers = useMemo(() => {
    if (filterBy === "All") return papersData;
    return papersData.filter((p) => {
      const statusMatch = p.status?.toLowerCase() === filterBy.toLowerCase().replace(/ /g, "_") || p.status?.toLowerCase() === filterBy.toLowerCase();
      const catMatch = p.category?.name?.toLowerCase().includes(filterBy.toLowerCase()) || p.category_name?.toLowerCase().includes(filterBy.toLowerCase());
      return statusMatch || catMatch;
    });
  }, [filterBy, papersData]);

  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "peer review" || s === "in_review" || s === "review") {
      return "text-[var(--badge-blue-text)] bg-[var(--badge-blue)]";
    }
    if (s === "ready to publish" || s === "approved" || s === "published") {
      return "text-[var(--badge-emerald-text)] bg-[var(--badge-emerald)]";
    }
    if (s === "draft") {
      return "text-[var(--badge-slate-text)] bg-[var(--badge-slate)]";
    }
    return "text-[var(--badge-amber-text)] bg-[var(--badge-amber)]";
  };

  const formatStatusLabel = (status) => {
    if (!status) return "Draft";
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const renderVerificationStatus = () => {
    if (verificationLoading) {
      return (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-4 mt-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded skeleton" />
              <div className="h-3 w-64 max-w-full rounded skeleton" />
            </div>
          </div>
        </motion.div>
      );
    }

    if (verificationStatus === VERIFICATION_STATUS.NOT_SUBMITTED) {
      return (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-4 mt-5 border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center">
              <ShieldCheck size={17} className="text-[var(--muted-foreground)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[var(--text-primary)]">Role verification required</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">Submit your university ID card to verify your Student or Faculty/Supervisor role.</div>
            </div>
            <Link to="/role-setup" className="shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-indigo-600 bg-[var(--badge-blue)] hover:opacity-80 transition-colors">
              Verify <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      );
    }

    if (verificationStatus === VERIFICATION_STATUS.PENDING) {
      return (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-4 mt-5 border border-[var(--warning)]/30 bg-[var(--warning-bg)]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-[var(--warning-bg)] border border-[var(--warning)]/30 flex items-center justify-center">
              <Clock3 size={17} className="text-[var(--warning)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-[var(--warning)]">Verification Pending</div>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-[var(--warning-bg)] text-[var(--warning)]">Under Review</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">Your university ID card is being reviewed by an administrator. You can continue using ScholarOS while verification is pending.</div>
            </div>
          </div>
        </motion.div>
      );
    }

    if (verificationStatus === VERIFICATION_STATUS.APPROVED) {
      return (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-4 mt-5 border border-[var(--success)]/30 bg-[var(--success-bg)]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-[var(--success-bg)] border border-[var(--success)]/30 flex items-center justify-center">
              <CheckCircle2 size={17} className="text-[var(--success)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-[var(--success)]">Role Verified</div>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-[var(--success-bg)] text-[var(--success)]">Approved</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">Your university role has been verified. You can now access ScholarOS research collaboration features.</div>
            </div>
          </div>
        </motion.div>
      );
    }

    if (verificationStatus === VERIFICATION_STATUS.REJECTED) {
      return (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-4 mt-5 border border-[var(--error)]/30 bg-[var(--error-bg)]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-[var(--error-bg)] border border-[var(--error)]/30 flex items-center justify-center">
              <AlertCircle size={17} className="text-[var(--error)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-[var(--error)]">Verification Rejected</div>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-[var(--error-bg)] text-[var(--error)]">Action Required</span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">Your verification request needs to be resubmitted.</div>
              {rejectionReason && (
                <div className="mt-2 text-xs text-[var(--error)]">
                  <span className="font-semibold">Reason:</span> {rejectionReason}
                </div>
              )}
            </div>
            <Link to="/role-setup" className="shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-[var(--error)] bg-[var(--error-bg)] hover:opacity-80 transition-colors">
              Resubmit <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1">Welcome back,</div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            {currentUser?.full_name || "Dr. Leila Morgan"}
          </h1>
        </div>

        {error && (
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <RotateCw size={14} className={loading ? "animate-spin" : ""} /> Retry Sync
          </button>
        )}
      </div>

      {renderVerificationStatus()}

      {error && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 mt-5 text-sm text-rose-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="underline font-bold hover:opacity-80">Retry</button>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mt-7">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-3xl p-6 space-y-3">
                <div className="h-9 w-9 rounded-xl skeleton" />
                <div className="h-3 w-24 rounded skeleton" />
                <div className="h-8 w-16 rounded skeleton" />
                <div className="h-3 w-36 rounded skeleton" />
              </div>
            ))
          : statsList.map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="glass-panel rounded-3xl p-6 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-[var(--border)] flex items-center justify-center shadow-sm">
                    <s.icon size={16} className="text-indigo-500" />
                  </div>
                </div>
                <div className="text-[10px] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase mb-1">{s.label}</div>
                <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1.5">{s.sub}</div>
              </motion.div>
            ))}
      </div>

      {/* Recent Papers + Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 mt-7">
        <div className="glass-panel rounded-[28px] p-8">
          <div className="flex items-center justify-between mb-6 relative" ref={filterRef}>
            <div>
              <div className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase">Research Pipeline</div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Recent Papers</h2>
            </div>
            <div className="relative z-20">
              <button
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  window.dispatchEvent(new CustomEvent("closeNotif"));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
              >
                {filterBy === "All" ? "Filter" : filterBy}
                <ChevronDown size={12} className={`transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-[var(--bg-surface-elevated)] rounded-xl shadow-xl border border-[var(--border)] p-1.5 z-30 overflow-hidden"
                  >
                    {["All", "Peer Review", "Ready to Publish", "Draft", "In Revision", "Approved"].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setFilterBy(item);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                          filterBy === item
                            ? "bg-[var(--badge-blue)] text-[var(--badge-blue-text)] font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 py-3 border-t border-[var(--border)] first:border-0">
                  <div className="h-4 w-28 rounded skeleton" />
                  <div className="h-5 w-3/4 rounded skeleton" />
                  <div className="h-3 w-1/2 rounded skeleton" />
                </div>
              ))
            ) : filteredPapers.length > 0 ? (
              filteredPapers.slice(0, 5).map((p, idx) => {
                const authorsText = p.authors
                  ? Array.isArray(p.authors)
                    ? p.authors.map((a) => (typeof a === "string" ? a : a.name || a.full_name)).join(" · ")
                    : p.authors
                  : p.uploaded_by?.full_name || currentUser?.full_name || "Author";
                const displayId = p.id ? `RP-${String(p.id).padStart(4, "0")}` : `RP-${idx + 1}`;
                const displayStatus = formatStatusLabel(p.status);
                const categoryTag = p.category?.name || p.research_area?.name || "General Research";

                return (
                  <motion.div
                    key={p.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`${idx !== 0 ? "border-t border-[var(--border)] pt-5" : ""} block group cursor-pointer`}
                    whileHover={{ x: 6 }}
                  >
                    <Link to="/dashboard/papers" className="flex items-start gap-4 pt-0.5">
                      <div className="text-[11px] text-[var(--text-muted)] font-medium w-16 shrink-0 pt-0.5 font-mono">
                        {displayId}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
                            {categoryTag}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColor(p.status)}`}>
                            {displayStatus}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {p.title}
                        </h3>
                        <div className="text-xs text-[var(--text-secondary)] line-clamp-1">{authorsText}</div>
                      </div>
                      <div className="text-right shrink-0 pl-4">
                        <div className="text-lg font-extrabold text-[var(--text-primary)]">
                          {p.citations ?? p.views ?? 0}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] tracking-[0.08em] uppercase">
                          {p.citations !== undefined ? "Citations" : "Views"}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                No papers found in the pipeline.
                <div className="mt-3">
                  <Link
                    to="/dashboard/upload"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20"
                  >
                    Upload New Paper
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Priority Tasks */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase mb-1">
              Active Workspace
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight mb-6">
              Priority Tasks
            </h3>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="h-5 w-5 rounded skeleton" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-3/4 rounded skeleton" />
                      <div className="h-3 w-1/3 rounded skeleton" />
                    </div>
                  </div>
                ))
              ) : tasksData.length > 0 ? (
                tasksData.slice(0, 4).map((t, i) => (
                  <label key={t.id || i} className="flex items-start gap-3 group cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={t.status === "completed"}
                      className="mt-0.5 h-5 w-5 rounded-md border-2 border-[var(--border)] text-indigo-500 focus:ring-indigo-200 accent-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-indigo-600 transition-colors truncate">
                        {t.title || t.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mt-1">
                        <CircleDot size={10} className="text-indigo-400 shrink-0" />
                        <span className="truncate">
                          {t.assigned_to?.full_name || t.assigned_user?.full_name || "Assigned"} · {t.due_date || t.deadline || "In Progress"}
                        </span>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No priority tasks assigned.
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase mb-1">
              Live Feed
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight mb-6">
              Activity
            </h3>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-1.5 py-1">
                    <div className="h-4 w-5/6 rounded skeleton" />
                    <div className="h-3 w-1/4 rounded skeleton" />
                  </div>
                ))
              ) : activitiesData.length > 0 ? (
                activitiesData.slice(0, 4).map((a, i) => {
                  const messageText = a.message || `${a.action || "Action"} on ${a.entity_type || "item"}`;
                  const createdTime = a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently";
                  return (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                      <p className="text-sm text-[var(--text-primary)] font-medium leading-snug">
                        {messageText}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{createdTime}</p>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No recent activities recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[28px] bg-gradient-to-r from-[var(--bg-sidebar)] via-[var(--bg-surface)] to-[var(--bg-sidebar)] text-white p-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden mt-7"
      >
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center shadow-xl shadow-indigo-400/20 shrink-0">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold tracking-[0.15em] text-indigo-300 uppercase mb-1.5">ScholarOS Insight</div>
            <h3 className="text-xl font-extrabold tracking-tight mb-2">Your reviewer turnaround is accelerating.</h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Teams using structured paper threads and visible milestone ownership are closing feedback loops 3x faster.
            </p>
          </div>
          <Link
            to="/dashboard/papers"
            className="w-full sm:w-auto self-start sm:self-center shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            View Analytics <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}