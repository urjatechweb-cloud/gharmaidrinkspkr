"use client";
import { useEffect, useState } from "react";

const TEXT_FIELDS: [string, string][] = [
  ["heroBadge", "Hero Badge Text"],
  ["menuTitle", "Menu Title"],
  ["menuSubtitle", "Menu Subtitle"],
  ["reserveTitle", "Reserve Title"],
  ["reserveSubtitle", "Reserve Subtitle"],
];

const TOGGLES: [string, string][] = [
  ["showBrands", "Show Brand Spotlight"],
  ["showReserve", "Show Reserve (Luxury) Section"],
  ["showSpecials", "Show Specials"],
  ["showVip", "Show VIP Section"],
  ["showWhyUs", "Show Why Us"],
  ["showHowItWorks", "Show How It Works"],
  ["showContact", "Show Contact"],
];

export default function SettingsAdmin() {
  const [s, setS] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setS);
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else alert("Save failed");
  }

  if (!s) return <div className="p-8 text-white/85">Loading settings…</div>;

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Site Settings</h1>
          <p className="text-white/85 text-sm">Edit homepage text and choose which sections appear — changes go live instantly</p>
        </div>
        <button onClick={save} disabled={saving} className="px-6 py-2.5 btn-gold rounded-xl text-sm disabled:opacity-60">
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-display font-bold text-lg mb-4">Homepage Text</h2>
        <div className="space-y-4">
          {TEXT_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className="text-white/75 text-sm mb-1.5 block">{label}</label>
              <input value={s[key] ?? ""} onChange={(e) => setS({ ...s, [key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/10 focus:border-gold/40 focus:outline-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display font-bold text-lg mb-2">Homepage Sections</h2>
        <p className="text-white/65 text-xs mb-4">Untick a section to hide it from the storefront.</p>
        <div className="divide-y divide-white/5">
          {TOGGLES.map(([key, label]) => (
            <label key={key} className="flex items-center justify-between py-3.5 cursor-pointer group">
              <span className="text-white/85 group-hover:text-white transition-colors">{label}</span>
              <input type="checkbox" checked={!!s[key]} onChange={(e) => setS({ ...s, [key]: e.target.checked })} className="w-4 h-4 accent-[#D4AF37]" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
