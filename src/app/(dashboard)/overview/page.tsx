"use client";

import { DollarSign, TrendingUp, Wallet, Smile, Package, Activity, ShieldAlert, ArrowUpRight } from "lucide-react";
import { useBusinessStore } from "@/lib/store/business-store";
import { MetricCard } from "@/components/dashboard/metric-card";
import { HealthGauge } from "@/components/dashboard/health-gauge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { DigitalTwin3DClient as DigitalTwin3D } from "@/components/twin/digital-twin-3d-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
  const current = useBusinessStore((s) => s.current);
  const previous = useBusinessStore((s) => s.previous);
  const { outputs } = current;

  const pctChange = (key: keyof typeof outputs) => {
    if (!previous) return undefined;
    const before = previous.outputs[key];
    if (before === 0) return undefined;
    return ((outputs[key] - before) / Math.abs(before)) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Business Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Live digital twin of Acme Retail Co. — updated in real time.</p>
        </div>
        <Button asChild>
          <Link href="/simulation">
            Run a Simulation <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center py-8">
          <HealthGauge score={outputs.businessHealthScore} />
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> Risk {Math.round(outputs.riskScore)}/100</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Growth {formatPercent(outputs.growthRate)}</span>
          </div>
        </Card>

        <Card className="lg:col-span-2 h-[340px] overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle>Live Digital Twin</CardTitle>
            <CardDescription>Departments react instantly as you adjust business levers.</CardDescription>
          </CardHeader>
          <div className="h-[270px]">
            <DigitalTwin3D departments={current.departments} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Revenue" value={outputs.revenue} formatter={formatCurrency} icon={DollarSign} changePercent={pctChange("revenue")} accent="violet" />
        <MetricCard label="Net Profit" value={outputs.netProfit} formatter={formatCurrency} icon={TrendingUp} changePercent={pctChange("netProfit")} accent="emerald" />
        <MetricCard label="Cash Flow" value={outputs.cashFlow} formatter={formatCurrency} icon={Wallet} changePercent={pctChange("cashFlow")} accent="cyan" />
        <MetricCard label="Customer Satisfaction" value={outputs.customerSatisfaction} formatter={(v) => `${Math.round(v)}/100`} icon={Smile} changePercent={pctChange("customerSatisfaction")} accent="amber" />
        <MetricCard label="Inventory Health" value={outputs.inventoryHealth} formatter={(v) => `${Math.round(v)}/100`} icon={Package} changePercent={pctChange("inventoryHealth")} accent="violet" />
        <MetricCard label="Churn Rate" value={outputs.churnRate} formatter={(v) => formatPercent(v)} icon={Activity} changePercent={pctChange("churnRate")} goodDirection="down" accent="red" />
        <MetricCard label="Risk Score" value={outputs.riskScore} formatter={(v) => `${Math.round(v)}/100`} icon={ShieldAlert} changePercent={pctChange("riskScore")} goodDirection="down" accent="amber" />
        <MetricCard label="Growth Rate" value={outputs.growthRate} formatter={(v) => formatPercent(v)} icon={TrendingUp} changePercent={pctChange("growthRate")} accent="cyan" />
      </div>
    </div>
  );
}