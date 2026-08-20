import React from "react";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Home } from "lucide-react";

export default function VerifyEmailPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    const pathToken = window.location.pathname.split("/verify-email/")[1] || "";
    if (!pathToken) {
      setError("Missing or invalid email verification link. Please request a new one.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: pathToken })
        });
        const data = await res.json();
        if (res.ok) {
          setEmail(data.email || "");
        } else {
          setError(data.error || "This verification link is invalid or has already been used.");
        }
      } catch (err) {
        setError("Network error while verifying your email. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 luxury-shadow overflow-hidden p-6 md:p-8 text-left">
        <div className="text-center space-y-2 pb-4 border-b border-slate-50 mb-6 flex flex-col items-center">
          <img
            src="/assets/logo.png"
            alt="WomenPlay Logo"
            onError={(e) => { (e.target as HTMLImageElement).src = "/assets/logo-light.svg"; }}
            className="h-14 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">
            Email Verification
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-slate-500">
            <Loader2 className="w-8 h-8 text-brand-pink animate-spin" />
            <p className="text-xs font-medium">Verifying your email address...</p>
          </div>
        )}

        {!loading && !error && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-display font-extrabold text-slate-900">Email Verified Successfully!</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {email ? (
                  <>Your email address <strong className="text-slate-700">{email}</strong> has been confirmed. You may now sign in to access your executive portal.</>
                ) : (
                  "Your email address has been confirmed. You may now sign in to access your executive portal."
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { window.location.href = "/?verified=true"; }}
              className="w-full mt-4 bg-brand-pink hover:bg-brand-pink-hover text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition flex justify-center items-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!loading && error && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 text-rose-500 mx-auto flex items-center justify-center">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-display font-extrabold text-slate-900">Verification Failed</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => { window.location.href = "/"; }}
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition flex justify-center items-center space-x-2 shadow-md cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
