import React from "react";
import { Award, Plus, Trash2, Check } from "lucide-react";
import { MembershipBadge } from "../types";

interface AdminMembershipBadgesProps {
  membershipBadgesList: MembershipBadge[];
  onLoadAdminData: () => Promise<void>;
}

export default function AdminMembershipBadges({
  membershipBadgesList,
  onLoadAdminData
}: AdminMembershipBadgesProps) {
  const [editingBadge, setEditingBadge] = React.useState<MembershipBadge | null>(null);
  const [isCreatingBadge, setIsCreatingBadge] = React.useState(false);
  const [badgeTitle, setBadgeTitle] = React.useState("");
  const [badgeCost, setBadgeCost] = React.useState(0);
  const [badgeCodePrefix, setBadgeCodePrefix] = React.useState("");
  const [badgeBgColor, setBadgeBgColor] = React.useState("#1E293B");
  const [badgeTextColor, setBadgeTextColor] = React.useState("#FFFFFF");
  const [badgeBenefits, setBadgeBenefits] = React.useState("");
  const [badgeActionLoading, setBadgeActionLoading] = React.useState(false);

  const resetBadgeForm = () => {
    setEditingBadge(null);
    setIsCreatingBadge(false);
    setBadgeTitle("");
    setBadgeCost(0);
    setBadgeCodePrefix("");
    setBadgeBgColor("#1E293B");
    setBadgeTextColor("#FFFFFF");
    setBadgeBenefits("");
  };

  const openEditBadge = (badge: MembershipBadge) => {
    setEditingBadge(badge);
    setIsCreatingBadge(false);
    setBadgeTitle(badge.title || badge.name || "");
    setBadgeCost(badge.cost);
    setBadgeCodePrefix(badge.codePrefix || "");
    setBadgeBgColor(badge.bgColor || "#1E293B");
    setBadgeTextColor(badge.textColor || "#FFFFFF");
    setBadgeBenefits(badge.benefits.join("\n"));
  };

  const handleSaveBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeTitle.trim() || !badgeCodePrefix.trim()) {
      alert("Title and Prefix are required.");
      return;
    }

    setBadgeActionLoading(true);
    const parsedBenefits = badgeBenefits
      .split("\n")
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const payload = {
      title: badgeTitle,
      cost: Number(badgeCost),
      codePrefix: badgeCodePrefix,
      bgColor: badgeBgColor,
      textColor: badgeTextColor,
      benefits: parsedBenefits
    };

    try {
      let res;
      if (editingBadge) {
        res = await fetch(`/api/membership-badges/${editingBadge.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/membership-badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok) {
        alert(editingBadge ? "Badge updated successfully!" : "New Badge tier created!");
        resetBadgeForm();
        onLoadAdminData();
      } else {
        alert(data.error || "Failed to save badge tier.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error saving membership badge.");
    } finally {
      setBadgeActionLoading(false);
    }
  };

  const handleDeleteBadge = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Membership Badge? Current members holding this status won't be modified but no new members will be able to subscribe to it.")) return;

    setBadgeActionLoading(true);
    try {
      const res = await fetch(`/api/membership-badges/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        alert("Membership Badge deleted successfully.");
        onLoadAdminData();
      } else {
        alert(data.error || "Failed to delete badge.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error deleting badge.");
    } finally {
      setBadgeActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn" id="panel-admin-badges">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Award className="w-5 h-5 text-brand-pink" />
            <span>Membership Badge Tiers & Benefits Manager</span>
          </h2>
          <p className="text-slate-500 text-[11px] mt-1">
            Customize badge aesthetics, prefixes, monthly price points, and member benefits in real-time.
          </p>
        </div>

        {!isCreatingBadge && !editingBadge && (
          <button
            onClick={() => {
              resetBadgeForm();
              setIsCreatingBadge(true);
            }}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Tier</span>
          </button>
        )}
      </div>

      {(isCreatingBadge || editingBadge) && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 luxury-shadow space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              {editingBadge ? `Edit Tier: ${editingBadge.title}` : "Establish New Custom Membership Tier"}
            </h3>
            <button
              onClick={resetBadgeForm}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveBadge} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tier Title</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Sovereign, Diamond Circle"
                  value={badgeTitle}
                  onChange={(e) => setBadgeTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-brand-pink"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Monthly Cost ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 199"
                    value={badgeCost}
                    onChange={(e) => setBadgeCost(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:border-brand-pink"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Badge Code Prefix</label>
                  <input
                    type="text"
                    placeholder="e.g. AURA-VIP, AURA-DIAMOND"
                    value={badgeCodePrefix}
                    onChange={(e) => setBadgeCodePrefix(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold uppercase tracking-wider font-mono focus:outline-none focus:border-brand-pink"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Background Hex</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={badgeBgColor}
                      onChange={(e) => setBadgeBgColor(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={badgeBgColor}
                      onChange={(e) => setBadgeBgColor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center font-mono focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Text/Accent Hex</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={badgeTextColor}
                      onChange={(e) => setBadgeTextColor(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={badgeTextColor}
                      onChange={(e) => setBadgeTextColor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-center font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Badge Aesthetic Preview:</span>
                <div className="flex justify-center py-4">
                  <div
                    style={{ backgroundColor: badgeBgColor, color: badgeTextColor, borderColor: badgeTextColor + "40" }}
                    className="px-6 py-3 rounded-xl border text-center shadow-lg font-bold tracking-widest min-w-[200px]"
                  >
                    <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">{badgeTitle || "Preview Tier"}</p>
                    <p className="text-xs font-mono font-extrabold mt-1">{badgeCodePrefix || "PREFIX"}-XXXXX</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tier Benefits list (one benefit per line)</label>
                <textarea
                  placeholder="e.g. Complimentary entrance to VIP Lounge&#10;Private Concierge Liaison&#10;All summit general admission packages included"
                  value={badgeBenefits}
                  onChange={(e) => setBadgeBenefits(e.target.value)}
                  rows={10}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 font-medium focus:outline-none focus:border-brand-pink"
                  required
                />
              </div>

              <div className="flex justify-end gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={resetBadgeForm}
                  className="py-2.5 px-5 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={badgeActionLoading}
                  className="py-2.5 px-6 bg-brand-pink text-white rounded-xl font-bold transition hover:bg-brand-pink-dark cursor-pointer disabled:opacity-50"
                >
                  {badgeActionLoading ? "Saving Changes..." : editingBadge ? "Save Badge tier" : "Create Badge tier"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membershipBadgesList.map((badge) => (
          <div
            key={badge.id}
            className="bg-white rounded-2xl border border-slate-100 luxury-shadow overflow-hidden flex flex-col hover:border-slate-200 transition"
            id={`badge-card-${badge.id}`}
          >
            <div
              style={{ backgroundColor: badge.bgColor || "#1E293B", color: badge.textColor || "#FFFFFF" }}
              className="p-5 text-center relative border-b border-black/10"
            >
              <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-75">{badge.title}</span>
              <h4 className="text-lg font-extrabold mt-1 font-mono tracking-wider">{badge.codePrefix}-XXXX</h4>
              <div className="absolute top-4 right-4 bg-black/20 text-white rounded-full px-2.5 py-0.5 text-[9px] font-bold">
                ${badge.cost}/mo
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Included Benefits & Privileges:</h5>
                <ul className="space-y-1.5">
                  {badge.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 font-medium">
                      <Check className="w-3.5 h-3.5 text-brand-pink shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openEditBadge(badge)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer text-center"
                >
                  Edit Config
                </button>
                <button
                  onClick={() => handleDeleteBadge(badge.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Delete Membership Tier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
