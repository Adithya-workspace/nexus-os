"use client";

import { useMemo } from "react";
import { useBusinessStore } from "@/lib/store/business-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricRadar } from "@/components/charts/metric-radar";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { Heatmap } from "@/components/charts/heatmap";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const current = useBusinessStore((s) => s.current);
  const { outputs, departments } = current;

  const forecastData = useMemo(() => {
    const months = ["Now", "Mo 1", "Mo 2", "Mo 3", "Mo 4", "Mo 5", "Mo 6"];
    return months.map((month, i) => ({
      month,
      revenue: outputs.revenue * Math.pow(1 + outputs.growthRate / 100, i),
      profit: outputs.netProfit * Math.pow(1 + outputs.growthRate / 100, i),
    }));
  }, [outputs.revenue, outputs.netProfit, outputs.growthRate]);

  const heatmapCells = departments.map((d) => ({ label: d.label, value: d.score }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Forecasts and cross-department pattern analysis.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>6-Month Forecast</CardTitle>
            <CardDescription>Projected at current growth rate of {outputs.growthRate.toFixed(1)}%/mo — 6-month revenue: {formatCurrency(forecastData[6].revenue)}.</CardDescription>
          </CardHeader>
          <CardContent>
            <ForecastChart data={forecastData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Radar</CardTitle>
            <CardDescription>Composite health across all 7 departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <MetricRadar departments={departments} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Heatmap</CardTitle>
          <CardDescription>Green is strong, red needs attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap cells={heatmapCells} />
        </CardContent>
      </Card>
    </div>
  );
}
