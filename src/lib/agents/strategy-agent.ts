import { BaseAgent, AgentFinding } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";
import { SimulationEngine } from "@/lib/simulation/engine";

export class StrategyAgent extends BaseAgent {
  id = "strategy";
  name = "Strategy Agent";
  role = "Tests alternative moves and recommends the highest-leverage action";

  /** Quickly test a handful of candidate strategic moves against the current baseline. */
  private testCandidateMoves(current: SimulationResult) {
    const base = current.inputs;
    const candidates = [
      { label: "Cut price 5%", inputs: { ...base, price: base.price * 0.95 } },
      { label: "Raise marketing 25%", inputs: { ...base, marketingBudget: base.marketingBudget * 1.25 } },
      { label: "Improve delivery by 1 day", inputs: { ...base, deliverySpeedDays: Math.max(1, base.deliverySpeedDays - 1) } },
      { label: "Increase service budget 20%", inputs: { ...base, customerServiceBudget: base.customerServiceBudget * 1.2 } },
      { label: "Add 5 employees", inputs: { ...base, employees: base.employees + 5 } },
    ];

    return candidates
      .map((c) => {
        const result = SimulationEngine.run(c.inputs);
        const healthDelta = result.outputs.businessHealthScore - current.outputs.businessHealthScore;
        const profitDelta = result.outputs.netProfit - current.outputs.netProfit;
        return { label: c.label, healthDelta, profitDelta, result };
      })
      .sort((a, b) => b.healthDelta - a.healthDelta);
  }

  protected analyze(current: SimulationResult) {
    const tested = this.testCandidateMoves(current);
    const best = tested[0];

    const findings: AgentFinding[] = tested.slice(0, 4).map((t) => ({
      label: t.label,
      detail: `Health score ${t.healthDelta >= 0 ? "+" : ""}${t.healthDelta.toFixed(1)}, profit ${t.profitDelta >= 0 ? "+" : ""}$${Math.round(t.profitDelta).toLocaleString()}/mo.`,
      severity: t.healthDelta > 2 ? "positive" : t.healthDelta > -1 ? "info" : "warning",
    }));

    const recommendations = [
      `Highest-leverage move: "${best.label}", improving health score by ${best.healthDelta.toFixed(1)} points.`,
      "Run this as a formal scenario before committing to compare it side-by-side with current settings.",
    ];

    const summary = `Tested ${tested.length} strategic moves — "${best.label}" offers the best projected improvement in business health.`;

    return { summary, findings, recommendations, confidence: 73 };
  }
}
