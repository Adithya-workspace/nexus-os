"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 bg-black/20 backdrop-blur-xl border-b border-white/5">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-foreground">Nexus OS</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <a href="#demo" className="hover:text-foreground transition-colors">Live Demo</a>
        <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
        <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
      </nav>

      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
    </header>
  );
}