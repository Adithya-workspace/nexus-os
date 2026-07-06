"use client";

import { useState } from "react";
import { Bell, Search, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBusinessStore } from "@/lib/store/business-store";

export function Navbar() {
  const [query, setQuery] = useState("");
  const businessHealthScore = useBusinessStore((s) => s.current.outputs.businessHealthScore);

  const healthLabel = businessHealthScore >= 65 ? "Healthy" : businessHealthScore >= 40 ? "Watch" : "At Risk";
  const healthVariant = businessHealthScore >= 65 ? "success" : businessHealthScore >= 40 ? "warning" : "danger";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-black/30 backdrop-blur-xl px-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Nexus anything… (e.g. 'why are sales down?')"
          className="pl-9 bg-white/[0.03]"
        />
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={healthVariant as "success" | "warning" | "danger"} className="hidden sm:inline-flex">
          <Activity className="h-3 w-3" />
          {healthLabel}
        </Badge>

        <button className="relative rounded-xl p-2 hover:bg-white/5 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-400" />
        </button>

        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
          AC
        </div>
      </div>
    </header>
  );
}
