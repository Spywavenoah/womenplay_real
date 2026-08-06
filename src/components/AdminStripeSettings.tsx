import React from "react";
import { DollarSign, Loader2, Check, Sparkles, Plus, Trash2 } from "lucide-react";

export default function AdminStripeSettings() {
  const [stripePublicKey, setStripePublicKey] = React.useState("");
  const [stripeSecretKey, setStripeSecretKey] = React.useState("");
  const [isSubscriptionRequired, setIsSubscriptionRequired] = React.useState(false);
  const [loadingSettings, setLoadingSettings] = React.useState(false);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = React.useState("");

  const [carouselSlides, setCarouselSlides] = React.useState<any[]>([]);
  const [newSlideTitle, setNewSlideTitle] = React.useState("");
  const [newSlideImage, setNewSlideImage] = React.useState("");
  const [newSlideDesc, setNewSlideDesc] = React.useState("");

  const loadSettingsAndSlides = async () => {
    setLoadingSettings(true);
    try {
      const setRes = await fetch("/api/settings");
      const setData = await setRes.json();
      setStripePublicKey(setData.stripePublicKey || "");
      setStripeSecretKey(setData.stripeSecretKey || "");
      setIsSubscriptionRequired(!!setData.isSubscriptionRequired);

      const slideRes = await fetch("/api/carousel");
      const slideData = await slideRes.json();
      setCarouselSlides(slideData || []);
    } catch (e) {
      console.error("Error fetching configurations:", e);
    } finally {
      setLoadingSettings(false);
    }
  };

  React.useEffect(() => {
    loadSettingsAndSlides();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSavedMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripePublicKey, stripeSecretKey, isSubscriptionRequired })
      });
      if (res.ok) {
        setSettingsSavedMsg("Stripe Credentials & Subscription requirements updated successfully!");
        setTimeout(() => setSettingsSavedMsg(""), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideImage || !newSlideTitle) return;
    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: newSlideImage, title: newSlideTitle, description: newSlideDesc })
      });
      if (res.ok) {
        setNewSlideTitle("");
        setNewSlideImage("");
        setNewSlideDesc("");
        loadSettingsAndSlides();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    try {
      const res = await fetch(`/api/carousel/${id}`, { method: "DELETE" });
      if (res.ok) loadSettingsAndSlides();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8" id="panel-admin-settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Configuration Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-pink" />
              <span>Stripe & Membership Gateway Settings</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configure Stripe credentials and toggle membership subscription requirements.</p>
          </div>

          {settingsSavedMsg && (
            <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl border border-emerald-100 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{settingsSavedMsg}</span>
            </div>
          )}

          {loadingSettings ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-pink" />
              <span>Fetching system settings...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs text-left">
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-600 uppercase tracking-wider block">Stripe Publishable Key</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:bg-white text-slate-800 font-mono transition" placeholder="pk_test_..." value={stripePublicKey} onChange={(e) => setStripePublicKey(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-600 uppercase tracking-wider block">Stripe Secret Key</label>
                <input type="password" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:bg-white text-slate-800 font-mono transition" placeholder="sk_test_..." value={stripeSecretKey} onChange={(e) => setStripeSecretKey(e.target.value)} />
              </div>
              <div className="pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[80%]">
                    <label className="font-extrabold text-slate-700 uppercase tracking-wider block">Require Subscription for New Registrations</label>
                    <p className="text-slate-400 text-[11px] leading-relaxed">When enabled, new users are registered as <strong>PENDING</strong> and cannot access full portal benefits until they complete subscription payment.</p>
                  </div>
                  <button type="button" onClick={() => setIsSubscriptionRequired(!isSubscriptionRequired)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isSubscriptionRequired ? "bg-brand-pink" : "bg-slate-200"}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isSubscriptionRequired ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
              <button type="submit" disabled={savingSettings} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                {savingSettings ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving Configuration...</span></>
                ) : (
                  <span>Save System Settings</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Carousel Slider Slide Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 luxury-shadow space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-gold-dark" />
              <span>Homepage Slider Carousel Settings</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Add, preview, and delete background images and overlays on the home page slider.</p>
          </div>

          <form onSubmit={handleAddSlide} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4 text-xs text-left">
            <p className="font-extrabold text-slate-700 uppercase tracking-wider">Add Premium Slide</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Slide Title</label>
                <input type="text" className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none text-slate-800" placeholder="e.g. Empower Your Influence" required value={newSlideTitle} onChange={(e) => setNewSlideTitle(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Image URL</label>
                <input type="url" className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none text-slate-800" placeholder="https://images.unsplash.com/..." required value={newSlideImage} onChange={(e) => setNewSlideImage(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Description Paragraph</label>
              <textarea className="w-full bg-white border border-slate-200 p-2.5 rounded-lg focus:outline-none text-slate-800 h-16" placeholder="Brief description that pops with luxury feel..." value={newSlideDesc} onChange={(e) => setNewSlideDesc(e.target.value)} />
            </div>
            <button type="submit" className="bg-brand-pink text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-pink-dark transition cursor-pointer text-[11px] flex items-center gap-1">
              <Plus className="w-4 h-4" />
              <span>Publish Slide to Slider</span>
            </button>
          </form>

          <div className="space-y-3">
            <p className="font-extrabold text-slate-700 uppercase tracking-wider text-xs text-left">Currently Published Slides ({carouselSlides.length})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carouselSlides.map((slide, sIdx) => (
                <div key={slide.id || sIdx} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50 flex flex-col">
                  <div className="h-28 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${slide.image})` }}>
                    <div className="absolute inset-0 bg-slate-950/40 flex items-end p-2.5">
                      <p className="text-white font-bold text-xs truncate max-w-[80%]">{slide.title}</p>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-slate-400 italic line-clamp-2 text-left flex-1">"{slide.description || "No description provided."}"</p>
                    <button type="button" onClick={() => handleDeleteSlide(slide.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition" title="Delete slide">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
