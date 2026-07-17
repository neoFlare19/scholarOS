import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button.jsx";
import { navigationLinks } from "../constants/site.js";
import { cn } from "../utils/cn.js";
import logoMark from "../assets/scholaros-mark.svg";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      {/* 
        Liquid Glass Navbar:
        - bg-white/10: Extremely high transparency to let the background grid and gradients bleed through.
        - backdrop-blur-2xl: Maximum frosted glass effect.
        - shadow-[0_8px_32px_rgba(255,255,255,0.1)]: Adds a subtle glowing rim light (liquid border effect).
        - transition-all duration-500: Smoothly fades in and out while scrolling.
      */}
      <div
        className={cn(
          "mx-auto max-w-7xl rounded-full border border-transparent transition-all duration-500 ease-out",
          scrolled 
            ? "border-white/20 bg-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(255,255,255,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.05)]" 
            : "border-transparent bg-transparent shadow-none backdrop-blur-0"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 lg:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoMark} alt="ScholarOS" className="h-10 w-10 rounded-2xl shadow-lg shadow-blue-500/20" />
            <div>
              <div className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">ScholarOS</div>
              <div className="text-sm text-slate-700">Research collaboration platform</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigationLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/70 hover:text-slate-950"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button to="/login" variant="ghost">Login</Button>
            <Button to="/register" variant="secondary">Register</Button>
            <Button to="/register" className="gap-2">
              Start Research
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile toggle button - also updated to liquid glass */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl text-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.02)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/20 px-4 pb-4 lg:hidden"
            >
              <div className="flex flex-col gap-2 pt-4">
                {navigationLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/70"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="mt-2 grid gap-2">
                  <Button to="/login" variant="secondary">Login</Button>
                  <Button to="/register">Start Research</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}