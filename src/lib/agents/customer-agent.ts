import { BaseAgent, AgentFinding } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";
import { formatPercent } from "@/lib/utils";

export class CustomerAgent extends BaseAgent {
  id = "customer";
  name = "Customer Agent";
  role = "Watches satisfaction, churn, and retention signals";

  protected analyze(current: SimulationResult, previous?: SimulationResult) {
    const { customerSatisfaction, churnRate } = current.outputs;
    const findings: AgentFinding[] = [];

    findings.push({
      label: "Satisfaction Score",
      detail: `${customerSatisfaction.toFixed(0)}/100 based on service, delivery speed, and perceived value.`,
      severity: customerSatisfaction > 70 ? "positive" : customerSatisfaction > 45 ? "warning" : "critical",
    });

    findings.push({
      label: "Churn Rate",
      detail: `${formatPercent(churnRate)} monthly churn projected at current settings.`,
      severity: churnRate > 20 ? "critical" : churnRate > 10 ? "warning" : "positive",
    });

    if (previous) {
      const churnDelta = churnRate - previous.outputs.churnRate;
      findings.push({
        label: "Churn Trend",
        detail: `Churn ${churnDelta <= 0 ? "improved" : "worsened"} by ${Math.abs(churnDelta).toFixed(1)} points.`,
        severity: churnDelta <= 0 ? "positive" : "warning",
      });
    }

    const recommendations: string[] = [];
    if (current.inputs.deliverySpeedDays > 6) {
      recommendations.push("Delivery speed is a top churn driver — invest in faster fulfillment or logistics partners.");
    }
    if (current.inputs.customerServiceBudget < current.outputs.demandUnits * 0.3) {
      recommendations.push("Customer service budget looks thin relative to demand volume — consider increasing it.");
    }
    if (churnRate > 15) {
      recommendations.push("Churn is elevated. A loyalty incentive or price adjustment could stabilize retention.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Customer sentiment is strong. Maintain current service and delivery investment.");
    }

    const summary = `Customers are ${customerSatisfaction > 70 ? "highly satisfied" : customerSatisfaction > 45 ? "moderately satisfied" : "at risk of leaving"}, with ${formatPercent(churnRate)} projected churn.`;

    return { summary, findings, recommendations, confidence: 85 };
  }
}
