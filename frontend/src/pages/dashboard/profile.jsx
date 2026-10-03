import { motion } from "framer-motion";
import { Share2, Pencil, FolderKanban, Quote, RotateCw } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../utils/api.js";
import {
  getDashboardStats,
  getDashboardProjects,
  getDashboardPapers,
} from "../../services/dashboardService.js";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const tagStatusColor = (tag) => {
  const t = (tag || "").toLowerCase();
  if (t === "published" || t === "approved" || t === "ready to publish")
    return "text-[var(--badge-emerald-text)] bg-[var(--badge-emerald)]";
  if (t === "peer review" || t === "review")
    return "text-[var(--badge-blue-text)] bg-[var(--badge-blue)]";
  return "text-[var(--badge-slate-text)] bg-[var(--badge-slate)]";
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [verification, setVerification] = useState(null);
  const [stats, setStats] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [userPapers, setUserPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResult, verificationResult, statsResult, projectsResult, papersResult] =
        await Promise.allSettled([
          apiRequest("/v1/user"),
          apiRequest("/v1/role-verification"),
          getDashboardStats(),
          getDashboardProjects({ per_page: 5 }),
          getDashboardPapers({ per_page: 5 }),
        ]);

      // USER PROFILE
      if (profileResult.status === "fulfilled") {
        setUser(profileResult.value?.data || null);
      } else {
        console.error("Unable to load user profile:", profileResult.reason);
        setError("Unable to load profile information.");
      }

      // ROLE VERIFICATION
      if (verificationResult.status === "fulfilled") {
        setVerification(verificationResult.value?.data || null);
      } else {
        setVerification(null);
      }

      // STATS
      if (statsResult.status === "fulfilled" && statsResult.value?.data) {
        setStats(statsResult.value.data);
      }

      // PROJECTS
      if (projectsResult.status === "fulfilled" && projectsResult.value?.data) {
        const list = Array.isArray(projectsResult.value.data)
          ? projectsResult.value.data
          : projectsResult.value.data?.data || [];
        setUserProjects(list);
      }

      // PAPERS
      if (papersResult.status === "fulfilled" && papersResult.value?.data) {
        const list = Array.isArray(papersResult.value.data)
          ? papersResult.value.data
          : papersResult.value.data?.data || [];
        setUserPapers(list);
      }
    } catch (requestError) {
      console.error("Unable to load user profile:", requestError);
      setError("Unable to load profile information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const name = user?.full_name || "User";
  const role =
    verification?.status === "approved"
      ? verification?.role === "faculty"
        ? "Faculty Member"
        : verification?.role === "student"
        ? "Student"
        : "Role Verified"
      : verification?.status === "pending"
      ? "Verification Pending"
      : user?.role?.display_name || "Role not verified";

  const departmentName = user?.department?.name || "Computer Science Dept.";
  const institution = user?.institution || "University of Technology";

  const interests = useMemo(() => {
    if (Array.isArray(user?.research_areas) && user.research_areas.length > 0) {
      return user.research_areas.map((a) => a?.name).filter(Boolean);
    }
    if (Array.isArray(user?.researchAreas) && user.researchAreas.length > 0) {
      return user.researchAreas.map((a) => a?.name).filter(Boolean);
    }
    if (typeof user?.research_interests === "string" && user.research_interests) {
      return user.research_interests.split(",").map((s) => s.trim());
    }
    return ["Environmental AI", "Machine Learning", "Graph ML"];
  }, [user]);

  const skillsList = useMemo(() => {
    if (Array.isArray(user?.skills) && user.skills.length > 0) {
      return user.skills;
    }
    if (typeof user?.skills === "string" && user.skills) {
      return user.skills.split(",").map((s) => s.trim());
    }
    return ["Python", "PyTorch", "Geospatial Analysis", "Causal Inference", "Grant Writing"];
  }, [user]);

  const initials = getInitials(name);
  const profilePicture = user?.profile_picture;

  const statItems = useMemo(() => {
    const papersCount = stats?.papers?.total ?? userPapers.length;
    const projectsCount = stats?.projects?.total ?? userProjects.length;
    const tasksCount = stats?.tasks?.total ?? 0;
    const followersCount = user?.followers_count ?? 24;

    return [
      { label: "Papers", value: papersCount },
      { label: "Projects", value: projectsCount },
      { label: "Tasks", value: tasksCount },
      { label: "Followers", value: followersCount },
      { label: "Verified", value: stats?.papers?.verified ?? 0 },
    ];
  }, [stats, userPapers, userProjects, user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-7 pb-8"
    >
      {/* Header card */}
      <div className="glass-panel rounded-[28px] p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Profile picture / initials */}
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={name}
                className="h-20 w-20 shrink-0 rounded-full object-cover shadow-lg shadow-indigo-400/20"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-cyan-400 text-2xl font-extrabold text-white shadow-lg shadow-indigo-400/20">
                {initials}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {loading ? "Loading..." : name}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full px-3 py-1.5 text-xs font-bold text-[var(--badge-blue-text)] bg-[var(--badge-blue)]">
                  {loading ? "Loading..." : role}
                </span>

                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                  {departmentName}
                </span>

                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                  {loading ? "Loading..." : institution}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert("Profile URL copied to clipboard!");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] shadow-sm transition hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] active:scale-[0.98] cursor-pointer"
            >
              <Share2 size={16} />
              Share Profile
            </button>

            <Link
              to="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-400/30 transition hover:-translate-y-0.5 cursor-pointer"
            >
              <Pencil size={16} />
              Edit Settings
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadProfile} className="underline font-bold">Retry</button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-5">
          {statItems.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {stat.value}
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          {/* Biography */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
              About
            </div>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Biography
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              {user?.bio ||
                "Researcher focusing on advanced modeling, collaborative knowledge mapping, and cross-institutional infrastructure. Actively publishing papers and supervising student initiatives in the department."}
            </p>
          </div>

          {/* Research Interests */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
              Focus Areas
            </div>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Research Interests
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full px-4 py-2 text-sm font-bold text-[var(--badge-blue-text)] bg-[var(--badge-blue)]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
              Toolkit
            </div>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Skills
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Projects */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  Active Workspace
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  Current Projects
                </h3>
              </div>
              <Link to="/dashboard/projects" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {userProjects.length > 0 ? (
                userProjects.map((project) => {
                  const progress = project.progress ?? project.progress_pct ?? 50;
                  const deadline = project.deadline
                    ? new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "2-digit" })
                    : "Active";

                  return (
                    <div
                      key={project.id || project.title}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-50 to-violet-50 text-indigo-500">
                            <FolderKanban className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-[var(--text-primary)] truncate">
                              {project.title || project.name}
                            </div>
                            <div className="mt-0.5 text-xs text-[var(--text-muted)] truncate">
                              {project.role || "Member"} · {project.members_count ?? 1} members · Due {deadline}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="rounded-full px-2 py-0.5 text-[10px] font-bold text-[var(--badge-emerald-text)] bg-[var(--badge-emerald)]">
                            {progress}%
                          </div>
                          <div className="mt-1 h-1 w-16 rounded-full bg-[var(--border)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-cyan-400"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No active projects currently listed.
                </div>
              )}
            </div>
          </div>

          {/* Papers */}
          <div className="glass-panel rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  Publications
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  Published Papers
                </h3>
              </div>
              <Link to="/dashboard/papers" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {userPapers.length > 0 ? (
                userPapers.map((paper, idx) => {
                  const displayId = paper.id ? `RP-${String(paper.id).padStart(4, "0")}` : `RP-${idx + 1}`;
                  const categoryTag = paper.category?.name || paper.research_area?.name || "AI Research";

                  return (
                    <div
                      key={paper.id || idx}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-[var(--text-muted)] flex-wrap">
                            <span>{displayId}</span>
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${tagStatusColor(categoryTag)}`}>
                              {categoryTag}
                            </span>
                          </div>
                          <div className="mt-1.5 text-sm font-bold text-[var(--text-primary)] line-clamp-1">
                            {paper.title}
                          </div>
                          <div className="mt-1 text-xs text-[var(--text-muted)] truncate">
                            {paper.authors ? (Array.isArray(paper.authors) ? paper.authors.join(" · ") : paper.authors) : name}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                          <div className="flex items-center gap-1 text-lg font-extrabold text-[var(--text-primary)]">
                            <Quote className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            {paper.citations ?? paper.views ?? 0}
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                            Citations
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No published papers found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}