"use client";
import { useEffect, useState } from "react";
import MediaUpload from "@/components/admin/MediaUpload";

const PLACEMENTS = ["HERO", "TOP_BAR", "MID_PAGE", "SPONSORED_CARD", "POPUP", "EXIT_INTENT", "FLASH_SALE", "SEASONAL"];
const AUDIENCES = ["ALL", "NEW_VISITORS", "VIP_ONLY", "MOBILE_ONLY"];
const FREQ = ["", "once_per_session", "once_per_day"];
const empty = { title: "", headline: "", subtext: "", buttonLabel: "", linkUrl: "", mediaUrl: "", mediaType: "image", placement: "HERO", audience: "ALL", priority: 0, startAt: "", endAt: "", active: true, frequency: "" };

function toLocal(d: string | null) { return d ? new Date(d).toISOString().slice(0, 16) : ""; }

export default function AdsAdmin() {
  const [ads, setAds] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  async function load() {
    const a = await fetch("/api/banners?admin=1").then((r) => r.json());
    setAds(Array.isArray(a) ? a : []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const method = editing.id ? "PATCH" : "POST";
    const url = editing.id ? `/api/banners/${editing.id}` : "/api/banners";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    if (res.ok) { setEditing(null); load(); } else alert("Save failed");
  }
  async function toggle(ad: any) {
    await fetch(`/api/banners/${ad.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !ad.active }) });
    load();
  }
  async function del(id: string) { if (confirm("Delete this ad?")) { await fetch(`/api/banners/${id}`, { method: "DELETE" }); load(); } }

  const now = Date.now();
  const status = (ad: any) => {
    if (!ad.active) return ["Inactive", "text-white/65"];
    if (ad.startAt && new Date(ad.startAt).getTime() > now) return ["Scheduled", "text-blue-400"];
    if (ad.endAt && new Date(ad.endAt).getTime() < now) return ["Expired", "text-accent"];
    return ["Live", "text-green-400"];
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-display font-bold">Ads & Banners</h1><p className="text-white/85 text-sm">Manage every promotional placement on the storefront</p></div>
        <button onClick={() => setEditing({ ...empty })} className="px-5 py-2.5 btn-gold rounded-xl text-sm">+ Create Ad</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => {
          const [label, color] = status(ad);
          return (
            <div key={ad.id} className="glass rounded-2xl overflow-hidden">
              {ad.mediaUrl && <img src={ad.mediaUrl} alt="" className="w-full h-28 object-cover" />}
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold uppercase font-bold">{ad.placement}</span>
                  <span className={`text-xs ${color}`}>● {label}</span>
                </div>
                <div className="font-semibold text-sm mb-0.5">{ad.title}</div>
                <div className="text-white/85 text-xs mb-2 truncate">{ad.headline}</div>
                <div className="text-white/65 text-[11px] mb-3">👁 {ad.impressions} · 🖱 {ad.clicks} clicks · CTR {ad.impressions ? Math.round((ad.clicks / ad.impressions) * 1000) / 10 : 0}%</div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setEditing({ ...ad, startAt: toLocal(ad.startAt), endAt: toLocal(ad.endAt), headline: ad.headline || "", subtext: ad.subtext || "", buttonLabel: ad.buttonLabel || "", linkUrl: ad.linkUrl || "", mediaUrl: ad.mediaUrl || "", frequency: ad.frequency || "" })} className="text-gold hover:underline">Edit</button>
                  <button onClick={() => toggle(ad)} className="text-white/75 hover:underline">{ad.active ? "Disable" : "Enable"}</button>
                  <button onClick={() => del(ad.id)} className="text-accent hover:underline">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
        {ads.length === 0 && <p className="text-white/65 col-span-3 text-center py-12">No ads yet. Create your first promotion.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-display text-xl font-bold mb-4">{editing.id ? "Edit" : "Create"} Ad</h2>
            <div className="space-y-3">
              <F l="Internal Title *"><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="inp" /></F>
              <div className="grid grid-cols-2 gap-3">
                <F l="Placement"><select value={editing.placement} onChange={(e) => setEditing({ ...editing, placement: e.target.value })} className="inp">{PLACEMENTS.map((p) => <option key={p}>{p}</option>)}</select></F>
                <F l="Audience"><select value={editing.audience} onChange={(e) => setEditing({ ...editing, audience: e.target.value })} className="inp">{AUDIENCES.map((a) => <option key={a}>{a}</option>)}</select></F>
              </div>
              <F l="Headline"><input value={editing.headline} onChange={(e) => setEditing({ ...editing, headline: e.target.value })} className="inp" /></F>
              <F l="Subtext"><input value={editing.subtext} onChange={(e) => setEditing({ ...editing, subtext: e.target.value })} className="inp" /></F>
              <div className="grid grid-cols-2 gap-3">
                <F l="Button Label"><input value={editing.buttonLabel} onChange={(e) => setEditing({ ...editing, buttonLabel: e.target.value })} className="inp" /></F>
                <F l="Link URL"><input value={editing.linkUrl} onChange={(e) => setEditing({ ...editing, linkUrl: e.target.value })} placeholder="#menu" className="inp" /></F>
              </div>
              <F l="Creative (image/video)"><MediaUpload value={editing.mediaUrl ? [editing.mediaUrl] : []} onChange={(urls) => setEditing({ ...editing, mediaUrl: urls[urls.length - 1] || "" })} /></F>
              <div className="grid grid-cols-2 gap-3">
                <F l="Start (auto-publish)"><input type="datetime-local" value={editing.startAt} onChange={(e) => setEditing({ ...editing, startAt: e.target.value })} className="inp" /></F>
                <F l="End (auto-expire)"><input type="datetime-local" value={editing.endAt} onChange={(e) => setEditing({ ...editing, endAt: e.target.value })} className="inp" /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F l="Priority (higher first)"><input type="number" value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: Number(e.target.value) })} className="inp" /></F>
                <F l="Frequency (popups)"><select value={editing.frequency} onChange={(e) => setEditing({ ...editing, frequency: e.target.value })} className="inp">{FREQ.map((f) => <option key={f} value={f}>{f || "—"}</option>)}</select></F>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>

              {/* Live preview */}
              {editing.headline && (
                <div className="mt-2 p-4 rounded-xl border border-gold/20 bg-gold/5">
                  <p className="text-white/65 text-[10px] uppercase mb-2">Live preview</p>
                  {editing.mediaUrl && <img src={editing.mediaUrl} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />}
                  <div className="font-display font-bold gold-text">{editing.headline}</div>
                  {editing.subtext && <div className="text-white/75 text-sm">{editing.subtext}</div>}
                  {editing.buttonLabel && <span className="inline-flex mt-2 px-4 py-1.5 btn-gold rounded-full text-xs">{editing.buttonLabel}</span>}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} className="flex-1 py-3 btn-gold rounded-xl">Save</button>
              <button onClick={() => setEditing(null)} className="px-6 py-3 rounded-xl bg-white/[0.08] hover:bg-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`.inp{width:100%;padding:0.6rem 0.85rem;border-radius:0.6rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:0.9rem}.inp:focus{outline:none;border-color:rgba(212,175,55,0.4)}`}</style>
    </div>
  );
}

function F({ l, children }: { l: string; children: React.ReactNode }) {
  return <div><label className="text-white/75 text-sm mb-1 block">{l}</label>{children}</div>;
}
