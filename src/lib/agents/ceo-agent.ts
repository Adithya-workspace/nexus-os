import { BaseAgent, AgentFinding, AgentReport } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";

/**
 * The CEO Agent doesn't run its own math — it synthesizes reports from every
 * other agent into one executive-level narrative. Called last by the
 * orchestrator, after all specialist agents have completed.
 */
export class CeoAgent extends BaseAgent {
  id = "ceo";
  name = "CEO Agent";
  role = "Synthesizes all agent findings into an executive decision brief";

  private childReports: AgentReport[] = [];

  withReports(reports: AgentReport[]): this {
    this.childReports = reports;
    return this;
  }

  protected analyze(current: SimulationResult) {
    const { businessHealthScore, riskScore, netProfit, growthRate } = current.outputs;

    const critical = this.childReports.flatMap((r) => r.findings.filter((f) => f.severity === "critical"));
    const positive = this.childReports.flatMap((r) => r.findings.filter((f) => f.severity === "positive"));

    const findings: AgentFinding[] = [
      {
        label: "Overall Health",
        detail: `Business health score is ${businessHealthScore.toFixed(0)}/100 with ${riskScore.toFixed(0)}/100 risk exposure.`,
        severity: businessHealthScore > 65 ? "positive" : businessHealthScore > 40 ? "warning" : "critical",
      },
      {
        label: "Critical Issues Flagged",
        detail: critical.length > 0 ? `${critical.length} critical issue(s) raised across specialist agents.` : "No critical issues raised by any specialist agent.",
        severity: critical.length > 0 ? "critical" : "positive",
      },
      {
        label: "Strengths",
        detail: positive.length > 0 ? `${positive.length} positive signal(s), including: ${positive.slice(0, 2).map((p) => p.label).join(", ")}.` : "No standout strengths identified this cycle.",
        severity: "positive",
      },
    ];

    const recommendations: string[] = [];
    const allRecs = this.childReports.flatMap((r) => r.recommendations);
    // De-duplicate and take the top few, prioritizing agents that flagged critical issues.
    const priorityAgents = this.childReports.filter((r) => r.findings.some((f) => f.severity === "critical"));
    const priorityRecs = priorityAgents.flatMap((r) => r.recommendations);
    const combined = Array.from(new Set([...priorityRecs, ...allRecs])).slice(0, 4);
    recommendations.push(...combined);
    if (recommendations.length === 0) recommendations.push("Hold current course — all departments report stable performance.");

    const summary =
      critical.length > 0
        ? `${critical.length} critical issue(s) require attention. Net profit is $${Math.round(netProfit).toLocaleString()}/mo with ${growthRate.toFixed(1)}% growth.`
        : `Business is performing within healthy bounds. Net profit is $${Math.round(netProfit).toLocaleString()}/mo with ${growthRate.toFixed(1)}% growth.`;

    const confidence = Math.round(this.childReports.reduce((sum, r) => sum + r.confidence, 0) / Math.max(this.childReports.length, 1));

    return { summary, findings, recommendations, confidence };
  }
}
