"use client";

import { useState } from "react";
import { useBusinessStore } from "@/lib/store/business-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, Wallet, Percent } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { AgentReport } from "@/lib/agents/base-agent";

export default function FinancePage() {
  const { current, previous } = useBusinessStore();
  const { outputs } = current;
  const [report, setReport] = useState<AgentReport | null>(null);
  const [loading, setLoading] = useState(false);

  async function runFinanceAgent() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, previous, agentId: "finance" }),
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
        <h1 className="text-2xl font-bold text-foreground">Finance</h1>
        <p className="text-sm text-muted-foreground mt-1">Revenue, margin, and cash position.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Revenue" value={outputs.revenue} formatter={formatCurrency} icon={DollarSign} accent="violet" />
        <MetricCard label="COGS" value={outputs.cogs} formatter={formatCurrency} icon={TrendingDown} goodDirection="down" accent="amber" />
        <MetricCard label="Net Profit" value={outputs.netProfit} formatter={formatCurrency} icon={Wallet} accent="emerald" />
        <MetricCard label="Margin" value={outputs.profitMargin} formatter={formatPercent} icon={Percent} accent="cyan" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>P&L Breakdown</CardTitle>
          <CardDescription>Full profit and loss for current settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Revenue" value={outputs.revenue} />
          <Row label="Cost of Goods Sold" value={-outputs.cogs} />
          <Row label="Gross Profit" value={outputs.grossProfit} bold />
          <Row label="Operating Expenses" value={-outputs.operatingExpenses} />
          <Row label="Net Profit" value={outputs.netProfit} bold />
          <Row label="Cash Flow" value={outputs.cashFlow} bold />

          <Button onClick={runFinanceAgent} disabled={loading} variant="secondary" size="sm" className="mt-3">
            {loading ? "Analyzing…" : "Run Finance Agent Deep Dive"}
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

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between border-b border-white/5 py-2 ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={value < 0 ? "text-red-400" : ""}>{value < 0 ? "-" : ""}${Math.abs(Math.round(value)).toLocaleString()}</span>
    </div>
  );
}
