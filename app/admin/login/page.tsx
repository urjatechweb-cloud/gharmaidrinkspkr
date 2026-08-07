"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password");
    else router.push("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-darker via-dark to-darker relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/8 rounded-full blur-[160px] pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Gharmai Drinks" width={150} height={64} className="h-16 w-auto mx-auto mb-3" style={{ width: "auto" }} />
          <h1 className="font-display text-xl font-bold">Admin CMS</h1>
          <p className="text-white/85 text-sm mt-1">Sign in to manage your store</p>
        </div>
        <form onSubmit={submit} className="glass rounded-2xl p-7 space-y-4 border border-gold/10 shadow-2xl shadow-gold/5">
          <div>
            <label className="text-white/75 text-sm mb-1.5 block">Email</label>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/10 focus:border-gold/40 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="text-white/75 text-sm mb-1.5 block">Password</label>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/10 focus:border-gold/40 focus:outline-none transition-colors" />
          </div>
          {error && <p className="text-accent text-sm">{error}</p>}
          <button disabled={loading} className="w-full py-3 btn-gold rounded-xl disabled:opacity-60">{loading ? "Signing in…" : "Sign In"}</button>
        </form>
        <p className="text-white/55 text-xs text-center mt-6">Gharmai Drinks · Cheers from Home</p>
      </div>
    </div>
  );
}
