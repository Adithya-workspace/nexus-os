"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  { name: "Jordan Reyes", role: "Founder, Northbound Goods", quote: "We tested a price increase in the twin before rolling it out — it flagged the churn risk we would've missed." },
  { name: "Amara Chen", role: "COO, Fieldstack", quote: "The root cause agent found our delivery speed was the real driver behind a sales dip, not marketing." },
  { name: "Priya Nair", role: "Owner, Loom & Co.", quote: "Running 'what if' scenarios before a hiring decision saved us from over-extending payroll." },
];

export function Testimonials() {
  return (
    <section className="relative py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Operators trust the twin.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="p-6 h-full">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 mb-4">&quot;{t.quote}&quot;</p>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
