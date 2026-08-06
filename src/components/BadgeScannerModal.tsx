import React, { useEffect, useRef, useState } from "react";
import { X, Camera, Check, AlertCircle, RefreshCw, Sparkles, UserPlus, FileText, Globe, History } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserRole } from "../types";
import type { User } from "../types";

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
      onAddContact(member);
      addScanToHistory(member);
    }, 1500);
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setScanStatus("detected");
    
    // Simulate lookup based on entered code
    setTimeout(() => {
      // Find a member other than self to simulate a successful scan
      const code = manualCode.trim().toUpperCase();
      
      // Select a member deterministically based on code or just use the first available other member
      const memberIndex = Math.abs(code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % (otherMembers.length || 1);
      const selected = otherMembers[memberIndex];
      
      if (selected) {
        setScannedMember(selected);
        setScanStatus("success");
        onAddContact(selected);
        addScanToHistory(selected);
      } else {
        setErrorMessage("No executive member found matching this credentials index.");
        setScanStatus("error");
      }
    }, 1200);
  };

  const handleViewProfile = (member: User) => {
    // Dispatch event to change view and select profile in Portal
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
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="badge-scanner-modal-overlay">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl text-left overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-pink animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Executive Scanner</h3>
              <p className="text-[10px] text-slate-400">Scan QR codes for effortless networking connections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
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
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Connection Secured!</h4>
                <p className="text-xs text-slate-400 mt-1">Successfully decoded badge and verified membership credentials.</p>
              </div>

              {/* Business Card Preview */}
              <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-5 rounded-2xl text-left max-w-sm mx-auto space-y-4 relative overflow-hidden">
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
                <button
                  type="button"
                  onClick={() => {
                    setScannedMember(null);
                    setScanStatus("scanning");
                    startCamera();
                  }}
                  className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Scan Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-4 bg-brand-pink hover:bg-brand-pink/90 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
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
                        Your browser or iframe has blocked camera permissions, or no device was detected. You can use the manual decoder or simulator controls below!
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
                    {/* Corners */}
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-2 border-l-2 border-brand-pink" />
                      <div className="w-5 h-5 border-t-2 border-r-2 border-brand-pink" />
                    </div>
                    
                    {/* Glowing Laser line */}
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
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Camera Connection</span>
                </button>
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
                  Webcams may not have physical badges handy to hold up. Select any of the pre-registered executive fellows below to simulate high-fidelity badge detection:
                </p>

                {otherMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {otherMembers.slice(0, 4).map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleSimulateScan(member)}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-850 hover:border-brand-pink/50 border border-slate-800 rounded-xl text-left text-xs transition cursor-pointer flex items-center justify-between group"
                      >
                        <div className="truncate pr-2">
                          <p className="font-bold text-slate-200 group-hover:text-brand-pink transition">{member.fullName}</p>
                          <p className="text-[9px] text-slate-500 truncate">{member.title || "Elite Member"}</p>
                        </div>
                        <span className="text-[8px] bg-slate-800 group-hover:bg-brand-pink group-hover:text-white px-2 py-0.5 rounded text-slate-400 font-bold transition whitespace-nowrap">
                          Scan Badges
                        </span>
                      </button>
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
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-pink"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Lookup
                  </button>
                </div>
                {errorMessage && (
                  <div className="flex items-center gap-1 text-rose-400 text-[10px] mt-1">
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
                      className="text-[9px] text-slate-500 hover:text-rose-400 transition cursor-pointer"
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
                              className="px-2 py-1 bg-brand-pink/10 hover:bg-brand-pink text-brand-pink hover:text-white text-[9px] font-bold rounded transition cursor-pointer"
                            >
                              View Profile
                            </button>
                            <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                              {entry.scannedAt}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                              title="Delete Encounter"
                            >
                              <X className="w-3.5 h-3.5" />
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
                            className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-pink/60 transition resize-none leading-relaxed"
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
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-xl transition text-xs cursor-pointer"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
