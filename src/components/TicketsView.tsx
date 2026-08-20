import React, { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import HeroBanner from "./HeroBanner";

interface TicketsViewProps {
  onNavigateHome?: () => void;
}

// Map the dropdown labels to the server-side authoritative ticket tier ids
const TICKET_TIER_MAP: Record<string, string> = {
  "Early Bird — $49.99": "early-bird",
  "Regular — $69.99": "regular",
  "Last Call — $79.99": "last-call",
};

export default function TicketsView({ onNavigateHome }: TicketsViewProps) {
  const [selectedTicket, setSelectedTicket] = useState<string>("regular");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    ticketType: "Regular — $69.99",
    quantity: "1",
    teamPreference: "No preference",
    agreedToWaiver: false,
    agreedToMedia: false,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("ticket_success") === "true") {
      setSuccess("Payment successful! Your Launch Experience access pass details have been emailed to you.");
      window.history.replaceState({}, document.title, "/tickets");
    } else if (params.get("stripe_cancel") === "true") {
      setError("Checkout was cancelled. No payment was taken.");
      window.history.replaceState({}, document.title, "/tickets");
    } else if (params.get("stripe_error") === "true") {
      setError("We could not confirm your payment. Please try again or contact support.");
      window.history.replaceState({}, document.title, "/tickets");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
      };
      if (name === "ticketType" && TICKET_TIER_MAP[value]) {
        setSelectedTicket(TICKET_TIER_MAP[value]);
      }
      return next;
    });
  };

  const handleSelectTicket = (tier: { id: string; name: string; price: string }) => {
    setSelectedTicket(tier.id);
    setFormData(prev => ({ ...prev, ticketType: `${tier.name} — ${tier.price}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.agreedToWaiver) {
      setError("Please agree to the event waiver and participation terms to continue.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/tickets/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          ticketType: TICKET_TIER_MAP[formData.ticketType] || selectedTicket,
          quantity: parseInt(formData.quantity, 10) || 1,
          teamPreference: formData.teamPreference,
        }),
      });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setError(data.error || "Unable to start secure payment. Please try again.");
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to reach the payment service. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const ticketTiers = [
    {
      id: "early-bird",
      name: "Early Bird",
      price: "$49.99",
      available: "25 tickets",
      description: "Best launch price for the first women ready to join the founding experience.",
      featured: false,
      buttonStyle: "outline"
    },
    {
      id: "regular",
      name: "Regular",
      price: "$69.99",
      available: "50 tickets",
      description: "Standard access to the full WomenPlay Launch Experience.",
      featured: true,
      flag: "Main Phase",
      buttonStyle: "primary"
    },
    {
      id: "last-call",
      name: "Last Call",
      price: "$79.99",
      available: "25 tickets",
      description: "Final ticket release once early access and regular tickets are gone.",
      featured: false,
      buttonStyle: "outline"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <HeroBanner
        eyebrow="Tickets"
        title={
          <>
            Secure Your Launch Ticket<br />
            <em className="gold-text-gradient not-italic">Complete Your Registration.</em>
          </>
        }
        description="Tickets are limited to 100 women and released in three pricing phases. Once a phase sells out, the next price applies."
        onNavigateHome={onNavigateHome}
      />

      {/* Ticket Cards Grid */}
      <div className="px-6 md:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {ticketTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-8 transition-all duration-300 cursor-pointer group ${
                  tier.featured
                    ? "bg-gradient-to-br from-brand-pink/10 to-brand-gold/10 border-2 border-brand-pink shadow-lg luxury-shadow"
                    : "bg-white border border-slate-200 hover:border-brand-pink/50 hover:shadow-lg"
                }`}
                onClick={() => setSelectedTicket(tier.id)}
              >
                {tier.flag && (
                  <div className="absolute -top-3 left-8 bg-brand-pink text-white text-xs font-bold px-3 py-1 rounded-full">
                    {tier.flag}
                  </div>
                )}
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900">{tier.name}</h3>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-brand-pink">{tier.price}</div>
                    <div className="text-sm font-semibold text-slate-500">{tier.available}</div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{tier.description}</p>
                  
                  <button
                    onClick={() => {
                      handleSelectTicket(tier);
                      setSelectedTicket(tier.id);
                      const formEl = document.getElementById("registration-form");
                      formEl?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all mt-6 flex items-center justify-center gap-2 ${
                      tier.buttonStyle === "primary"
                        ? "bg-brand-pink hover:bg-brand-pink-dark text-white shadow-md shadow-brand-pink/25"
                        : "border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    Select <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Ticket Includes */}
          <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-2xl p-8 mb-16">
            <p className="text-slate-900 font-semibold text-lg mb-4">What&apos;s Included in Your Ticket:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Access to the WomenPlay Launch Experience",
                "Team challenges and competitions",
                "WomenPlay Passport",
                "Live music and entertainment",
                "Professional photo moments",
                "Prize draw access",
                "Light refreshments"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-brand-gold-dark flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 mt-4 italic">Merchandise will be available separately.</p>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="px-6 md:px-12 py-20 bg-gradient-to-b from-white to-slate-50" id="registration-form">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-12">Launch Registration</h2>

          {success && (
            <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold p-4 rounded-xl">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-8 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold p-4 rounded-xl">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Full name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition"
                />
              </div>
            </div>

            {/* Phone and Ticket Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Phone number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Ticket type</label>
                <select
                  name="ticketType"
                  value={formData.ticketType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition bg-white"
                >
                  <option>Early Bird — $49.99</option>
                  <option>Regular — $69.99</option>
                  <option>Last Call — $79.99</option>
                </select>
              </div>
            </div>

            {/* Quantity and Team Preference Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Quantity</label>
                <select
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition bg-white"
                >
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900">Optional team preference</label>
                <select
                  name="teamPreference"
                  value={formData.teamPreference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition bg-white"
                >
                  <option>No preference</option>
                  <option>Team Classy Queens 👑</option>
                  <option>Team Tomboy Tribe 🏀</option>
                  <option>Team Simple Souls ✨</option>
                  <option>Team Free Spirits 🦋</option>
                  <option>Team Fearless 🔥</option>
                  <option>Team Wildflowers 🌸</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 py-4 border-y border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="agreedToWaiver"
                  checked={formData.agreedToWaiver}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-pink focus:ring-brand-pink"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                  I agree to the event waiver and participation terms.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="agreedToMedia"
                  checked={formData.agreedToMedia}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-pink focus:ring-brand-pink"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                  I consent to photo/video media use from the event.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-brand-gold hover:bg-brand-gold-dark text-slate-900 font-bold py-4 px-6 rounded-lg transition-all shadow-md shadow-brand-gold/25 flex items-center justify-center gap-2 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting to Stripe Secure Checkout...
                </>
              ) : (
                <>
                  Proceed to Secure Payment
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Payment Methods */}
            <div className="space-y-4 pt-4">
              <p className="text-sm text-slate-600 text-center">Payment methods accepted:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {["Stripe", "Square", "PayPal", "Eventbrite"].map((method) => (
                  <span
                    key={method}
                    className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-sm font-semibold text-slate-700"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Trust Line */}
            <p className="text-center text-sm text-slate-500 italic">
              Secure checkout. Limited capacity. No ticket is confirmed until payment is complete.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
