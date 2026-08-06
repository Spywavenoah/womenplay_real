import React from "react";
import { Sparkles, ArrowRight, Building2, Send, Check, CreditCard, ShieldCheck, Lock, Loader2, AlertCircle } from "lucide-react";
import HeroBanner from "./HeroBanner";

interface SponsorshipViewProps {
  onNavigateHome: () => void;
  onOpenAuth: () => void;
}

export default function SponsorshipView({ onNavigateHome, onOpenAuth }: SponsorshipViewProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successResult, setSuccessResult] = React.useState<any>(null);

  const [formData, setFormData] = React.useState({
    companyName: "",
    contactName: "",
    email: "",
    tier: "Executive Chapter Sponsor ($25,000)",
    message: ""
  });

  const [paymentData, setPaymentData] = React.useState({
    cardName: "",
    cardNo: "",
    cardExpiry: "",
    cardCvv: ""
  });

  // Calculate pricing
  const getTierPrice = (tierStr: string) => {
    if (tierStr.includes("25") || tierStr.includes("Chapter")) return 25000;
    if (tierStr.includes("50") || tierStr.includes("Global") || tierStr.includes("Title")) return 50000;
    if (tierStr.includes("5") || tierStr.includes("Custom")) return 5000;
    return 10000; // Fellowship default
  };

  // Helper for auto slash formatting in expiry date (MM/YY)
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

  const currentPrice = getTierPrice(formData.tier);

  const handleSubmitSponsorship = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/sponsorship-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          tier: formData.tier,
          message: formData.message,
          cardName: paymentData.cardName,
          cardNo: paymentData.cardNo,
          cardExpiry: paymentData.cardExpiry,
          cardCvv: paymentData.cardCvv
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessResult(data);
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to process sponsorship payment. Please check card details.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error processing sponsorship payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-left" id="sponsorship-page-view">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Corporate Partnership & Sponsorship
          </span>
        }
        title="Empower Extraordinary Women Leaders"
        description="Align your enterprise with top-tier female executives, board members, and venture founders. Partner with WomenPlay to champion executive diversity and gain direct visibility at global leadership summits."
        onNavigateHome={onNavigateHome}
      >
        <div className="flex flex-wrap gap-4 pt-2 justify-center">
          <a
            href="#inquiry-form-section"
            className="px-6 py-3 rounded-full bg-brand-pink hover:bg-brand-pink-dark text-white font-bold text-xs shadow-lg shadow-brand-pink/25 transition flex items-center space-x-2"
          >
            <span>Proceed to Sponsorship Registration</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </HeroBanner>

      <div className="max-w-4xl mx-auto space-y-12 py-12 px-6 md:px-12">

        {/* High Impact Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-center space-y-1">
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display">12,000+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">C-Suite Members</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-center space-y-1">
            <p className="text-2xl md:text-3xl font-extrabold text-brand-pink font-display">85+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Board Seats Facilitated</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-center space-y-1">
            <p className="text-2xl md:text-3xl font-extrabold text-brand-gold-dark font-display">24</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Global Summits</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow text-center space-y-1">
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900 font-display">$1.2B+</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Syndicate Venture Deals</p>
          </div>
        </div>

        {/* Inquiry Form & Payment Section */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 luxury-shadow" id="inquiry-form-section">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <Building2 className="w-8 h-8 text-brand-pink mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900 font-display">Submit Sponsorship Inquiry & Payment</h3>
              <p className="text-xs text-slate-500">
                Sponsorship records are officially saved and activated immediately upon successful payment processing.
              </p>
            </div>

            {submitted && successResult ? (
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-emerald-900 text-lg">Sponsorship Payment Successful!</h4>
                  <p className="text-xs text-emerald-700">
                    Thank you for partnering with WomenPlay Executive Network. Your sponsorship record has been created and saved to the database.
                  </p>
                </div>

                {/* Receipt Details Box */}
                <div className="bg-white p-4 rounded-xl border border-emerald-150 text-left space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-500">Company Name:</span>
                    <span className="font-extrabold text-slate-900">{successResult.sponsor.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-500">Sponsorship Tier:</span>
                    <span className="font-extrabold text-brand-pink">{successResult.sponsor.tier}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-500">Amount Paid:</span>
                    <span className="font-extrabold text-slate-900">${currentPrice.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Payment Transaction Ref:</span>
                    <span className="font-mono font-bold text-brand-gold-dark">{successResult.payment.id}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setSuccessResult(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                  >
                    Submit Another Sponsorship
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitSponsorship} className="space-y-6 text-xs font-semibold">
                
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Section 1: Enterprise Info */}
                <div className="space-y-4 pt-2">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-800">
                      1. Corporate & Contact Details
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 mb-1">Company / Enterprise Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acme Global Capital"
                        value={formData.companyName}
                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-pink outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Contact Officer Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={formData.contactName}
                        onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-pink outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 mb-1">Corporate Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. s.jenkins@acmecapital.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-pink outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Select Sponsorship Tier *</label>
                      <select
                        value={formData.tier}
                        onChange={e => setFormData({ ...formData, tier: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-pink outline-none transition font-bold"
                      >
                        <option value="Fellowship Sponsor ($10,000)">Board Fellowship Sponsor ($10,000 / yr)</option>
                        <option value="Executive Chapter Sponsor ($25,000)">Executive Chapter Sponsor ($25,000 / yr)</option>
                        <option value="Global Title Partner ($50,000)">Global Title Partner ($50,000 / yr)</option>
                        <option value="Custom Event Branding ($5,000)">Custom Event Branding ($5,000)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Additional Objectives / Notes (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Tell us about your organization's executive diversity goals or specific summit sponsorship requests..."
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-pink outline-none transition"
                    />
                  </div>
                </div>

                {/* Section 2: Sponsorship Payment Checkout */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-800 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-brand-pink" />
                      <span>2. Process Payment (${currentPrice.toLocaleString()} USD)</span>
                    </h4>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      256-bit Encrypted
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Cardholder Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={paymentData.cardName}
                      onChange={e => setPaymentData({ ...paymentData, cardName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-pink outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Credit / Debit Card Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010"
                      value={paymentData.cardNo}
                      onChange={e => setPaymentData({ ...paymentData, cardNo: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-pink outline-none transition font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 mb-1">Expiry Date (MM/YY) *</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="12/28"
                        value={paymentData.cardExpiry}
                        onChange={e => setPaymentData({ ...paymentData, cardExpiry: formatCardExpiry(e.target.value, paymentData.cardExpiry) })}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-pink outline-none transition font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Security Code (CVV) *</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={paymentData.cardCvv}
                        onChange={e => setPaymentData({ ...paymentData, cardCvv: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-pink outline-none transition font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-6 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-pink/20 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing & Saving Sponsorship...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Process Payment & Confirm Sponsorship (${currentPrice.toLocaleString()})</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Your sponsorship record will be created and saved ONLY upon successful payment confirmation.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
