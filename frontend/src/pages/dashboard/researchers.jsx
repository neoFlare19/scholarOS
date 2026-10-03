import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  RotateCw,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FolderGit2,
  UserCheck,
  UserPlus,
  Mail,
  Building,
  GraduationCap,
} from "lucide-react";
import { cn } from "../../utils/cn.js";
import {
  getDashboardResearchers,
  getResearcherDetails,
} from "../../services/dashboardService.js";

const departments = [
  "All Departments",
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Information Technology",
];

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function isSystemAdmin(researcher) {
  if (!researcher) return false;
  const role = (researcher.role || "").toLowerCase().trim();
  const roleName = (researcher.role_name || "").toLowerCase().trim();

  return (
    role === "system administrator" ||
    role === "sys_admin" ||
    role === "system_admin" ||
    role === "admin" ||
    role === "administrator" ||
    roleName === "sys_admin" ||
    roleName === "system_admin" ||
    roleName === "admin"
  );
}

export default function Researchers() {
  const [department, setDepartment] = useState("All Departments");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const [followings, setFollowings] = useState(() => {
    try {
      const saved = localStorage.getItem("scholaros_followed_researchers");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [selectedResearcherId, setSelectedResearcherId] = useState(null);
  const [selectedResearcher, setSelectedResearcher] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Persist followings to localStorage
  const toggleFollow = (idOrName) => {
    setFollowings((current) => {
      const next = new Set(current);
      if (next.has(idOrName)) next.delete(idOrName);
      else next.add(idOrName);
      try {
        localStorage.setItem(
          "scholaros_followed_researchers",
          JSON.stringify(Array.from(next))
        );
      } catch (e) {
        console.warn("Could not persist followings", e);
      }
      return next;
    });
  };

  // Fetch researchers from API
  const fetchResearchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
      };

      if (debouncedQuery) {
        params.search = debouncedQuery;
      }

      const res = await getDashboardResearchers(params);

      let list = [];
      if (res?.data?.data && Array.isArray(res.data.data)) {
        list = res.data.data;
        setPagination({
          currentPage: res.data.current_page || 1,
          lastPage: res.data.last_page || 1,
          total: res.data.total || list.length,
        });
      } else if (Array.isArray(res?.data)) {
        list = res.data;
        setPagination({
          currentPage: 1,
          lastPage: 1,
          total: list.length,
        });
      }

      setResearchers(list);
    } catch (err) {
      console.error("Error loading researchers:", err);
      setError(err?.data?.message || err?.message || "Failed to load researchers");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page]);

  useEffect(() => {
    fetchResearchers();
  }, [fetchResearchers]);

  // Load modal details when a researcher is selected
  useEffect(() => {
    let isMounted = true;
    async function loadModalDetails() {
      if (!selectedResearcherId) {
        setSelectedResearcher(null);
        setModalError(null);
        return;
      }
      try {
        setModalLoading(true);
        setModalError(null);
        const res = await getResearcherDetails(selectedResearcherId);
        if (isMounted && res?.data) {
          setSelectedResearcher(res.data);
        }
      } catch (err) {
        console.error("Error loading researcher details:", err);
        if (isMounted) {
          setModalError(
            err?.data?.message || err?.message || "Failed to load profile details"
          );
        }
      } finally {
        if (isMounted) setModalLoading(false);
      }
    }
    loadModalDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedResearcherId]);

  // Filter researchers by selected department and exclude system administrators
  const visibleResearchers = useMemo(() => {
    const nonAdminResearchers = researchers.filter((r) => !isSystemAdmin(r));

    if (department === "All Departments") {
      return nonAdminResearchers;
    }
    const targetDept = department.toLowerCase();
    return nonAdminResearchers.filter((r) => {
      const dept = (r.department || "").toLowerCase();
      return (
        dept.includes(targetDept) ||
        (targetDept.includes("computer science") && dept.includes("cs")) ||
        (targetDept.includes("software") && dept.includes("se")) ||
        (targetDept.includes("data science") && dept.includes("ds")) ||
        (targetDept.includes("information technology") && dept.includes("it"))
      );
    });
  }, [department, researchers]);

  return (
    <div className="space-y-6 pb-8 w-full min-w-0 relative">
      {/* Page Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1">
            Directory
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Researchers
          </h1>
        </div>
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            size={16}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search by name, interest, email..."
            className="w-full rounded-full border border-[var(--border)] bg-[var(--input-bg)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] shadow-sm outline-none backdrop-blur-md placeholder:text-[var(--text-muted)] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Departments Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {departments.map((item) => (
          <button
            key={item}
            onClick={() => setDepartment(item)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer",
              department === item
                ? "bg-linear-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-400/30"
                : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:shadow-sm hover:text-[var(--text-primary)]"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Researchers Grid / Loading / Error */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="glass-panel rounded-[28px] p-7 space-y-4 flex flex-col items-center"
            >
              <div className="h-20 w-20 rounded-full skeleton" />
              <div className="h-5 w-32 rounded skeleton" />
              <div className="h-3 w-24 rounded skeleton" />
              <div className="flex gap-2 mt-2">
                <div className="h-4 w-12 rounded-full skeleton" />
                <div className="h-4 w-12 rounded-full skeleton" />
              </div>
              <div className="h-8 w-full rounded-full skeleton mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel rounded-[28px] p-10 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Unable to Load Researchers
          </h3>
          <p className="text-rose-500 font-medium text-sm mb-4">{error}</p>
          <button
            onClick={fetchResearchers}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <RotateCw size={15} /> Retry
          </button>
        </div>
      ) : visibleResearchers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleResearchers.map((researcher) => {
              const name = researcher.full_name || researcher.name || "Researcher";
              const initials = researcher.initials || getInitials(name);
              const role = researcher.role || "Researcher";
              const field =
                researcher.field ||
                (researcher.department
                  ? `${researcher.department} Dept.`
                  : researcher.institution || "Academic Researcher");
              const isFollowing =
                followings.has(researcher.id) || followings.has(name);

              const rawInterests = researcher.research_interests;
              let interests = [];
              if (Array.isArray(rawInterests)) {
                interests = rawInterests;
              } else if (typeof rawInterests === "string" && rawInterests) {
                interests = rawInterests.split(",").map((s) => s.trim());
              }

              const papersCount =
                researcher.paper_count ?? researcher.papers ?? 0;
              const projectsCount =
                researcher.project_count ?? researcher.projects ?? 0;
              const followersCount =
                researcher.followers_count ?? researcher.followers ?? 0;

              return (
                <motion.div
                  key={researcher.id || name}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedResearcherId(researcher.id)}
                  className="group relative flex flex-col items-center rounded-[28px] glass-panel p-7 transition-all hover:shadow-xl hover:border-indigo-500/30 cursor-pointer w-full"
                >
                  {/* Avatar */}
                  <div className="h-20 w-20 shrink-0 rounded-full bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-400/20 mb-4 overflow-hidden">
                    {researcher.profile_picture ? (
                      <img
                        src={researcher.profile_picture}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] text-center line-clamp-1 group-hover:text-indigo-500 transition-colors">
                    {name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] text-center font-medium">
                    {role}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] text-center line-clamp-1 mt-0.5">
                    {field}
                  </p>

                  {/* Interests */}
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-h-14 overflow-hidden">
                    {interests.length > 0 ? (
                      interests.slice(0, 3).map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)] truncate max-w-[120px]"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)] italic">
                        General Research
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mt-5 w-full border-t border-[var(--border)] pt-4 grid grid-cols-3 text-center gap-2">
                    {[
                      [papersCount, "Papers"],
                      [projectsCount, "Projects"],
                      [followersCount, "Followers"],
                    ].map(([value, label]) => (
                      <div key={label}>
                        <div className="text-lg font-extrabold leading-none text-[var(--text-primary)]">
                          {value}
                        </div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(researcher.id || name);
                    }}
                    className={cn(
                      "mt-5 w-full rounded-full py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5",
                      isFollowing
                        ? "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:border-indigo-200 hover:text-indigo-600"
                        : "bg-linear-to-r from-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-400/20 hover:shadow-lg"
                    )}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={15} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={15} />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.lastPage > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Page {pagination.currentPage} of {pagination.lastPage}
              </span>
              <button
                disabled={page >= pagination.lastPage}
                onClick={() => setPage((p) => Math.min(pagination.lastPage, p + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-[28px] glass-panel py-20 text-center text-[var(--text-secondary)]">
          <Users className="h-12 w-12 text-indigo-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            No Researchers Found
          </h3>
          <p className="text-sm mt-1 max-w-sm mx-auto text-[var(--text-muted)]">
            No researcher profiles match your search criteria. Try a different query or department filter.
          </p>
        </div>
      )}

      {/* DETAILED PROFILE MODAL */}
      <AnimatePresence>
        {selectedResearcherId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setSelectedResearcherId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-[var(--bg-surface-elevated)] border border-[var(--border)] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedResearcherId(null)}
                className="absolute right-4 top-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {modalLoading ? (
                <div className="space-y-4 py-8 flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full skeleton" />
                  <div className="h-6 w-48 rounded skeleton" />
                  <div className="h-4 w-32 rounded skeleton" />
                  <div className="h-16 w-full rounded-2xl skeleton mt-4" />
                </div>
              ) : modalError ? (
                <div className="py-8 text-center space-y-3">
                  <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                  <p className="text-sm text-rose-400 font-semibold">{modalError}</p>
                  <button
                    onClick={() => {
                      const id = selectedResearcherId;
                      setSelectedResearcherId(null);
                      setTimeout(() => setSelectedResearcherId(id), 50);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] cursor-pointer"
                  >
                    <RotateCw size={13} /> Retry
                  </button>
                </div>
              ) : selectedResearcher ? (
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-400/20 mb-4 overflow-hidden">
                    {selectedResearcher.profile_picture ? (
                      <img
                        src={selectedResearcher.profile_picture}
                        alt={selectedResearcher.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(selectedResearcher.full_name)
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
                    {selectedResearcher.full_name}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] font-medium mt-0.5">
                    {selectedResearcher.role || "Researcher"} ·{" "}
                    {selectedResearcher.department
                      ? `${selectedResearcher.department} Dept.`
                      : selectedResearcher.institution || "ScholarOS Faculty"}
                  </p>
                  {selectedResearcher.email && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] px-3 py-1 rounded-full border border-[var(--border)]">
                      <Mail size={12} />
                      <span>{selectedResearcher.email}</span>
                    </div>
                  )}

                  {selectedResearcher.bio && (
                    <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed text-left bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border)] w-full">
                      {selectedResearcher.bio}
                    </p>
                  )}

                  {selectedResearcher.research_areas &&
                    selectedResearcher.research_areas.length > 0 && (
                      <div className="mt-4 w-full text-left">
                        <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                          Research Areas
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedResearcher.research_areas.map((area) => (
                            <span
                              key={area}
                              className="rounded-full bg-[var(--badge-blue)] px-3 py-1 text-xs font-semibold text-[var(--badge-blue-text)]"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="mt-6 w-full border-t border-[var(--border)] pt-4 grid grid-cols-4 text-center gap-2">
                    <div>
                      <div className="text-xl font-extrabold text-[var(--text-primary)]">
                        {selectedResearcher.paper_count ?? 0}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                        Papers
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-[var(--text-primary)]">
                        {selectedResearcher.project_count ?? 0}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                        Projects
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-[var(--text-primary)]">
                        {selectedResearcher.followers_count ?? 0}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                        Followers
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-[var(--text-primary)]">
                        {selectedResearcher.following_count ?? 0}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
                        Following
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 w-full">
                    <button
                      onClick={() =>
                        toggleFollow(
                          selectedResearcher.id || selectedResearcher.full_name
                        )
                      }
                      className={cn(
                        "w-full rounded-full py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2",
                        followings.has(selectedResearcher.id) ||
                          followings.has(selectedResearcher.full_name)
                          ? "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
                          : "bg-linear-to-r from-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-400/20 hover:shadow-lg"
                      )}
                    >
                      {followings.has(selectedResearcher.id) ||
                      followings.has(selectedResearcher.full_name) ? (
                        <>
                          <UserCheck size={16} />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>Follow Researcher</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}