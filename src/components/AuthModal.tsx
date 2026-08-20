import React from "react";
import { X, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, token?: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = React.useState<"login" | "forgot">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [unverifiedEmail, setUnverifiedEmail] = React.useState("");
  const [resending, setResending] = React.useState(false);

  // 2FA Verification Step State
  const [requires2FA, setRequires2FA] = React.useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = React.useState<"email" | "authenticator">("authenticator");
  const [tempToken, setTempToken] = React.useState("");
  const [twoFactorCode, setTwoFactorCode] = React.useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setRequires2FA(false);
    setTempToken("");
    setTwoFactorCode("");
  };

  const handleResendVerification = async () => {
    const targetEmail = unverifiedEmail || email;
    if (!targetEmail) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "Verification email resent! Please check your inbox.");
        setError("");
      } else {
        setError(data.error || "Failed to resend verification email.");
      }
    } catch (err) {
      setError("Network error while attempting to resend verification link.");
    } finally {
      setResending(false);
    }
  };

  const handleVerify2FALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code: twoFactorCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        resetForm();
        if (data.token) localStorage.setItem("wp_token", data.token);
        if (data.user) localStorage.setItem("aura_user", JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.error || "Invalid 2FA verification code. Please check and try again.");
      }
    } catch (err) {
      setError("Network error verifying 2FA code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setUnverifiedEmail("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.requires2FA) {
          setRequires2FA(true);
          setTwoFactorMethod(data.twoFactorMethod || "authenticator");
          setTempToken(data.tempToken);
          setSuccessMessage(data.message || "Please enter your 2FA verification code.");
          return;
        }
        // Clear form after successful sign in
        resetForm();
        if (data.token) localStorage.setItem("wp_token", data.token);
        if (data.user) localStorage.setItem("aura_user", JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.error || "Login failed. Ensure the email is registered.");
        if (data.emailUnverified) {
          setUnverifiedEmail(data.email || email);
        }
      }
    } catch (err) {
      setError("Failed to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "If that email is registered, a password reset link has been sent.");
      } else {
        setError(data.error || "Failed to send password reset link.");
      }
    } catch (err) {
      setError("Network error while sending password reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="auth-modal-overlay">      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 luxury-shadow overflow-hidden p-6 md:p-8 animate-in zoom-in-95 duration-200 text-left">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          id="btn-close-auth"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Banner Header */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-50 mb-6 flex flex-col items-center">
          <img 
            src="/assets/logo.png" 
            alt="WomenPlay Logo" 
            onError={(e) => { (e.target as HTMLImageElement).src = "/assets/logo-light.svg"; }}
            className="h-14 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">
            {requires2FA ? "Two-Factor Security Verification" : "Gateway of Influence & Leadership"}
          </p>
        </div>

        {requires2FA ? (
          <form onSubmit={handleVerify2FALogin} className="space-y-4">
            <div className="bg-brand-pink/10 border border-brand-pink/20 p-4 rounded-2xl text-center space-y-1">
              <p className="text-xs font-bold text-slate-800">2FA Security Challenge Required</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {twoFactorMethod === "email"
                  ? "A 6-digit verification code has been dispatched to your email address."
                  : "Please open your Authenticator app (Google Authenticator, Authy) and enter the 6-digit code."}
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs py-2.5 px-3.5 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block">
                6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-mono text-center text-xl font-extrabold tracking-widest text-slate-900 focus:outline-none focus:border-brand-pink"
                required
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRequires2FA(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
                className="flex-1 bg-brand-pink hover:bg-brand-pink-hover disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Verify & Sign In</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Sign In indicator */}
        {mode !== "forgot" && (
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); setSuccessMessage(""); }}
            id="auth-toggle-login"
            className="flex-1 py-2 rounded-lg text-xs font-bold transition bg-white text-brand-pink shadow-xs"
          >
            Sign In
          </button>
        </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium mb-4 leading-relaxed space-y-2">
            <p>✓ {successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs py-2.5 px-3.5 rounded-xl font-medium mb-4 leading-relaxed space-y-2">
            <p>{error}</p>
            {unverifiedEmail && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="mt-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Resend Verification Email via SMTP</span>
              </button>
            )}
          </div>
        )}

        {/* Form Body */}
        {mode === "forgot" ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@corporate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="auth-input-forgot-email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-brand-pink hover:bg-brand-pink-hover disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition flex justify-center items-center space-x-2 shadow-md cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Send Reset Link</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccessMessage(""); }}
              className="w-full text-slate-500 hover:text-slate-800 text-xs font-bold py-2 transition cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@corporate.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="auth-input-email"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Password (Security Code)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="auth-input-password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="btn-auth-submit"
            className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition flex justify-center items-center space-x-2 shadow-md cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => { setMode("forgot"); setError(""); setSuccessMessage(""); setUnverifiedEmail(""); }}
              className="w-full text-slate-500 hover:text-brand-pink text-xs font-bold py-1 transition cursor-pointer"
              id="btn-forgot-password"
            >
              Forgot your password?
            </button>
          )}
        </form>
        )}
        </>)}
      </div>
    </div>
  );
}
