import { BaseAgent, AgentFinding } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";

export class AnalyticsAgent extends BaseAgent {
  id = "analytics";
  name = "Analytics Agent";
  role = "Surfaces statistical patterns and forward-looking forecasts";

  protected analyze(current: SimulationResult) {
    const { businessHealthScore, growthRate, riskScore } = current.outputs;
    const findings: AgentFinding[] = [];

    // Simple linear forward projection using current growth rate (used for forecast charts elsewhere).
    const projected3mo = current.outputs.revenue * Math.pow(1 + growthRate / 100, 3);
    const projected6mo = current.outputs.revenue * Math.pow(1 + growthRate / 100, 6);

    findings.push({
      label: "Business Health Score",
      detail: `Composite score of ${businessHealthScore.toFixed(0)}/100 across margin, satisfaction, inventory, and risk.`,
      severity: businessHealthScore > 65 ? "positive" : businessHealthScore > 40 ? "warning" : "critical",
    });

    findings.push({
      label: "3-Month Revenue Forecast",
      detail: `Projected at $${Math.round(projected3mo).toLocaleString()} if current trends hold.`,
      severity: projected3mo > current.outputs.revenue ? "positive" : "warning",
    });

    findings.push({
      label: "6-Month Revenue Forecast",
      detail: `Projected at $${Math.round(projected6mo).toLocaleString()} under a linear-growth assumption.`,
      severity: projected6mo > current.outputs.revenue ? "positive" : "warning",
    });

    const recommendations: string[] = [];
    if (riskScore > 60) {
      recommendations.push("Statistical risk indicators are elevated — cross-check with the Risk Agent before scaling spend.");
    }
    if (growthRate < 0) {
      recommendations.push("Forecast trend is negative; recommend running a scenario comparison before committing budget.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Trend lines support continued investment at current levels.");
    }

    const summary = `Forecasting ${growthRate >= 0 ? "continued growth" : "a decline"} with a composite health score of ${businessHealthScore.toFixed(0)}/100.`;

    return { summary, findings, recommendations, confidence: 76 };
  }
}
