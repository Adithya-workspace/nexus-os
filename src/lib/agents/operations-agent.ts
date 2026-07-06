import { BaseAgent, AgentFinding } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";
import { formatNumber } from "@/lib/utils";

export class OperationsAgent extends BaseAgent {
  id = "operations";
  name = "Operations Agent";
  role = "Evaluates fulfillment capacity, delivery speed, and workforce load";

  protected analyze(current: SimulationResult) {
    const { employees, deliverySpeedDays, productionRate } = current.inputs;
    const { demandUnits } = current.outputs;
    const findings: AgentFinding[] = [];

    const unitsPerEmployee = employees > 0 ? demandUnits / employees : 0;

    findings.push({
      label: "Workforce Load",
      detail: `${formatNumber(unitsPerEmployee)} units of demand per employee per month.`,
      severity: unitsPerEmployee > 900 ? "critical" : unitsPerEmployee > 700 ? "warning" : "positive",
    });

    findings.push({
      label: "Delivery Speed",
      detail: `Averaging ${deliverySpeedDays} day(s) to fulfill orders.`,
      severity: deliverySpeedDays > 7 ? "critical" : deliverySpeedDays > 4 ? "warning" : "positive",
    });

    findings.push({
      label: "Production Capacity",
      detail: `${formatNumber(productionRate)} units/mo capacity against ${formatNumber(demandUnits)} demanded.`,
      severity: productionRate < demandUnits ? "warning" : "positive",
    });

    const recommendations: string[] = [];
    if (unitsPerEmployee > 850) {
      recommendations.push("Team is over capacity — hiring additional staff would reduce fulfillment strain.");
    }
    if (deliverySpeedDays > 5) {
      recommendations.push("Delivery speed is dragging satisfaction down. Explore regional warehousing or courier upgrades.");
    }
    if (productionRate < demandUnits * 0.8) {
      recommendations.push("Production capacity is a bottleneck relative to demand — evaluate a second shift or supplier scaling.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Operational capacity is comfortably matched to current demand.");
    }

    const summary = `Operations are ${unitsPerEmployee > 850 || deliverySpeedDays > 7 ? "strained" : "stable"}, with ${deliverySpeedDays}-day average delivery.`;

    return { summary, findings, recommendations, confidence: 80 };
  }
}
