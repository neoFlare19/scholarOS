import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookmarkCheck,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  FileStack,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Orbit,
  SearchCode,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserSquare2,
  UsersRound,
  Waypoints,
  BookOpenCheck,
} from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import SectionHeading from "../../components/ui/SectionHeading.jsx";
import Reveal from "../../components/ui/Reveal.jsx";
import AnimatedCounter from "../../components/ui/AnimatedCounter.jsx";
import { statistics } from "../../data/statistics.js";
import { featureCards } from "../../data/featureCards.js";
import { researchPapers } from "../../data/researchPapers.js";
import { projects } from "../../data/projects.js";
import { researchers } from "../../data/researchers.js";
import { testimonials } from "../../data/testimonials.js";
import { useParallaxMouse } from "../../hooks/useParallaxMouse.js";

const featureIcons = {
  DatabaseZap,
  FolderKanban,
  UsersRound,
  UserSquare2,
  SearchCode,
  ListTodo,
  BellRing,
  LayoutDashboard,
  BookmarkCheck,
  BarChart3,
};

const problemCards = [
  {
    title: "Research scattered everywhere",
    description:
      "Papers, notes, datasets, and feedback live across drives, chat threads, and disconnected folders.",
    icon: FileStack,
  },
  {
    title: "Finding collaborators is slow",
    description:
      "It takes too long to discover who has the right expertise, availability, or interest to contribute.",
    icon: UsersRound,
  },
  {
    title: "Projects lack visibility",
    description:
      "Milestones, ownership, and deadlines become opaque when teams rely on generic tools not built for research.",
    icon: Clock3,
  },
  {
    title: "No central source of truth",
    description:
      "Version confusion and duplicated work create friction right when teams should be preparing for submission.",
    icon: ShieldCheck,
  },
];

const workflowSteps = [
  {
    title: "Research Idea",
    description:
      "Capture the hypothesis, frame the opportunity, and align collaborators from day one.",
    icon: BrainCircuit,
  },
  {
    title: "Create Project",
    description:
      "Spin up a dedicated workspace with timelines, documents, roles, and milestones.",
    icon: FolderKanban,
  },
  {
    title: "Invite Team",
    description:
      "Bring in supervisors, researchers, and reviewers with clear ownership and transparency.",
    icon: UsersRound,
  },
  {
    title: "Upload Papers",
    description:
      "Organize references, notes, linked datasets, and supporting materials in one repository.",
    icon: UploadCloud,
  },
  {
    title: "Track Tasks",
    description:
      "Move research forward through accountable execution instead of scattered reminders.",
    icon: ListTodo,
  },
  {
    title: "Publish Research",
    description:
      "Finalize revisions, prepare submissions, and preserve institutional knowledge after launch.",
    icon: BookOpenCheck,
  },
];

const howItWorksSteps = [
  {
    step: "01",
    title: "Register",
    description:
      "Create your ScholarOS workspace with your institution, department, and research interests.",
  },
  {
    step: "02",
    title: "Create Project",
    description:
      "Launch a structured research environment for papers, tasks, notes, and version tracking.",
  },
  {
    step: "03",
    title: "Collaborate",
    description:
      "Assign owners, review drafts, annotate insights, and align teammates in real time.",
  },
  {
    step: "04",
    title: "Publish",
    description:
      "Turn coordinated progress into publication-ready output with clean documentation and review history.",
  },
];

export function HeroSection() {
  const { position, handlers } = useParallaxMouse(26);

  return (
    <section id="home" className="relative pt-32 sm:pt-36 lg:pt-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] hero-grid opacity-55" />
      <div className="pointer-events-none absolute left-1/2 top-14 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-24 h-96 w-96 rounded-full bg-violet-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-10 top-52 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />
      <div className="section-shell relative grid items-center gap-16 pb-20 lg:grid-cols-[0.8fr_1.2fr] lg:pb-24">
        <div className="space-y-8">
          <Reveal delay={0.08} className="space-y-6">
            <h1 className="max-w-5xl text-5xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] sm:text-6xl lg:text-[5.35rem] lg:leading-[0.96]">
              Research Together.
              <br />
              <span className="text-gradient">Publish Smarter.</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
              ScholarOS brings papers, projects, people, and publication
              workflows into one beautifully orchestrated research operating
              system.
            </p>
          </Reveal>
          <Reveal
            delay={0.16}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button to="/register" className="gap-2 px-6 py-3.5 text-base">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              to="/dashboard"
              variant="secondary"
              className="px-6 py-3.5 text-base"
            >
              Explore Platform
            </Button>
          </Reveal>
          <Reveal delay={0.24} className="grid gap-4 sm:grid-cols-3">
            {[
              "Versioned paper workflows",
              "Cross-team collaboration graphs",
              "Submission-ready project tracking",
            ].map((item) => (
              <div
                key={item}
                className="glass-panel rounded-2xl px-4 py-4 text-sm font-medium text-[var(--text-primary)]"
              >
                {item}
              </div>
            ))}
          </Reveal>
        </div>

        <motion.div
          {...handlers}
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto h-[38rem] w-full max-w-[80rem] overflow-visible"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-[36px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 backdrop-blur-2xl shadow-luxury"
            style={{ x: position.x * 0.18, y: position.y * 0.18 }}
          >
            <div className="noise-overlay relative h-full overflow-hidden rounded-[30px] bg-slate-950 p-5 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.26),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.22),transparent_30%)]" />
              <div className="relative flex h-full flex-col gap-5">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-blue-100/80">
                      ScholarOS workspace
                    </div>
                    <div className="mt-1 text-xl font-semibold">
                      Collaborative research cockpit
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-cyan-200">
                    Live
                  </div>
                </div>

                <div className="grid flex-1 gap-4 md:grid-cols-[2fr_0.4fr]">
                  <div className="space-y-4 rounded-[26px] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-300">
                          Publication velocity
                        </div>
                        <div className="mt-1 text-2xl font-semibold">
                          +34% this quarter
                        </div>
                      </div>
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shrink-0">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="grid h-40 grid-cols-8 items-end gap-2">
                      {[52, 78, 70, 106, 94, 122, 138, 160].map(
                        (height, index) => (
                          <motion.div
                            key={height + index}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height, opacity: 1 }}
                            transition={{
                              delay: 0.35 + index * 0.08,
                              duration: 0.7,
                            }}
                            className="rounded-t-2xl bg-gradient-to-t from-cyan-400 via-blue-500 to-violet-500"
                          />
                        ),
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["14", "Drafts"],
                        ["92%", "Confidence"],
                        ["48", "Resolved"],
                      ].map(([value, label]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 w-full flex flex-col items-center justify-center min-w-0"
                        >
                          <div className="text-xl font-semibold">{value}</div>
                          <div className="flex w-full justify-center mt-1">
                            <span className="text-[0.65rem] uppercase tracking-[0.16em] text-slate-300 whitespace-nowrap">
                              {label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm text-slate-300">
                          Collaboration pulse
                        </div>
                        <UsersRound className="h-4 w-4 text-cyan-300 shrink-0" />
                      </div>
                      <div className="space-y-3">
                        {researchers.map((researcher) => (
                          <div
                            key={researcher.name}
                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-3"
                          >
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${researcher.avatarGradient} text-sm font-semibold text-white shrink-0`}
                            >
                              {researcher.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                              <div className="truncate text-sm font-medium">
                                {researcher.name}
                              </div>
                              <div className="truncate text-xs text-slate-300">
                                {researcher.interests[0]}
                              </div>
                            </div>
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-slate-300">
                            AI insights
                          </div>
                          <div className="text-lg font-semibold">
                            Submission readiness
                          </div>
                        </div>
                        <Orbit className="h-5 w-5 text-violet-300 shrink-0" />
                      </div>
                      <div className="space-y-3">
                        {[
                          "Methods section missing one citation cluster",
                          "Review turnaround improved from 6.4 to 2.1 days",
                          "Recommended collaborator: Data ethics specialist",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm leading-6 text-slate-200"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ x: position.x * -0.26, y: position.y * -0.2 }}
            className="absolute -left-12 top-16 hidden w-72 rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-soft backdrop-blur-2xl md:block z-50 flex flex-col gap-2"
          >
            <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shrink-0">
              <Waypoints className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              Collaboration graph
            </div>
            <p className="text-xs leading-5 text-[var(--text-secondary)]">
              12 departments connected around one climate resilience initiative.
            </p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ x: position.x * 0.24, y: position.y * 0.22 }}
            className="absolute -bottom-4 right-8 hidden w-60 rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-soft backdrop-blur-2xl md:block flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Publication timeline
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  On schedule
                </div>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                +18 days buffer
              </div>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[var(--bg-surface)]">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="pb-24">
      <div className="section-shell">
        <div className="glass-panel gradient-stroke rounded-[32px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Trusted by ambitious teams
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-4xl">
                Built for the next generation of collaborative research.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-[var(--text-secondary)]">
              ScholarOS gives modern institutions a calm, centralized system for
              high-quality output.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statistics.map((item, index) => (
              <Reveal
                key={item.label}
                delay={index * 0.08}
                className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] backdrop-blur-xl flex flex-col gap-2 min-h-[6rem]"
              >
                <div className="text-4xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl">
                  <AnimatedCounter value={item.value} suffix={item.suffix} />
                </div>
                <div className="text-lg font-medium text-[var(--text-primary)]">
                  {item.label}
                </div>
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section id="about" className="py-24">
      <div className="section-shell grid gap-12 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
        <SectionHeading
          eyebrow="The problem"
          title="Great research breaks when the system around it is fragmented."
          description="Brilliant ideas often move through broken operations: scattered documents, invisible progress, disconnected collaborators, and generic software that was never designed for academic workflows."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {problemCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Reveal
                key={card.title}
                delay={index * 0.08}
                className="glass-panel gradient-stroke rounded-[28px] p-6 shadow-soft flex flex-col gap-3"
              >
                <div className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                  {card.title}
                </h3>
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  {card.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SolutionSection() {
  return (
    <section className="py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="The ScholarOS workflow"
          title="One platform from first hypothesis to final publication."
          description="ScholarOS turns research into a visible, collaborative system with structure for people, documents, reviews, and momentum."
          align="center"
          className="mb-14"
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="pointer-events-none absolute left-8 right-8 top-10 hidden h-px bg-gradient-to-r from-blue-200 via-violet-200 to-cyan-200 lg:block" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal
                  key={step.title}
                  delay={index * 0.06}
                  className="relative rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-soft backdrop-blur-xl flex flex-col gap-2"
                >
                  <div className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Step {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">
                    {step.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything a serious research organization needs, in one elegant stack."
          description="From repository management to review coordination, ScholarOS brings depth without visual chaos."
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {featureCards.map((feature, index) => {
            const Icon = featureIcons[feature.icon] ?? Sparkles;
            return (
              <Reveal
                key={feature.title}
                delay={index * 0.04}
                className="group glass-panel gradient-stroke rounded-[28px] p-6 shadow-soft flex flex-col gap-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] whitespace-nowrap shrink-0">
                    {feature.eyebrow}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] transition-transform duration-300 group-hover:translate-x-1">
                  {feature.title}
                </h3>
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ShowcaseSection() {
  return (
    <section id="research" className="py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Product preview"
          title="A dashboard that feels built for world-class research operations."
          description="ScholarOS combines calm information density, intuitive hierarchy, and premium motion design to make serious work feel effortless."
          className="mb-14"
        />
        <Reveal className="glass-panel gradient-stroke overflow-hidden rounded-[36px] p-4 shadow-luxury sm:p-5">
          <div className="overflow-hidden rounded-[30px] bg-slate-950 text-white">
            <div className="grid grid-cols-1 xl:grid-cols-[0.82fr_1.18fr] gap-0">
              <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.18),transparent_28%)] p-6 xl:border-b-0 xl:border-r">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-blue-100/80">
                      Live workspace
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold">
                      BlueGrid Climate Archive
                    </h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-cyan-200 whitespace-nowrap shrink-0">
                    Synced
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl flex flex-col gap-2.5 min-h-[6rem]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-slate-300">
                            {project.id}
                          </div>
                          <div className="mt-1 text-lg font-semibold">
                            {project.name}
                          </div>
                        </div>
                        <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 whitespace-nowrap shrink-0">
                          {project.progress}%
                        </div>
                      </div>
                      <p className="text-sm leading-7 text-slate-300">
                        {project.phase} · {project.institution}
                      </p>
                      <div className="mt-2 h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-400">
                        <span>{project.members} members</span>
                        <span>Due {project.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--bg-surface)] px-5 py-6 text-[var(--text-primary)] sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5">
                  <div className="space-y-5">
                    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            Recent papers
                          </div>
                          <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                            Peer review queue
                          </div>
                        </div>
                        <Button
                          to="/dashboard"
                          variant="secondary"
                          className="hidden sm:inline-flex shrink-0"
                        >
                          Open dashboard
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {researchPapers.slice(0, 3).map((paper) => (
                          <div
                            key={paper.id}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-sm flex flex-col gap-2"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                  {paper.id} · {paper.domain}
                                </div>
                                <div className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                                  {paper.title}
                                </div>
                                <div className="mt-2 text-sm text-[var(--text-secondary)]">
                                  {paper.authors.join(" • ")}
                                </div>
                              </div>
                              <span className="rounded-full bg-[var(--badge-blue)] px-3 py-1 text-xs font-semibold text-[var(--badge-blue-text)] whitespace-nowrap shrink-0">
                                {paper.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[var(--border)] bg-slate-950 p-5 text-white flex flex-col gap-4">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs uppercase tracking-[0.2em] text-blue-100/80">
                            Knowledge graph
                          </div>
                          <div className="mt-2 text-xl font-semibold">
                            Connected expertise
                          </div>
                        </div>
                        <UsersRound className="h-5 w-5 text-cyan-300 shrink-0" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {researchers.map((person) => (
                          <div
                            key={person.name}
                            className="rounded-[22px] border border-white/10 bg-white/5 p-4 flex flex-col gap-1.5 min-h-[4rem]"
                          >
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${person.avatarGradient} text-sm font-semibold text-white shrink-0`}
                            >
                              {person.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div className="mt-2 text-sm font-medium">
                              {person.name}
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-300">
                              {person.role}
                            </div>
                            <div className="mt-1 text-xs leading-5 text-slate-300">
                              {person.interests[0]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[28px] border border-[var(--border)] bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 p-5 text-white shadow-[0_30px_90px_rgba(59,130,246,0.32)] flex flex-col gap-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-blue-50/90">
                        Team readiness
                      </div>
                      <div className="text-4xl font-semibold tracking-[-0.04em]">
                        94%
                      </div>
                      <p className="max-w-xs text-sm leading-7 text-blue-50/90">
                        Submission package, contributor approvals, and review
                        milestones are aligned.
                      </p>
                      <div className="mt-2 grid gap-3">
                        {[
                          "Citations verified",
                          "Supervisor approval captured",
                          "Dataset package archived",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 text-cyan-100 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex flex-col gap-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                        System activity
                      </div>
                      <div className="text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                        What changed today
                      </div>
                      <div className="mt-2 space-y-3">
                        {[
                          "3 reviewers left feedback on adaptive graph model draft",
                          "2 project timelines moved into publication phase",
                          "1 new collaborator matched from data ethics department",
                          "Citation extraction completed for 128 references",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-sm"
                          >
                            <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 shrink-0" />
                            <div className="text-sm leading-7 text-[var(--text-secondary)]">
                              {item}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="How it works"
          title="Four simple steps to elevate your research workflow."
          description="ScholarOS is designed to feel instantly familiar while giving research teams the depth they actually need."
          align="center"
          className="mb-14"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {howItWorksSteps.map((item, index) => (
            <Reveal
              key={item.step}
              delay={index * 0.08}
              className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-soft backdrop-blur-xl flex flex-col gap-2 min-h-[6rem]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500" />
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                {item.step}
              </div>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                {item.title}
              </h3>
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by researchers who want beautiful tools and serious structure."
          description="From doctoral candidates to faculty advisors, teams rely on ScholarOS to reduce friction and raise output quality."
          className="mb-14"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((testimonial, index) => (
            <Reveal
              key={testimonial.name}
              delay={index * 0.08}
              className="glass-panel gradient-stroke rounded-[30px] p-6 shadow-soft flex flex-col gap-3 min-h-[6rem]"
            >
              <div className="mb-1 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white w-fit whitespace-nowrap">
                {testimonial.metric}
              </div>
              <p className="text-lg leading-9 text-[var(--text-primary)]">
                “{testimonial.quote}”
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-semibold text-white shrink-0">
                  {testimonial.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  <div className="font-semibold text-[var(--text-primary)]">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {testimonial.title} · {testimonial.institution}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="section-shell">
        <Reveal className="relative overflow-hidden rounded-[38px] border border-white/70 bg-slate-950 px-6 py-16 text-white shadow-luxury sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_20%),radial-gradient(circle_at_center,rgba(139,92,246,0.22),transparent_34%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100 w-fit whitespace-nowrap">
                Ready to transform research collaboration?
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl lg:leading-[1.02]">
                Build a calmer, smarter future for every research team.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Start with a polished workspace today and give your institution
                a product experience worthy of world-class ideas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button to="/register" className="px-6 py-3.5 text-base">
                Register
              </Button>
              <Button
                to="/login"
                variant="secondary"
                className="border-white/20 bg-white/10 px-6 py-3.5 text-base text-white hover:bg-white/15 hover:text-white"
              >
                Login
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}