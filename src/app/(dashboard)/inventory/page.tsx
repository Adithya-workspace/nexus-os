"use client";

import { useState } from "react";
import { useBusinessStore } from "@/lib/store/business-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Package, Factory, TrendingUp, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { AgentReport } from "@/lib/agents/base-agent";

export default function InventoryPage() {
  const { current, previous } = useBusinessStore();
  const { outputs, inputs } = current;
  const [report, setReport] = useState<AgentReport | null>(null);
  const [loading, setLoading] = useState(false);

  const coverageDays = Math.round((inputs.inventoryUnits / Math.max(outputs.demandUnits, 1)) * 30);

  async function runInventoryAgent() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, previous, agentId: "inventory" }),
      });
      const data = await res.json();
      if (data.success) setReport(data.reports[0]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">Stock health, coverage, and production capacity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Units on Hand" value={inputs.inventoryUnits} formatter={formatNumber} icon={Package} accent="violet" />
        <MetricCard label="Production Rate" value={inputs.productionRate} formatter={(v) => `${formatNumber(v)}/mo`} icon={Factory} accent="cyan" />
        <MetricCard label="Demand" value={outputs.demandUnits} formatter={formatNumber} icon={TrendingUp} accent="emerald" />
        <MetricCard label="Inventory Health" value={outputs.inventoryHealth} formatter={(v) => `${Math.round(v)}/100`} icon={AlertTriangle} accent="amber" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coverage Analysis</CardTitle>
          <CardDescription>Current stock covers approximately {coverageDays} days of demand.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Inventory Health Score</span><span>{Math.round(outputs.inventoryHealth)}/100</span></div>
            <Progress value={outputs.inventoryHealth} />
          </div>
          <Button onClick={runInventoryAgent} disabled={loading} variant="secondary" size="sm">
            {loading ? "Analyzing…" : "Run Inventory Agent Deep Dive"}
          </Button>
          {report && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
              <p className="text-sm text-foreground/90">{report.summary}</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {report.recommendations.map((rec, i) => <li key={i}>• {rec}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
