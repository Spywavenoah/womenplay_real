import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Check,
  Mail,
  Phone,
  MapPin,
  Heart,
  Gift,
} from "lucide-react";
import HeroBanner from "./HeroBanner";

interface FoundersViewProps {
  onNavigateHome?: () => void;
}

const INTEREST_OPTIONS = [
  "Brunches",
  "Tea Parties",
  "Wellness Events",
  "Games Nights",
  "Karaoke",
  "Networking & Mixers",
  "Themed Parties",
  "Weekend Getaways",
  "International Retreats",
  "Cultural Experiences",
  "Luxury Experiences",
];

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  ageRange: "",
  interests: [] as string[],
};

export default function FoundersView({ onNavigateHome }: FoundersViewProps) {
  const [form, setForm] = React.useState(INITIAL_FORM);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const scrollToForm = () => {
    const el = document.getElementById("founding-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const toggleInterest = (opt: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(opt)
        ? prev.interests.filter((i) => i !== opt)
        : [...prev.interests, opt],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/founding-circle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          ageRange: form.ageRange,
          interests: form.interests.join(","),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message || "Successfully joined the Founding Circle!",
        });
        setForm(INITIAL_FORM);
      } else {
        setMessage({ type: "error", text: data.error || "Unable to join the Founding Circle. Please try again." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Founding Circle
          </span>
        }
        title={
          <>
            Become A <em className="gold-text-gradient not-italic">Founding Member.</em>
          </>
        }
        description="Join the first women helping shape the WomenPlay experience. WomenPlay is launching with a select circle of women who believe in beautiful experiences, celebration, wellness, travel, community, and meaningful connection."
        onNavigateHome={onNavigateHome}
      />

      <section
        id="founding"
        className="relative py-20 md:py-28 px-4 sm:px-6 md:px-12 overflow-hidden bg-gradient-to-b from-white via-brand-pink-light/30 to-slate-50"
      >
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-brand-pink/10 rounded-full blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left: Founding Circle pitch */}
          <div className="text-left lg:sticky lg:top-8">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-extrabold text-brand-gold-dark bg-brand-gold-light/60 border border-brand-gold/30 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Founding Circle
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 leading-tight">
              Become A <em className="gold-text-gradient not-italic">Founding Member.</em>
            </h2>

            <div className="mt-8 bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden">
              <div className="gold-gradient px-6 sm:px-8 py-5 flex items-center justify-between gap-4 border-b border-brand-gold/20">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-brand-pink text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Pre-Launch
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-extrabold text-brand-pink">FREE</div>
                  <p className="text-[10px] text-slate-500 font-medium">No commitment required</p>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-6 space-y-5">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Join the first women helping shape the WomenPlay experience. WomenPlay is launching with a select circle of women who believe in beautiful experiences, celebration, wellness, travel, community, and meaningful connection.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  As a Founding Member, you'll receive early access to events, exclusive launch updates, and the opportunity to help shape the experiences we create together.
                </p>

                <ul className="space-y-2.5">
                  {[
                    "Founding Member recognition in our community",
                    "Early access to all event registration",
                    "Priority invitations before public launch",
                    "Exclusive launch updates & behind-the-scenes access",
                    "First access to future retreats and travel announcements",
                    "Opportunities to share feedback and shape future experiences",
                    "Invitations to select pilot experiences",
                    "First access to future membership options when available",
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-brand-pink to-brand-gold text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={scrollToForm}
                  className="block text-center w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-brand-pink/20 transition hover:-translate-y-0.5 cursor-pointer"
                >
                  Join The Founding Circle
                </button>
              </div>
            </div>
          </div>

          {/* Right: Founding Circle form */}
          <div id="founding-form" className="bg-white rounded-3xl border border-brand-gold/15 luxury-shadow p-6 sm:p-9 text-left scroll-mt-24">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <h3 className="text-2xl font-display font-extrabold text-slate-900">Join The Circle</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Women from British Columbia and communities across Canada are joining the Founding Circle. Join the growing circle of women shaping WomenPlay.
                </p>
              </div>

              {message && (
                <div
                  className={`mb-4 p-4 rounded-xl text-sm font-semibold ${
                    message.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border border-rose-200 text-rose-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">First Name</label>
                  <input
                    placeholder="Your first name"
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">Last Name</label>
                  <input
                    placeholder="Your last name"
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <Mail className="w-3 h-3 inline -mt-0.5 mr-1 text-brand-pink" />
                  Email Address
                </label>
                <input
                  placeholder="your@email.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <Phone className="w-3 h-3 inline -mt-0.5 mr-1 text-brand-pink" />
                  Phone Number{" "}
                  <span className="normal-case tracking-normal font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  placeholder="+1 (604) 000-0000"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    <MapPin className="w-3 h-3 inline -mt-0.5 mr-1 text-brand-pink" />
                    City
                  </label>
                  <input
                    placeholder="e.g. Surrey, Vancouver..."
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Age Range{" "}
                    <span className="normal-case tracking-normal font-normal text-slate-400">(optional)</span>
                  </label>
                  <select
                    value={form.ageRange}
                    onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition cursor-pointer ${
                      form.ageRange ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    <option value="">Select...</option>
                    <option value="21-29">21–29</option>
                    <option value="30-39">30–39</option>
                    <option value="40-49">40–49</option>
                    <option value="50-59">50–59</option>
                    <option value="60+">60+</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <Heart className="w-3 h-3 inline -mt-0.5 mr-1 text-brand-pink" />
                  Which experiences interest you most?
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INTEREST_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm cursor-pointer transition select-none bg-slate-50 border-slate-200 text-slate-600 hover:border-brand-pink/40"
                    >
                      <input
                        className="accent-brand-pink w-4 h-4 cursor-pointer"
                        type="checkbox"
                        checked={form.interests.includes(opt)}
                        onChange={() => toggleInterest(opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-pink hover:bg-brand-pink-dark disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-brand-pink/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>{submitting ? "Joining..." : "Join The Founding Circle"}</span>
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Free to join during pre-launch · No commitment required. By joining you agree to our community principles of joy, connection, and respect.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}