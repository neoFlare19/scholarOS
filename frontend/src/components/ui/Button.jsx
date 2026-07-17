import { Link } from "react-router-dom";
import { cn } from "../../utils/cn.js";

const variants = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(37,99,235,0.36)]",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur-xl hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700",
  ghost:
    "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-white/70 hover:text-slate-900",
  dark:
    "inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(15,23,42,0.25)] hover:-translate-y-0.5 hover:bg-slate-900",
};

export default function Button({
  children,
  className,
  variant = "primary",
  to,
  href,
  ...props
}) {
  const classes = cn(variants[variant], className);

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
