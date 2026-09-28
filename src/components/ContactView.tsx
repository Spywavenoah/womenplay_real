import React from "react";
import { Loader2, MessageSquareHeart, Facebook, Instagram, Youtube } from "lucide-react";
import HeroBanner from "./HeroBanner";

interface ContactViewProps {
  onNavigateHome: () => void;
  onNavigateSponsorship?: () => void;
}

export default function ContactView({ onNavigateHome, onNavigateSponsorship }: ContactViewProps) {
  const [contactForm, setContactForm] = React.useState({
    firstName: "",
    email: "",
    phone: "",
    interest: "General question",
    organization: "",
    message: ""
  });
  const [contactSubmitted, setContactSubmitted] = React.useState(false);
  const [contactSubmitting, setContactSubmitting] = React.useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.firstName || !contactForm.email || !contactForm.interest || !contactForm.message) return;
    setContactSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: contactForm.firstName,
          email: contactForm.email,
          phone: contactForm.phone,
          interest: contactForm.interest,
          organization: contactForm.organization,
          message: contactForm.message
        })
      });
      setContactSubmitted(true);
      setContactForm({
        firstName: "",
        email: "",
        phone: "",
        interest: "General question",
        organization: "",
        message: ""
      });
    } catch (err) {
      console.error("Error submitting contact inquiry:", err);
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 text-left">
      {/* Hero Banner */}
      <HeroBanner
        backgroundImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <MessageSquareHeart className="w-4 h-4" />
            Get In Touch
          </span>
        }
        title={
          <>
            Let's <em className="gold-text-gradient not-italic">Connect.</em>
          </>
        }
        description="We'd love to hear from you. Whether you have a question, an event idea, a partnership enquiry, or simply want to learn more — reach out and we'll get back to you warmly."
        onNavigateHome={onNavigateHome}
      />

      {/* Contact Section */}
      <section className="bg-white py-20" id="contact-view-landing">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Contact Details */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">We’d Love to Hear From You</span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
                Let’s Stay <em className="gold-text-gradient not-italic">Connected.</em>
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Have a question or idea? We’ll respond within 24 hours.
              </p>
            </div>

            {/* Contact Details List */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-pink-light flex items-center justify-center text-base shrink-0">📧</div>
                <div>
                  <div className="text-[10px] uppercase tracking-[2px] font-bold text-brand-gold-dark mb-0.5">Email</div>
                  <div className="text-sm text-slate-600">
                    <a href="mailto:hello@womenplay.org" className="text-slate-600 hover:text-brand-pink transition">hello@womenplay.org</a>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-pink-light flex items-center justify-center text-base shrink-0">📍</div>
                <div>
                  <div className="text-[10px] uppercase tracking-[2px] font-bold text-brand-gold-dark mb-0.5">Location</div>
                  <div className="text-sm text-slate-600">British Columbia, Canada</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-pink-light flex items-center justify-center text-base shrink-0">📱</div>
                <div>
                  <div className="text-[10px] uppercase tracking-[2px] font-bold text-brand-gold-dark mb-1.5">Follow Us</div>
                  <div className="flex items-center flex-wrap gap-2 pt-0.5">
                    <a
                      href="https://www.facebook.com/profile.php?id=61591292890238"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#1877F2] text-slate-700 hover:text-white text-xs font-medium transition shadow-2xs cursor-pointer"
                      title="Follow WomenPlay on Facebook"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>Facebook</span>
                    </a>
                    <a
                      href="https://www.instagram.com/womenplay_org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#E1306C] text-slate-700 hover:text-white text-xs font-medium transition shadow-2xs cursor-pointer"
                      title="Follow WomenPlay on Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram</span>
                    </a>
                    <a
                      href="https://www.tiktok.com/@womenplay?lang=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-black text-slate-700 hover:text-white text-xs font-medium transition shadow-2xs cursor-pointer"
                      title="Follow WomenPlay on TikTok"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 1.603A6.338 6.338 0 0 0 3 15.672a6.335 6.335 0 0 0 6.34 6.328 6.335 6.335 0 0 0 6.34-6.328V9.124a8.17 8.17 0 0 0 4.909 1.623V7.27a4.84 4.84 0 0 1-1-.584z" />
                      </svg>
                      <span>TikTok</span>
                    </a>
                    <a
                      href="https://www.youtube.com/@WomenPlayOrg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#FF0000] text-slate-700 hover:text-white text-xs font-medium transition shadow-2xs cursor-pointer"
                      title="Subscribe to WomenPlay on YouTube"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Partnerships Note */}
            <div className="bg-brand-gold-light/40 border border-brand-gold/30 rounded-2xl p-6 space-y-3">
              <div className="text-[10px] uppercase tracking-[2px] font-bold text-brand-gold-dark">Partnerships &amp; Sponsorships</div>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Interested in sponsoring or partnering with WomenPlay? We’d love to explore opportunities to create unique play spaces for women.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateSponsorship) {
                      onNavigateSponsorship();
                    } else {
                      window.location.hash = "#sponsorship";
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-pink hover:text-brand-pink-dark transition cursor-pointer group"
                >
                  <span>SPONSOR OR PARTNER</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-brand-gold/15 rounded-2xl p-8 md:p-11 luxury-shadow text-left" id="contact-form-box">
            <div className="text-2xl font-display font-extrabold text-slate-900 mb-6">Send Us A Message</div>

            {contactSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-4 px-6 rounded-2xl font-medium space-y-2">
                <p className="font-bold">Message Submitted successfully!</p>
                <p className="text-[11px] text-emerald-700">Our team will review your message and reach out within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 mira-field">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">FIRST NAME *</label>
                    <input
                      name="firstName"
                      type="text"
                      required
                      autoComplete="given-name"
                      placeholder="Your first name"
                      value={contactForm.firstName}
                      onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                      id="input-contact-firstname"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                    />
                  </div>
                  <div className="space-y-1.5 mira-field">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">EMAIL ADDRESS *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      id="input-contact-email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 mira-field">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">PHONE NUMBER (OPTIONAL)</label>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(555) 000-0000"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      id="input-contact-phone"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                    />
                  </div>

                  <div className="space-y-1.5 mira-field">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">AREA OF INTEREST *</label>
                    <select
                      name="interest"
                      required
                      value={contactForm.interest}
                      onChange={(e) => setContactForm({ ...contactForm, interest: e.target.value })}
                      id="select-contact-interest"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800"
                    >
                      <option>Event attendance</option>
                      <option>Membership</option>
                      <option>Partnership</option>
                      <option>Sponsorship</option>
                      <option>Vendor</option>
                      <option>Volunteer</option>
                      <option>General question</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 mira-field">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">BUSINESS OR ORGANIZATION (IF APPLICABLE)</label>
                  <input
                    name="organization"
                    type="text"
                    placeholder="Your company or group name"
                    value={contactForm.organization}
                    onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                    id="input-contact-organization"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                  />
                </div>

                <div className="space-y-1.5 mira-field">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">YOUR MESSAGE OR PROPOSAL *</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell us about yourself, your idea, or how you'd like to partner with us..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    id="textarea-contact-message"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  id="btn-contact-submit"
                  className="w-full bg-brand-pink hover:bg-brand-pink-dark disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {contactSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
