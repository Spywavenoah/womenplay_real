import React from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { User, MembershipTier } from "../types";

interface PortalSubscriptionProps {
  currentUser: User;
  onRefreshData: () => Promise<void>;
}

export default function PortalSubscription({ currentUser, onRefreshData }: PortalSubscriptionProps) {
  // Subscription Checkout state
  const [selectedTier, setSelectedTier] = React.useState<MembershipTier | null>(null);
  const [checkoutMethod, setCheckoutMethod] = React.useState<"Credit Card" | "Bank Transfer">("Credit Card");
  const [checkoutCardName, setCheckoutCardName] = React.useState("");
  const [checkoutCardNo, setCheckoutCardNo] = React.useState("");
  const [checkoutBank, setCheckoutBank] = React.useState("");
  const [processingPayment, setProcessingPayment] = React.useState(false);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);
  const [subscriptionReceipt, setSubscriptionReceipt] = React.useState<any>(null);

  // Active Subscription details
  const [activeSub, setActiveSub] = React.useState<any>(null);
  const [loadingSub, setLoadingSub] = React.useState(false);
  const [unsubscribing, setUnsubscribing] = React.useState(false);

  const fetchActiveSubscription = async () => {
    if (!currentUser) return;
    setLoadingSub(true);
    try {
      const res = await fetch(`/api/members/${currentUser.id}/subscription`);
      if (res.ok) {
        const data = await res.json();
        setActiveSub(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSub(false);
    }
  };

  React.useEffect(() => {
    if (currentUser.membershipTier === "PREMIUM" || currentUser.membershipTier === "ELITE") {
      fetchActiveSubscription();
    }
  }, [currentUser.membershipTier]);

  const handleUnsubscribe = async () => {
    if (!confirm("Are you sure you want to cancel your recurring premium subscription? This will instantly downgrade your access to the basic plan.")) return;
    setUnsubscribing(true);
    try {
      const res = await fetch("/api/members/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Your subscription has been successfully cancelled.");
        setActiveSub(null);
        if (onRefreshData) {
          await onRefreshData();
        }
      } else {
        alert(data.error || "Failed to unsubscribe");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "An error occurred");
    } finally {
      setUnsubscribing(false);
    }
  };

  // Subscription Payment Process
  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setProcessingPayment(true);
    setPaymentSuccess(false);

    let fee = 100;
    if (selectedTier === MembershipTier.ELITE) fee = 250;

    try {
      const res = await fetch("/api/members/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          tier: selectedTier,
          amount: fee,
          method: checkoutMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubscriptionReceipt(data.payment);
        setPaymentSuccess(true);
        await onRefreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-8" id="panel-subscription">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-display font-extrabold text-slate-900">Manage Your WomenPlay Membership Tier</h2>
        <p className="text-slate-500 text-xs">WomenPlay offers role-based tier allocations catering to distinguished levels of sponsorship and corporate preparatories.</p>
      </div>

      {/* Active Subscription Overview Card */}
      {(currentUser.membershipTier === "PREMIUM" || currentUser.membershipTier === "ELITE") && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-brand-gold-dark/20 text-white rounded-2xl p-6 border border-slate-800 luxury-shadow relative overflow-hidden text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider font-extrabold bg-brand-gold text-slate-900 px-3 py-1 rounded-full">
              Active VIP Subscription
            </span>
            <h3 className="text-xl font-extrabold flex items-center gap-2">
              <span>{currentUser.membershipTier} Tier Member</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <div className="text-slate-300 text-xs space-y-1">
              <p className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-gold animate-bounce" />
                <span>Status: <strong className="text-emerald-400 uppercase">{currentUser.membershipStatus || "ACTIVE"}</strong></span>
              </p>
              {activeSub && (
                <>
                  <p>Billing Cycle: <strong>{activeSub.interval === "month" ? "Monthly" : "Annual"} Recurring</strong></p>
                  <p>Next Payment Due: <strong>{new Date(activeSub.nextBillingDate).toLocaleDateString()}</strong></p>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
            <button
              onClick={handleUnsubscribe}
              disabled={unsubscribing}
              className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              {unsubscribing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Cancel Premium Subscription</span>
              )}
            </button>
            <p className="text-[10px] text-slate-400 italic text-center md:text-left">Downgrades instantly to Free plan.</p>
          </div>
        </div>
      )}

      {paymentSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-4 text-center">
          <Check className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Subscription Upgraded Successfully!</h3>
          <p className="text-slate-600 text-xs">Welcome to the prestigious <span className="font-bold text-brand-pink">{currentUser.membershipTier}</span> layer of the WomenPlay Network.</p>

          {subscriptionReceipt && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 max-w-sm mx-auto text-left font-mono text-[11px] space-y-2">
              <p className="font-bold text-center border-b pb-2">WOMENPLAY OFFICIAL RECEIPT</p>
              <p><strong>Receipt:</strong> {subscriptionReceipt.receiptNumber}</p>
              <p><strong>Tier:</strong> {subscriptionReceipt.itemId}</p>
              <p><strong>Amount:</strong> ${subscriptionReceipt.amount}</p>
              <p><strong>Transaction:</strong> {subscriptionReceipt.transactionId}</p>
              <p><strong>Date:</strong> {new Date(subscriptionReceipt.createdAt).toLocaleDateString()}</p>
              <p className="text-center pt-2 border-t text-[9px] text-slate-400">THANK YOU FOR YOUR PRESTIGIOUS SPONSORSHIP</p>
            </div>
          )}

          <button
            onClick={() => {
              setPaymentSuccess(false);
              setSelectedTier(null);
            }}
            id="btn-subscription-done"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition"
          >
            Continue Browsing Portal
          </button>
        </div>
      ) : selectedTier ? (
        <form onSubmit={handleSubscriptionSubmit} className="space-y-6 max-w-lg">
          <div className="flex justify-between items-center bg-brand-gold-light/40 border border-brand-gold/30 p-4 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Selected Tier Upgrade</span>
              <h3 className="font-bold text-slate-800 text-base">{selectedTier} Membership</h3>
            </div>
            <span className="text-lg font-bold text-brand-gold-dark">
              {selectedTier === MembershipTier.PREMIUM ? "$100" : "$250"}
            </span>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-700 block">Select Secure Gateway Method</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCheckoutMethod("Credit Card")}
                id="btn-sub-method-card"
                className={`p-4 rounded-xl border text-center font-bold text-xs transition ${
                  checkoutMethod === "Credit Card"
                    ? "border-brand-pink bg-brand-pink-light/30 text-brand-pink"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setCheckoutMethod("Bank Transfer")}
                id="btn-sub-method-bank"
                className={`p-4 rounded-xl border text-center font-bold text-xs transition ${
                  checkoutMethod === "Bank Transfer"
                    ? "border-brand-pink bg-brand-pink-light/30 text-brand-pink"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                Direct Bank Transfer
              </button>
            </div>
          </div>

          {checkoutMethod === "Credit Card" ? (
            <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Name on Card</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={checkoutCardName}
                  onChange={(e) => setCheckoutCardName(e.target.value)}
                  id="input-sub-cardname"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="•••• •••• •••• ••••"
                  value={checkoutCardNo}
                  onChange={(e) => setCheckoutCardNo(e.target.value)}
                  id="input-sub-cardno"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Bank Routing / Account Holder Name</label>
                <input
                  type="text"
                  required
                  placeholder="Chase Executive / Jane Doe"
                  value={checkoutBank}
                  onChange={(e) => setCheckoutBank(e.target.value)}
                  id="input-sub-bank"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">Please execute transfer to WomenPlay Global routing, using your unique membership ID as reference.</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSelectedTier(null)}
              id="btn-sub-cancel"
              className="flex-1 py-3 px-6 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Back to Tiers
            </button>
            <button
              type="submit"
              disabled={processingPayment}
              id="btn-sub-confirm"
              className="flex-1 py-3 px-6 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Gateway...</span>
                </>
              ) : (
                <span>Complete Secure Upgrade</span>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Premium Tier */}
          <div className="border border-brand-pink-mid/30 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden bg-gradient-to-b from-brand-pink-light/20 to-white hover:border-brand-pink transition duration-350 shadow-sm">
            <div className="space-y-4">
              <span className="text-[9px] uppercase tracking-widest font-extrabold bg-brand-pink text-white px-2.5 py-0.5 rounded-full">PREMIUM TIER</span>
              <h3 className="text-xl font-bold text-slate-900">$100 <span className="text-xs text-slate-400 font-normal">/ Annually</span></h3>
              <p className="text-xs text-slate-500">Fosters foundational networking and key accesses to annual sessions.</p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 text-left">
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Book standard passes for summits</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Publish breakthroughs to timeline</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Interactive community feed access</li>
              </ul>
            </div>

            <button
              disabled={currentUser.membershipTier === "PREMIUM" || currentUser.membershipTier === "ELITE"}
              onClick={() => setSelectedTier(MembershipTier.PREMIUM)}
              id="btn-select-tier-premium"
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition ${
                currentUser.membershipTier === "PREMIUM"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : currentUser.membershipTier === "ELITE"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-brand-pink hover:bg-brand-pink-dark text-white"
              }`}
            >
              {currentUser.membershipTier === "PREMIUM" || currentUser.membershipTier === "ELITE" ? "Active / Upgraded" : "Select Premium Tier"}
            </button>
          </div>

          {/* Elite Tier */}
          <div className="border border-brand-gold rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden bg-gradient-to-b from-brand-gold-light/40 to-white hover:border-brand-gold-dark transition duration-350 shadow-md">
            <div className="absolute top-0 right-0 bg-brand-gold-dark text-white text-[9px] font-bold px-3 py-1 uppercase rounded-bl-xl tracking-wider">RECOMMENDED</div>
            <div className="space-y-4">
              <span className="text-[9px] uppercase tracking-widest font-extrabold bg-brand-gold-dark text-white px-2.5 py-0.5 rounded-full">ELITE SPONSOR TIER</span>
              <h3 className="text-xl font-bold text-slate-900">$250 <span className="text-xs text-slate-400 font-normal">/ Annually</span></h3>
              <p className="text-xs text-slate-500">Perfect for senior board members and aspiring non-executive directors.</p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2 text-left">
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Premium front-row VIP gold badges</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> Elite AI Boardroom mentoring access</li>
                <li className="flex items-center"><Check className="w-3.5 h-3.5 text-emerald-500 mr-2" /> 1-on-1 sponsorship prep support</li>
              </ul>
            </div>

            <button
              disabled={currentUser.membershipTier === "ELITE"}
              onClick={() => setSelectedTier(MembershipTier.ELITE)}
              id="btn-select-tier-elite"
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition ${
                currentUser.membershipTier === "ELITE"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "gold-button-gradient text-slate-900 shadow-md"
              }`}
            >
              {currentUser.membershipTier === "ELITE" ? "Active / Active" : "Select Elite Tier"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
