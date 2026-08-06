import React from "react";
import { Award, Calendar, MapPin, QrCode, ShieldAlert, Share2, Download, Check } from "lucide-react";
import { motion } from "motion/react";
import QRCode from "qrcode";

interface DigitalBadgeProps {
  attendeeName: string;
  badgeType: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  badgeCode: string;
  seat?: string;
}

export default function DigitalBadge({
  attendeeName,
  badgeType,
  eventTitle,
  eventDate,
  eventLocation,
  badgeCode,
  seat
}: DigitalBadgeProps) {
  const [downloaded, setDownloaded] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");

  React.useEffect(() => {
    // Requirement: QR code containing 1. member fullname, 2. event passcode, 3. event name, 4. event pass type/category separated by comma
    const passPayload = `${attendeeName}, ${badgeCode}, ${eventTitle}, ${badgeType}`;
    QRCode.toDataURL(passPayload, {
      width: 200,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [attendeeName, badgeCode, eventTitle, badgeType]);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  const isVIP = badgeType.toUpperCase().includes("VIP") || badgeType.toUpperCase().includes("GOLD") || badgeType.toUpperCase().includes("ELITE");

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow w-full max-w-sm mx-auto" id="digital-badge-container">
      {/* Elegantly Styled Luxury Access Badge */}
      <motion.div 
        initial={{ rotateY: -15, scale: 0.95 }}
        animate={{ rotateY: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`relative w-full rounded-2xl overflow-hidden shadow-2xl p-6 flex flex-col justify-between border-4 h-[450px] ${
          isVIP 
            ? "border-brand-gold gold-gradient" 
            : "border-brand-pink-mid bg-gradient-to-b from-brand-pink-light/30 to-white"
        }`}
        style={{ perspective: 1000 }}
      >
        {/* Hologram / Gold Accent Borders */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-pink via-brand-gold to-brand-pink" />
        
        {/* Header Logo */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-brand-pink">WOMENPLAY</span>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">OFFICIAL PASS</h4>
          </div>
          <div className="p-2 rounded-full gold-gradient border border-brand-gold/30">
            <Award className={`w-5 h-5 ${isVIP ? "text-brand-gold-dark animate-pulse" : "text-brand-pink"}`} />
          </div>
        </div>

        {/* Dynamic Ticket Brand */}
        <div className="my-auto flex flex-col items-center text-center">
          <div className="mb-2">
            <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${
              isVIP 
                ? "bg-brand-gold-dark text-white border-brand-gold" 
                : "bg-brand-pink text-white border-brand-pink"
            }`}>
              {badgeType}
            </span>
          </div>

          <h3 className="text-lg font-display font-bold text-slate-900 leading-tight mb-3 px-2 line-clamp-2">
            {eventTitle}
          </h3>

          <div className="w-16 h-[2px] bg-brand-gold/40 mb-3" />

          <p className="text-sm font-semibold text-slate-600 tracking-wider font-display">
            ATTENDEE
          </p>
          <p className="text-xl font-bold text-slate-900 tracking-wide font-display">
            {attendeeName}
          </p>
        </div>

        {/* Footer info & QR Code */}
        <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
          <div className="text-left space-y-1">
            <div className="flex items-center text-[10px] text-slate-500 font-medium">
              <Calendar className="w-3 h-3 mr-1 text-brand-gold" />
              {eventDate}
            </div>
            <div className="flex items-center text-[10px] text-slate-500 font-medium w-36 truncate">
              <MapPin className="w-3 h-3 mr-1 text-brand-pink-mid" />
              {eventLocation}
            </div>
            <div className="font-mono text-[9px] text-brand-gold-dark font-semibold mt-1">
              CODE: {badgeCode} {seat && `| SEAT: ${seat}`}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative p-1.5 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center shrink-0">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`Pass QR Code for ${attendeeName}`} className="w-14 h-14 object-contain rounded-lg" />
            ) : (
              <QrCode className="w-12 h-12 text-slate-800" />
            )}
            <div className="absolute top-0 left-0 w-full h-full bg-brand-gold-glow pointer-events-none opacity-30 mix-blend-color-burn rounded-xl" />
          </div>
        </div>
      </motion.div>

      {/* Access Pass Actions */}
      <div className="flex space-x-3 mt-6 w-full">
        <button
          onClick={handleDownload}
          id="btn-download-pass"
          className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-medium text-sm border border-slate-200 hover:bg-slate-50 transition text-slate-700"
        >
          {downloaded ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 font-semibold">Pass Saved!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-brand-gold-dark" />
              <span>Download PDF</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          id="btn-share-pass"
          className="flex items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-700"
          title="Share Pass"
        >
          {shared ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : (
            <Share2 className="w-5 h-5 text-brand-pink" />
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
        <ShieldAlert className="w-3.5 h-3.5 text-brand-gold mr-1.5" />
        Show this QR code at the reception desk for entry.
      </div>
    </div>
  );
}
