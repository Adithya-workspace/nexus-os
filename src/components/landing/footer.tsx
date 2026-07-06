import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-foreground text-sm">Nexus OS</span>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Nexus OS. Built for founders who simulate before they commit.</p>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
      </div>
    </footer>
  );
}
