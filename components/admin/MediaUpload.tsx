"use client";
import { useState } from "react";

// Reusable upload field — posts to /api/media and returns the URL.
export default function MediaUpload({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/media", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    onChange([...value, ...urls]);
    setBusy(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((u, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
            <img src={u} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(value.filter((_, x) => x !== i))} className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 text-accent text-xs">Remove</button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.08] border border-white/10 text-sm cursor-pointer hover:border-gold/30">
        {busy ? "Uploading…" : "+ Upload image(s)"}
        <input type="file" accept="image/*,video/*" multiple hidden onChange={(e) => upload(e.target.files)} />
      </label>
      <p className="text-white/80 text-xs mt-1">Or paste a URL below.</p>
      <input placeholder="https://…" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = (e.target as HTMLInputElement).value; if (v) { onChange([...value, v]); (e.target as HTMLInputElement).value = ""; } } }} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/[0.08] border border-white/10 text-sm focus:border-gold/40 focus:outline-none" />
    </div>
  );
}
