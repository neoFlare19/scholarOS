import { Link } from "react-router-dom";
import { Globe2, Mail, Send, Sparkles } from "lucide-react";
import { footerGroups } from "../constants/site.js";
import logoMark from "../assets/scholaros-mark.svg";

const socialLinks = [
  { label: "Social", icon: Send },
  { label: "Community", icon: Globe2 },
  { label: "Updates", icon: Sparkles },
  { label: "Email", icon: Mail },
];

export default function SiteFooter() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--bg-surface)] py-20 backdrop-blur-2xl">
      <div className="section-shell grid gap-14 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-8">
          <Link to="/" className="flex items-center gap-4">
            <img src={logoMark} alt="ScholarOS" className="h-12 w-12 rounded-2xl shadow-lg shadow-blue-500/20" />
            <div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">ScholarOS</div>
              <div className="text-sm text-[var(--text-muted)]">The operating system for modern research teams.</div>
            </div>
          </Link>
          <p className="max-w-xl text-base leading-8 text-[var(--text-secondary)]">
            Built for institutions, labs, faculty, and student researchers who want a beautiful, centralized platform for collaboration, publishing, and knowledge management.
          </p>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="/"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">{group.title}</h3>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="/" className="hover:text-[var(--text-primary)]">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="section-shell mt-14 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 ScholarOS. Crafted for ambitious research teams.</p>
        <div className="flex gap-5">
          <a href="/" className="hover:text-[var(--text-primary)]">Privacy</a>
          <a href="/" className="hover:text-[var(--text-primary)]">Terms</a>
          <a href="/" className="hover:text-[var(--text-primary)]">Security</a>
        </div>
      </div>
    </footer>
  );
}