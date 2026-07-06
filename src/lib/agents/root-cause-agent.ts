import { BaseAgent, AgentFinding } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";

interface Cause {
  factor: string;
  contribution: number; // relative weight 0-1
  explanation: string;
}

export class RootCauseAgent extends BaseAgent {
  id = "root-cause";
  name = "Root Cause Agent";
  role = "Diagnoses why key metrics moved and ranks contributing factors";

  /** Rank likely causes of revenue/profit decline using the current input/output state. */
  private rankCauses(current: SimulationResult): Cause[] {
    const { inputs, outputs } = current;
    const causes: Cause[] = [];

    if (inputs.price / 49 > 1.15) {
      causes.push({
        factor: "Price increase",
        contribution: Math.min(0.9, (inputs.price / 49 - 1) * 1.2),
        explanation: "Price sits meaningfully above baseline, compressing demand via elasticity.",
      });
    }
    if (outputs.customerSatisfaction < 55) {
      causes.push({
        factor: "Low customer satisfaction",
        contribution: (55 - outputs.customerSatisfaction) / 55,
        explanation: "Service, delivery speed, or perceived value are under-delivering relative to expectations.",
      });
    }
    if (inputs.deliverySpeedDays > 6) {
      causes.push({
        factor: "Slow delivery",
        contribution: Math.min(0.8, (inputs.deliverySpeedDays - 4) / 10),
        explanation: "Fulfillment time exceeds the 4-day satisfaction threshold, driving churn.",
      });
    }
    if (inputs.marketingBudget < 12000) {
      causes.push({
        factor: "Underinvestment in marketing",
        contribution: (12000 - inputs.marketingBudget) / 12000,
        explanation: "Marketing spend is below the level needed to sustain demand at this price point.",
      });
    }
    if (outputs.churnRate > 15) {
      causes.push({
        factor: "Elevated churn",
        contribution: Math.min(0.85, outputs.churnRate / 40),
        explanation: "Customers are leaving faster than they're being replaced, eroding recurring revenue.",
      });
    }
    if (inputs.inventoryUnits < outputs.demandUnits * 0.3) {
      causes.push({
        factor: "Inventory shortfall",
        contribution: 0.6,
        explanation: "Stock on hand can't fully cover demand, capping realized revenue.",
      });
    }

    return causes.sort((a, b) => b.contribution - a.contribution).slice(0, 5);
  }

  protected analyze(current: SimulationResult) {
    const causes = this.rankCauses(current);
    const findings: AgentFinding[] = causes.map((c, i) => ({
      label: `#${i + 1} ${c.factor}`,
      detail: `${c.explanation} (relative weight ${(c.contribution * 100).toFixed(0)}%)`,
      severity: i === 0 ? "critical" : i < 3 ? "warning" : "info",
    }));

    if (findings.length === 0) {
      findings.push({
        label: "No dominant issue",
        detail: "No single factor stands out as a primary driver of underperformance.",
        severity: "positive",
      });
    }

    const recommendations = causes.slice(0, 3).map((c) => `Address "${c.factor}" first — it carries the largest weight among current issues.`);
    if (recommendations.length === 0) recommendations.push("Continue monitoring — no corrective action required right now.");

    const summary =
      causes.length > 0
        ? `Top driver of current performance is "${causes[0].factor}", accounting for the largest share of impact.`
        : "No significant negative drivers detected in the current scenario.";

    return { summary, findings, recommendations, confidence: 79 };
  }
}
