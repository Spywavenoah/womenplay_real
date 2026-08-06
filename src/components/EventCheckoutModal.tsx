import React from "react";
import { X, Check, Loader2, Award, Landmark, Lock, HelpCircle } from "lucide-react";
import type { EventItem, EventPackage } from "../types";

interface EventCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  currentUser: any;
  onSuccess: (registration: any, payment: any) => void;
}

export default function EventCheckoutModal({
  isOpen,
  onClose,
  event,
  currentUser,
  onSuccess
}: EventCheckoutModalProps) {
  const [selectedPkg, setSelectedPkg] = React.useState<EventPackage | null>(null);
  const [method, setMethod] = React.useState<"Credit Card" | "Bank Transfer">("Credit Card");
  const [cardName, setCardName] = React.useState(currentUser?.fullName || "");
  const [cardNo, setCardNo] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");

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
  const [cardCvv, setCardCvv] = React.useState("");
  const [useSavedCard, setUseSavedCard] = React.useState(!!currentUser?.savedCard);
  const [bankRouting, setBankRouting] = React.useState("");
  const [saveCardForFuture, setSaveCardForFuture] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState("");

  // Seat Reservation State
  const [takenSeats, setTakenSeats] = React.useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = React.useState<string>("");
  const [loadingRegs, setLoadingRegs] = React.useState(false);

  React.useEffect(() => {
    if (event && event.packages.length > 0) {
      setSelectedPkg(event.packages[0]);
    }
  }, [event]);

  // Reset states on open/user changes
  React.useEffect(() => {
    if (isOpen) {
      setUseSavedCard(!!currentUser?.savedCard);
      setCardName(currentUser?.fullName || "");
      setCardNo("");
      setCardExpiry("");
      setCardCvv("");
    }
  }, [isOpen, currentUser]);

  // Fetch taken seats for this event
  React.useEffect(() => {
    if (isOpen && event) {
      setLoadingRegs(true);
      setError("");
      fetch(`/api/events/${event.id}/registrations`)
        .then((res) => {
          if (!res.ok) throw new Error("Could not fetch registrations");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            const seats = data.map((r: any) => r.seat).filter(Boolean);
            setTakenSeats(seats);
          }
        })
        .catch((err) => {
          console.error("Error loading seats:", err);
        })
        .finally(() => {
          setLoadingRegs(false);
        });
      setSelectedSeat("");
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;

    setProcessing(true);
    setError("");

    try {
      // Check if Stripe API is active and create Stripe Checkout Session
      try {
        const stripeRes = await fetch(`/api/events/${event.id}/register-stripe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            packageId: selectedPkg.id
          })
        });
        const stripeData = await stripeRes.json();
        if (stripeRes.ok && stripeData.checkoutUrl) {
          window.location.href = stripeData.checkoutUrl;
          return;
        }
      } catch (stripeErr) {
        // Fall back to direct card registration
      }

      const isSavedCardInUse = useSavedCard && currentUser?.savedCard;
      const billingDetails = isSavedCardInUse 
        ? { 
            cardName: currentUser.savedCard.cardholderName || currentUser.fullName, 
            cardNo: `•••• •••• •••• ${currentUser.savedCard.last4}` 
          } 
        : { 
            cardName, 
            cardNo,
            cardExpiry,
            cardCvv
          };

      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          packageId: selectedPkg.id,
          method: "Credit Card",
          billingDetails,
          useSavedCard: isSavedCardInUse,
          saveCardForFuture: !isSavedCardInUse ? saveCardForFuture : false
        })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.registration, data.payment);
      } else {
        setError(data.error || "Event registration failed.");
      }
    } catch (err) {
      setError("Failed to process payment. Ensure server-side services are available.");
    } finally {
      setProcessing(false);
    }
  };

  // Check if a seat row is accessible for the selected package
  const isSeatRowAllowed = (row: string) => {
    if (!selectedPkg) return false;
    const pkgNameLower = selectedPkg.name.toLowerCase();
    const isVipOrPremium = pkgNameLower.includes("vip") || pkgNameLower.includes("elite") || pkgNameLower.includes("premium");
    
    // Rows A & B are VIP Front Rows
    if (row === "A" || row === "B") {
      return isVipOrPremium;
    }
    return true; // Rows C-F are open to everyone
  };

  // Generate rows A-F, cols 1-6
  const rows = ["A", "B", "C", "D", "E", "F"];
  const cols = [1, 2, 3, 4, 5, 6];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" id="event-checkout-overlay">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-100 luxury-shadow overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 text-left">
        {/* Header */}
        <div className="p-6 md:p-8 pb-4 border-b border-slate-100 flex justify-between items-start shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-pink tracking-wider">Summit Access Checkout</span>
            <h2 className="text-xl font-display font-extrabold text-slate-800 leading-tight mt-1">{event.title}</h2>
          </div>
          <button 
            onClick={onClose} 
            id="btn-close-checkout"
            className="p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-6 md:p-8 pt-4 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs py-2.5 px-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

          {/* Selected Package Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">Select Your Premium Badge Tier</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => {
                    setSelectedPkg(pkg);
                    setSelectedSeat(""); // Reset seat if package changes rows eligibility
                  }}
                  id={`btn-select-pkg-${pkg.id}`}
                  className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                    selectedPkg?.id === pkg.id 
                      ? "border-brand-pink bg-brand-pink-light/30 shadow-xs" 
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">{pkg.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                  </div>
                  <span className="text-brand-pink font-bold text-xs mt-3 block">${pkg.fee}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Benefits lists */}
          {selectedPkg && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
              <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Included Benefits:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                {selectedPkg.benefits.map((ben, idx) => (
                  <div key={idx} className="flex items-center">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0" />
                    <span>{ben}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form billing details */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Payment Details (Credit Card)</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
                Payments are securely processed via standard 256-bit SSL encryption.
              </div>
            </div>

            <div className="space-y-4">
              {currentUser?.savedCard && (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useSavedCard}
                      onChange={(e) => setUseSavedCard(e.target.checked)}
                      id="checkbox-use-saved-card"
                      className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink border-slate-300"
                    />
                    <label htmlFor="checkbox-use-saved-card" className="text-xs font-bold text-slate-700 select-none">
                      Use secure saved card ending in {currentUser.savedCard.last4}
                    </label>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-850 px-2 py-0.5 rounded font-bold uppercase shrink-0 border border-emerald-100">
                    {currentUser.savedCard.brand}
                  </span>
                </div>
              )}

                {useSavedCard && currentUser?.savedCard ? (
                  <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-pink/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold">SECURE VAULT CARD</span>
                      <span className="text-xs font-bold uppercase bg-white/10 px-2 py-0.5 rounded text-white/90">
                        {currentUser.savedCard.brand}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="text-base font-mono tracking-wider">
                        •••• •••• •••• {currentUser.savedCard.last4}
                      </div>
                      <div className="flex justify-between items-center text-[10px] uppercase text-slate-400">
                        <div>
                          <span className="block text-[8px] text-slate-500">Cardholder</span>
                          <span className="font-bold text-slate-200">{currentUser.savedCard.cardholderName || currentUser.fullName}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] text-slate-500">Expires</span>
                          <span className="font-bold text-slate-200">{currentUser.savedCard.expiryDate || "12/29"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        id="checkout-card-name"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Card Number (Digits Only)</label>
                      <input
                        type="text"
                        required
                        placeholder="4111222233334444"
                        maxLength={16}
                        value={cardNo}
                        onChange={(e) => setCardNo(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        id="checkout-card-no"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Expiration (MM/YY)</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value, cardExpiry))}
                          id="checkout-card-expiry"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">CVV Code</label>
                        <input
                          type="text"
                          required
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          id="checkout-card-cvv"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-250/50">
                      <input
                        type="checkbox"
                        checked={saveCardForFuture}
                        onChange={(e) => setSaveCardForFuture(e.target.checked)}
                        id="checkbox-save-card-future"
                        className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink border-slate-300"
                      />
                      <label htmlFor="checkbox-save-card-future" className="text-xs text-slate-600 select-none font-semibold">
                        Securely save this card to my profile for future checkouts
                      </label>
                    </div>
                  </div>
                )}
            </div>

            <button
              type="submit"
              disabled={processing || !selectedPkg}
              id="btn-checkout-confirm"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition flex justify-center items-center space-x-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Funds...</span>
                </>
              ) : (
                <span>Purchase Badge • ${selectedPkg?.fee}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
