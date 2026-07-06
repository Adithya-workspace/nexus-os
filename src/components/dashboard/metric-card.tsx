"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "./animated-counter";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  formatter?: (value: number) => string;
  icon: LucideIcon;
  changePercent?: number;
  goodDirection?: "up" | "down";
  accent?: "violet" | "cyan" | "emerald" | "amber" | "red";
}

const accentMap = {
  violet: "from-violet-500/20 to-violet-500/0 text-violet-300",
  cyan: "from-cyan-500/20 to-cyan-500/0 text-cyan-300",
  emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-300",
  amber: "from-amber-500/20 to-amber-500/0 text-amber-300",
  red: "from-red-500/20 to-red-500/0 text-red-300",
};

export function MetricCard({ label, value, formatter, icon: Icon, changePercent, goodDirection = "up", accent = "violet" }: MetricCardProps) {
  const isPositiveChange = changePercent !== undefined ? changePercent >= 0 : null;
  const isGood = isPositiveChange === null ? null : goodDirection === "up" ? isPositiveChange : !isPositiveChange;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="relative overflow-hidden p-5 group hover:border-white/20 transition-colors">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", accentMap[accent])} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <div className="mt-2 text-2xl font-bold text-foreground">
              <AnimatedCounter value={value} formatter={formatter} />
            </div>
          </div>
          <div className={cn("rounded-xl p-2.5 bg-white/5 border border-white/10", accentMap[accent].split(" ").pop())}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {changePercent !== undefined && (
          <div className="relative mt-3 flex items-center gap-1 text-xs font-medium">
            {Math.abs(changePercent) < 0.05 ? (
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            ) : isPositiveChange ? (
              <ArrowUpRight className={cn("h-3.5 w-3.5", isGood ? "text-emerald-400" : "text-red-400")} />
            ) : (
              <ArrowDownRight className={cn("h-3.5 w-3.5", isGood ? "text-emerald-400" : "text-red-400")} />
            )}
            <span className={cn(isGood === null ? "text-muted-foreground" : isGood ? "text-emerald-400" : "text-red-400")}>
              {Math.abs(changePercent).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs. last change</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
