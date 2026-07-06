"use client";

import { useEffect, useRef } from "react";

/** Ambient animated glow blobs + cursor spotlight used behind dashboard/landing content. */
export function BackgroundFX() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!spotlightRef.current) return;
      spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(167,139,250,0.08), transparent 40%)`;
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px] animate-float" />
      <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px] animate-float" style={{ animationDelay: "4s" }} />
      <div ref={spotlightRef} className="absolute inset-0 transition-opacity" />
    </div>
  );
}
