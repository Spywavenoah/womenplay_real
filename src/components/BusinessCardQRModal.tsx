import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, QrCode, Download, Check, Copy, User, Mail, Briefcase } from "lucide-react";
import type { User as UserType } from "../types";

interface BusinessCardQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  scannedMember: UserType | null;
  currentUser: UserType | null;
}

export default function BusinessCardQRModal({
  isOpen,
  onClose,
  scannedMember,
  currentUser
}: BusinessCardQRModalProps) {
  const [activeTab, setActiveTab] = React.useState<"scanned" | "mine">("scanned");
  const [copied, setCopied] = React.useState(false);

  // If there's no scanned member, default to "mine"
  React.useEffect(() => {
    if (!scannedMember) {
      setActiveTab("mine");
    } else {
      setActiveTab("scanned");
    }
  }, [scannedMember]);

  if (!isOpen) return null;

  const activeUser = activeTab === "mine" ? currentUser : scannedMember;

  if (!activeUser) {
    return null;
  }

  // Construct a standard vCard v3.0 text
  const vCardText = `BEGIN:VCARD
VERSION:3.0
FN:${activeUser.fullName}
N:${activeUser.fullName};;;
ORG:${activeUser.company || "WomenPlay Alliance"}
TITLE:${activeUser.title || "Elite Professional"}
EMAIL;TYPE=PREF,INTERNET:${activeUser.email}
NOTE:${activeUser.bio || "WomenPlay Member"}
END:VCARD`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(vCardText)}`;

  const handleCopyVCard = async () => {
    try {
      await navigator.clipboard.writeText(vCardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy vCard", err);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Business_Card_QR_${activeUser.fullName.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR code", err);
      // Fallback
      window.open(qrCodeUrl, "_blank");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          id="qr-modal-backdrop"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl p-6 overflow-hidden text-left flex flex-col space-y-5"
          id="business-card-qr-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-brand-pink/10 rounded-xl text-brand-pink">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-base leading-tight">Digital Business Card</h3>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Shareable Contact QR Code</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              id="btn-close-qr-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Toggle Tabs */}
          {scannedMember && currentUser && (
            <div className="flex bg-slate-100 p-1 rounded-xl" id="qr-modal-tabs">
              <button
                type="button"
                onClick={() => setActiveTab("scanned")}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "scanned"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Scanned Member
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("mine")}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "mine"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                My Profile
              </button>
            </div>
          )}

          {/* Core Content Box */}
          <div className="flex flex-col items-center space-y-4">
            {/* Elegant QR Frame */}
            <div className="relative p-4 bg-gradient-to-br from-brand-pink/5 via-white to-brand-gold/5 rounded-3xl border border-slate-150 shadow-md flex items-center justify-center w-52 h-52">
              <img
                src={qrCodeUrl}
                alt="vCard QR Code"
                className="w-44 h-44 rounded-xl shadow-xs"
                id="qr-code-img"
              />
              <div className="absolute top-0 right-0 p-1.5 bg-brand-pink text-white rounded-tr-3xl rounded-bl-xl shadow">
                <QrCode className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Selected User Details Card */}
            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink font-bold text-sm uppercase shrink-0 overflow-hidden">
                  {activeUser.avatarUrl ? (
                    <img
                      src={activeUser.avatarUrl}
                      alt={activeUser.fullName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    activeUser.fullName.substring(0, 2)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{activeUser.fullName}</h4>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{activeUser.title || "Elite Professional"}</span>
                    {activeUser.company && (
                      <span className="truncate"> at {activeUser.company}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{activeUser.email}</span>
                  </p>
                </div>
              </div>

              {activeUser.bio && (
                <div className="text-[11px] text-slate-500 leading-relaxed italic border-t border-slate-150 pt-2.5">
                  "{activeUser.bio}"
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadQR}
              id="btn-download-qr-image"
              className="flex-1 py-2.5 px-4 bg-brand-pink hover:bg-brand-pink/90 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download QR</span>
            </button>
            <button
              type="button"
              onClick={handleCopyVCard}
              id="btn-copy-vcard"
              className={`flex-1 py-2.5 px-4 border text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                copied
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy Contact"}</span>
            </button>
          </div>

          {/* Scan Tip */}
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Scan this QR code with any mobile camera to instantly import this profile as a smartphone address book contact card.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
