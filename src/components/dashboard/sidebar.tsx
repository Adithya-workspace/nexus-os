"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, SlidersHorizontal, Building2, Bot, LineChart, Users,
  Package, Wallet, Cog, FileText, Settings, Sparkles,
  LogOut, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/import", label: "Import Data", icon: Upload },
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/simulation", label: "Simulation", icon: SlidersHorizontal },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/agents", label: "AI Agents", icon: Bot },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/operations", label: "Operations", icon: Cog },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl fixed left-0 top-0 z-40">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-foreground">Nexus OS</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Digital Twin OS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group relative",
                active
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-400/10 text-white border border-white/10"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />}
              <Icon className={cn("h-4 w-4", active && "text-violet-300")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
          <p className="text-xs font-medium text-foreground">Demo Workspace</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Acme Retail Co.</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
