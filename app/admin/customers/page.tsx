"use client";
import { useEffect, useState } from "react";

const TIERS = ["NONE", "SILVER", "GOLD", "PLATINUM", "BLACK_CARD"];

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [edit, setEdit] = useState<any>(null);

  async function load() { const c = await fetch("/api/customers").then((r) => r.json()); setCustomers(Array.isArray(c) ? c : []); }
  useEffect(() => { load(); }, []);

  async function save() {
    await fetch(`/api/customers/${edit.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vipTier: edit.vipTier, rewardPoints: Number(edit.rewardPoints) }) });
    setEdit(null); load();
  }

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-bold mb-1">Customers & VIP</h1>
      <p className="text-white/85 text-sm mb-6">{customers.length} customers</p>
      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-white/[0.08] text-white/75 text-left"><tr><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">VIP Tier</th><th className="p-3">Points</th><th className="p-3">Orders</th><th className="p-3"></th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-white/75">{c.phone}</td>
                <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold">{c.vipTier}</span></td>
                <td className="p-3 text-white/80">{c.rewardPoints}</td>
                <td className="p-3 text-white/75">{c._count?.orders ?? 0}</td>
                <td className="p-3 text-right"><button onClick={() => setEdit({ ...c })} className="text-gold hover:underline">Manage</button></td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-white/65">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {edit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-white/10 rounded-2xl max-w-sm w-full p-6">
            <h2 className="font-display text-lg font-bold mb-4">{edit.name}</h2>
            <label className="text-white/75 text-sm block mb-1">VIP Tier</label>
            <select value={edit.vipTier} onChange={(e) => setEdit({ ...edit, vipTier: e.target.value })} className="inp mb-3">{TIERS.map((t) => <option key={t}>{t}</option>)}</select>
            <label className="text-white/75 text-sm block mb-1">Reward Points</label>
            <input type="number" value={edit.rewardPoints} onChange={(e) => setEdit({ ...edit, rewardPoints: e.target.value })} className="inp mb-4" />
            <div className="flex gap-3"><button onClick={save} className="flex-1 py-3 btn-gold rounded-xl">Save</button><button onClick={() => setEdit(null)} className="px-6 py-3 rounded-xl bg-white/[0.08]">Cancel</button></div>
          </div>
        </div>
      )}
      <style jsx global>{`.inp{width:100%;padding:0.6rem 0.85rem;border-radius:0.6rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:0.9rem}.inp:focus{outline:none;border-color:rgba(212,175,55,0.4)}`}</style>
    </div>
  );
}
