import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import AuthLayout from "../layout/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import { cn } from "../utils/cn.js";

const initialState = {
  email: "",
  password: "",
  remember: true,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const inputClass = useMemo(
    () =>
      "w-full rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3.5 text-slate-900 shadow-sm outline-none backdrop-blur-xl placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100",
    []
  );

  const validate = () => {
    const nextErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid institutional email address.";
    if (form.password.trim().length < 6) nextErrors.password = "Password must be at least 6 characters.";
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      navigate("/dashboard");
    }
  };

  return (
    <AuthLayout
      title="Login to your workspace"
      subtitle="Access your papers, projects, collaborators, and publication pipeline in one place."
      sideTitle="Secure access for focused research operations."
      sideDescription="ScholarOS gives researchers a premium collaboration environment without the noise of generic productivity tools."
      footerText="Don’t have an account?"
      footerAction={<Link to="/register" className="font-semibold text-blue-700 hover:text-blue-800">Create one</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@institution.edu"
              className={cn(inputClass, "pl-11", errors.email && "border-rose-300 focus:border-rose-300 focus:ring-rose-100")}
            />
          </div>
          {errors.email && <p className="mt-2 text-sm text-rose-600">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Enter your password"
              className={cn(inputClass, "pl-11 pr-11", errors.password && "border-rose-300 focus:border-rose-300 focus:ring-rose-100")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-sm text-rose-600">{errors.password}</p>}
        </div>

        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(event) => setForm((current) => ({ ...current, remember: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
            />
            Remember me
          </label>
          <a href="/" className="font-medium text-blue-700 hover:text-blue-800">Forgot password?</a>
        </div>

        <Button type="submit" className="w-full justify-center py-3.5 text-base">Login</Button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[28px] border border-blue-100 bg-blue-50/70 p-5 text-sm leading-7 text-slate-600"
        >
          Demo credentials are not required. This frontend prototype uses local state only and routes directly to the dashboard preview after validation.
        </motion.div>
      </form>
    </AuthLayout>
  );
}
