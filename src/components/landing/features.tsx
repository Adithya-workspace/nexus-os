"use client";

import { motion } from "framer-motion";
import { Brain, Boxes, MessageSquareText, GitCompare, Search, FileBarChart } from "lucide-react";
import { Card } from "@/components/ui/card";

const FEATURES = [
  { icon: Boxes, title: "Live Digital Twin", desc: "A 3D graph of your business — Finance, Sales, Marketing, Ops, HR, Inventory, and Customers — all connected in real time." },
  { icon: MessageSquareText, title: "AI Command Center", desc: "Type decisions in plain English. \"Increase price 10%\" instantly recalculates every downstream metric." },
  { icon: Brain, title: "10 Autonomous Agents", desc: "CEO, Finance, Sales, Risk, Root Cause, Strategy and more — each an independent specialist you can run on demand." },
  { icon: GitCompare, title: "Scenario Comparison", desc: "Save multiple what-if scenarios and compare revenue, profit, risk, and growth side by side." },
  { icon: Search, title: "Root Cause Analysis", desc: "Ask \"why are sales decreasing?\" and get ranked, explainable causes — not just a dashboard of numbers." },
  { icon: FileBarChart, title: "Executive Reports", desc: "One-click executive briefs synthesizing every department into clear, prioritized recommendations." },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Every department. One intelligent twin.</h2>
          <p className="mt-4 text-muted-foreground">Stop guessing what a decision will do to your business. Simulate it first.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Card className="p-6 h-full hover:border-violet-400/30 transition-colors group">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-400/10 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5 text-violet-300" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
