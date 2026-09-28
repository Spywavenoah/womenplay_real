import React from "react";
import { DollarSign, Loader2, Check, Sparkles, Plus, Trash2 } from "lucide-react";

export default function AdminStripeSettings() {
  const [stripeMode, setStripeMode] = React.useState<"test" | "live">("test");
  const [stripeTestPublicKey, setStripeTestPublicKey] = React.useState("");
  const [stripeTestSecretKey, setStripeTestSecretKey] = React.useState("");
  const [stripeLivePublicKey, setStripeLivePublicKey] = React.useState("");
  const [stripeLiveSecretKey, setStripeLiveSecretKey] = React.useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = React.useState("");
  const [isSubscriptionRequired, setIsSubscriptionRequired] = React.useState(false);
  const [loadingSettings, setLoadingSettings] = React.useState(false);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [testingStripe, setTestingStripe] = React.useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = React.useState("");
  const [stripeTestResult, setStripeTestResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [isStripeConfigured, setIsStripeConfigured] = React.useState<boolean>(false);
  const [activeStripeMode, setActiveStripeMode] = React.useState<string>("none");

  const [carouselSlides, setCarouselSlides] = React.useState<any[]>([]);
  const [newSlideTitle, setNewSlideTitle] = React.useState("");
  const [newSlideImage, setNewSlideImage] = React.useState("");
  const [newSlideDesc, setNewSlideDesc] = React.useState("");

  const loadSettingsAndSlides = async () => {
    setLoadingSettings(true);
    try {
      const setRes = await fetch("/api/settings");
      const setData = await setRes.json();
      setStripeMode(setData.stripeMode || "test");
      setStripeTestPublicKey(setData.stripeTestPublicKey || "");
      setStripeTestSecretKey(setData.stripeTestSecretKey || "");
      setStripeLivePublicKey(setData.stripeLivePublicKey || "");
      setStripeLiveSecretKey(setData.stripeLiveSecretKey || "");
      setStripeWebhookSecret(setData.stripeWebhookSecret || "");
      setIsSubscriptionRequired(!!setData.isSubscriptionRequired);
      setIsStripeConfigured(!!setData.isStripeConfigured);
      setActiveStripeMode(setData.activeStripeMode || "none");

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
    setStripeTestResult(null);
    try {
      const activePub = stripeMode === "live" ? stripeLivePublicKey : stripeTestPublicKey;
      const activeSec = stripeMode === "live" ? stripeLiveSecretKey : stripeTestSecretKey;
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeMode,
          stripeTestPublicKey,
          stripeTestSecretKey,
          stripeLivePublicKey,
          stripeLiveSecretKey,
          stripeWebhookSecret,
          stripePublicKey: activePub,
          stripeSecretKey: activeSec,
          isSubscriptionRequired
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsSavedMsg("Stripe Credentials & Subscription requirements saved successfully!");
        setIsStripeConfigured(!!data.isStripeConfigured);
        setActiveStripeMode(data.activeStripeMode || "none");
        setTimeout(() => setSettingsSavedMsg(""), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestStripeConnection = async () => {
    setTestingStripe(true);
    setStripeTestResult(null);
    try {
      const activePub = stripeMode === "live" ? stripeLivePublicKey : stripeTestPublicKey;
      const activeSec = stripeMode === "live" ? stripeLiveSecretKey : stripeTestSecretKey;
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeMode,
          stripeTestPublicKey,
          stripeTestSecretKey,
          stripeLivePublicKey,
          stripeLiveSecretKey,
          stripeWebhookSecret,
          stripePublicKey: activePub,
          stripeSecretKey: activeSec,
          isSubscriptionRequired
        })
      });

      const res = await fetch("/api/settings/test-stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStripeTestResult({ success: true, message: data.message });
        setIsStripeConfigured(true);
        setActiveStripeMode(data.mode);
      } else {
        setStripeTestResult({ success: false, message: data.error || "Failed to verify Stripe connection." });
        setIsStripeConfigured(false);
      }
    } catch (e: any) {
      setStripeTestResult({ success: false, message: e.message || "Network error while testing Stripe connection." });
    } finally {
      setTestingStripe(false);
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
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-pink" />
                <span>Stripe & Membership Gateway Settings</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure Stripe credentials and toggle membership subscription requirements.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isStripeConfigured ? (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  activeStripeMode === "live"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    activeStripeMode === "live" ? "bg-emerald-500" : "bg-amber-500"
                  }`} />
                  Stripe Connected ({activeStripeMode.toUpperCase()})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Stripe Not Configured
                </span>
              )}
            </div>
          </div>

          {settingsSavedMsg && (
            <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl border border-emerald-100 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{settingsSavedMsg}</span>
            </div>
          )}

          {stripeTestResult && (
            <div className={`text-xs font-semibold p-3.5 rounded-xl border flex items-start space-x-2 ${
              stripeTestResult.success
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}>
              {stripeTestResult.success ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <span className="w-4 h-4 text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
              )}
              <span className="leading-relaxed">{stripeTestResult.message}</span>
            </div>
          )}

          {loadingSettings ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-pink" />
              <span>Fetching system settings...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs text-left">
              {/* Stripe Mode Selector */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider block">Stripe Operating Environment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStripeMode("test")}
                    className={`py-2 px-3 rounded-lg font-bold text-xs transition border ${
                      stripeMode === "test"
                        ? "bg-amber-50 text-amber-900 border-amber-300 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Sandbox / Test Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setStripeMode("live")}
                    className={`py-2 px-3 rounded-lg font-bold text-xs transition border ${
                      stripeMode === "live"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Production / Live Mode
                  </button>
                </div>
              </div>

              {stripeMode === "test" ? (
                <div className="space-y-4 p-4 rounded-xl border border-amber-200 bg-amber-50/30">
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">Sandbox API Keys</span>
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Test Publishable Key</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                      placeholder="pk_test_..."
                      value={stripeTestPublicKey}
                      onChange={(e) => setStripeTestPublicKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Test Secret Key</label>
                    <input
                      type="password"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                      placeholder="sk_test_..."
                      value={stripeTestSecretKey}
                      onChange={(e) => setStripeTestSecretKey(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Production Live API Keys</span>
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Live Publishable Key</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                      placeholder="pk_live_..."
                      value={stripeLivePublicKey}
                      onChange={(e) => setStripeLivePublicKey(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Live Secret Key</label>
                    <input
                      type="password"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                      placeholder="sk_live_..."
                      value={stripeLiveSecretKey}
                      onChange={(e) => setStripeLiveSecretKey(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="font-extrabold text-slate-600 uppercase tracking-wider block text-[10px]">Stripe Webhook Signing Secret</label>
                <input
                  type="password"
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-slate-800 font-mono transition text-xs"
                  placeholder="whsec_..."
                  value={stripeWebhookSecret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                />
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

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={savingSettings || testingStripe} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold p-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                  {savingSettings ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving Configuration...</span></>
                  ) : (
                    <span>Save System Settings</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleTestStripeConnection}
                  disabled={savingSettings || testingStripe}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold p-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
                >
                  {testingStripe ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-pink" />
                      <span>Verifying Stripe...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-brand-pink" />
                      <span>Test Stripe Connection</span>
                    </>
                  )}
                </button>
              </div>
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
