import React from "react";
import {
  Sparkles, Check, ShieldCheck, Loader2, Gift,
  Mail, Phone, MapPin, Heart
} from "lucide-react";

interface FoundingCircleProps {
  onOpenAuth?: () => void;
}

const EXPERIENCES = [
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
  "Luxury Experiences"
];

const BENEFITS = [
  "Founding Member recognition in our community",
  "Early access to all event registration",
  "Priority invitations before public launch",
  "Exclusive launch updates & behind-the-scenes access",
  "First access to future retreats and travel announcements",
  "Opportunities to share feedback and shape future experiences",
  "Invitations to select pilot experiences",
  "First access to future membership options when available"
];

export default function FoundingCircle({ onOpenAuth }: FoundingCircleProps) {
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    ageRange: "",
    interests: [] as string[]
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleInterest = (interest: string) =>
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest]
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.email) {
      setError("Please fill in your first name, last name, and email address.");
      return;
    }
    setSubmitting(true);
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
          interests: form.interests.join(",")
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sorry, we couldn't process your signup. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError("A network error occurred. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition";

  return (
    <section
      id="founding"
      className="relative py-20 md:py-28 px-4 sm:px-6 md:px-12 overflow-hidden bg-gradient-to-b from-white via-brand-pink-light/30 to-slate-50"
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-brand-pink/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* LEFT: Founding Circle Pitch */}
          <div className="text-left lg:sticky lg:top-8">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-extrabold text-brand-gold-dark bg-brand-gold-light/60 border border-brand-gold/30 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Founding Circle
            </span>

            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 leading-tight">
              Become A <em className="gold-text-gradient not-italic">Founding Member.</em>
            </h2>

            {/* Companion Card */}
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
                  Join the first women helping shape the WomenPlay experience. WomenPlay is launching
                  with a select circle of women who believe in beautiful experiences, celebration,
                  wellness, travel, community, and meaningful connection.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  As a Founding Member, you'll receive early access to events, exclusive launch updates,
                  and the opportunity to help shape the experiences we create together.
                </p>

                <ul className="space-y-2.5">
                  {BENEFITS.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-brand-pink to-brand-gold text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#founding-form"
                  className="block text-center w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-brand-pink/20 transition hover:-translate-y-0.5"
                >
                  Join The Founding Circle
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: FORM */}
          <div
            id="founding-form"
            className="bg-white rounded-3xl border border-brand-gold/15 luxury-shadow p-6 sm:p-9 text-left"
          >
            {submitted ? (
              <div className="text-center py-16 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-extrabold text-slate-900">
                    Welcome to the Circle!
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-brand-pink">{form.firstName}</strong>! An
                    activation link has been sent to <strong className="text-slate-700">{form.email}</strong>.
                    Click it to verify your email and set a password for your account.
                  </p>
                </div>
                <a
                  href="#founding"
                  onClick={(e) => {
                    e.preventDefault();
                    setSubmitted(false);
                  }}
                  className="inline-block text-xs font-bold text-brand-pink hover:text-brand-pink-dark underline underline-offset-4"
                >
                  Join With Another Email
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-extrabold text-slate-900">Join The Circle</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Women from British Columbia and communities across Canada are joining the Founding
                    Circle. Join the growing community of women shaping WomenPlay.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">First Name</label>
                    <input
                      type="text"
                      placeholder="Your first name"
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">Last Name</label>
                    <input
                      type="text"
                      placeholder="Your last name"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    <Mail className="w-3 h-3 inline -mt-0.5 mr-1 text-brand-pink" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    <Phone className="w-3 h-3 inline -mt-0.5 mr-1 text-brand-pink" />
                    Phone Number{" "}
                    <span className="normal-case tracking-normal font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (604) 000-0000"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      <MapPin className="w-3 h-3 inline -mt-0.5 mr-1 text-brand-pink" />
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Surrey, Vancouver..."
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      Age Range{" "}
                      <span className="normal-case tracking-normal font-normal text-slate-400">(optional)</span>
                    </label>
                    <select
                      value={form.ageRange}
                      onChange={(e) => update("ageRange", e.target.value)}
                      className={`${inputClass} cursor-pointer ${form.ageRange ? "" : "text-slate-400"}`}
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
                    {EXPERIENCES.map((experience) => {
                      const selected = form.interests.includes(experience);
                      return (
                        <label
                          key={experience}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm cursor-pointer transition select-none ${
                            selected
                              ? "bg-brand-pink-light border-brand-pink text-brand-pink-dark font-semibold"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-brand-pink/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleInterest(experience)}
                            className="accent-brand-pink w-4 h-4 cursor-pointer"
                          />
                          <span>{experience}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs py-3 px-4 rounded-xl font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-pink hover:bg-brand-pink-dark disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-brand-pink/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Joining The Circle...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      <span>Join The Founding Circle</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  Free to join during pre-launch · No commitment required. By joining you agree to our
                  community principles of joy, connection, and respect.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
