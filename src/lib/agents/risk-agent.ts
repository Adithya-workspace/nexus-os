import { BaseAgent, AgentFinding } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";

export class RiskAgent extends BaseAgent {
  id = "risk";
  name = "Risk Agent";
  role = "Quantifies financial, operational, and market risk exposure";

  protected analyze(current: SimulationResult) {
    const { riskScore, cashFlow, churnRate, inventoryHealth } = current.outputs;
    const findings: AgentFinding[] = [];

    findings.push({
      label: "Composite Risk Score",
      detail: `${riskScore.toFixed(0)}/100 — ${riskScore > 60 ? "high" : riskScore > 35 ? "moderate" : "low"} exposure.`,
      severity: riskScore > 60 ? "critical" : riskScore > 35 ? "warning" : "positive",
    });

    if (cashFlow < 0) {
      findings.push({ label: "Cash Flow Risk", detail: "Negative cash flow detected — runway is shrinking.", severity: "critical" });
    }
    if (churnRate > 20) {
      findings.push({ label: "Retention Risk", detail: `Churn at ${churnRate.toFixed(1)}% threatens recurring revenue base.`, severity: "critical" });
    }
    if (inventoryHealth < 40) {
      findings.push({ label: "Supply Risk", detail: "Inventory imbalance increases stockout or overstock exposure.", severity: "warning" });
    }
    if (findings.length === 1) {
      findings.push({ label: "Overall Exposure", detail: "No single risk factor is currently dominant.", severity: "positive" });
    }

    const recommendations: string[] = [];
    if (riskScore > 60) {
      recommendations.push("Risk is high — avoid compounding changes (e.g. simultaneous price + budget cuts) until stabilized.");
    }
    if (cashFlow < 0) {
      recommendations.push("Build a cash buffer: reduce discretionary marketing spend or renegotiate supplier terms.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Risk profile is within acceptable range for planned changes.");
    }

    const summary = `Overall risk exposure is ${riskScore > 60 ? "elevated" : riskScore > 35 ? "moderate" : "low"} at ${riskScore.toFixed(0)}/100.`;

    return { summary, findings, recommendations, confidence: 84 };
  }
}
