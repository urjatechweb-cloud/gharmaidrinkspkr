"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [s, setS] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then((d) => d.error ? setErr(d.error) : setS(d)).catch(() => setErr("Failed to load"));
  }, []);

  const NPR = (n: number) => "Rs. " + (n || 0).toLocaleString();
  if (err) return <div className="p-8"><p className="text-white/75">{err === "Forbidden" ? "Your role does not have analytics access." : err}</p></div>;
  if (!s) return <div className="p-8 text-white/85">Loading dashboard…</div>;

  const cards = [
    ["Total Revenue", NPR(s.revenue), "💰"],
    ["Total Orders", s.orderCount, "📦"],
    ["Delivered", s.deliveredCount, "✅"],
    ["Customers", s.customerCount, "👥"],
    ["Active Products", s.productCount, "🍾"],
  ];

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-bold mb-1">Dashboard</h1>
      <p className="text-white/85 text-sm mb-6">Overview of your store performance</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(([label, val, icon]) => (
          <div key={label as string} className="glass rounded-2xl p-5">
            <div className="text-2xl mb-2">{icon as string}</div>
            <div className="text-xl font-display font-bold gold-text">{val as any}</div>
            <div className="text-white/85 text-xs mt-1">{label as string}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-bold mb-4">Top Selling Products</h3>
          {s.topItems.length === 0 && <p className="text-white/65 text-sm">No sales yet.</p>}
          {s.topItems.map((t: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b border-white/10 last:border-0">
              <span className="text-white/80 text-sm">{i + 1}. {t.name}</span>
              <span className="text-gold text-sm font-semibold">{t.qty} sold</span>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-bold mb-4">Ad Performance (CTR)</h3>
          {s.adStats.length === 0 && <p className="text-white/65 text-sm">No ads tracked yet.</p>}
          {s.adStats.map((a: any) => (
            <div key={a.id} className="flex justify-between py-2 border-b border-white/10 last:border-0">
              <span className="text-white/80 text-sm truncate mr-2">{a.title}</span>
              <span className="text-white/85 text-xs whitespace-nowrap">{a.clicks}/{a.impressions} · <span className="text-gold">{a.ctr}%</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
