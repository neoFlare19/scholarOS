import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, ShieldCheck, Orbit } from "lucide-react";
import logoMark from "../assets/scholaros-mark.svg";

const highlights = [
  {
    icon: Sparkles,
    title: "Designed for clarity",
    description: "A calm interface for complex research operations and publication workflows.",
  },
  {
    icon: ShieldCheck,
    title: "Built for academic rigor",
    description: "Versioned collaboration, transparent ownership, and publication-ready organization.",
  },
  {
    icon: Orbit,
    title: "Connected knowledge",
    description: "Projects, papers, notes, and teams live in a single intelligent workspace.",
  },
];

export default function AuthLayout({ title, subtitle, children, sideTitle, sideDescription, footerText, footerAction }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-radial-premium text-slate-950">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-40" />
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="section-shell relative flex min-h-screen flex-col py-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-xl hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Link to="/" className="flex items-center gap-3">
            <img src={logoMark} alt="ScholarOS" className="h-10 w-10 rounded-2xl shadow-lg shadow-blue-500/20" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">ScholarOS</span>
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative hidden rounded-[36px] border border-white/60 bg-slate-950 px-10 py-10 text-white shadow-luxury lg:block"
          >
            <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.24),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.24),transparent_28%)]" />
            <div className="relative space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-blue-100">
                Premium research workspace
              </div>
              <div className="space-y-4">
                <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.05em] leading-[1.02]">{sideTitle}</h1>
                <p className="max-w-xl text-lg leading-8 text-slate-300">{sideDescription}</p>
              </div>
              <div className="grid gap-4">
                {highlights.map(({ icon: Icon, title: itemTitle, description }) => (
                  <div key={itemTitle} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-lg font-medium">{itemTitle}</div>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="glass-panel gradient-stroke mx-auto w-full max-w-xl rounded-[36px] px-6 py-8 shadow-luxury sm:px-8 sm:py-10"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                Welcome to ScholarOS
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">{title}</h2>
              <p className="text-base leading-8 text-slate-600">{subtitle}</p>
            </div>
            <div className="mt-8">{children}</div>
            <div className="mt-8 border-t border-slate-200/70 pt-6 text-sm text-slate-500">
              {footerText} {footerAction}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
