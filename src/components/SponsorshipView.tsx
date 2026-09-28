import React from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface SponsorshipViewProps {
  onNavigateHome: () => void;
  onOpenAuth?: () => void;
}

export default function SponsorshipView({ onNavigateHome }: SponsorshipViewProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    partnershipInterest: "",
    opportunityInterest: "",
    idea: "",
    preferredContact: "",
    consent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      setErrorMessage("Please consent to be contacted regarding your inquiry before submitting.");
      return;
    }
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
          phone: formData.phone,
          website: formData.website,
          partnershipInterest: formData.partnershipInterest || "Brand Partnership",
          opportunityInterest: formData.opportunityInterest || "All Experiences",
          idea: formData.idea,
          preferredContact: formData.preferredContact || "Email",
          consent: formData.consent
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "Something went wrong while submitting your inquiry. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to connect to the server. Please check your internet connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("sponsorship-inquiry-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-left text-slate-800 selection:bg-[#b04a68]/20 selection:text-[#b04a68]" id="sponsorship-page-view">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Copy & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-[11px] md:text-xs font-semibold tracking-[0.24em] text-[#b04a68] uppercase font-sans">
              SPONSORSHIP &amp; PARTNERSHIPS
            </div>

            <h1 className="font-serif text-[#261f22] font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-[46px] leading-[1.12] tracking-tight uppercase">
              SPONSOR OR<br />
              PARTNER WITH<br />
              WOMENPLAY.ORG
            </h1>

            <p className="italic font-serif text-xl sm:text-2xl text-[#b04a68] tracking-wide pt-0.5">
              Put Your Brand Where the Fun Is!
            </p>

            <div className="space-y-4 text-xs sm:text-sm md:text-[15px] text-slate-700 leading-relaxed font-sans max-w-xl">
              <p>
                We create playful experiences where women can step away from the everyday to play, laugh, connect and make unforgettable memories.
              </p>
              <p>
                From games and social gatherings to travel, lifestyle experiences and special events, we bring women together in spaces filled with energy, connection and
fun.
              </p>
              <p className="font-medium text-slate-800">
                And your brand can be part of it.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="#sponsorship-inquiry-form"
                onClick={scrollToForm}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#b04a68] hover:bg-[#963b54] text-white font-sans font-semibold text-xs tracking-wider uppercase shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
              >
                <span>SPONSOR OR PARTNER</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Hero Image with Soft Rounded Corners */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative rounded-3xl md:rounded-[36px] overflow-hidden shadow-xl shadow-stone-200/50 border-4 border-white w-full max-w-lg lg:max-w-none">
              <img
                src="/assets/images/sponsors_hero.jpeg"
                alt="WomenPlay dining, socializing, and playing outdoor lawn games together"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/sponsors_hero.jpg";
                }}
                className="w-full h-auto object-cover max-h-[520px] transform hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2. BRING YOUR BRAND TO LIFE SECTION */}
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-5xl mx-auto text-center">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#261f22] font-semibold tracking-tight">
          Bring Your Brand to Life
        </h2>

        {/* Small gold ornament divider */}
        <div className="flex items-center justify-center gap-3 my-5">
          <span className="w-8 h-[1px] bg-[#b4804d]/40"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#b4804d]"></span>
          <span className="w-8 h-[1px] bg-[#b4804d]/40"></span>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto text-xs sm:text-sm md:text-[15px] text-slate-700 leading-relaxed font-sans mb-8">
          <p>
            We love sponsorships and partnerships that go beyond simply placing a logo on a banner.
          </p>
          <p>
            Whether you have a product, service, experience, giveaway or creative idea, we'd love to explore how we can bring your brand to life across WomenPlay experiences.
          </p>
          <p>
            Think product activations, event integrations, prizes, samples, branded moments, giveaways and other playful ways to put your brand directly in front of our growing community of women.
          </p>
        </div>

        {/* Tags / Categories with Bullet Separators */}
        <div className="space-y-2.5 text-xs sm:text-sm md:text-[15px] font-sans font-medium text-[#b04a68]">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>Financial Sponsorship</span>
            <span className="text-[#b04a68]/40">•</span>
            <span>Event Sponsorship</span>
            <span className="text-[#b04a68]/40">•</span>
            <span>Product Activations</span>
            <span className="text-[#b04a68]/40">•</span>
            <span>In-Kind Support</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>Prizes &amp; Giveaways</span>
            <span className="text-[#b04a68]/40">•</span>
            <span>Brand Partnerships</span>
          </div>
        </div>
      </section>

      {/* 3. TELL US ABOUT YOUR BRAND (FORM SECTION) */}
      <section id="sponsorship-inquiry-form" className="py-12 md:py-20 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#261f22] font-semibold tracking-tight">
            Tell Us About Your Brand
          </h2>

          {/* Small gold ornament divider */}
          <div className="flex items-center justify-center gap-3 my-4">
            <span className="w-8 h-[1px] bg-[#b4804d]/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#b4804d]"></span>
            <span className="w-8 h-[1px] bg-[#b4804d]/40"></span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-sans max-w-lg mx-auto">
            We'd love to learn more about your brand and how we can create something amazing together.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white border border-[#eddcd4] p-8 md:p-12 rounded-3xl text-center space-y-5 shadow-sm animate-fadeIn max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-[#261f22]">Thank You for Reaching Out!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your sponsorship &amp; partnership inquiry has been received. Our team will review your proposal and contact you shortly to begin the conversation.
              </p>
            </div>

            <div className="bg-[#fcfaf7] p-5 rounded-2xl border border-[#f0e8dc] text-left text-xs space-y-2 text-slate-700 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Company:</span>
                <span className="font-bold text-slate-900">{formData.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Contact Person:</span>
                <span className="font-semibold text-slate-900">{formData.contactName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Interest:</span>
                <span className="font-semibold text-[#b04a68]">{formData.partnershipInterest || "Brand Partnership"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Preferred Contact:</span>
                <span className="font-semibold text-slate-900">{formData.preferredContact || "Email"}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    companyName: "",
                    contactName: "",
                    email: "",
                    phone: "",
                    website: "",
                    partnershipInterest: "",
                    opportunityInterest: "",
                    idea: "",
                    preferredContact: "",
                    consent: true
                  });
                }}
                className="px-6 py-2.5 rounded-full bg-[#b04a68] text-white font-medium text-xs tracking-wider uppercase shadow-sm hover:bg-[#963b54] transition"
              >
                Submit Another Inquiry
              </button>
              <button
                onClick={onNavigateHome}
                className="px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 font-medium text-xs tracking-wider uppercase hover:bg-slate-200 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl mx-auto font-sans text-left">
            
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Row 1: Company Name & Contact Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1.5">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#e5ddd3] bg-white text-slate-800 text-xs sm:text-sm focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] outline-none transition shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#e5ddd3] bg-white text-slate-800 text-xs sm:text-sm focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] outline-none transition shadow-xs"
                />
              </div>
            </div>

            {/* Row 2: Business Email Address & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1.5">
                  Business Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#e5ddd3] bg-white text-slate-800 text-xs sm:text-sm focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] outline-none transition shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#e5ddd3] bg-white text-slate-800 text-xs sm:text-sm focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] outline-none transition shadow-xs"
                />
              </div>
            </div>

            {/* Row 3: Company Website or Social Media */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1.5">
                Company Website or Social Media
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#e5ddd3] bg-white text-slate-800 text-xs sm:text-sm focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] outline-none transition shadow-xs"
              />
            </div>

            {/* Row 4: SPONSORSHIP OR PARTNERSHIP INTEREST & OPPORTUNITY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  SPONSORSHIP OR PARTNERSHIP INTEREST *
                </label>
                <select
                  required
                  value={formData.partnershipInterest}
                  onChange={(e) => setFormData({ ...formData, partnershipInterest: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#e5ddd3] bg-white text-slate-800 text-xs sm:text-sm focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] outline-none transition shadow-xs cursor-pointer"
                >
                  <option value="">Select an option</option>
                  <option value="Financial Sponsorship">Financial Sponsorship</option>
                  <option value="Event Sponsorship">Event Sponsorship</option>
                  <option value="Product Activations">Product Activations</option>
                  <option value="In-Kind Support">In-Kind Support</option>
                  <option value="Prizes & Giveaways">Prizes &amp; Giveaways</option>
                  <option value="Brand Partnerships">Brand Partnerships</option>
                  <option value="Other / Custom Collaboration">Other / Custom Collaboration</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  WHICH WOMENPLAY OPPORTUNITY INTERESTS YOU?
                </label>
                <select
                  value={formData.opportunityInterest}
                  onChange={(e) => setFormData({ ...formData, opportunityInterest: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#e5ddd3] bg-white text-slate-800 text-xs sm:text-sm focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] outline-none transition shadow-xs cursor-pointer"
                >
                  <option value="">Select an option</option>
                  <option value="Launch Experience & Special Events">Launch Experience &amp; Special Events</option>
                  <option value="Games & Social Gatherings">Games &amp; Social Gatherings</option>
                  <option value="Travel & Lifestyle Experiences">Travel &amp; Lifestyle Experiences</option>
                  <option value="Digital & Community Activations">Digital &amp; Community Activations</option>
                  <option value="All WomenPlay Experiences">All WomenPlay Experiences</option>
                  <option value="General Brand Partnership">General Brand Partnership</option>
                </select>
              </div>
            </div>

            {/* Row 5: TELL US ABOUT YOUR SPONSORSHIP OR PARTNERSHIP IDEA */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                TELL US ABOUT YOUR SPONSORSHIP OR PARTNERSHIP IDEA *
              </label>
              <textarea
                required
                rows={4}
                placeholder="What would you like to offer?&#10;product, service, experience, giveaway, prize, sponsorship or creative collaboration"
                value={formData.idea}
                onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#e5ddd3] bg-white text-slate-800 text-xs sm:text-sm focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] outline-none transition shadow-xs resize-y"
              />
            </div>

            {/* Row 6: Preferred Contact Method */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Contact Method
              </label>
              <select
                value={formData.preferredContact}
                onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#e5ddd3] bg-white text-slate-800 text-xs sm:text-sm focus:border-[#b04a68] focus:ring-1 focus:ring-[#b04a68] outline-none transition shadow-xs cursor-pointer"
              >
                <option value="">Select an option</option>
                <option value="Email">Email</option>
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Virtual Meeting (Zoom / Google Meet)">Virtual Meeting (Zoom / Google Meet)</option>
              </select>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2 space-y-1">
              <label className="flex items-start space-x-2.5 cursor-pointer text-xs text-slate-700 select-none">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={(e) => {
                    setFormData({ ...formData, consent: e.target.checked });
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="mt-0.5 rounded border-slate-300 text-[#b04a68] accent-[#b04a68] focus:ring-[#b04a68] w-4 h-4 cursor-pointer"
                />
                <span className="font-medium text-slate-800">
                  I consent to be contacted regarding this inquiry. <span className="text-[#b04a68] font-bold">*</span>
                </span>
              </label>
              <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                We respect your privacy. Your information will only be used to respond to your inquiry.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6 text-center space-y-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-[#b04a68] hover:bg-[#963b54] text-white font-sans font-semibold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT SPONSORSHIP OR PARTNERSHIP INQUIRY</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] sm:text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                <p>Submitting this form begins a conversation.</p>
                <p>Sponsorship and partnership opportunities are discussed and customized directly with each interested organization.</p>
              </div>
            </div>

          </form>
        )}
      </section>

      {/* 4. LET'S PLAY TOGETHER (BOTTOM CTA WITH FLANKING IMAGES) */}
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="bg-[#fcfaf7] border border-[#f0e8dc] rounded-3xl md:rounded-[36px] p-6 sm:p-10 md:p-12 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Photo - Arched Rounded */}
            <div className="md:col-span-3 flex justify-center order-2 md:order-1">
              <div className="w-44 h-44 sm:w-52 sm:h-52 md:w-full md:h-64 rounded-3xl md:rounded-t-[80px] md:rounded-b-2xl overflow-hidden shadow-md border-2 border-white">
                <img
                  src="/assets/images/sponsor_1.jpeg"
                  alt="Women enjoying friendship and laughter outdoors"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/sponsor_1.jpeg";
                  }}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Center Content */}
            <div className="md:col-span-6 text-center space-y-4 order-1 md:order-2">
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#261f22] font-semibold tracking-tight">
                Let's Play Together!
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-md mx-auto">
                Interested in sponsoring or partnering with WomenPlay.Org? We'd be happy to connect. Reach out by email and chat about creative ways we can showcase your product or service across WomenPlay experiences.
              </p>

              <div className="pt-2">
                <a
                  href="mailto:hello@womenplay.org"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#b04a68] hover:bg-[#963b54] text-white font-sans font-semibold text-xs tracking-wider uppercase shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                >
                  <span>EMAIL US TO CONNECT</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-1">
                <a
                  href="mailto:hello@womenplay.org"
                  className="text-xs sm:text-sm text-slate-700 hover:text-[#b04a68] font-medium transition underline-offset-4 hover:underline"
                >
                  hello@womenplay.org
                </a>
              </div>
            </div>

            {/* Right Photo - Arched Rounded */}
            <div className="md:col-span-3 flex justify-center order-3">
              <div className="w-44 h-44 sm:w-52 sm:h-52 md:w-full md:h-64 rounded-3xl md:rounded-t-[80px] md:rounded-b-2xl overflow-hidden shadow-md border-2 border-white">
                <img
                  src="/assets/images/sponsor_2.jpeg"
                  alt="Women cheering and toasting drinks"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/sponsor_2.jpeg";
                  }}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

