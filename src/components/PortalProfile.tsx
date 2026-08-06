import React from "react";
import { Loader2, CreditCard, Users, Camera, QrCode, History, RefreshCw, X, FileText, Lock, Key, Eye, EyeOff, ShieldCheck, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";

interface PortalProfileProps {
  currentUser: User;
  onUpdateProfile: (data: Partial<User>) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onOpenScanner?: () => void;
  pendingContactCard?: User | null;
  onContactCardSeen?: () => void;
}

export default function PortalProfile({ currentUser, onUpdateProfile, onRefreshData, onOpenScanner, pendingContactCard, onContactCardSeen }: PortalProfileProps) {
  const [contacts, setContacts] = React.useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`wp-contacts-${currentUser.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedContactCard, setSelectedContactCard] = React.useState<User | null>(null);

  // Password Change state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [passwordStatus, setPasswordStatus] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Auto slash helper for card expiry
  const formatCardExpiry = (rawVal: string, prevVal: string = ""): string => {
    if (prevVal.endsWith("/") && rawVal.length < prevVal.length) {
      const digits = rawVal.replace(/\D/g, "");
      return digits.slice(0, -1);
    }
    const digits = rawVal.replace(/\D/g, "").slice(0, 4);
    if (!digits) return "";
    if (digits.length === 1) {
      if (parseInt(digits, 10) > 1) return `0${digits}/`;
      return digits;
    }
    let month = digits.slice(0, 2);
    let monthNum = parseInt(month, 10);
    if (monthNum > 12) month = "12";
    if (monthNum === 0 && digits.length >= 2) month = "01";

    if (digits.length > 2) {
      return `${month}/${digits.slice(2, 4)}`;
    }
    if (digits.length === 2) {
      return `${month}/`;
    }
    return month;
  };

  // Password Strength Evaluator
  const getPasswordCriteria = (pass: string) => {
    return {
      hasMinLength: pass.length >= 8,
      hasUpper: /[A-Z]/.test(pass),
      hasLower: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)
    };
  };

  const passCriteria = getPasswordCriteria(newPassword);
  const passScore = Object.values(passCriteria).filter(Boolean).length;

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return { label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
    if (score <= 3) return { label: "Fair / Medium", color: "bg-amber-500", text: "text-amber-600" };
    if (score === 4) return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
    return { label: "Executive Grade", color: "bg-brand-pink", text: "text-brand-pink font-extrabold" };
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword) {
      setPasswordStatus({ type: "error", msg: "Please enter your current password." });
      return;
    }
    if (passScore < 3) {
      setPasswordStatus({ type: "error", msg: "New password is too weak. Please meet at least 3 strength criteria." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", msg: "New passwords do not match. Please verify." });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordStatus({ type: "success", msg: data.message || "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordStatus({ type: "error", msg: data.error || "Failed to update password." });
      }
    } catch (err) {
      console.error(err);
      setPasswordStatus({ type: "error", msg: "Network error updating password." });
    } finally {
      setChangingPassword(false);
    }
  };

  React.useEffect(() => {
    if (pendingContactCard) {
      setSelectedContactCard(pendingContactCard);
      onContactCardSeen?.();
    }
  }, [pendingContactCard]);

  React.useEffect(() => {
    const handleContactsUpdate = () => {
      try {
        const saved = localStorage.getItem(`wp-contacts-${currentUser.id}`);
        setContacts(saved ? JSON.parse(saved) : []);
      } catch (err) { console.error("Error syncing contacts:", err); }
    };
    window.addEventListener("contacts-updated", handleContactsUpdate);
    return () => window.removeEventListener("contacts-updated", handleContactsUpdate);
  }, [currentUser.id]);

  const [profileForm, setProfileForm] = React.useState({
    fullName: currentUser.fullName,
    title: currentUser.title || "",
    company: currentUser.company || "",
    bio: currentUser.bio || "",
    avatarUrl: currentUser.avatarUrl || ""
  });
  const [updatingProfile, setUpdatingProfile] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState(false);

  const [walletCardName, setWalletCardName] = React.useState("");
  const [walletCardNumber, setWalletCardNumber] = React.useState("");
  const [walletCardExpiry, setWalletCardExpiry] = React.useState("");
  const [walletCardCvv, setWalletCardCvv] = React.useState("");
  const [walletSaving, setWalletSaving] = React.useState(false);
  const [walletDeleting, setWalletDeleting] = React.useState(false);

  const [memberPayments, setMemberPayments] = React.useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = React.useState(false);

  React.useEffect(() => {
    fetchMemberPayments();
  }, []);

  const fetchMemberPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const allPayments = await res.json();
        setMemberPayments(allPayments.filter((p: any) => p.userId === currentUser.id));
      }
    } catch (err) { console.error("Error fetching payments:", err); }
    finally { setLoadingPayments(false); }
  };

  const handleSetupWalletCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletCardName.trim() || !walletCardNumber.trim() || !walletCardExpiry.trim() || !walletCardCvv.trim()) {
      alert("All card credentials must be supplied.");
      return;
    }
    setWalletSaving(true);
    try {
      const res = await fetch(`/api/members/${currentUser.id}/setup-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardholderName: walletCardName,
          cardNumber: walletCardNumber,
          expiryDate: walletCardExpiry,
          cvv: walletCardCvv
        })
      });
      if (res.ok) {
        alert("Card secured successfully!");
        setWalletCardName(""); setWalletCardNumber(""); setWalletCardExpiry(""); setWalletCardCvv("");
        await onRefreshData();
      } else {
        alert((await res.json()).error || "Failed to secure card.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally { setWalletSaving(false); }
  };

  const handleDeleteWalletCard = async () => {
    if (!window.confirm("Delete saved card? Subscription billing may fail.")) return;
    setWalletDeleting(true);
    try {
      const res = await fetch(`/api/members/${currentUser.id}/delete-card`, { method: "DELETE" });
      if (res.ok) {
        alert("Card removed.");
        await onRefreshData();
      } else {
        alert((await res.json()).error || "Failed to remove card.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally { setWalletDeleting(false); }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      await onUpdateProfile(profileForm);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) { console.error(err); }
    finally { setUpdatingProfile(false); }
  };

  return (
    <div className="space-y-6" id="panel-profile">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-display font-extrabold text-slate-900">Manage Your Executive Profile</h2>
        <p className="text-slate-500 text-xs">Update your career details, company affiliations, and biographical details displayed to WomenPlay fellows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          {profileSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium animate-pulse">
              Executive Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Full Name</label>
                <input type="text" required value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Avatar URL</label>
                <input type="text" placeholder="https://..." value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Executive Title</label>
                <input type="text" placeholder="Chief Investment Officer" value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Corporate Affiliation</label>
                <input type="text" placeholder="Grand Venture Alliance" value={profileForm.company}
                  onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Professional Biography</label>
              <textarea rows={4} placeholder="Tell us about your corporate breakthroughs..."
                value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none" />
            </div>
            <button type="submit" disabled={updatingProfile}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase shadow-md transition flex justify-center items-center cursor-pointer">
              {updatingProfile ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /><span>Synchronizing Core Profile...</span></>
              ) : <span>Update Profile Data</span>}
            </button>
          </form>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 text-left">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-brand-pink" />
                  <span>Secured Payment Wallet</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Compliant with Stripe & PCI standards</p>
              </div>
              {currentUser.savedCard && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Active Card</span>
              )}
            </div>

            {currentUser.savedCard ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-xl p-4 shadow-md font-mono relative overflow-hidden min-h-[120px] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-slate-400">WomenPlay Premium Link</span>
                    <span className="text-xs font-extrabold tracking-widest text-slate-300">
                      {currentUser.savedCard.brand?.toUpperCase() || "CARD"}
                    </span>
                  </div>
                  <div className="text-base font-bold tracking-widest text-slate-100 py-2">
                    •••• •••• •••• {currentUser.savedCard.last4 || "4242"}
                  </div>
                  <div className="flex justify-between items-end text-[10px]">
                    <div>
                      <span className="text-slate-500 block text-[8px] uppercase">Cardholder</span>
                      <span className="font-bold text-slate-200">{currentUser.savedCard.cardholderName || currentUser.fullName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[8px] uppercase">Expires</span>
                      <span className="font-bold text-slate-200">{currentUser.savedCard.expiryDate || "12/28"}</span>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={handleDeleteWalletCard} disabled={walletDeleting}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition cursor-pointer text-center border border-red-200">
                  {walletDeleting ? "Removing Secure Profile..." : "Remove Card details"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSetupWalletCard} className="space-y-3.5 text-xs">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  No payment profile found. Store your card securely for effortless summit registrations and recurring memberships.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Cardholder Name</label>
                  <input type="text" required placeholder="e.g. Sandra Bullock" value={walletCardName}
                    onChange={(e) => setWalletCardName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Card Number</label>
                  <input type="text" required maxLength={16} placeholder="4111222233334444" value={walletCardNumber}
                    onChange={(e) => setWalletCardNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Expiry (MM/YY)</label>
                    <input type="text" required placeholder="12/28" maxLength={5} value={walletCardExpiry}
                      onChange={(e) => setWalletCardExpiry(formatCardExpiry(e.target.value, walletCardExpiry))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-center font-mono focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">CVV</label>
                    <input type="password" required maxLength={4} placeholder="***" value={walletCardCvv}
                      onChange={(e) => setWalletCardCvv(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-center font-mono focus:outline-none" />
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 italic bg-white/50 p-2.5 rounded-xl border border-slate-100">
                  Card details are sent directly to Stripe via secure cryptographic vaults. No CVVs are persisted on local servers.
                </div>
                <button type="submit" disabled={walletSaving}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer">
                  {walletSaving ? "Securing payment wallet..." : "Secure and Save Card"}
                </button>
              </form>
            )}
          </div>

          {/* Security & Change Password Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 text-left">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-brand-pink" />
                  <span>Account Security & Change Password</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Enforce executive-grade access credentials</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            {passwordStatus && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                passwordStatus.type === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                {passwordStatus.type === "success" ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{passwordStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Current Password *</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">New Password *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password Strength Validator Bar */}
                {newPassword.length > 0 && (
                  <div className="space-y-2 pt-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-500">Password Strength:</span>
                      <span className={`font-extrabold ${getStrengthLabel(passScore).text}`}>
                        {getStrengthLabel(passScore).label}
                      </span>
                    </div>

                    {/* Progress Bar Segments */}
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            lvl <= passScore ? getStrengthLabel(passScore).color : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Requirements Checklist */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                      <div className={`flex items-center gap-1 ${passCriteria.hasMinLength ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        {passCriteria.hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 inline-block text-center">&bull;</span>}
                        <span>8+ Characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passCriteria.hasUpper ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        {passCriteria.hasUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 inline-block text-center">&bull;</span>}
                        <span>Uppercase Letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passCriteria.hasLower ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        {passCriteria.hasLower ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 inline-block text-center">&bull;</span>}
                        <span>Lowercase Letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passCriteria.hasNumber ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        {passCriteria.hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 inline-block text-center">&bull;</span>}
                        <span>Number (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passCriteria.hasSymbol ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                        {passCriteria.hasSymbol ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-3 h-3 inline-block text-center">&bull;</span>}
                        <span>Special Symbol</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none font-mono"
                />
                {confirmPassword.length > 0 && (
                  <p className={`text-[10px] font-bold mt-1 ${confirmPassword === newPassword ? "text-emerald-600" : "text-rose-500"}`}>
                    {confirmPassword === newPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPassword || passScore < 3 || newPassword !== confirmPassword}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex justify-center items-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Security Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Update Account Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-50/50 border border-slate-100 p-5 md:p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-display font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-brand-pink" />
                <span>My Executive Network</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Scanned and verified member credentials: {contacts.length} fellows</p>
            </div>
            {onOpenScanner && (
              <button type="button" onClick={onOpenScanner}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm">
                <Camera className="w-3.5 h-3.5 text-brand-pink animate-pulse" />
                <span>Scan Badge</span>
              </button>
            )}
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <QrCode className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">No connections logged yet</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed mt-1">
                  Start building your executive network! Use the "Scan Badge" button to scan and securely exchange links at active summits.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <div key={contact.id}
                  className="bg-white border border-slate-150 p-4 rounded-xl shadow-sm hover:shadow transition flex flex-col justify-between space-y-3 hover:border-brand-pink/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 overflow-hidden">
                      {contact.avatarUrl ? <img src={contact.avatarUrl} alt={contact.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : contact.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{contact.fullName}</h4>
                      <p className="text-[9px] text-brand-pink font-medium uppercase tracking-wider truncate mt-0.5">{contact.title || "Elite Professional"}</p>
                      <p className="text-[9px] text-slate-500 truncate">{contact.company || "WomenPlay Syndicate"}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button type="button" onClick={() => setSelectedContactCard(contact)}
                      className="flex-1 py-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer text-center">View Card</button>
                    <a href={`mailto:${contact.email}`}
                      className="flex-1 py-1 px-2 bg-brand-pink/10 hover:bg-brand-pink/20 text-brand-pink rounded-lg text-[10px] font-bold transition text-center">Email</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-6 rounded-2xl luxury-shadow space-y-4 text-left">
        <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-display font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-brand-pink" />
              <span>My Billing & Payment History</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Track your past membership subscriptions and event registrations</p>
          </div>
          <button onClick={fetchMemberPayments} disabled={loadingPayments}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer" title="Reload payments ledger">
            <RefreshCw className={`w-4 h-4 ${loadingPayments ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loadingPayments ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-brand-pink" /></div>
        ) : memberPayments.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center">No payment records found for your account.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction / Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {memberPayments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-800 block text-[11px]">{p.transactionId || p.id}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-700 block">{p.purpose}</span>
                      <span className="text-slate-400 text-[10px] font-mono block mt-0.5">Payment Method: {p.method}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">${p.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                        p.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : p.status === "refunded" ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                      }`}>{p.status.toUpperCase()}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => {
                        alert(`INVOICE RECEIPT\n-----------------------\nTransaction ID: ${p.transactionId || p.id}\nDate: ${new Date(p.createdAt).toLocaleString()}\nMember: ${currentUser.fullName}\nItem: ${p.purpose}\nAmount: $${p.amount.toFixed(2)}\nStatus: ${p.status.toUpperCase()}\n\nThank you for choosing WomenPlay!`);
                      }}
                        className="py-1 px-2.5 bg-slate-100 hover:bg-brand-pink/10 hover:text-brand-pink text-slate-600 rounded-lg text-[10px] font-bold transition cursor-pointer">View Receipt</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedContactCard && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm shadow-xl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-2xl w-full max-w-sm text-center relative overflow-hidden space-y-6">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-pink to-brand-gold" />
              <button type="button" onClick={() => setSelectedContactCard(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
              <div className="pt-4 flex flex-col items-center space-y-3">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-brand-pink to-brand-gold">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-800 overflow-hidden">
                      {selectedContactCard.avatarUrl ? <img src={selectedContactCard.avatarUrl} alt={selectedContactCard.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : selectedContactCard.fullName.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-display font-extrabold text-slate-900">{selectedContactCard.fullName}</h4>
                  <p className="text-[10px] text-brand-pink font-semibold uppercase tracking-widest mt-0.5">{selectedContactCard.title || "Elite Corporate Director"}</p>
                  <p className="text-xs text-slate-500">{selectedContactCard.company || "WomenPlay Alliance"}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-2.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedContactCard.email}</span>
                </div>
                {selectedContactCard.bio && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Professional bio</p>
                    <p className="italic leading-relaxed text-slate-500">"{selectedContactCard.bio}"</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <a href={`mailto:${selectedContactCard.email}`}
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer text-center">Send Direct Message</a>
                <button type="button" onClick={() => setSelectedContactCard(null)}
                  className="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer">Close Card</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
