import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Check, ChevronDown, Circle, Upload, X } from "lucide-react";

type Author = { initials: string; name: string };
type UploadedFile = { name: string; size: string };

const initialAuthors: Author[] = [
  { initials: "LM", name: "Dr. Leila Morgan" },
  { initials: "AP", name: "Aarav Patel" },
  { initials: "SC", name: "Sofia Chen" },
];

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100/60";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function UploadPaper() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile>({ name: "adaptive_graph_models_climate.pdf", size: "4.8 MB" });
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("Adaptive Graph Models for Predictive Climate Resilience Planning");
  const [abstract, setAbstract] = useState("Introduces a graph-based framework for modeling climate resilience across interconnected infrastructure systems, validated against five regional datasets.");
  const [keywords, setKeywords] = useState(["Climate Resilience", "Graph Neural Networks", "Infrastructure"]);
  const [keywordInput, setKeywordInput] = useState("");
  const [researchArea, setResearchArea] = useState("Environmental AI");
  const [category, setCategory] = useState("Peer Review");
  const [publicationYear, setPublicationYear] = useState("2026");
  const [department, setDepartment] = useState("Computer Science Dept.");
  const [authors, setAuthors] = useState(initialAuthors);
  const [authorInput, setAuthorInput] = useState("");
  const [areaConfirmed, setAreaConfirmed] = useState(false);
  const [authorsConfirmed, setAuthorsConfirmed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  };

  const useFile = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showNotice("Please choose a PDF file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      showNotice("The PDF must be smaller than 50 MB.");
      return;
    }
    setUploadedFile({ name: file.name, size: `${Math.max(file.size / 1024 / 1024, 0.1).toFixed(1)} MB` });
    showNotice("PDF uploaded and ready.");
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    useFile(event.dataTransfer.files[0]);
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (!keyword || keywords.some((item) => item.toLowerCase() === keyword.toLowerCase())) return;
    setKeywords((current) => [...current, keyword]);
    setKeywordInput("");
  };

  const handleKeywordKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addKeyword();
    }
  };

  const addAuthor = () => {
    const name = authorInput.trim();
    if (!name || authors.some((author) => author.name.toLowerCase() === name.toLowerCase())) return;
    const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    setAuthors((current) => [...current, { initials, name }]);
    setAuthorInput("");
    setAuthorsConfirmed(true);
  };

  const handleAuthorKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addAuthor();
    }
  };

  const saveDraft = () => showNotice("Draft saved successfully.");

  const submitForApproval = () => {
    if (!uploadedFile || !title.trim() || !abstract.trim() || keywords.length === 0) {
      showNotice("Complete the required manuscript details first.");
      return;
    }
    setAreaConfirmed(true);
    setAuthorsConfirmed(true);
    showNotice("Paper submitted for approval.");
    setTimeout(() => { navigate("/dashboard/papers"); }, 1500);
  };

  const checklist = [
    { label: "PDF file uploaded", complete: Boolean(uploadedFile) },
    { label: "Title added", complete: Boolean(title.trim()) },
    { label: "Abstract added", complete: Boolean(abstract.trim()) },
    { label: "At least one keyword", complete: keywords.length > 0 },
    { label: "Research area selected", complete: areaConfirmed },
    { label: "Authors confirmed", complete: authorsConfirmed },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-8 w-full min-w-0 relative">
      {/* Responsive Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
        <div>
          <div className="mb-1 text-xs font-medium text-[var(--text-muted)]">Every paper starts here</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Add Your Work to the Record</h1>
        </div>
        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={saveDraft} className="h-11 w-full sm:w-auto rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 text-sm font-bold text-[var(--text-secondary)] shadow-sm transition hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]">
          Save as Draft
        </motion.button>
      </motion.div>

      {/* Responsive Main Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] items-start gap-5">
        <div className="space-y-5">
          <motion.section variants={itemVariants} whileHover={{ y: -4, boxShadow: "0 24px 80px rgba(15,23,42,0.08)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 sm:p-7 shadow-[0_16px_36px_rgba(35,42,83,0.07)] backdrop-blur-md">
            <p className="text-base text-[var(--text-primary)]">Manuscript</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Upload File</h2>
            <motion.div animate={{ scale: isDragging ? 1.02 : 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`mt-1 cursor-pointer rounded-[20px] border-2 border-dashed px-4 sm:px-6 py-8 sm:py-10 text-center transition ${isDragging ? "border-indigo-400 bg-indigo-50/80" : "border-violet-300/80 bg-linear-to-br from-violet-50/45 to-cyan-50/45 hover:border-indigo-400"}`}>
              <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => useFile(event.target.files?.[0])} />
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-300/35">
                <Upload size={22} />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-[var(--text-primary)]">Drag and drop your PDF here</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">or click to browse · Max file size 50MB · PDF only</p>
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="mt-5 h-11 w-full rounded-xl bg-linear-to-r from-violet-500 via-indigo-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-indigo-300/35 transition hover:-translate-y-0.5 hover:shadow-xl">
                Choose File
              </motion.button>
            </motion.div>
            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface-elevated)] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-50 to-cyan-50 text-xs font-extrabold text-violet-500">PDF</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-[var(--text-primary)]">{uploadedFile.name}</div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">{uploadedFile.size} · Uploaded just now</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                <Check size={13} strokeWidth={3} /> Ready
              </span>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} whileHover={{ y: -4, boxShadow: "0 24px 80px rgba(15,23,42,0.08)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 sm:p-7 shadow-[0_16px_36px_rgba(35,42,83,0.07)] backdrop-blur-md">
            <p className="text-base text-[var(--text-primary)]">Details</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Paper Information</h2>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold text-[var(--text-primary)]">Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className={`${inputClass} h-11`} />
            </label>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-bold text-[var(--text-primary)]">Abstract</span>
              <textarea value={abstract} onChange={(event) => setAbstract(event.target.value)} rows={4} className={`${inputClass} resize-none py-3 leading-relaxed`} />
            </label>
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">Keywords</span>
                <span className="text-[11px] text-[var(--text-muted)]">Press enter to add a tag</span>
              </div>
              <div className="flex min-h-13 flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2">
                {keywords.map((keyword) => (
                  <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={keyword} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                    {keyword}
                    <button type="button" aria-label={`Remove ${keyword}`} onClick={() => setKeywords((current) => current.filter((item) => item !== keyword))} className="text-slate-400 transition hover:text-red-500">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </motion.span>
                ))}
                <input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} onKeyDown={handleKeywordKeyDown} onBlur={addKeyword} placeholder="Add keyword…" className="min-w-32 flex-1 bg-transparent px-1 py-1.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <SelectField label="Research Area" value={researchArea} options={["Environmental AI", "Health Informatics", "Research Systems", "Cybersecurity"]} onChange={(v) => { setResearchArea(v); setAreaConfirmed(true); }} />
              <SelectField label="Category" value={category} options={["Peer Review", "Ready to Publish", "Draft", "In Revision"]} onChange={setCategory} />
              <SelectField label="Publication Year" value={publicationYear} options={["2026", "2025", "2024", "2023"]} onChange={setPublicationYear} />
              <SelectField label="Department" value={department} options={["Computer Science Dept.", "Medicine", "Engineering", "Social Sciences"]} onChange={setDepartment} />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">Authors</span>
                <span className="text-[11px] text-[var(--text-muted)]">Search registered researchers</span>
              </div>
              <div className="flex min-h-13 flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2">
                {authors.map((author) => (
                  <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={author.name} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-bold text-[var(--text-primary)]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-cyan-400 text-[8px] text-white">{author.initials}</span>
                    {author.name}
                    <button type="button" aria-label={`Remove ${author.name}`} onClick={() => { setAuthors((current) => current.filter((item) => item.name !== author.name)); setAuthorsConfirmed(true); }} className="text-slate-400 transition hover:text-red-500">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </motion.span>
                ))}
                <input value={authorInput} onChange={(event) => setAuthorInput(event.target.value)} onKeyDown={handleAuthorKeyDown} onBlur={addAuthor} placeholder="Add co-author…" className="min-w-36 flex-1 bg-transparent px-1 py-1.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
              </div>
            </div>
          </motion.section>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-end gap-3">
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => navigate("/dashboard/papers")} className="h-11 w-full sm:w-auto rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 text-sm font-bold text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]">
              Cancel
            </motion.button>
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={saveDraft} className="h-11 w-full sm:w-auto rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 text-sm font-bold text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]">
              Save as Draft
            </motion.button>
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={submitForApproval} className="h-11 w-full sm:w-auto rounded-xl bg-linear-to-r from-violet-500 via-indigo-500 to-cyan-400 px-7 text-sm font-bold text-white shadow-lg shadow-indigo-300/35 transition hover:-translate-y-0.5 hover:shadow-xl">
              Submit for Approval
            </motion.button>
          </motion.div>
        </div>

        <aside className="space-y-5">
          <motion.section variants={itemVariants} whileHover={{ y: -4, boxShadow: "0 24px 80px rgba(15,23,42,0.08)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_16px_36px_rgba(35,42,83,0.07)] backdrop-blur-md">
            <p className="text-base text-[var(--text-primary)]">Status</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Submission Checklist</h2>
            <div className="mt-3 divide-y divide-[var(--border)]">
              {checklist.map((item, index) => (
                <motion.button key={item.label} type="button" whileTap={{ scale: 0.98 }} onClick={() => { if (index === 4) setAreaConfirmed((current) => !current); if (index === 5) setAuthorsConfirmed((current) => !current); }} className={`flex w-full items-center gap-3 py-4 text-left ${index < 4 ? "cursor-default" : "cursor-pointer"}`}>
                  {item.complete ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-cyan-400 text-white">
                      <Check size={13} strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-[var(--text-muted)]">
                      <Circle size={7} />
                    </span>
                  )}
                  <span className={`text-sm font-bold ${item.complete ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.section>
        </aside>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[90vw] max-w-sm rounded-xl bg-[var(--bg-sidebar)] px-5 py-3 text-sm font-bold text-white shadow-2xl text-center">
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <motion.label whileHover={{ scale: 1.01 }} className="block">
      <span className="mb-2 block text-xs font-bold text-[var(--text-primary)]">{label}</span>
      <span className="relative block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} h-11 appearance-none pr-10`}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
      </span>
    </motion.label>
  );
}