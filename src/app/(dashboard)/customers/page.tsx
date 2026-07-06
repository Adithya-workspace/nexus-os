"use client";

import { useState } from "react";
import { useBusinessStore } from "@/lib/store/business-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Smile, UserMinus, Clock, Headphones } from "lucide-react";
import { formatPercent } from "@/lib/utils";
import { AgentReport } from "@/lib/agents/base-agent";

export default function CustomersPage() {
  const { current, previous } = useBusinessStore();
  const { outputs, inputs } = current;
  const [report, setReport] = useState<AgentReport | null>(null);
  const [loading, setLoading] = useState(false);

  async function runCustomerAgent() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, previous, agentId: "customer" }),
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
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Satisfaction, retention, and service quality.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Satisfaction" value={outputs.customerSatisfaction} formatter={(v) => `${Math.round(v)}/100`} icon={Smile} accent="emerald" />
        <MetricCard label="Churn Rate" value={outputs.churnRate} formatter={formatPercent} icon={UserMinus} goodDirection="down" accent="red" />
        <MetricCard label="Delivery Speed" value={inputs.deliverySpeedDays} formatter={(v) => `${Math.round(v)} days`} icon={Clock} goodDirection="down" accent="cyan" />
        <MetricCard label="Service Budget" value={inputs.customerServiceBudget} formatter={(v) => `$${Math.round(v).toLocaleString()}`} icon={Headphones} accent="violet" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Retention Breakdown</CardTitle>
          <CardDescription>What&apos;s driving satisfaction and churn right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Customer Satisfaction</span><span>{Math.round(outputs.customerSatisfaction)}/100</span></div>
            <Progress value={outputs.customerSatisfaction} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span>Retention (100 - churn)</span><span>{(100 - outputs.churnRate).toFixed(0)}/100</span></div>
            <Progress value={100 - outputs.churnRate} />
          </div>

          <Button onClick={runCustomerAgent} disabled={loading} variant="secondary" size="sm">
            {loading ? "Analyzing…" : "Run Customer Agent Deep Dive"}
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
