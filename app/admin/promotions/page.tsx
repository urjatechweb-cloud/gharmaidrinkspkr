"use client";
import { useEffect, useState } from "react";

const TYPES = ["PERCENT", "FIXED", "BOGO"];
const empty = { code: "", description: "", type: "PERCENT", value: 10, minOrder: 0, usageLimit: "", startAt: "", endAt: "", active: true };
const toLocal = (d: string | null) => (d ? new Date(d).toISOString().slice(0, 16) : "");

export default function PromotionsAdmin() {
  const [promos, setPromos] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  async function load() { const p = await fetch("/api/promotions").then((r) => r.json()); setPromos(Array.isArray(p) ? p : []); }
  useEffect(() => { load(); }, []);

  async function save() {
    const method = editing.id ? "PATCH" : "POST";
    const url = editing.id ? `/api/promotions/${editing.id}` : "/api/promotions";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    if (res.ok) { setEditing(null); load(); } else alert("Save failed — code may already exist.");
  }
  async function del(id: string) { if (confirm("Delete coupon?")) { await fetch(`/api/promotions/${id}`, { method: "DELETE" }); load(); } }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-display font-bold">Promotions & Coupons</h1><p className="text-white/85 text-sm">{promos.length} codes</p></div>
        <button onClick={() => setEditing({ ...empty })} className="px-5 py-2.5 btn-gold rounded-xl text-sm">+ New Coupon</button>
      </div>
      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-white/[0.08] text-white/75 text-left"><tr><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Value</th><th className="p-3">Min Order</th><th className="p-3">Used</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-3 font-mono font-bold gold-text">{p.code}</td>
                <td className="p-3 text-white/75">{p.type}</td>
                <td className="p-3">{p.type === "PERCENT" ? p.value + "%" : "Rs. " + p.value}</td>
                <td className="p-3 text-white/75">Rs. {p.minOrder}</td>
                <td className="p-3 text-white/75">{p.usageCount}{p.usageLimit ? `/${p.usageLimit}` : ""}</td>
                <td className="p-3">{p.active ? <span className="text-green-400 text-xs">Active</span> : <span className="text-white/65 text-xs">Off</span>}</td>
                <td className="p-3 text-right whitespace-nowrap"><button onClick={() => setEditing({ ...p, usageLimit: p.usageLimit ?? "", startAt: toLocal(p.startAt), endAt: toLocal(p.endAt) })} className="text-gold hover:underline mr-3">Edit</button><button onClick={() => del(p.id)} className="text-accent hover:underline">Delete</button></td>
              </tr>
            ))}
            {promos.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-white/65">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-white/10 rounded-2xl max-w-md w-full p-6">
            <h2 className="font-display text-xl font-bold mb-4">{editing.id ? "Edit" : "New"} Coupon</h2>
            <div className="space-y-3">
              <input placeholder="CODE" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className="inp font-mono" />
              <input placeholder="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="inp" />
              <div className="grid grid-cols-2 gap-3">
                <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="inp">{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                <input type="number" placeholder="Value" value={editing.value} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} className="inp" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Min order" value={editing.minOrder} onChange={(e) => setEditing({ ...editing, minOrder: Number(e.target.value) })} className="inp" />
                <input type="number" placeholder="Usage limit" value={editing.usageLimit} onChange={(e) => setEditing({ ...editing, usageLimit: e.target.value })} className="inp" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="datetime-local" value={editing.startAt} onChange={(e) => setEditing({ ...editing, startAt: e.target.value })} className="inp" />
                <input type="datetime-local" value={editing.endAt} onChange={(e) => setEditing({ ...editing, endAt: e.target.value })} className="inp" />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={save} className="flex-1 py-3 btn-gold rounded-xl">Save</button><button onClick={() => setEditing(null)} className="px-6 py-3 rounded-xl bg-white/[0.08]">Cancel</button></div>
          </div>
        </div>
      )}
      <style jsx global>{`.inp{width:100%;padding:0.6rem 0.85rem;border-radius:0.6rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:0.9rem}.inp:focus{outline:none;border-color:rgba(212,175,55,0.4)}`}</style>
    </div>
  );
}
