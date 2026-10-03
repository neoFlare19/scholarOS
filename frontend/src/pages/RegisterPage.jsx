import { apiRequest } from "../utils/api.js";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Mail,
  ShieldCheck,
  User2,
} from "lucide-react";
import AuthLayout from "../layout/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import { cn } from "../utils/cn.js";

const initialState = {
  name: "",
  institution: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputClass = useMemo(
    () =>
      "w-full rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3.5 text-slate-900 shadow-sm outline-none backdrop-blur-xl placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100",
    [],
  );

  const validate = () => {
    const nextErrors = {};
    ["name", "institution"].forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = "This field is required.";
    });
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      nextErrors.email = "Enter a valid email address.";
    if (form.password.trim().length < 6)
      nextErrors.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password)
      nextErrors.confirmPassword = "Passwords do not match.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length !== 0) {
      return;
    }

    try {
      const data = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          institution: form.institution,
          email: form.email,
          password: form.password,
          password_confirmation: form.confirmPassword,
        }),
      });

      // Keep the email temporarily so OTP page knows which account to verify
      sessionStorage.setItem("scholaros_verification_email", data.email);

      navigate("/verify-otp");
    } catch (error) {
      const backendErrors = error.data?.errors;

      if (backendErrors) {
        const formattedErrors = {};

        Object.keys(backendErrors).forEach((key) => {
          formattedErrors[key] = backendErrors[key][0];
        });

        setErrors(formattedErrors);
      } else {
        setErrors({
          general:
            error.data?.message || "Something went wrong. Please try again.",
        });
      }
    }
  };

  const renderError = (key) =>
    errors[key] && <p className="mt-2 text-sm text-rose-600">{errors[key]}</p>;

  return (
    <AuthLayout
      title="Create your ScholarOS account"
      subtitle="Set up your research identity — you can complete the rest of your profile after signing in."
      sideTitle="Launch a research workspace your team will actually enjoy using."
      sideDescription="ScholarOS is where publication pipelines, repositories, and interdisciplinary collaboration become beautifully manageable."
      footerText="Already have an account?"
      footerAction={
        <Link
          to="/login"
          className="font-semibold text-blue-700 hover:text-blue-800"
        >
          Login
        </Link>
      }
    >
      {errors.general && (
        <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600">
          {errors.general}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <div className="relative">
              <User2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Dr. Leila Morgan"
                className={cn(
                  inputClass,
                  "pl-11",
                  errors.name &&
                    "border-rose-300 focus:border-rose-300 focus:ring-rose-100",
                )}
              />
            </div>
            {renderError("name")}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Institution
            </label>
            <div className="relative">
              <GraduationCap className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={form.institution}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    institution: event.target.value,
                  }))
                }
                placeholder="North Atlantic Institute"
                className={cn(
                  inputClass,
                  "pl-11",
                  errors.institution &&
                    "border-rose-300 focus:border-rose-300 focus:ring-rose-100",
                )}
              />
            </div>
            {renderError("institution")}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="you@institution.edu"
              className={cn(
                inputClass,
                "pl-11",
                errors.email &&
                  "border-rose-300 focus:border-rose-300 focus:ring-rose-100",
              )}
            />
          </div>
          {renderError("email")}
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Create a secure password"
                className={cn(
                  inputClass,
                  "pl-11 pr-11",
                  errors.password &&
                    "border-rose-300 focus:border-rose-300 focus:ring-rose-100",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {renderError("password")}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                placeholder="Confirm your password"
                className={cn(
                  inputClass,
                  "pl-11 pr-11",
                  errors.confirmPassword &&
                    "border-rose-300 focus:border-rose-300 focus:ring-rose-100",
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {renderError("confirmPassword")}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full justify-center py-3.5 text-base"
        >
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
