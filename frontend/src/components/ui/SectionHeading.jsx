import { motion } from "framer-motion";
import { cn } from "../../utils/cn.js";

export default function SectionHeading({ eyebrow, title, description, align = "left", className }) {
  const aligned = align === "center" ? "mx-auto text-center items-center" : "items-start text-left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("flex max-w-3xl flex-col gap-4", aligned, className)}
    >
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/60 bg-white/75 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 shadow-sm backdrop-blur-xl">
        <span className="h-2 w-2 rounded-full bg-cyan-400" />
        {eyebrow}
      </div>
      <h2 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.02]">
        {title}
      </h2>
      <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
        {description}
      </p>
    </motion.div>
  );
}
