import React from "react";
import { Loader2, CheckCircle2, AlertCircle, Sparkles, Ticket, Heart, Users, Camera, Package, ShieldCheck, Compass } from "lucide-react";
import HeroBanner from "./HeroBanner";

const VOLUNTEER_ROLES = [
  { icon: "✨", name: "Guest Experience Ambassador", desc: "Welcome guests, support wayfinding, answer questions and help every attendee feel seen and included." },
  { icon: "🎟️", name: "Registration Ambassador", desc: "Support check-in, QR scanning, wristbands and smooth arrival under the Operations Lead." },
  { icon: "🤝", name: "Community Engagement Ambassador", desc: "Encourage connection, support community sign-ups and collect approved testimonials." },
  { icon: "📱", name: "Brand Content Ambassador", desc: "Capture approved behind-the-scenes moments and support social storytelling." },
  { icon: "📦", name: "Event Operations Ambassador", desc: "Assist with setup, supplies, inventory, vendor directions and teardown." },
  { icon: "🧭", name: "Safety & First-Aid Liaison", desc: "Connect event operations with the venue and qualified first-aid provider. This is not a medical-responder role unless separately qualified." }
];

const ROLE_CHECKS = [
  "Guest Experience",
  "Registration",
  "Community Engagement",
  "Brand Content",
  "Event Operations",
  "Safety Liaison"
];

const BENEFITS = [
  "Founding Volunteer certificate with verified role and hours",
  "Official “Class of 2026” recognition",
  "Volunteer T-shirt/name badge if approved",
  "Refreshments and event-day support",
  "Behind-the-scenes event experience",
  "Professional networking and future priority consideration",
  "Reference or LinkedIn recommendation consideration for exceptional service",
  "Invitation to the WomenPlay volunteer network"
];

const PROCESS_STEPS = [
  { num: "01", label: "Apply online" },
  { num: "02", label: "Brief conversation" },
  { num: "03", label: "Role assignment" },
  { num: "04", label: "Orientation" },
  { num: "05", label: "Launch & recognition" }
];

export default function VolunteerView({ onNavigateHome }: { onNavigateHome: () => void }) {
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    availability: "",
    shirtSize: "",
    roles: [] as string[],
    skills: "",
    why: "",
    emergencyContact: "",
    consent: false
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleRole = (role: string) => {
    setForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.availability) {
      setError("Please fill in your full name, email, phone and event-day availability.");
      return;
    }
    if (!form.consent) {
      setError("Please confirm you understand this is a limited volunteer opportunity.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          roles: form.roles.join(",")
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Thank you! Your volunteer application has been received.");
        setForm({
          fullName: "",
          email: "",
          phone: "",
          linkedin: "",
          availability: "",
          shirtSize: "",
          roles: [],
          skills: "",
          why: "",
          emergencyContact: "",
          consent: false
        });
      } else {
        setError(data.error || "Failed to submit your application. Please try again.");
      }
    } catch (err) {
      setError("Network error while submitting your application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink";

  return (
    <div className="min-h-screen bg-slate-50 text-left" id="volunteer" aria-labelledby="volunteer-title">
      {/* Hero Header */}
      <HeroBanner
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Founding Volunteer Program · Class of 2026
          </span>
        }
        title={
          <span id="volunteer-title">
            Help Bring <em className="gold-text-gradient not-italic">WomenPlay</em> To Life.
          </span>
        }
        description="Join the inaugural WomenPlay launch team and help create a joyful, welcoming and beautifully organized experience for women across British Columbia. This is a time-limited event-support opportunity with clear roles, orientation, recognition and community impact."
        onNavigateHome={onNavigateHome}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 py-16 md:py-20">
        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {VOLUNTEER_ROLES.map((role, idx) => (
            <article
              key={idx}
              className="bg-white border border-slate-100 rounded-3xl p-8 space-y-4 hover:border-brand-pink/30 hover:shadow-lg transition-all duration-300 luxury-shadow group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-pink to-brand-gold text-white flex items-center justify-center shadow-md shadow-brand-pink/20 group-hover:scale-110 transition-transform duration-200 text-2xl">
                {role.icon}
              </div>
              <h3 className="text-lg font-display font-bold text-slate-900">{role.name}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{role.desc}</p>
            </article>
          ))}
        </div>

        {/* Benefits */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 luxury-shadow grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark inline-block">Recognition</span>
            <h3 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">What Founding Volunteers Receive</h3>
            <p className="text-slate-600 leading-relaxed">
              Your contribution will be documented and celebrated as part of WomenPlay's inaugural launch.
            </p>
          </div>
          <ul className="space-y-3">
            {BENEFITS.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Process */}
        <section className="bg-gradient-to-br from-brand-pink/5 via-white to-brand-gold/5 border border-slate-100 rounded-3xl p-8 md:p-12 luxury-shadow">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-pink inline-block">The Journey</span>
            <h3 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900">From Application to Launch Day</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {PROCESS_STEPS.map((step, idx) => (
              <div key={idx} className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-pink to-brand-gold text-white font-display font-extrabold text-lg flex items-center justify-center shadow-md shadow-brand-pink/20">
                  {step.num}
                </div>
                <p className="text-sm font-bold text-slate-800">{step.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Form */}
        <section className="bg-brand-gold-light/50 border-l-4 border-brand-gold rounded-r-xl p-5 text-black">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-pink/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-10 p-8 md:p-12">
            {/* Info Aside */}
            <aside className="lg:col-span-2 space-y-5">
              <h3 className="text-2xl md:text-3xl font-display font-extrabold text-black">Become a Founding Volunteer</h3>
              <p className="text-black/80 text-sm leading-relaxed">
                We are seeking dependable, warm and community-minded adults who can support the October 24, 2026 launch in Surrey, BC.
              </p>
              <p className="text-black/80 text-sm leading-relaxed">
                <strong className="text-black">Expected commitment:</strong> orientation, final briefing and an assigned event-day shift.
              </p>
              <div className="bg-white/60 border border-black/10 rounded-2xl p-5 text-sm leading-relaxed text-black/85">
                <strong className="text-brand-gold block mb-1">Your recognition:</strong>
                Certificates will include your name, role, verified service hours, event date and a unique WomenPlay certificate number.
              </div>
              <p className="text-black/60 text-xs leading-relaxed">
                WomenPlay.org Inc. is a for-profit company. Volunteer roles are presented transparently as limited community/event-support opportunities and are not promises of employment or payment.
              </p>
            </aside>

            {/* Form */}
            <form className="lg:col-span-3 space-y-5 bg-brand-gold-light/50 border-l-4 border-brand-gold rounded-r-xl p-5 text-black" onSubmit={handleSubmit}>
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs py-3 px-4 rounded-xl font-medium leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="volName" className="block text-xs font-bold text-black mb-1.5">Full name *</label>
                  <input id="volName" name="name" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="volEmail" className="block text-xs font-bold text-black mb-1.5">Email *</label>
                  <input id="volEmail" name="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="volPhone" className="block text-xs font-bold text-black mb-1.5">Phone *</label>
                  <input id="volPhone" name="phone" type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="volLinkedin" className="block text-xs font-bold text-black mb-1.5">LinkedIn profile (optional)</label>
                  <input id="volLinkedin" name="linkedin" type="url" value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="volAvailability" className="block text-xs font-bold text-black mb-1.5">Event-day availability *</label>
                  <select id="volAvailability" required value={form.availability} onChange={(e) => update("availability", e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    <option>Full day</option>
                    <option>Setup shift</option>
                    <option>Event shift</option>
                    <option>Teardown shift</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="volShirt" className="block text-xs font-bold text-black mb-1.5">T-shirt size</label>
                  <select id="volShirt" value={form.shirtSize} onChange={(e) => update("shirtSize", e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    <option>XS</option>
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                    <option>2XL</option>
                    <option>3XL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">Roles of interest</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROLE_CHECKS.map((role) => (
                    <label key={role} className={`flex items-center gap-2.5 bg-white/60 border rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition ${form.roles.includes(role) ? "border-brand-pink bg-brand-pink/20 text-black" : "border-black/15 text-black/80 hover:border-brand-pink/40"}`}>
                      <input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} className="accent-brand-pink" />
                      {role}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="volSkills" className="block text-xs font-bold text-black mb-1.5">Relevant skills, experience or certifications</label>
                <textarea id="volSkills" rows={3} value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="Customer service, events, social media, first aid, languages, administration..." className={`${inputClass} resize-none`} />
              </div>

              <div>
                <label htmlFor="volWhy" className="block text-xs font-bold text-black mb-1.5">Why would you like to volunteer with WomenPlay? *</label>
                <textarea id="volWhy" rows={3} required value={form.why} onChange={(e) => update("why", e.target.value)} className={`${inputClass} resize-none`} />
              </div>

              <div>
                <label htmlFor="volEmergency" className="block text-xs font-bold text-black mb-1.5">Emergency contact name and phone *</label>
                <input id="volEmergency" required value={form.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} className={inputClass} />
              </div>

              <label className="flex items-start gap-2.5 text-xs text-black/80 leading-relaxed cursor-pointer">
                <input type="checkbox" required checked={form.consent} onChange={(e) => setForm(prev => ({ ...prev, consent: e.target.checked }))} className="accent-brand-pink mt-0.5" />
                I understand this is a limited volunteer opportunity and agree to be contacted about screening, orientation and event details.
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-pink to-brand-gold hover:opacity-95 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-brand-pink/25 transition-all hover:-translate-y-0.5 text-sm disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                  <span>{loading ? "Submitting Application..." : "Apply to Join the Founding Team"}</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
