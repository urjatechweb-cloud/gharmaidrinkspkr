"use client";
import { useEffect, useState } from "react";
import MediaUpload from "@/components/admin/MediaUpload";

const STATUS = ["DRAFT", "SCHEDULED", "PUBLISHED"];
const empty = { title: "", excerpt: "", body: "", coverImage: "", status: "DRAFT", publishAt: "", metaTitle: "", metaDescription: "" };
const toLocal = (d: string | null) => (d ? new Date(d).toISOString().slice(0, 16) : "");

export default function PostsAdmin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  async function load() { const p = await fetch("/api/posts?admin=1").then((r) => r.json()); setPosts(Array.isArray(p) ? p : []); }
  useEffect(() => { load(); }, []);

  async function save() {
    const method = editing.id ? "PATCH" : "POST";
    const url = editing.id ? `/api/posts/${editing.id}` : "/api/posts";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    if (res.ok) { setEditing(null); load(); } else alert("Save failed");
  }
  async function del(id: string) { if (confirm("Delete post?")) { await fetch(`/api/posts/${id}`, { method: "DELETE" }); load(); } }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-display font-bold">Blog Posts</h1><p className="text-white/85 text-sm">Content marketing — recipes, party tips, event recaps</p></div>
        <button onClick={() => setEditing({ ...empty })} className="px-5 py-2.5 btn-gold rounded-xl text-sm">+ New Post</button>
      </div>
      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-white/[0.08] text-white/75 text-left"><tr><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3">Publish</th><th className="p-3"></th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3"><span className={`text-xs ${p.status === "PUBLISHED" ? "text-green-400" : p.status === "SCHEDULED" ? "text-blue-400" : "text-white/85"}`}>{p.status}</span></td>
                <td className="p-3 text-white/85 text-xs">{p.publishAt ? new Date(p.publishAt).toLocaleDateString() : "—"}</td>
                <td className="p-3 text-right whitespace-nowrap"><button onClick={() => setEditing({ ...p, publishAt: toLocal(p.publishAt), coverImage: p.coverImage || "", excerpt: p.excerpt || "", metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "" })} className="text-gold hover:underline mr-3">Edit</button><button onClick={() => del(p.id)} className="text-accent hover:underline">Delete</button></td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-white/65">No posts yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-card border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-display text-xl font-bold mb-4">{editing.id ? "Edit" : "New"} Post</h2>
            <div className="space-y-3">
              <input placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="inp" />
              <input placeholder="Excerpt" value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="inp" />
              <div><label className="text-white/75 text-sm mb-1 block">Cover Image</label><MediaUpload value={editing.coverImage ? [editing.coverImage] : []} onChange={(u) => setEditing({ ...editing, coverImage: u[u.length - 1] || "" })} /></div>
              <textarea placeholder="Body (HTML / rich text)" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={6} className="inp resize-none font-mono text-xs" />
              <div className="grid grid-cols-2 gap-3">
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="inp">{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
                <input type="datetime-local" value={editing.publishAt} onChange={(e) => setEditing({ ...editing, publishAt: e.target.value })} className="inp" />
              </div>
              <input placeholder="SEO meta title" value={editing.metaTitle} onChange={(e) => setEditing({ ...editing, metaTitle: e.target.value })} className="inp" />
              <input placeholder="SEO meta description" value={editing.metaDescription} onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })} className="inp" />
            </div>
            <div className="flex gap-3 mt-6"><button onClick={save} className="flex-1 py-3 btn-gold rounded-xl">Save</button><button onClick={() => setEditing(null)} className="px-6 py-3 rounded-xl bg-white/[0.08]">Cancel</button></div>
          </div>
        </div>
      )}
      <style jsx global>{`.inp{width:100%;padding:0.6rem 0.85rem;border-radius:0.6rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);font-size:0.9rem}.inp:focus{outline:none;border-color:rgba(212,175,55,0.4)}`}</style>
    </div>
  );
}
