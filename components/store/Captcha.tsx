"use client";
import { useEffect, useMemo, useState } from "react";

// Lightweight, self-contained human-verification CAPTCHA (no third-party keys).
// A short arithmetic challenge that must be solved before an order is sent.
// Calls onValidChange(true) only while the current answer is correct.
export default function Captcha({ onValidChange }: { onValidChange: (ok: boolean) => void }) {
  const [seed, setSeed] = useState(0);
  const [answer, setAnswer] = useState("");

  // New challenge whenever seed changes
  const { a, b, op, expected } = useMemo(() => {
    const a = 2 + Math.floor(Math.random() * 8); // 2..9
    const b = 2 + Math.floor(Math.random() * 8);
    const useMul = Math.random() > 0.5;
    return { a, b, op: useMul ? "×" : "+", expected: useMul ? a * b : a + b };
  }, [seed]);

  const ok = answer.trim() !== "" && Number(answer) === expected;

  useEffect(() => { onValidChange(ok); }, [ok, onValidChange]);
  useEffect(() => { setAnswer(""); }, [seed]);

  function refresh() { setSeed((s) => s + 1); }

  return (
    <div>
      <label className="text-white/75 text-sm mb-1.5 block">Security check *</label>
      <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${ok ? "border-green-500/40 bg-green-500/5" : "border-white/10 bg-white/[0.06]"}`}>
        <span className="text-white/50 text-lg" aria-hidden>🔒</span>
        <div className="flex items-center gap-2 font-display font-bold text-lg select-none tracking-wide" aria-hidden>
          <span>{a}</span><span className="text-gold">{op}</span><span>{b}</span><span className="text-white/50">=</span>
        </div>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.replace(/[^\d-]/g, ""))}
          aria-label={`What is ${a} ${op} ${b}?`}
          placeholder="?"
          className="w-16 px-3 py-2 rounded-lg bg-white/[0.08] border border-white/10 text-center font-bold focus:border-gold/40 focus:outline-none"
        />
        {ok && <span className="text-green-400 text-sm font-semibold">✓ Verified</span>}
        <button type="button" onClick={refresh} title="New challenge" aria-label="New challenge"
          className="ml-auto w-8 h-8 rounded-lg bg-white/[0.08] border border-white/10 hover:border-gold/30 text-sm">↻</button>
      </div>
      <p className="text-white/45 text-xs mt-1">Solve the sum to confirm you&apos;re human before ordering.</p>
    </div>
  );
}
