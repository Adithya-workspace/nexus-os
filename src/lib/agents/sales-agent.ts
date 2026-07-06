import { BaseAgent, AgentFinding } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export class SalesAgent extends BaseAgent {
  id = "sales";
  name = "Sales Agent";
  role = "Analyzes revenue drivers, demand, and growth trajectory";

  protected analyze(current: SimulationResult, previous?: SimulationResult) {
    const { revenue, demandUnits, growthRate } = current.outputs;
    const findings: AgentFinding[] = [];

    findings.push({
      label: "Revenue",
      detail: `${formatCurrency(revenue)}/mo from ${formatNumber(demandUnits)} units of demand.`,
      severity: "info",
    });

    findings.push({
      label: "Growth Trajectory",
      detail: `Projected at ${formatPercent(growthRate)} month-over-month.`,
      severity: growthRate > 5 ? "positive" : growthRate > 0 ? "info" : "critical",
    });

    if (previous) {
      const revenueDelta = revenue - previous.outputs.revenue;
      const pct = previous.outputs.revenue !== 0 ? (revenueDelta / previous.outputs.revenue) * 100 : 0;
      findings.push({
        label: "Revenue Change",
        detail: `${revenueDelta >= 0 ? "Up" : "Down"} ${formatCurrency(Math.abs(revenueDelta))} (${formatPercent(Math.abs(pct))}) vs. previous scenario.`,
        severity: revenueDelta >= 0 ? "positive" : "warning",
      });
    }

    const recommendations: string[] = [];
    if (growthRate < 0) {
      recommendations.push("Growth is negative — retention issues are outweighing acquisition. Prioritize churn reduction.");
    }
    if (current.inputs.price / 49 > 1.3 && current.outputs.customerSatisfaction < 55) {
      recommendations.push("Price increases are outpacing perceived value. Consider bundling or phased rollout.");
    }
    if (current.inputs.marketingBudget < 10000 && demandUnits < 30000) {
      recommendations.push("Marketing spend is low relative to market potential — test incremental budget increases.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Sales trajectory looks solid. Maintain current pricing and marketing mix.");
    }

    const summary = `Revenue is ${formatCurrency(revenue)}/mo with growth trending ${growthRate >= 0 ? "positive" : "negative"} at ${formatPercent(growthRate)}.`;

    return { summary, findings, recommendations, confidence: 82 };
  }
}
