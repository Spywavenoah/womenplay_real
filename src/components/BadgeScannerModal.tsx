import React, { useEffect, useRef, useState } from "react";
import { X, Camera, Check, AlertCircle, RefreshCw, Sparkles, Globe, History, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { UserRole } from "../types";
import type { User } from "../types";
import { playSuccessChime, playWarningTone, playErrorBuzzer } from "../lib/audioFeedback";

interface BadgeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  allMembers: User[];
  onAddContact: (contact: User) => void;
}

interface ScanHistoryEntry {
  id: string;
  member: User;
  scannedAt: string;
  notes?: string;
}

export default function BadgeScannerModal({
  isOpen,
  onClose,
  currentUser,
  allMembers,
  onAddContact,
}: BadgeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "detected" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedMember, setScannedMember] = useState<User | null>(null);
  const [manualCode, setManualCode] = useState("");
  
  // Persistent scan history state
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>(() => {
    try {
      const storageKey = currentUser ? `wp-scan-history-${currentUser.id}` : "wp-scan-history-anonymous";
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addScanToHistory = (member: User) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const newEntry: ScanHistoryEntry = {
      id: `${member.id}-${Date.now()}`,
      member,
      scannedAt: timestamp,
      notes: ""
    };
    setScanHistory(prev => {
      const updated = [newEntry, ...prev];
      try {
        const storageKey = currentUser ? `wp-scan-history-${currentUser.id}` : "wp-scan-history-anonymous";
        localStorage.setItem(storageKey, JSON.stringify(updated));
        window.dispatchEvent(new Event("scan-history-updated"));
      } catch (err) {
        console.error("Failed to save scan history:", err);
      }
      return updated;
    });
  };

  const handleUpdateNotes = (entryId: string, notesText: string) => {
    setScanHistory(prev => {
      const updated = prev.map(entry => 
        entry.id === entryId ? { ...entry, notes: notesText } : entry
      );
      try {
        const storageKey = currentUser ? `wp-scan-history-${currentUser.id}` : "wp-scan-history-anonymous";
        localStorage.setItem(storageKey, JSON.stringify(updated));
        window.dispatchEvent(new Event("scan-history-updated"));
      } catch (err) {
        console.error("Failed to save updated scan history notes:", err);
      }
      return updated;
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setScanHistory(prev => {
      const updated = prev.filter(entry => entry.id !== entryId);
      try {
        const storageKey = currentUser ? `wp-scan-history-${currentUser.id}` : "wp-scan-history-anonymous";
        localStorage.setItem(storageKey, JSON.stringify(updated));
        window.dispatchEvent(new Event("scan-history-updated"));
      } catch (err) {
        console.error("Failed to delete entry:", err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    try {
      const storageKey = currentUser ? `wp-scan-history-${currentUser.id}` : "wp-scan-history-anonymous";
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event("scan-history-updated"));
    } catch (err) {
      console.error("Failed to clear scan history:", err);
    }
  };

  // Get members other than current user for simulation
  const otherMembers = allMembers.filter(m => m.id !== currentUser?.id);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setScanStatus("scanning");
      setScannedMember(null);
      setErrorMessage("");
      setManualCode("");
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setHasCameraAccess(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraAccess(true);
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      setHasCameraAccess(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleSimulateScan = (member: User) => {
    setScanStatus("detected");
    setTimeout(() => {
      setScannedMember(member);
      setScanStatus("success");
      playSuccessChime();
      onAddContact(member);
      addScanToHistory(member);
    }, 1200);
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setScanStatus("detected");
    
    // Simulate lookup based on entered code
    setTimeout(() => {
      const code = manualCode.trim().toUpperCase();
      
      const memberIndex = Math.abs(code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % (otherMembers.length || 1);
      const selected = otherMembers[memberIndex];
      
      if (selected) {
        setScannedMember(selected);
        setScanStatus("success");
        playSuccessChime();
        onAddContact(selected);
        addScanToHistory(selected);
      } else {
        setErrorMessage("No executive member found matching this credentials index.");
        setScanStatus("error");
        playErrorBuzzer();
      }
    }, 1000);
  };

  const handleViewProfile = (member: User) => {
    const event = new CustomEvent("view-member-profile", {
      detail: { member }
    });
    window.dispatchEvent(event);
    onClose();
  };

  if (!isOpen) return null;

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="badge-scanner-modal-overlay">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Access Restricted</h3>
          <p className="text-xs text-slate-400">Scanning of QR codes and taking of event attendance is restricted exclusively to executive administrators.</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            aria-label="Close restricted access modal"
            className="w-full min-h-[44px] py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center"
          >
            Close
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="badge-scanner-modal-overlay">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl text-left overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Executive Scanner</h3>
                <span className="text-[10px] bg-brand-pink/15 text-brand-pink border border-brand-pink/20 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Volume2 className="w-2.5 h-2.5" /> Chime Active
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Instant verification with audio feedback and real-time ledger</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close executive scanner modal"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/50">
          {scanStatus === "success" && scannedMember ? (
            /* SUCCESS CONNECTIONS VIEW */
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Connection Secured!</h4>
                <p className="text-xs text-slate-400 mt-1">Successfully decoded badge and verified membership credentials.</p>
              </div>

              {/* Business Card Preview */}
              <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-5 rounded-2xl text-left max-w-sm mx-auto space-y-4 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-pink/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink font-bold text-sm uppercase shrink-0">
                    {scannedMember.avatarUrl ? (
                      <img src={scannedMember.avatarUrl} alt={scannedMember.fullName} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      scannedMember.fullName.substring(0, 2)
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-100">{scannedMember.fullName}</h5>
                    <p className="text-[10px] text-brand-pink font-medium uppercase tracking-wide">
                      {scannedMember.title || "Elite Corporate Director"}
                    </p>
                    <p className="text-[9px] text-slate-400">{scannedMember.company || "WomenPlay Syndicate"}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 text-[10px] space-y-1.5 text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>{scannedMember.email}</span>
                  </p>
                  {scannedMember.bio && (
                    <p className="text-slate-400 italic leading-relaxed line-clamp-2 pt-1 border-t border-slate-800/30">
                      "{scannedMember.bio}"
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3 max-w-sm mx-auto">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    setScannedMember(null);
                    setScanStatus("scanning");
                    startCamera();
                  }}
                  aria-label="Scan another badge"
                  className="flex-1 min-h-[44px] py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center"
                >
                  Scan Another
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onClose}
                  aria-label="Finish scanning"
                  className="flex-1 min-h-[44px] py-2.5 px-4 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center"
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* SCANNING SCREEN WITH REAL-TIME PREVIEW */
            <div className="space-y-6">
              {/* CAMERA SCREEN PREVIEW BOX */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner flex items-center justify-center">
                
                {hasCameraAccess === true && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}

                {hasCameraAccess === false && (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">Camera Feed Restricted</p>
                      <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                        Camera permissions are disabled or unavailable in this environment. Use the manual lookup or one-click simulator below to test scanning with audio feedback.
                      </p>
                    </div>
                  </div>
                )}

                {hasCameraAccess === null && (
                  <div className="text-center space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-brand-pink mx-auto" />
                    <p className="text-[10px] text-slate-400">Requesting Camera Authorization...</p>
                  </div>
                )}

                {/* Laser/Scanner targeting Overlay */}
                {scanStatus === "scanning" && hasCameraAccess === true && (
                  <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-2 border-l-2 border-brand-pink" />
                      <div className="w-5 h-5 border-t-2 border-r-2 border-brand-pink" />
                    </div>
                    
                    <div className="w-full h-0.5 bg-brand-pink shadow-[0_0_8px_#ff2a85] animate-bounce" />

                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-b-2 border-l-2 border-brand-pink" />
                      <div className="w-5 h-5 border-b-2 border-r-2 border-brand-pink" />
                    </div>
                  </div>
                )}

                {/* Status Message Overlay */}
                {scanStatus === "detected" && (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-brand-pink" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                      Decoding Secure QR Code...
                    </span>
                  </div>
                )}
              </div>

              {/* RE-TRY CAMERA ACCESS IN CASE BLOCKED */}
              {hasCameraAccess === false && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={startCamera}
                  aria-label="Retry connecting camera feed"
                  className="w-full min-h-[44px] py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera Connection</span>
                </motion.button>
              )}

              {/* SIMULATION DROPDOWN - EXTREMELY USER FRIENDLY */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-pink animate-pulse" />
                  <h4 className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                    Interactive Networking Simulator
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Select any pre-registered executive fellow below to simulate high-fidelity badge detection with audio chime:
                </p>

                {otherMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {otherMembers.slice(0, 4).map((member) => (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        key={member.id}
                        type="button"
                        onClick={() => handleSimulateScan(member)}
                        aria-label={`Simulate scanning badge for ${member.fullName}`}
                        className="min-h-[44px] py-2 px-3 bg-slate-900 hover:bg-slate-850 hover:border-brand-pink/50 border border-slate-800 rounded-xl text-left text-xs transition cursor-pointer flex items-center justify-between group"
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold text-slate-200 group-hover:text-brand-pink transition">{member.fullName}</p>
                          <p className="text-[9px] text-slate-500 truncate">{member.title || "Elite Member"}</p>
                        </div>
                        <span className="text-[8px] bg-slate-800 group-hover:bg-brand-pink group-hover:text-white px-2 py-1 rounded text-slate-400 font-bold transition whitespace-nowrap">
                          Scan Badge
                        </span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">No other registered fellows found in the network.</p>
                )}
              </div>

              {/* MANUAL CREDENTIAL CODE ENTER */}
              <form onSubmit={handleManualCodeSubmit} className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                  Or enter Credential Badge Code manually
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. REG-AURA-101"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    aria-label="Credential badge code"
                    className="flex-1 min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-pink"
                  />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    aria-label="Look up credential badge code"
                    className="min-h-[44px] px-5 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center shadow-sm"
                  >
                    Lookup
                  </motion.button>
                </div>
                {errorMessage && (
                  <div className="flex items-center gap-1.5 text-rose-400 text-[10px] mt-1.5 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </form>

              {/* RECENT ENCOUNTERS HISTORY */}
              {scanHistory.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 mt-4" id="scanner-recent-encounters">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <History className="w-4 h-4 text-brand-pink" />
                      <h4 className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                        Recent Encounters ({scanHistory.length})
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      aria-label="Clear recent encounters history"
                      className="min-h-[44px] px-2 text-[10px] text-slate-500 hover:text-rose-400 transition cursor-pointer flex items-center"
                    >
                      Clear History
                    </button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {scanHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5 text-xs"
                      >
                        {/* Entry Header */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink font-bold text-xs uppercase shrink-0 overflow-hidden">
                              {entry.member.avatarUrl ? (
                                <img src={entry.member.avatarUrl} alt={entry.member.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                entry.member.fullName.substring(0, 2)
                              )}
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="font-bold text-slate-200 truncate">{entry.member.fullName}</p>
                              <p className="text-[9px] text-slate-400 truncate">{entry.member.title || "Elite Fellow"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleViewProfile(entry.member)}
                              aria-label={`View profile for ${entry.member.fullName}`}
                              className="min-h-[44px] px-3 bg-brand-pink/10 hover:bg-brand-pink text-brand-pink hover:text-white text-[10px] font-bold rounded-xl transition cursor-pointer flex items-center justify-center"
                            >
                              View Profile
                            </button>
                            <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">
                              {entry.scannedAt}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-800 rounded-xl text-slate-500 hover:text-rose-400 transition cursor-pointer"
                              aria-label={`Delete encounter with ${entry.member.fullName}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Editable Note Section */}
                        <div className="space-y-1 text-left">
                          <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">
                            Private Meeting Notes / Context
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Interested in board role, follow up with pitch deck next Monday..."
                            value={entry.notes || ""}
                            onChange={(e) => handleUpdateNotes(entry.id, e.target.value)}
                            aria-label="Private meeting notes"
                            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-pink/60 transition resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end no-print shrink-0">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onClose}
            aria-label="Close badge scanner"
            className="min-h-[44px] px-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-xl transition text-xs cursor-pointer flex items-center justify-center"
          >
            Close Scanner
          </motion.button>
        </div>
      </div>
    </div>
  );
}
