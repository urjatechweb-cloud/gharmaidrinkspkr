"use client";
import { useMemo } from "react";

// Ambient animated "beer pour" background — a couple of amber pour streams
// plus slow rising golden bubbles (beer / champagne fizz). Pure CSS, GPU-cheap.
export default function BeerBackground() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => {
        const size = 4 + Math.round(Math.random() * 14);
        return {
          key: i,
          left: Math.round(Math.random() * 100),
          size,
          duration: 12 + Math.round(Math.random() * 16),
          delay: -Math.round(Math.random() * 20),
        };
      }),
    []
  );

  return (
    <div className="beer-bg" aria-hidden="true">
      <span className="pour" />
      <span className="pour p2" />
      {bubbles.map((b) => (
        <span
          key={b.key}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
