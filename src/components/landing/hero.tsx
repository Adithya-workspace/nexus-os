"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DigitalTwin3DClient as DigitalTwin3D } from "@/components/twin/digital-twin-3d-client";
import { DEFAULT_INPUTS } from "@/lib/simulation/constants";
import { SimulationEngine } from "@/lib/simulation/engine";

const baseline = SimulationEngine.run(DEFAULT_INPUTS);

export function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-6 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-violet-300 mb-6">
            ⚡ AI-Powered Business Digital Twin
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-foreground">
            Your Business.
            <br />
            <span className="text-gradient">Simulated Before Reality.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Nexus OS creates a live digital clone of your business and predicts the impact of every decision —
            revenue, profit, churn, and risk — before you make it.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/login">
                Launch Your Twin <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#demo">
                <PlayCircle className="h-4 w-4" /> Watch Live Demo
              </a>
            </Button>
          </div>

          <div className="mt-10 flex gap-8">
            <Stat label="Health Score" value={`${Math.round(baseline.outputs.businessHealthScore)}/100`} />
            <Stat label="Simulated Revenue" value={`$${Math.round(baseline.outputs.revenue / 1000)}k/mo`} />
            <Stat label="AI Agents" value="10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-[440px] rounded-3xl glass-panel overflow-hidden relative"
        >
          <div className="absolute top-4 left-4 z-10 text-xs text-muted-foreground bg-black/30 backdrop-blur px-3 py-1.5 rounded-full">
            Live Digital Twin — Acme Retail Co.
          </div>
          <DigitalTwin3D departments={baseline.departments} />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}