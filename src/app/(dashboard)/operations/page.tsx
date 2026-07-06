"use client";

import { useState } from "react";
import { useBusinessStore } from "@/lib/store/business-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { Users, Truck, Factory, Gauge } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { AgentReport } from "@/lib/agents/base-agent";

export default function OperationsPage() {
  const { current, previous } = useBusinessStore();
  const { outputs, inputs } = current;
  const [report, setReport] = useState<AgentReport | null>(null);
  const [loading, setLoading] = useState(false);

  const unitsPerEmployee = inputs.employees > 0 ? Math.round(outputs.demandUnits / inputs.employees) : 0;

  async function runOperationsAgent() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, previous, agentId: "operations" }),
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
        <h1 className="text-2xl font-bold text-foreground">Operations</h1>
        <p className="text-sm text-muted-foreground mt-1">Workforce capacity, delivery speed, and production.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Employees" value={inputs.employees} icon={Users} accent="violet" />
        <MetricCard label="Delivery Speed" value={inputs.deliverySpeedDays} formatter={(v) => `${Math.round(v)} days`} icon={Truck} goodDirection="down" accent="cyan" />
        <MetricCard label="Production Rate" value={inputs.productionRate} formatter={(v) => `${formatNumber(v)}/mo`} icon={Factory} accent="emerald" />
        <MetricCard label="Units / Employee" value={unitsPerEmployee} formatter={formatNumber} icon={Gauge} goodDirection="down" accent="amber" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capacity Analysis</CardTitle>
          <CardDescription>Is the team over or under capacity?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each employee handles roughly <span className="text-foreground font-medium">{unitsPerEmployee}</span> units of demand per month.
            Healthy range is under 850. {unitsPerEmployee > 850 ? "The team is currently over capacity." : "The team has healthy headroom."}
          </p>
          <Button onClick={runOperationsAgent} disabled={loading} variant="secondary" size="sm">
            {loading ? "Analyzing…" : "Run Operations Agent Deep Dive"}
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
