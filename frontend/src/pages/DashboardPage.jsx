import { motion } from "framer-motion";
import {
  BellRing,
  BookMarked,
  CalendarRange,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Filter,
  Sparkles,
  TrendingUp,
  UsersRound,
  ArrowUpRight,
  Activity,
  MessageSquare,
  GitCommitHorizontal,
  Rocket,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import DashboardShell from "../layout/DashboardShell.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import AnimatedCounter from "../components/ui/AnimatedCounter.jsx";
import { statistics } from "../data/statistics.js";
import { researchPapers } from "../data/researchPapers.js";
import { projects } from "../data/projects.js";

const tasks = [
  {
    title: "Resolve peer review comments for federated imaging paper",
    owner: "Jonas Richter",
    due: "Today · 4:00 PM",
    priority: "High",
  },
  {
    title: "Finalize ethics appendix for BlueGrid Climate Archive",
    owner: "Dr. Leila Morgan",
    due: "Tomorrow",
    priority: "Medium",
  },
  {
    title: "Prepare collaborator invite list for Civic Insight Observatory",
    owner: "Mina Ross",
    due: "May 21",
    priority: "Low",
  },
];

const notifications = [
  {
    title: "New review note added",
    description: "Prof. Nadia Mensah commented on the Methods section.",
    tone: "info",
  },
  {
    title: "Submission deadline approaching",
    description: "BlueGrid Climate Archive is due in 5 days.",
    tone: "warning",
  },
  {
    title: "Milestone completed",
    description: "Citation verification finished for 128 references.",
    tone: "success",
  },
];

const recentActivities = [
  { user: "Jonas Richter", action: "uploaded a new paper", project: "Federated Imaging", time: "2m ago", icon: FileText },
  { user: "Dr. Leila Morgan", action: "joined the project", project: "BlueGrid Archive", time: "1h ago", icon: UsersRound },
  { user: "Elena Park", action: "completed a task", project: "Civic Insight", time: "3h ago", icon: CheckCircle2 },
  { user: "Mina Ross", action: "left a comment", project: "Adaptive Graph Models", time: "6h ago", icon: MessageSquare },
];

const toneClasses = {
  info: "bg-blue-50 text-blue-700 border-blue-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function DashboardPage() {
  const [tasksCompleted, setTasksCompleted] = useState([false, false, false]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <DashboardShell>
        
        {/* UPDATED STATS CARDS ROW: The sparkline chart (pillars) and the +8% badge have been entirely removed */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statistics.map((item, index) => (
            <motion.div 
              key={item.label} 
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: "0 24px 80px rgba(15,23,42,0.12)" }}
              className="group relative flex flex-col rounded-[28px] glass-panel p-6 shadow-sm border-white/60 hover:border-blue-200/60 transition-all duration-300 min-w-0"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[28px] bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500" />
              
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium tracking-wide text-slate-500 uppercase break-words min-w-0 mr-2">{item.label}</span>
                <div className="shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 p-2.5 text-blue-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <LayoutGrid className="h-5 w-5" />
                </div>
              </div>
              
              {/* Removed the container for pillars and +8% badge. Now, the number sits cleanly on the left. */}
              <div className="mt-0">
                <div className="text-4xl font-bold tracking-tight text-slate-900">
                  <AnimatedCounter value={item.value} suffix={item.suffix} />
                </div>
              </div>
              
              <p className="mt-4 text-xs leading-5 text-slate-500 break-words min-w-0">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          
          <Reveal className="glass-panel gradient-stroke-premium rounded-[32px] p-6 shadow-sm border-white/60">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Research Pipeline</div>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Recent Papers</h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm">
                <Filter className="h-4 w-4" />
                <span className="text-xs">Filter</span>
              </div>
            </div>
            <div className="space-y-3">
              {researchPapers.map((paper, idx) => (
                <motion.div 
                  key={paper.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 6, backgroundColor: "rgba(255,255,255,0.9)" }}
                  className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-sm transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-slate-400">
                        <span>{paper.id}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{paper.domain}</span>
                      </div>
                      <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">{paper.title}</h4>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        {paper.authors.join(" • ")}
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="rounded-full bg-blue-50/80 px-3 py-1 text-[10px] font-semibold text-blue-700 border border-blue-100/80">{paper.status}</span>
                      <div className="flex flex-col items-end text-right">
                        <div className="text-xs font-medium text-slate-700">{paper.citations}</div>
                        <div className="text-[10px] text-slate-400">Citations</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <Reveal className="glass-panel gradient-stroke-premium rounded-[32px] p-6 shadow-sm border-white/60">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Active Workspace</div>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Projects & Tasks</h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg">
                <CircleAlert className="h-3.5 w-3.5 text-cyan-300" />
                3 Active
              </div>
            </div>

            <div className="space-y-4">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-medium text-slate-400">{project.id}</div>
                      <h4 className="mt-0.5 text-base font-semibold text-slate-900">{project.name}</h4>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <UsersRound className="h-3 w-3" />
                          {project.members}
                        </div>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>Due {project.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="rounded-full bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100/80">{project.progress}%</div>
                      <div className="mt-1 h-1 w-16 rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-2 mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Priority Tasks</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              {tasks.map((task, idx) => (
                <motion.div 
                  key={task.title} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 rounded-xl border border-slate-200/50 bg-white/50 p-3 transition-all"
                >
                  <input 
                    type="checkbox" 
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded-full border-slate-300 text-blue-600 focus:ring-blue-200"
                    checked={tasksCompleted[idx]}
                    onChange={() => {
                      const newState = [...tasksCompleted];
                      newState[idx] = !newState[idx];
                      setTasksCompleted(newState);
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm font-medium text-slate-900 transition-colors", tasksCompleted[idx] && "line-through text-slate-400")}>{task.title}</div>
                    <div className="mt-1 flex flex-wrap gap-3 text-[10px] uppercase tracking-wide text-slate-400">
                      <span className="flex items-center gap-1">
                        <UsersRound className="h-3 w-3" /> {task.owner}
                      </span>
                      <span>{task.due}</span>
                      <span className={cn("font-semibold", task.priority === "High" ? "text-rose-500" : task.priority === "Medium" ? "text-amber-500" : "text-emerald-500")}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          
          <Reveal className="glass-panel gradient-stroke-premium rounded-[32px] p-6 shadow-sm border-white/60">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Updates</div>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Notifications</h3>
              </div>
              <BellRing className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              {notifications.map((note, idx) => (
                <motion.div 
                  key={note.title} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className="relative rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-sm hover:bg-white/90 transition-all duration-200"
                >
                  <div className="absolute right-4 top-4 flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <div className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${toneClasses[note.tone]}`}>
                    {note.tone}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900 pr-6">{note.title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{note.description}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <Reveal className="glass-panel gradient-stroke-premium rounded-[32px] p-6 shadow-sm border-white/60 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl" />
            
            <div className="mb-5 flex items-center justify-between relative">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Live Feed</div>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Activity Timeline</h3>
              </div>
              <Activity className="h-5 w-5 text-violet-500" />
            </div>

            <div className="absolute left-10 top-16 bottom-8 w-px bg-gradient-to-b from-blue-400 via-violet-400 to-transparent opacity-30" />

            <div className="relative space-y-5 pl-4">
              {recentActivities.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="relative flex items-start gap-4"
                  >
                    <div className="absolute -left-[18px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-blue-100">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    </div>
                    
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 rounded-xl border border-slate-200/50 bg-white/50 p-3.5 shadow-sm hover:bg-white transition-colors">
                      <div className="text-sm font-medium text-slate-900">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-slate-700 font-medium">{activity.project}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Reveal>

        </div>

        <Reveal className="rounded-[32px] bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 p-[1px] shadow-premium">
          <div className="rounded-[31px] bg-white/95 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    ScholarOS Insight
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Your reviewer turnaround is accelerating.</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-500 max-w-2xl">
                    Teams using structured paper threads and visible milestone ownership are closing feedback loops 3x faster than before.
                  </p>
                </div>
              </div>
              <button className="flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white shadow-lg hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200">
                View Analytics
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Reveal>

      </DashboardShell>
    </motion.div>
  );
}

function cn(...classes) {
  return classes.flat(Infinity).filter(Boolean).join(" ");
}