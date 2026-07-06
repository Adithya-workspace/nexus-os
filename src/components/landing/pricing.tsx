"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  { name: "Starter", price: "$0", desc: "For solo founders exploring their first twin.", features: ["1 business twin", "Core simulation engine", "3 AI agents", "Community support"], highlighted: false },
  { name: "Growth", price: "$149", desc: "For growing SMBs running weekly scenarios.", features: ["3 business twins", "All 10 AI agents", "Scenario comparison", "Executive reports", "Priority support"], highlighted: true },
  { name: "Enterprise", price: "Custom", desc: "For multi-location operators and franchises.", features: ["Unlimited twins", "Custom agent training", "SSO & audit logs", "Dedicated success manager"], highlighted: false },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Simple, transparent pricing.</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className={cn("p-8 h-full flex flex-col", plan.highlighted && "border-violet-400/50 shadow-2xl shadow-violet-500/20 relative")}>
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-sm text-muted-foreground">/mo</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                      <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={plan.highlighted ? "default" : "secondary"}>
                  <Link href="/login">Get Started</Link>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}