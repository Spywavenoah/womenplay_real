import React from "react";
import { Lock, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const [token, setToken] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    setToken(t);
    if (!t) setError("Missing or invalid password reset link. Please request a new one.");
  }, []);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) return "Password must contain at least one special character.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Missing or invalid password reset link. Please request a new one.");
      return;
    }
    const passErr = validatePassword(newPassword);
    if (passErr) {
      setError(passErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please confirm your password accurately.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Your password has been reset successfully.");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          window.location.href = "/";
        }, 2500);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Network error while resetting your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 luxury-shadow overflow-hidden p-6 md:p-8 text-left">
        <div className="text-center space-y-2 pb-4 border-b border-slate-50 mb-6 flex flex-col items-center">
          <img
            src="/assets/logo.png"
            alt="WomenPlay Logo"
            className="h-14 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">
            Create a New Password
          </p>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium mb-4 leading-relaxed flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs py-3 px-4 rounded-xl font-medium mb-4 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
              />
            </div>
            <p className="text-[9px] text-slate-400 mt-1">
              Must be 8+ chars with uppercase, lowercase, number, and special character.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full mt-6 bg-brand-pink hover:bg-brand-pink-hover disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition flex justify-center items-center space-x-2 shadow-md cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Reset Password</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
