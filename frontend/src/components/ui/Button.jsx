import { Link } from "react-router-dom";
import { cn } from "../../utils/cn.js";

const variants = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 text-white shadow-[0_20px_50px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(37,99,235,0.36)]",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600",
  ghost:
    "inline-flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]",
  dark: "inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-950 text-white shadow-[0_20px_50px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 hover:bg-slate-900",
};

const sizes = {
  sm: "px-4 py-2 text-xs font-semibold",
  md: "px-5 py-3 text-sm font-semibold",
  lg: "px-6 py-3.5 text-base font-semibold",
};

const ghostSizes = {
  sm: "px-3 py-1.5 text-xs font-medium",
  md: "px-4 py-2.5 text-sm font-medium",
  lg: "px-5 py-3 text-base font-medium",
};

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  to,
  href,
  ...props
}) {
  const sizeClasses = variant === "ghost" ? ghostSizes[size] : sizes[size];
  const classes = cn(variants[variant], sizeClasses, className);

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}