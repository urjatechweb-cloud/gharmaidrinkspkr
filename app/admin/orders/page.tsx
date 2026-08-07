"use client";
import { useEffect, useState } from "react";

const STATUSES = ["RECEIVED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const COLORS: Record<string, string> = { RECEIVED: "text-blue-400", PREPARING: "text-gold", OUT_FOR_DELIVERY: "text-purple-400", DELIVERED: "text-green-400", CANCELLED: "text-accent" };

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<any>(null);

  async function load() {
    const o = await fetch(`/api/orders${filter ? "?status=" + filter : ""}`).then((r) => r.json());
    setOrders(Array.isArray(o) ? o : []);
  }
  useEffect(() => { load(); }, [filter]);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
    if (view?.id === id) setView({ ...view, status });
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div><h1 className="text-2xl font-display font-bold">Orders</h1><p className="text-white/85 text-sm">{orders.length} orders</p></div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 rounded-xl bg-white/[0.08] border border-white/10 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-white/[0.08] text-white/75 text-left"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Time</th><th className="p-3"></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-white/10">
                <td className="p-3 font-mono text-xs">{o.orderNumber}</td>
                <td className="p-3"><div className="font-medium">{o.customerName}</div><div className="text-white/85 text-xs">{o.phone}</div></td>
                <td className="p-3 gold-text font-semibold">Rs. {o.total.toLocaleString()}</td>
                <td className="p-3"><select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className={`bg-transparent text-xs font-semibold ${COLORS[o.status]}`}>{STATUSES.map((s) => <option key={s} value={s} className="bg-dark-card text-white">{s.replace(/_/g, " ")}</option>)}</select></td>
                <td className="p-3 text-white/85 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="p-3 text-right"><button onClick={() => setView(o)} className="text-gold hover:underline">View</button></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-white/65">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {view && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setView(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-dark-card border border-white/10 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="font-display text-lg font-bold">{view.orderNumber}</h2><button onClick={() => setView(null)} className="text-white/85">✕</button></div>
            <div className="space-y-1 text-sm text-white/80 mb-4">
              <p><b className="text-white/85">Name:</b> {view.customerName}</p>
              <p><b className="text-white/85">Phone:</b> {view.phone}</p>
              <p><b className="text-white/85">Address:</b> {view.address}</p>
              {view.mapsLink && <p><b className="text-white/85">Maps:</b> <a href={view.mapsLink} target="_blank" className="text-gold underline">Open</a></p>}
              {view.notes && <p><b className="text-white/85">Notes:</b> {view.notes}</p>}
            </div>
            <div className="border-t border-white/10 pt-3 mb-3">
              {view.items?.map((i: any) => <div key={i.id} className="flex justify-between text-sm py-1"><span className="text-white/80">{i.name} ×{i.quantity}</span><span>Rs. {(i.price * i.quantity).toLocaleString()}</span></div>)}
            </div>
            <div className="flex justify-between font-bold border-t border-white/10 pt-3"><span>Total</span><span className="gold-text">Rs. {view.total.toLocaleString()}</span></div>
            {view.whatsappLog && <details className="mt-4"><summary className="text-white/85 text-xs cursor-pointer">WhatsApp message log</summary><pre className="text-[11px] text-white/85 whitespace-pre-wrap mt-2 p-3 bg-black/30 rounded-lg">{view.whatsappLog}</pre></details>}
          </div>
        </div>
      )}
    </div>
  );
}
