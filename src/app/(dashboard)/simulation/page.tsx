"use client";

import { useState } from "react";
import { Send, RotateCcw, Save, Sparkles } from "lucide-react";
import { useBusinessStore } from "@/lib/store/business-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeverSlider } from "@/components/dashboard/lever-slider";
import { BusinessInputs, SimulationDelta } from "@/lib/simulation/types";
import { SimulationEngine } from "@/lib/simulation/engine";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const LEVER_FIELDS: (keyof BusinessInputs)[] = [
  "price",
  "marketingBudget",
  "employees",
  "avgSalary",
  "discountPercent",
  "inventoryUnits",
  "productionRate",
  "deliverySpeedDays",
  "customerServiceBudget",
  "supplierCostPerUnit",
];

export default function SimulationPage() {
  const { inputs, current, previous, updateInput, updateInputs, resetToBaseline, saveScenario, chatHistory, addChatMessage } = useBusinessStore();
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scenarioName, setScenarioName] = useState("");

  const deltas: SimulationDelta[] = previous ? SimulationEngine.diff(previous, current) : [];

  async function handleSend() {
    if (!command.trim()) return;
    const userMessage = command;
    setCommand("");
    addChatMessage({ role: "user", content: userMessage });
    setIsProcessing(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, inputs }),
      });
      const data = await res.json();
      if (data.success) {
        updateInputs(data.nextInputs);
        const impactLines = (data.deltas as SimulationDelta[])
          .filter((d) => Math.abs(d.changePercent) > 0.5)
          .slice(0, 4)
          .map((d) => `${d.label}: ${d.direction === "up" ? "+" : d.direction === "down" ? "-" : ""}${Math.abs(d.changePercent).toFixed(1)}%`)
          .join(" · ");
        addChatMessage({
          role: "assistant",
          content: `${data.explanation}\n\nProjected impact — ${impactLines || "minimal change detected."}`,
        });
      } else {
        addChatMessage({ role: "assistant", content: "I ran into an issue processing that command." });
      }
    } catch {
      addChatMessage({ role: "assistant", content: "Network error reaching the simulation engine." });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Simulation Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">Adjust levers or use natural language — every change recalculates instantly.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={resetToBaseline}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Levers */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Business Levers</CardTitle>
            <CardDescription>Drag to simulate a decision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {LEVER_FIELDS.map((field) => (
              <LeverSlider key={field} field={field} value={inputs[field]} onChange={(v) => updateInput(field, v)} />
            ))}
            <div className="flex gap-2 pt-2">
              <Input value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="Scenario name…" />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (!scenarioName.trim()) return;
                  saveScenario(scenarioName);
                  setScenarioName("");
                }}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live impact */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Predicted Impact</CardTitle>
            <CardDescription>Change vs. previous state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {deltas.length === 0 && <p className="text-sm text-muted-foreground">Adjust a lever to see predicted impact here.</p>}
            {deltas.map((d) => (
              <div key={d.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5">
                <span className="text-sm text-foreground/90">{d.label}</span>
                <div className="flex items-center gap-1.5">
                  {d.direction === "up" ? (
                    <TrendingUp className={`h-4 w-4 ${d.isGood ? "text-emerald-400" : "text-red-400"}`} />
                  ) : d.direction === "down" ? (
                    <TrendingDown className={`h-4 w-4 ${d.isGood ? "text-emerald-400" : "text-red-400"}`} />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm font-semibold tabular-nums ${d.isGood ? "text-emerald-400" : d.direction === "flat" ? "text-muted-foreground" : "text-red-400"}`}>
                    {Math.abs(d.changePercent).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(current.outputs.revenue)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
                <p className="text-xs text-muted-foreground">Net Profit</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(current.outputs.netProfit)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
                <p className="text-xs text-muted-foreground">Margin</p>
                <p className="text-lg font-bold text-foreground">{formatPercent(current.outputs.profitMargin)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
                <p className="text-xs text-muted-foreground">Risk</p>
                <p className="text-lg font-bold text-foreground">{Math.round(current.outputs.riskScore)}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Command Center */}
        <Card className="xl:col-span-1 flex flex-col h-[640px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-300" /> AI Command Center</CardTitle>
            <CardDescription>Type a decision in plain English.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Try commands like:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>"Increase price by 10%"</li>
                  <li>"Hire 5 employees"</li>
                  <li>"Cut marketing budget 15%"</li>
                  <li>"Improve delivery speed"</li>
                </ul>
              </div>
            )}
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`rounded-xl px-4 py-2.5 text-sm max-w-[90%] whitespace-pre-line ${msg.role === "user" ? "bg-gradient-to-r from-violet-500/20 to-cyan-400/10 border border-white/10 ml-auto" : "bg-white/[0.03] border border-white/10"}`}>
                {msg.content}
              </div>
            ))}
            {isProcessing && <div className="text-xs text-muted-foreground animate-pulse">Nexus is thinking…</div>}
          </CardContent>
          <div className="p-4 pt-0 flex gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. Increase price by 10%"
            />
            <Button size="icon" onClick={handleSend} disabled={isProcessing}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
