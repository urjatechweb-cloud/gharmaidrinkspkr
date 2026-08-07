"use client";
import { useEffect, useState } from "react";
import MediaUpload from "@/components/admin/MediaUpload";

const BADGES = ["NONE", "PREMIUM", "POPULAR", "LIMITED", "VALUE", "NEW"];
const STOCK = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"];
const empty = { name: "", price: 0, compareAt: "", description: "", images: [] as string[], badge: "NONE", stock: "IN_STOCK", categoryId: "", brandId: "", featured: false, sponsored: false, luxury: false, active: true, metaTitle: "", metaDescription: "" };

export default function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [p, c, b] = await Promise.all([
      fetch("/api/products?admin=1").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()).catch(() => []),
      fetch("/api/brands?admin=1").then((r) => r.json()).catch(() => []),
    ]);
    setProducts(Array.isArray(p) ? p : []);
    setCats(Array.isArray(c) ? c : []);
    setBrands(Array.isArray(b) ? b : []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const body = { ...editing, price: Number(editing.price), compareAt: editing.compareAt ? Number(editing.compareAt) : null };
    const method = editing.id ? "PATCH" : "POST";
    const url = editing.id ? `/api/products/${editing.id}` : "/api/products";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setEditing(null); load(); } else alert("Save failed — check required fields (name, price, category).");
  }
  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-display font-bold">Products</h1><p className="text-white/85 text-sm">{products.length} items</p></div>
        <button onClick={() => setEditing({ ...empty })} className="px-5 py-2.5 btn-gold rounded-xl text-sm">+ Add Product</button>
      </div>

      {loading ? <p className="text-white/85">Loading…</p> : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.08] text-white/75 text-left"><tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Badge</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="p-3 flex items-center gap-3">{p.images?.[0] && <img src={p.images[0]} className="w-9 h-9 rounded-lg object-cover" alt="" />}<span className="font-medium">{p.name}</span></td>
                  <td className="p-3 text-white/75">{p.category?.name}</td>
                  <td className="p-3 gold-text font-semibold">Rs. {p.price.toLocaleString()}</td>
                  <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.08]">{p.badge}</span></td>
                  <td className="p-3">{p.active ? <span className="text-green-400 text-xs">Active</span> : <span className="text-white/65 text-xs">Hidden</span>}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing({ ...p, compareAt: p.compareAt ?? "" })} className="text-gold hover:underline mr-3">Edit</button>
                    <button onClick={() => del(p.id)} className="text-accent hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-white/65">No products yet. Run the seed or add one.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-display text-xl font-bold mb-4">{editing.id ? "Edit" : "Add"} Product</h2>
            <div className="space-y-3">
              <Field label="Name *"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="inp" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (Rs) *"><input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="inp" /></Field>
                <Field label="Compare-at (was)"><input type="number" value={editing.compareAt} onChange={(e) => setEditing({ ...editing, compareAt: e.target.value })} className="inp" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category *">
                  <select value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })} className="inp">
                    <option value="">Select category</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Brand">
                  <select value={editing.brandId || ""} onChange={(e) => setEditing({ ...editing, brandId: e.target.value })} className="inp">
                    <option value="">No brand</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Description"><textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="inp resize-none" /></Field>
              <Field label="Images"><MediaUpload value={editing.images || []} onChange={(images) => setEditing({ ...editing, images })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Badge"><select value={editing.badge} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} className="inp">{BADGES.map((b) => <option key={b}>{b}</option>)}</select></Field>
                <Field label="Stock"><select value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} className="inp">{STOCK.map((s) => <option key={s}>{s}</option>)}</select></Field>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.sponsored} onChange={(e) => setEditing({ ...editing, sponsored: e.target.checked })} /> Sponsored</label>
                <label className="flex items-center gap-2 text-gold"><input type="checkbox" checked={editing.luxury} onChange={(e) => setEditing({ ...editing, luxury: e.target.checked })} /> ✦ Luxury / Reserve</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
              </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-white/75 text-sm mb-1 block">{label}</label>{children}</div>;
}
