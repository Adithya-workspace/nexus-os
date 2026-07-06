"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Layers, Cpu, Database, Bot } from "lucide-react";

const LAYERS = [
  { icon: Layers, title: "Presentation", desc: "Next.js 15 + React 19 + Tailwind + Framer Motion + React Three Fiber" },
  { icon: Bot, title: "Agent Layer", desc: "10 specialist agents orchestrated in parallel, synthesized by a CEO agent" },
  { icon: Cpu, title: "Simulation Engine", desc: "Deterministic system-dynamics model connecting every business lever" },
  { icon: Database, title: "Data Layer", desc: "Prisma + SQLite for scenarios, users, and historical snapshots" },
];

export function Architecture() {
  return (
    <section id="architecture" className="relative py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Built like a real platform.</h2>
          <p className="mt-4 text-muted-foreground">Modular, explainable, and ready to scale.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LAYERS.map((l, i) => (
            <motion.div key={l.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="p-6 h-full text-center">
                <div className="h-12 w-12 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/10 border border-white/10 flex items-center justify-center mb-4">
                  <l.icon className="h-6 w-6 text-violet-300" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{l.title}</h3>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
                {i < LAYERS.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-2 h-px w-4 bg-white/10" />}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
