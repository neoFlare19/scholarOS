import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout.jsx";
import Button from "../components/ui/Button.jsx";
import { apiRequest } from "../utils/api.js";

export default function VerifyOtpPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem(
      "scholaros_verification_email"
    );

    if (!savedEmail) {
      navigate("/register");
      return;
    }

    setEmail(savedEmail);
  }, [navigate]);

  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/otp/verify", {
        method: "POST",
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      // Save authentication token
      localStorage.setItem("scholaros_token", data.token);
      localStorage.setItem("scholaros_user", JSON.stringify(data.user));

      sessionStorage.removeItem("scholaros_verification_email");

      navigate("/interest-setup");
    } catch (error) {
      const backendErrors = error.data?.errors;

      if (backendErrors?.otp) {
        setError(backendErrors.otp[0]);
      } else {
        setError(
          error.data?.message ||
            "Verification failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    try {
      const data = await apiRequest("/otp/resend", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });

      setMessage(data.message);
    } catch (error) {
      setError(
        error.data?.message ||
          "Unable to resend the verification code."
      );
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the 6-digit verification code sent to ${email}.`}
      sideTitle="One more step before entering ScholarOS."
      sideDescription="Verify your email address to secure your ScholarOS account."
    >
      <form onSubmit={handleVerify} className="space-y-5">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600">
            {message}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Verification code
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, ""))
            }
            placeholder="123456"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center text-xl tracking-[0.5em] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full justify-center py-3.5 text-base"
        >
          {loading ? "Verifying..." : "Verify email"}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          className="w-full text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Resend verification code
        </button>
      </form>
    </AuthLayout>
  );
}