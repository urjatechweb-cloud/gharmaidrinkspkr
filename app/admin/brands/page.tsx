"use client";
import { useEffect, useState } from "react";
import MediaUpload from "@/components/admin/MediaUpload";

const empty = { name: "", logo: "", bannerImage: "", tagline: "", description: "", accent: "#D4AF37", linkUrl: "", featured: true, sortOrder: 0, active: true };

export default function BrandsAdmin() {
  const [brands, setBrands] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  async function load() {
    const b = await fetch("/api/brands?admin=1").then((r) => r.json());
    setBrands(Array.isArray(b) ? b : []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const method = editing.id ? "PATCH" : "POST";
    const url = editing.id ? `/api/brands/${editing.id}` : "/api/brands";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    if (res.ok) { setEditing(null); load(); } else alert("Save failed");
  }
  async function toggle(b: any) {
    await fetch(`/api/brands/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured: !b.featured }) });
    load();
  }
  async function del(id: string) { if (confirm("Delete this brand?")) { await fetch(`/api/brands/${id}`, { method: "DELETE" }); load(); } }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-display font-bold">Brand Spotlight</h1><p className="text-white/85 text-sm">Feature & rotate different brands on the storefront</p></div>
        <button onClick={() => setEditing({ ...empty })} className="px-5 py-2.5 btn-gold rounded-xl text-sm">+ Add Brand</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((b) => (
          <div key={b.id} className="glass rounded-2xl overflow-hidden">
            <div className="relative h-28" style={{ background: b.bannerImage ? undefined : `linear-gradient(135deg, ${b.accent}, #0A0A0A)` }}>
              {b.bannerImage && <img src={b.bannerImage} alt={b.name} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 flex items-center justify-center">
                {b.logo ? <img src={b.logo} alt={b.name} className="h-9 object-contain" /> : <span className="font-display font-black text-xl" style={{ color: "#fff" }}>{b.name}</span>}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{b.name}</span>
                <span className={`text-xs ${b.featured ? "text-green-400" : "text-white/65"}`}>{b.featured ? "● Featured" : "Hidden"}</span>
              </div>
              <div className="text-white/85 text-xs mb-3 truncate">{b.tagline || b.description}</div>
              <div className="flex gap-2 text-xs">
                <button onClick={() => setEditing({ ...b, logo: b.logo || "", bannerImage: b.bannerImage || "", tagline: b.tagline || "", linkUrl: b.linkUrl || "" })} className="text-gold hover:underline">Edit</button>
                <button onClick={() => toggle(b)} className="text-white/75 hover:underline">{b.featured ? "Unfeature" : "Feature"}</button>
                <button onClick={() => del(b.id)} className="text-accent hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {brands.length === 0 && <p className="text-white/65 col-span-3 text-center py-12">No brands yet. Add your first brand house.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-display text-xl font-bold mb-4">{editing.id ? "Edit" : "Add"} Brand</h2>
            <div className="space-y-3">
              <F l="Brand Name *"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="inp" /></F>
              <F l="Tagline"><input value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} placeholder="Keep Walking." className="inp" /></F>
              <F l="Description"><textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="inp resize-none" /></F>
              <F l="Logo (transparent PNG works best)"><MediaUpload value={editing.logo ? [editing.logo] : []} onChange={(u) => setEditing({ ...editing, logo: u[u.length - 1] || "" })} /></F>
              <F l="Spotlight Banner Image"><MediaUpload value={editing.bannerImage ? [editing.bannerImage] : []} onChange={(u) => setEditing({ ...editing, bannerImage: u[u.length - 1] || "" })} /></F>
              <div className="grid grid-cols-2 gap-3">
                <F l="Accent Color"><input type="color" value={editing.accent} onChange={(e) => setEditing({ ...editing, accent: e.target.value })} className="inp h-11 p-1" /></F>
                <F l="Shop Link"><input value={editing.linkUrl} onChange={(e) => setEditing({ ...editing, linkUrl: e.target.value })} placeholder="#menu" className="inp" /></F>
              </div>
              <F l="Sort Order"><input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className="inp" /></F>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Show in Spotlight</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={save} className="flex-1 py-3 btn-gold rounded-xl">Save</button><button onClick={() => setEditing(null)} className="px-6 py-3 rounded-xl bg-white/[0.08]">Cancel</button></div>
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
