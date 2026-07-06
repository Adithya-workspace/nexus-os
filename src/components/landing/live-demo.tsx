"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { SimulationEngine } from "@/lib/simulation/engine";
import { DEFAULT_INPUTS } from "@/lib/simulation/constants";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { formatCurrency, formatPercent } from "@/lib/utils";

/** A real, functional mini-simulation embedded in the landing page — not a fake mockup. */
export function LiveDemo() {
  const [price, setPrice] = useState(DEFAULT_INPUTS.price);
  const result = SimulationEngine.run({ ...DEFAULT_INPUTS, price });

  return (
    <section id="demo" className="relative py-24 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Try it right now.</h2>
        <p className="mt-4 text-muted-foreground">This slider is running the real Nexus simulation engine — drag it.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Product Price</span>
              <span className="text-sm font-semibold text-violet-300">${price}</span>
            </div>
            <Slider min={5} max={200} step={1} value={[price]} onValueChange={([v]) => setPrice(v)} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DemoStat label="Revenue" value={result.outputs.revenue} formatter={formatCurrency} />
            <DemoStat label="Profit" value={result.outputs.netProfit} formatter={formatCurrency} />
            <DemoStat label="Satisfaction" value={result.outputs.customerSatisfaction} formatter={(v) => `${Math.round(v)}/100`} />
            <DemoStat label="Churn" value={result.outputs.churnRate} formatter={(v) => formatPercent(v)} />
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

function DemoStat({ label, value, formatter }: { label: string; value: number; formatter: (v: number) => string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground mt-1">
        <AnimatedCounter value={value} formatter={formatter} />
      </p>
    </div>
  );
}
