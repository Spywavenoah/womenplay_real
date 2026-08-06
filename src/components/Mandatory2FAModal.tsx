import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, KeyRound, Mail, Smartphone, ArrowRight, CheckCircle2, Loader2, Copy, Check } from "lucide-react";
import type { User } from "../types";
import { showSuccessAlert, showErrorAlert } from "../lib/swal";

interface Mandatory2FAModalProps {
  currentUser: User;
  onUpdateCurrentUser: (updatedUser: User) => void;
}

export default function Mandatory2FAModal({ currentUser, onUpdateCurrentUser }: Mandatory2FAModalProps) {
  const [method, setMethod] = useState<"authenticator" | "email">("authenticator");
  const [step, setStep] = useState<"select" | "verify">("select");
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Start Setup Process
  const handleStartSetup = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          method
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (method === "authenticator") {
          setQrCodeUrl(data.qrCodeUrl || "");
          setSecretKey(data.secret || "");
        }
        setStep("verify");
      } else {
        setErrorMessage(data.error || "Failed to initiate 2FA setup.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error initiating 2FA setup.");
    } finally {
      setLoading(false);
    }
  };

  // Verify and Finalize Mandatory 2FA
  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length < 6) {
      setErrorMessage("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/auth/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          method,
          code: verificationCode.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        showSuccessAlert("2FA Security Enabled!", "Two-Factor Authentication setup is complete. Full access granted.");
        onUpdateCurrentUser(data.user);
      } else {
        setErrorMessage(data.error || "Invalid verification code. Please check and try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error verifying 2FA code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-brand-pink/20 p-6 text-white border-b border-brand-gold/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-black tracking-widest bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                  Action Required
                </span>
                <span className="text-slate-400 text-xs">Mandatory Policy</span>
              </div>
              <h2 className="text-lg font-bold font-display text-white mt-0.5">Enforce 2FA Security Setup</h2>
            </div>
          </div>
          <p className="text-slate-300 text-xs mt-3 leading-relaxed">
            Welcome, <strong className="text-white">{currentUser.fullName}</strong>. To comply with platform security standards, 2FA setup is required for all executive accounts before full dashboard access is unlocked.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 bg-white">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === "select" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select your preferred 2FA verification method:
                </label>
                
                <div className="grid grid-cols-1 gap-3">
                  {/* Authenticator App */}
                  <div
                    onClick={() => setMethod("authenticator")}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center space-x-4 ${
                      method === "authenticator" 
                        ? "border-brand-pink bg-brand-pink-light/30 shadow-xs" 
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${method === "authenticator" ? "bg-brand-pink text-white" : "bg-slate-200 text-slate-700"}`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>Authenticator App (TOTP)</span>
                        <span className="text-[10px] font-extrabold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded-full">Recommended</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Use Google Authenticator, Authy, 1Password, or Duo to scan QR code.
                      </div>
                    </div>
                  </div>

                  {/* Email Code */}
                  <div
                    onClick={() => setMethod("email")}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center space-x-4 ${
                      method === "email" 
                        ? "border-brand-pink bg-brand-pink-light/30 shadow-xs" 
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${method === "email" ? "bg-brand-pink text-white" : "bg-slate-200 text-slate-700"}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900">Email Verification Code</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Receive a 6-digit OTP code directly at <strong className="text-slate-800">{currentUser.email}</strong> via SMTP.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartSetup}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold py-3.5 px-6 rounded-2xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                    <span>Initiating 2FA Setup...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Setup</span>
                    <ArrowRight className="w-4 h-4 text-brand-gold" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifySetup} className="space-y-5">
              {method === "authenticator" ? (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-slate-800">Scan QR Code with your Authenticator App</p>
                    <p className="text-[11px] text-slate-500">Open Google Authenticator, Authy, or Duo and scan below:</p>
                  </div>

                  {qrCodeUrl ? (
                    <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 rounded-xl shadow-xs border border-slate-200" />
                      
                      {secretKey && (
                        <div className="w-full space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">Or manual secret key:</span>
                          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono">
                            <span className="truncate text-slate-800 font-bold tracking-wider">{secretKey}</span>
                            <button
                              type="button"
                              onClick={handleCopySecret}
                              className="p-1 text-slate-500 hover:text-brand-pink transition cursor-pointer"
                              title="Copy secret"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-pink mx-auto" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-blue-900 text-xs space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>OTP Code Dispatched</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    A 6-digit security code has been sent to <strong>{currentUser.email}</strong> via SMTP. Please check your inbox and spam folder.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block text-center">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-2xl font-mono font-bold tracking-widest bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 focus:outline-none focus:border-brand-pink focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl transition cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length < 6}
                  className="w-2/3 py-3 bg-brand-pink hover:bg-brand-pink-dark disabled:opacity-50 text-white text-xs font-bold rounded-2xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Enable 2FA & Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
