"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try { localStorage.setItem("gharmai_theme", next ? "light" : "dark"); } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light / dark theme"
      title={light ? "Switch to dark" : "Switch to light"}
      className={`w-11 h-11 rounded-xl bg-white/[0.06] border border-white/12 flex items-center justify-center hover:border-gold/40 transition-all text-lg ${className}`}
    >
      {light ? "🌙" : "☀️"}
    </button>
  );
}
