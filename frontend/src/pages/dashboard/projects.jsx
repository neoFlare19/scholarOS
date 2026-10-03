import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Check,
  ChevronDown,
  RotateCw,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  AlertCircle,
  X,
  Search,
  Calendar,
  Globe,
  Lock,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  getDashboardProjects,
  getProjectDetails,
  createProject,
  updateProject,
  deleteProject,
  getProjectMilestones,
  getProjectTasks,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  getProjectFiles,
  updateTaskStatus,
  getResearchAreas,
  getDashboardResearchers,
} from "../../services/dashboardService.js";

const tabs = [
  "Overview",
  "Members",
  "Tasks",
  "Files",
  "Discussion",
  "Progress",
  "Timeline",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function getFileExtension(filename = "") {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
}

function getFileColor(type) {
  switch (type) {
    case "PDF":
      return "text-red-500 bg-red-500/10";
    case "XLS":
    case "XLSX":
    case "CSV":
      return "text-emerald-500 bg-emerald-500/10";
    case "ZIP":
    case "RAR":
    case "TAR":
      return "text-violet-500 bg-violet-500/10";
    case "DOC":
    case "DOCX":
      return "text-blue-500 bg-blue-500/10";
    default:
      return "text-indigo-500 bg-indigo-500/10";
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function Projects() {
  const [activeTab, setActiveTab] = useState("Overview");

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);

  const [projectDetails, setProjectDetails] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);

  const [researchAreas, setResearchAreas] = useState([]);
  const [researchers, setResearchers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form states
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const initialProjectForm = useMemo(
    () => ({
      title: "",
      description: "",
      research_area_id: "",
      supervisor_id: "",
      start_date: todayStr,
      deadline: "",
      status: "planning",
      progress_pct: 0,
      is_public: false,
    }),
    [todayStr]
  );

  const [projectForm, setProjectForm] = useState(initialProjectForm);
  const [inviteForm, setInviteForm] = useState({
    user_id: "",
    role: "member",
  });

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("scholaros_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Show auto-dismissing feedback banner
  const showFeedback = useCallback((type, message) => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);
  }, []);

  // Fetch initial project list
  const fetchProjects = useCallback(
    async (keepSelectedId = null) => {
      try {
        setLoading(true);
        setError(null);
        const res = await getDashboardProjects();
        const projectList = Array.isArray(res?.data)
          ? res.data
          : res?.data?.data || [];

        setProjects(projectList);

        if (projectList.length > 0) {
          if (keepSelectedId && projectList.some((p) => p.id === keepSelectedId)) {
            setSelectedProjectId(keepSelectedId);
          } else if (!selectedProjectId || !projectList.some((p) => p.id === selectedProjectId)) {
            setSelectedProjectId(projectList[0].id);
          }
        } else {
          setSelectedProjectId(null);
          setProjectDetails(null);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
        setError(err?.data?.message || err?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    },
    [selectedProjectId]
  );

  useEffect(() => {
    fetchProjects();
  }, []); // Initial load only

  // Load auxiliary data (research areas and researchers list) for modals
  useEffect(() => {
    const loadAuxData = async () => {
      try {
        const [areasRes, researchersRes] = await Promise.allSettled([
          getResearchAreas(),
          getDashboardResearchers({ per_page: 50 }),
        ]);

        if (areasRes.status === "fulfilled" && areasRes.value?.data) {
          const areas = Array.isArray(areasRes.value.data)
            ? areasRes.value.data
            : areasRes.value.data?.data || [];
          setResearchAreas(areas);
        }

        if (researchersRes.status === "fulfilled" && researchersRes.value?.data) {
          const resList = Array.isArray(researchersRes.value.data)
            ? researchersRes.value.data
            : researchersRes.value.data?.data || [];
          setResearchers(resList);
        }
      } catch (e) {
        console.warn("Could not load research areas / researchers auxiliary data", e);
      }
    };
    loadAuxData();
  }, []);

  // Fetch selected project resources
  const fetchProjectResources = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      setSubLoading(true);
      const [detailsRes, milestonesRes, tasksRes, membersRes, filesRes] = await Promise.allSettled([
        getProjectDetails(projectId),
        getProjectMilestones(projectId),
        getProjectTasks(projectId),
        getProjectMembers(projectId),
        getProjectFiles(projectId),
      ]);

      if (detailsRes.status === "fulfilled" && detailsRes.value?.data) {
        setProjectDetails(detailsRes.value.data);
      }
      if (milestonesRes.status === "fulfilled" && milestonesRes.value?.data) {
        const raw = Array.isArray(milestonesRes.value.data)
          ? milestonesRes.value.data
          : milestonesRes.value.data?.data || [];
        setMilestones(raw);
      }
      if (tasksRes.status === "fulfilled" && tasksRes.value?.data) {
        const raw = Array.isArray(tasksRes.value.data)
          ? tasksRes.value.data
          : tasksRes.value.data?.data || [];
        setTasks(raw);
      }
      if (membersRes.status === "fulfilled" && membersRes.value?.data) {
        const raw = Array.isArray(membersRes.value.data)
          ? membersRes.value.data
          : membersRes.value.data?.data || [];
        setMembers(raw);
      }
      if (filesRes.status === "fulfilled" && filesRes.value?.data) {
        const raw = Array.isArray(filesRes.value.data)
          ? filesRes.value.data
          : filesRes.value.data?.data || [];
        setFiles(raw);
      }
    } catch (err) {
      console.error("Error loading project resources:", err);
    } finally {
      setSubLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectResources(selectedProjectId);
    }
  }, [selectedProjectId, fetchProjectResources]);

  const currentProject = useMemo(() => {
    if (projectDetails) return projectDetails;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projectDetails, projects, selectedProjectId]);

  const isCreatorOrAdmin = useMemo(() => {
    if (!currentProject || !currentUser) return false;
    const isCreator = currentProject.creator?.id === currentUser.id;
    const isSupervisor = currentProject.supervisor?.id === currentUser.id;
    const isAdmin =
      currentUser.role === "admin" ||
      currentUser.role?.name === "admin" ||
      currentUser.role_id === 1;
    return isCreator || isSupervisor || isAdmin;
  }, [currentProject, currentUser]);

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      if (selectedProjectId) {
        await updateTaskStatus(selectedProjectId, taskId, newStatus);
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: currentStatus } : t))
      );
      showFeedback("error", "Failed to update task status. Please try again.");
    }
  };

  // Open Create Project Modal
  const handleOpenCreateModal = () => {
    setModalError(null);
    setProjectForm({
      title: "",
      description: "",
      research_area_id: researchAreas[0]?.id || "",
      supervisor_id: "",
      start_date: todayStr,
      deadline: "",
      status: "planning",
      progress_pct: 0,
      is_public: false,
    });
    setIsCreateModalOpen(true);
  };

  // Submit Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    try {
      const payload = {
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        research_area_id: parseInt(projectForm.research_area_id, 10),
        start_date: projectForm.start_date,
        status: projectForm.status || "planning",
        is_public: Boolean(projectForm.is_public),
      };

      if (projectForm.supervisor_id) {
        payload.supervisor_id = parseInt(projectForm.supervisor_id, 10);
      }
      if (projectForm.deadline) {
        payload.deadline = projectForm.deadline;
      }

      const res = await createProject(payload);
      const newProj = res?.data;

      setIsCreateModalOpen(false);
      showFeedback("success", "Project created successfully!");

      await fetchProjects(newProj?.id);
      if (newProj?.id) {
        setSelectedProjectId(newProj.id);
      }
    } catch (err) {
      console.error("Create project error:", err);
      const msg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        "Failed to create project.";
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Open Edit Project Modal
  const handleOpenEditModal = () => {
    if (!currentProject) return;
    setModalError(null);
    setProjectForm({
      title: currentProject.title || "",
      description: currentProject.description || "",
      research_area_id: currentProject.research_area?.id || researchAreas[0]?.id || "",
      supervisor_id: currentProject.supervisor?.id || "",
      start_date: currentProject.start_date || todayStr,
      deadline: currentProject.deadline || "",
      status: currentProject.status || "planning",
      progress_pct: currentProject.progress ?? currentProject.progress_pct ?? 0,
      is_public: Boolean(currentProject.is_public),
    });
    setIsEditModalOpen(true);
  };

  // Submit Update Project
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setModalLoading(true);
    setModalError(null);

    try {
      const payload = {
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        research_area_id: parseInt(projectForm.research_area_id, 10),
        start_date: projectForm.start_date,
        status: projectForm.status || "planning",
        progress_pct: parseInt(projectForm.progress_pct, 10) || 0,
        is_public: Boolean(projectForm.is_public),
      };

      if (projectForm.supervisor_id) {
        payload.supervisor_id = parseInt(projectForm.supervisor_id, 10);
      } else {
        payload.supervisor_id = null;
      }
      if (projectForm.deadline) {
        payload.deadline = projectForm.deadline;
      } else {
        payload.deadline = null;
      }

      const res = await updateProject(selectedProjectId, payload);
      const updated = res?.data;

      if (updated) {
        setProjectDetails(updated);
      }

      setIsEditModalOpen(false);
      showFeedback("success", "Project updated successfully!");
      fetchProjects(selectedProjectId);
    } catch (err) {
      console.error("Update project error:", err);
      const msg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        "Failed to update project.";
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Submit Delete Project
  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;
    setModalLoading(true);
    setModalError(null);

    try {
      await deleteProject(selectedProjectId);
      setIsDeleteModalOpen(false);
      showFeedback("success", "Project deleted successfully.");
      await fetchProjects();
    } catch (err) {
      console.error("Delete project error:", err);
      const msg = err?.data?.message || "Failed to delete project.";
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Open Invite / Add Member Modal
  const handleOpenInviteModal = () => {
    setModalError(null);
    setInviteForm({
      user_id: researchers.find((r) => !members.some((m) => m.user_id === r.id))?.id || "",
      role: "member",
    });
    setIsInviteModalOpen(true);
  };

  // Submit Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !inviteForm.user_id) {
      setModalError("Please select a researcher to add.");
      return;
    }
    setModalLoading(true);
    setModalError(null);

    try {
      await addProjectMember(selectedProjectId, {
        user_id: parseInt(inviteForm.user_id, 10),
        role: inviteForm.role || "member",
      });

      setIsInviteModalOpen(false);
      showFeedback("success", "Project member added successfully!");
      fetchProjectResources(selectedProjectId);
    } catch (err) {
      console.error("Add member error:", err);
      const msg =
        err?.data?.message ||
        (err?.data?.errors ? Object.values(err.data.errors).flat().join(" ") : null) ||
        "Failed to add project member.";
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Submit Remove Member
  const handleRemoveMember = async (member) => {
    if (!selectedProjectId || !member?.id) return;
    if (member.user_id === currentProject?.creator?.id) {
      showFeedback("error", "Cannot remove the project creator.");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${member.name || "this member"} from the project?`)) {
      return;
    }

    try {
      await removeProjectMember(selectedProjectId, member.id);
      showFeedback("success", "Member removed from project.");
      fetchProjectResources(selectedProjectId);
    } catch (err) {
      console.error("Remove member error:", err);
      const msg = err?.data?.message || "Failed to remove member.";
      showFeedback("error", msg);
    }
  };

  const leftHasContent =
    activeTab === "Overview" ||
    activeTab === "Tasks" ||
    activeTab === "Progress" ||
    activeTab === "Timeline";
  const rightHasContent =
    activeTab === "Overview" || activeTab === "Members" || activeTab === "Files";
  const rightOnly = rightHasContent && !leftHasContent;

  const progressPct = currentProject?.progress ?? currentProject?.progress_pct ?? 0;
  const projectTitle = currentProject?.title || "Project";
  const supervisorName =
    currentProject?.supervisor?.name ||
    currentProject?.creator?.name ||
    "Unassigned Supervisor";
  const memberCount =
    members.length > 0 ? members.length : currentProject?.members_count ?? 1;
  const deadlineText = currentProject?.deadline
    ? new Date(currentProject.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "Ongoing";
  const projectCode = currentProject
    ? `PRJ-${String(currentProject.id).padStart(3, "0")}`
    : "PRJ-001";

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="rounded-[28px] glass-panel p-8 space-y-4">
          <div className="h-20 w-20 rounded-2xl skeleton" />
          <div className="h-6 w-1/3 rounded skeleton" />
          <div className="h-4 w-1/2 rounded skeleton" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-8"
    >
      {/* Toast / Feedback Banner */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold shadow-lg ${
              actionFeedback.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionFeedback.type === "success" ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle size={18} className="shrink-0 text-rose-400" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-current opacity-70 hover:opacity-100 cursor-pointer p-1"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs text-[var(--text-muted)] font-medium mb-1">
            Workspace
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Projects
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {projects.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm font-bold text-[var(--text-primary)] shadow-sm hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
              >
                <span className="truncate max-w-[160px] sm:max-w-xs">{projectTitle}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    isProjectSelectorOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProjectSelectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-surface-elevated)] rounded-xl shadow-xl border border-[var(--border)] p-1.5 z-30 overflow-hidden"
                  >
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setIsProjectSelectorOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                          selectedProjectId === p.id
                            ? "bg-[var(--badge-blue)] text-[var(--badge-blue-text)] font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                        }`}
                      >
                        <div className="font-bold truncate">{p.title}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          PRJ-{String(p.id).padStart(3, "0")} · {p.status_label || p.status}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>New Project</span>
          </motion.button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-[28px] glass-panel p-10 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Unable to Load Projects
          </h3>
          <p className="text-rose-500 text-sm font-medium mb-4">{error}</p>
          <button
            onClick={() => fetchProjects(selectedProjectId)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <RotateCw size={15} /> Retry
          </button>
        </div>
      )}

      {/* Empty State when no projects exist */}
      {!error && projects.length === 0 && (
        <div className="rounded-[28px] glass-panel p-12 text-center text-[var(--text-secondary)]">
          <Layers className="h-14 w-14 text-indigo-400 mx-auto mb-4 opacity-70" />
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            No Projects Found
          </h3>
          <p className="text-sm mt-1 max-w-md mx-auto text-[var(--text-muted)]">
            You don't have any active research projects yet. Create your first project to start tracking milestones, collaborating with researchers, and organizing files.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenCreateModal}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <Plus size={16} /> Create Your First Project
          </motion.button>
        </div>
      )}

      {/* Main Content when project is selected */}
      {!error && projects.length > 0 && currentProject && (
        <>
          {/* Project Banner */}
          <motion.div
            whileHover={{
              scale: 1.002,
              boxShadow: "0 24px 80px rgba(15,23,42,0.12)",
            }}
            transition={{ duration: 0.2 }}
            className="rounded-[28px] bg-linear-to-r from-[#0f111a] via-[#151827] to-[#0f111a] text-white p-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:gap-6">
              <div className="flex items-start gap-6 flex-1 min-w-0">
                <div className="h-20 w-20 shrink-0 rounded-2xl bg-linear-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-xl shadow-indigo-500/25">
                  <Layers size={32} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] font-bold tracking-[0.2em] text-indigo-300 uppercase font-mono">
                      {projectCode}
                    </span>
                    {currentProject.research_area && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 font-medium">
                        {currentProject.research_area.name}
                      </span>
                    )}
                    {currentProject.is_public ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300">
                        <Globe size={11} /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Lock size={11} /> Private
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight mb-3">
                    {projectTitle}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
                    <span>
                      Supervisor:{" "}
                      <span className="text-white font-bold">{supervisorName}</span>
                    </span>
                    <span>
                      Members:{" "}
                      <span className="text-white font-bold">{memberCount}</span>
                    </span>
                    <span>
                      Deadline:{" "}
                      <span className="text-white font-bold">{deadlineText}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-left lg:text-right mt-4 lg:mt-0 w-full lg:w-64 flex flex-col items-start lg:items-end">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                    {currentProject?.status_label || currentProject?.status || "Active"}
                  </span>

                  {isCreatorOrAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleOpenEditModal}
                        title="Edit Project"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setModalError(null);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Delete Project"
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <div className="text-xs text-slate-400 mb-2">Overall Completion</div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full rounded-full bg-linear-to-r from-indigo-400 via-violet-400 to-blue-400"
                    />
                  </div>
                  <div className="text-lg font-extrabold mt-2 text-right">
                    {progressPct}% complete
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-card)] p-1.5 overflow-x-auto max-w-full"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className={`relative z-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? "text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 shadow-md shadow-indigo-400/30 z-0"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content Panes */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`grid grid-cols-1 ${
                leftHasContent && rightHasContent ? "lg:grid-cols-[1fr_380px]" : ""
              } gap-6 items-start`}
            >
              {/* Main Column */}
              <div className="space-y-6">
                {activeTab === "Overview" && (
                  <motion.div
                    variants={itemVariants}
                    className="glass-panel rounded-[28px] p-8"
                  >
                    <div className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase mb-1">
                      Project Summary
                    </div>
                    <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
                      About this project
                    </h2>
                    <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                      {currentProject?.description ||
                        "A collaborative cross-institutional research initiative standardizing data intake, research timelines, and linking datasets back to their originating publications."}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                      <div>
                        <div className="text-xs text-[var(--text-muted)] font-medium">
                          Created By
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                          {currentProject?.creator?.name || "Team Member"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] font-medium">
                          Start Date
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                          {currentProject?.start_date
                            ? new Date(currentProject.start_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] font-medium">
                          Total Tasks
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                          {tasks.length > 0 ? tasks.length : currentProject?.tasks_count ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] font-medium">
                          Milestones
                        </div>
                        <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                          {milestones.length}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {(activeTab === "Overview" ||
                  activeTab === "Progress" ||
                  activeTab === "Timeline") && (
                  <motion.div
                    variants={itemVariants}
                    className="glass-panel rounded-[28px] p-8"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase">
                          Research Stages
                        </div>
                        <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                          Milestones
                        </h2>
                      </div>
                      {activeTab === "Overview" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab("Progress")}
                          className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          View all
                        </motion.button>
                      )}
                    </div>

                    {milestones.length > 0 ? (
                      <div className="divide-y divide-[var(--border)]">
                        {milestones.map((m) => {
                          const isCompleted = m.status === "completed" || m.done;
                          const dateText = m.due_date
                            ? `Due ${new Date(m.due_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "2-digit",
                              })}`
                            : m.date || "Scheduled";

                          return (
                            <motion.div
                              key={m.id || m.title || m.label}
                              variants={itemVariants}
                              whileHover={{ x: 6 }}
                              className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                            >
                              {isCompleted ? (
                                <span className="h-6 w-6 rounded-full bg-linear-to-br from-indigo-400 to-violet-400 flex items-center justify-center shadow-md shadow-indigo-400/30 shrink-0">
                                  <Check size={13} className="text-white" strokeWidth={3} />
                                </span>
                              ) : (
                                <span className="h-6 w-6 rounded-full border-2 border-[var(--border)] bg-[var(--bg-surface)] shrink-0" />
                              )}
                              <span
                                className={`flex-1 text-base font-bold ${
                                  isCompleted
                                    ? "text-[var(--text-muted)] line-through"
                                    : "text-[var(--text-primary)]"
                                }`}
                              >
                                {m.title || m.name || m.label}
                              </span>
                              <span className="text-sm text-[var(--text-muted)]">
                                {dateText}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                        No milestones defined for this project yet.
                      </div>
                    )}
                  </motion.div>
                )}

                {(activeTab === "Overview" || activeTab === "Tasks") && (
                  <motion.div
                    variants={itemVariants}
                    className="glass-panel rounded-[28px] p-8"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase">
                          Task Board
                        </div>
                        <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                          Open Tasks
                        </h2>
                      </div>
                      {activeTab === "Overview" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab("Tasks")}
                          className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          View board
                        </motion.button>
                      )}
                    </div>

                    {tasks.length > 0 ? (
                      <div className="space-y-4">
                        {tasks.map((t) => {
                          const isCompleted = t.status === "completed" || t.done;
                          const priority = t.priority || "Medium";
                          const badgeStyle =
                            priority.toLowerCase() === "high"
                              ? "text-[var(--warning)] bg-[var(--warning-bg)]"
                              : isCompleted
                              ? "text-[var(--muted-foreground)] bg-[var(--muted)]"
                              : "text-[var(--info)] bg-[var(--info-bg)]";

                          const assignee =
                            t.assigned_to?.name ||
                            t.assigned_to?.full_name ||
                            t.assigned_user?.full_name ||
                            "Assigned";
                          const due = t.deadline || t.due_date || "In Progress";

                          return (
                            <motion.div
                              key={t.id}
                              variants={itemVariants}
                              whileHover={{ x: 6 }}
                              className="flex items-start gap-4 p-2 -mx-2 rounded-xl transition-colors cursor-pointer hover:bg-[var(--bg-surface-elevated)]"
                              onClick={() => toggleTask(t.id, t.status)}
                            >
                              <motion.span
                                whileTap={{ scale: 0.8 }}
                                className={`mt-0.5 h-5 w-5 shrink-0 rounded-md flex items-center justify-center transition-colors ${
                                  isCompleted
                                    ? "bg-linear-to-br from-indigo-400 to-violet-400 shadow-sm"
                                    : "border-2 border-[var(--border)] bg-[var(--bg-surface)]"
                                }`}
                              >
                                {isCompleted && (
                                  <Check size={12} className="text-white" strokeWidth={3} />
                                )}
                              </motion.span>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-base font-bold leading-snug transition-all duration-300 ${
                                    isCompleted
                                      ? "text-[var(--text-muted)] line-through"
                                      : "text-[var(--text-primary)]"
                                  }`}
                                >
                                  {t.title || t.name}
                                </div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">
                                  {assignee} · {due}
                                </div>
                              </div>
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${badgeStyle}`}
                              >
                                {isCompleted ? "Done" : priority}
                              </motion.span>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                        No open tasks for this project yet.
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "Discussion" && (
                  <motion.div
                    variants={itemVariants}
                    className="glass-panel rounded-[28px] p-8 text-center py-12"
                  >
                    <Sparkles className="h-10 w-10 text-indigo-400 mx-auto mb-3 opacity-60" />
                    <p className="text-base font-bold text-[var(--text-primary)]">
                      Project Discussion Stream
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Team comments and paper reviews are linked directly into this project pipeline.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Right Column / Sub sections */}
              <div className={`space-y-6 ${rightOnly ? "max-w-xl" : ""}`}>
                {(activeTab === "Overview" || activeTab === "Members") && (
                  <motion.div
                    variants={itemVariants}
                    className="glass-panel rounded-[28px] p-6"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase mb-1">
                          Collaboration
                        </div>
                        <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                          Members
                        </h3>
                      </div>
                      {isCreatorOrAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleOpenInviteModal}
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <UserPlus size={15} />
                          <span>Invite</span>
                        </motion.button>
                      )}
                    </div>

                    {members.length > 0 ? (
                      <div className="divide-y divide-[var(--border)]">
                        {members.map((m) => {
                          const name = m.name || m.user?.full_name || "Researcher";
                          const role = m.role_label || m.role || "Member";
                          const isLead =
                            role.toLowerCase().includes("lead") ||
                            role.toLowerCase().includes("supervisor") ||
                            role.toLowerCase().includes("admin");
                          const isCreator = m.user_id === currentProject?.creator?.id;

                          const initials = name
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase();

                          return (
                            <motion.div
                              key={m.id || name}
                              variants={itemVariants}
                              whileHover={{ x: 4 }}
                              className="group flex items-center gap-3 py-4 first:pt-0 last:pb-0 -mx-2 px-2 rounded-xl transition-colors hover:bg-[var(--bg-surface-elevated)]"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-400/20 shrink-0"
                              >
                                {initials}
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-[var(--text-primary)] truncate">
                                  {name}
                                </div>
                                <div className="text-xs text-[var(--text-muted)] capitalize">
                                  {role} {isCreator ? "· Creator" : ""}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    isLead
                                      ? "text-[var(--badge-blue-text)] bg-[var(--badge-blue)]"
                                      : "text-[var(--muted-foreground)] bg-[var(--muted)]"
                                  }`}
                                >
                                  {isLead ? "Lead" : "Member"}
                                </span>
                                {isCreatorOrAdmin && !isCreator && (
                                  <button
                                    onClick={() => handleRemoveMember(m)}
                                    title="Remove Member"
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
                                  >
                                    <UserMinus size={14} />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                        No members listed for this project.
                      </div>
                    )}
                  </motion.div>
                )}

                {(activeTab === "Overview" || activeTab === "Files") && (
                  <motion.div
                    variants={itemVariants}
                    className="glass-panel rounded-[28px] p-6"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.15em] text-[var(--text-muted)] uppercase mb-1">
                          Repository
                        </div>
                        <h3 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                          Recent Files
                        </h3>
                      </div>
                      {activeTab === "Overview" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTab("Files")}
                          className="text-sm font-bold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          View all
                        </motion.button>
                      )}
                    </div>

                    {files.length > 0 ? (
                      <div className="divide-y divide-[var(--border)]">
                        {files.map((f) => {
                          const fileName =
                            f.name || f.file_name || f.original_name || "dataset_file.pdf";
                          const ext = getFileExtension(fileName);
                          const colorStyle = getFileColor(ext);
                          const fileSize = f.size
                            ? typeof f.size === "number"
                              ? formatBytes(f.size)
                              : f.size
                            : "1.2 MB";

                          return (
                            <motion.div
                              key={f.id || fileName}
                              variants={itemVariants}
                              whileHover={{ x: 6 }}
                              className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 -mx-2 px-2 rounded-xl transition-colors cursor-pointer hover:bg-[var(--bg-surface-elevated)]"
                              onClick={() => {
                                if (f.download_url || f.file_path) {
                                  window.open(
                                    f.download_url ||
                                      `/api/v1/projects/${selectedProjectId}/files/${f.id}/download`,
                                    "_blank"
                                  );
                                }
                              }}
                            >
                              <motion.div
                                whileHover={{ rotate: 4, scale: 1.05 }}
                                className={`h-10 w-10 rounded-xl flex items-center justify-center text-[10px] font-extrabold shrink-0 ${colorStyle}`}
                              >
                                {ext}
                              </motion.div>
                              <div className="flex-1 min-w-0 text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-indigo-500 transition-colors">
                                {fileName}
                              </div>
                              <div className="shrink-0 text-xs text-[var(--text-muted)] font-medium">
                                {fileSize}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                        No files uploaded to this project yet.
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border)] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                      Create New Project
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Start a new research project workspace
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, title: e.target.value })
                    }
                    placeholder="e.g., Quantum-Resistant Cryptography Framework"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, description: e.target.value })
                    }
                    placeholder="Describe the research objectives and scope..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Research Area *
                    </label>
                    <select
                      required
                      value={projectForm.research_area_id}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          research_area_id: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Select Research Area</option>
                      {researchAreas.map((ra) => (
                        <option key={ra.id} value={ra.id}>
                          {ra.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Supervisor (Optional)
                    </label>
                    <select
                      value={projectForm.supervisor_id}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          supervisor_id: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Select Supervisor</option>
                      {researchers.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name || r.full_name} ({r.role || "Researcher"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={projectForm.start_date}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          start_date: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      value={projectForm.deadline}
                      min={projectForm.start_date}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={projectForm.status}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, status: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors capitalize"
                    >
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="create_is_public"
                      checked={projectForm.is_public}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          is_public: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded text-indigo-500 border-[var(--border)] cursor-pointer"
                    />
                    <label
                      htmlFor="create_is_public"
                      className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                    >
                      Make project public
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {modalLoading ? (
                      <>
                        <RotateCw size={15} className="animate-spin" /> Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={15} /> Create Project
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROJECT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border)] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Pencil size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                      Edit Project
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Update project specifications and status
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProject} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Research Area *
                    </label>
                    <select
                      required
                      value={projectForm.research_area_id}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          research_area_id: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors"
                    >
                      {researchAreas.map((ra) => (
                        <option key={ra.id} value={ra.id}>
                          {ra.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={projectForm.status}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, status: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors capitalize"
                    >
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Progress ({projectForm.progress_pct}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={projectForm.progress_pct}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          progress_pct: e.target.value,
                        })
                      }
                      className="w-full h-2 rounded-lg bg-[var(--bg-surface)] cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={projectForm.deadline || ""}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="edit_is_public"
                    checked={projectForm.is_public}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        is_public: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded text-indigo-500 border-[var(--border)] cursor-pointer"
                  />
                  <label
                    htmlFor="edit_is_public"
                    className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                  >
                    Make project public
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {modalLoading ? (
                      <>
                        <RotateCw size={15} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check size={15} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border)] shadow-2xl p-6 space-y-5"
            >
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Trash2 size={24} />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Delete Project
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Are you sure you want to delete{" "}
                  <strong className="text-[var(--text-primary)]">{projectTitle}</strong>?
                  This action will archive the project workspace and remove access for collaborators.
                </p>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={handleDeleteProject}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading ? "Deleting..." : "Delete Project"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVITE / ADD MEMBER MODAL */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-[var(--bg-surface-elevated)] border border-[var(--border)] shadow-2xl p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                      Invite Collaborator
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Add a researcher to {projectCode}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleAddMember} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Select Researcher *
                  </label>
                  <select
                    required
                    value={inviteForm.user_id}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, user_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Choose a researcher...</option>
                    {researchers
                      .filter((r) => !members.some((m) => m.user_id === r.id))
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name || r.full_name} ({r.email || r.department || "Researcher"})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Role in Project
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, role: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-hidden focus:border-indigo-500 transition-colors capitalize"
                  >
                    <option value="member">Member</option>
                    <option value="co_supervisor">Co-Supervisor</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {modalLoading ? (
                      <>
                        <RotateCw size={15} className="animate-spin" /> Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus size={15} /> Add Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}