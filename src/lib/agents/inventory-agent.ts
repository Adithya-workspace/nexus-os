import { BaseAgent, AgentFinding } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";
import { formatNumber } from "@/lib/utils";

export class InventoryAgent extends BaseAgent {
  id = "inventory";
  name = "Inventory Agent";
  role = "Tracks stock health, demand coverage, and stockout risk";

  protected analyze(current: SimulationResult) {
    const { inventoryUnits, productionRate } = current.inputs;
    const { demandUnits, inventoryHealth } = current.outputs;

    const findings: AgentFinding[] = [];
    const coverageRatio = inventoryUnits / Math.max(demandUnits, 1);

    findings.push({
      label: "Inventory Health",
      detail: `Scoring ${inventoryHealth.toFixed(0)}/100 with ${formatNumber(inventoryUnits)} units on hand.`,
      severity: inventoryHealth > 65 ? "positive" : inventoryHealth > 40 ? "warning" : "critical",
    });

    findings.push({
      label: "Demand Coverage",
      detail: `Current stock covers ${(coverageRatio * 30).toFixed(0)} days of projected demand at this rate.`,
      severity: coverageRatio < 0.5 ? "critical" : coverageRatio > 3 ? "warning" : "info",
    });

    findings.push({
      label: "Production Rate",
      detail: `Producing ${formatNumber(productionRate)} units/mo against ${formatNumber(demandUnits)} demanded.`,
      severity: productionRate < demandUnits * 0.7 ? "warning" : "info",
    });

    const recommendations: string[] = [];
    if (coverageRatio < 0.5) {
      recommendations.push("Stockout risk is high — increase production rate or inventory buffer immediately.");
    }
    if (coverageRatio > 3) {
      recommendations.push("Excess inventory is tying up capital. Consider a targeted discount to clear stock.");
    }
    if (productionRate < demandUnits * 0.7) {
      recommendations.push("Production is undershooting demand — scale up manufacturing or supplier orders.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Inventory levels are well balanced against current demand.");
    }

    const summary = `Inventory is ${inventoryHealth > 65 ? "healthy" : inventoryHealth > 40 ? "under pressure" : "at risk"}, covering roughly ${(coverageRatio * 30).toFixed(0)} days of demand.`;

    return { summary, findings, recommendations, confidence: 88 };
  }
}
