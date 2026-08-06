import React from "react";
import { BookOpen, Loader2, MessageSquareHeart } from "lucide-react";
import HeroBanner from "./HeroBanner";

interface ContactViewProps {
  onNavigateHome: () => void;
}

export default function ContactView({ onNavigateHome }: ContactViewProps) {
  const [contactForm, setContactForm] = React.useState({ name: "", email: "", subject: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = React.useState(false);
  const [contactSubmitting, setContactSubmitting] = React.useState(false);
  const [newsletterEmail, setNewsletterEmail] = React.useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = React.useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail })
      });
    } catch (err) {
      console.error("Error subscribing to newsletter:", err);
    }
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject || "Website Contact Inquiry",
          message: contactForm.message
        })
      });
      setContactSubmitted(true);
      setContactForm({ name: "", email: "", subject: "", message: "" });
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
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gold-dark">Concierge Support</span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900">
                The Secretariat is <em className="gold-text-gradient not-italic">here.</em>
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Our executive secretariat responds within 24 business hours to every inquiry.
              </p>
            </div>

            {/* Contact Details List */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-pink-light flex items-center justify-center text-base shrink-0">📧</div>
                <div>
                  <div className="text-[10px] uppercase tracking-[2px] font-bold text-brand-gold-dark mb-0.5">Email</div>
                  <div className="text-sm text-slate-600">
                    <a href="mailto:womenplay.org@gmail.com" className="text-slate-600 hover:text-brand-pink transition">womenplay.org@gmail.com</a>
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
                  <div className="text-[10px] uppercase tracking-[2px] font-bold text-brand-gold-dark mb-0.5">Follow Us</div>
                  <div className="text-sm text-slate-500">Instagram &nbsp;·&nbsp; Facebook &nbsp;·&nbsp; TikTok &nbsp;·&nbsp; YouTube</div>
                </div>
              </div>
            </div>

            {/* Partnerships Note */}
            <div className="bg-brand-gold-light/50 border-l-4 border-brand-gold rounded-r-xl p-5">
              <div className="text-[10px] uppercase tracking-[2px] font-bold text-brand-gold-dark mb-1">Partnerships &amp; Sponsorships</div>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Interested in partnering with WomenPlay? We'd love to explore opportunities to create unique play spaces for women.
              </p>
            </div>

            {/* Luxury Newsletter Form */}
            <div className="bg-brand-pink-light/30 border border-brand-pink/10 p-6 rounded-2xl relative overflow-hidden" id="newsletter-landing-box">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-pink-light rounded-full blur-xl" />
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-brand-pink" />
                <span>Join our Newsletter & Strategic Announcements</span>
              </h3>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed mb-4">
                Receive weekly executive opportunities, boardroom vacancies, and invitation-only social tickets.
              </p>

              {newsletterSubscribed ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium animate-pulse">
                  Thank you! You have been subscribed to WomenPlay Strategic Announcements.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your executive email..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    id="input-newsletter-email"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                  />
                  <button
                    type="submit"
                    id="btn-newsletter-submit"
                    className="bg-brand-pink hover:bg-brand-pink-dark text-white text-xs px-5 rounded-xl font-bold transition shadow-md"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-brand-gold/15 rounded-2xl p-8 md:p-11 luxury-shadow text-left" id="contact-form-box">
            <div className="text-2xl font-display font-extrabold text-slate-900 mb-6">Send Us A Message</div>

            {contactSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-4 px-6 rounded-2xl font-medium space-y-2">
                <p className="font-bold">Message Submitted successfully!</p>
                <p className="text-[11px] text-emerald-700">The executive secretariat will verify your contact details and reach out within 24 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      id="input-contact-name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      id="input-contact-email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Subject</label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    id="input-contact-subject"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Message</label>
                  <textarea
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
