import { BaseAgent, AgentFinding } from "./base-agent";
import { SimulationResult } from "@/lib/simulation/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

export class FinanceAgent extends BaseAgent {
  id = "finance";
  name = "Finance Agent";
  role = "Monitors margin, cash flow, and profitability";

  protected analyze(current: SimulationResult, previous?: SimulationResult) {
    const { revenue, netProfit, profitMargin, cashFlow, operatingExpenses } = current.outputs;
    const findings: AgentFinding[] = [];

    findings.push({
      label: "Net Profit",
      detail: `${formatCurrency(netProfit)}/mo at a ${formatPercent(profitMargin)} margin.`,
      severity: netProfit >= 0 ? (profitMargin > 15 ? "positive" : "info") : "critical",
    });

    findings.push({
      label: "Cash Flow",
      detail: `${formatCurrency(cashFlow)}/mo after working-capital drag.`,
      severity: cashFlow >= 0 ? "positive" : "critical",
    });

    findings.push({
      label: "Operating Expenses",
      detail: `${formatCurrency(operatingExpenses)}/mo across payroll, marketing, and support.`,
      severity: operatingExpenses > revenue * 0.6 ? "warning" : "info",
    });

    if (previous) {
      const profitDelta = netProfit - previous.outputs.netProfit;
      findings.push({
        label: "Change vs. Previous",
        detail: `Profit ${profitDelta >= 0 ? "improved" : "declined"} by ${formatCurrency(Math.abs(profitDelta))}.`,
        severity: profitDelta >= 0 ? "positive" : "warning",
      });
    }

    const recommendations: string[] = [];
    if (profitMargin < 10) {
      recommendations.push("Reduce COGS by renegotiating supplier cost per unit or trimming discount depth.");
    }
    if (operatingExpenses > revenue * 0.55) {
      recommendations.push("Operating expenses are consuming most of revenue — review payroll and marketing efficiency.");
    }
    if (cashFlow < 0) {
      recommendations.push("Cash flow is negative. Prioritize inventory turnover and delay non-critical spend.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Financials are healthy. Consider reinvesting surplus profit into growth levers.");
    }

    const summary =
      netProfit >= 0
        ? `The business is profitable at ${formatPercent(profitMargin)} margin, generating ${formatCurrency(netProfit)}/mo.`
        : `The business is currently unprofitable, losing ${formatCurrency(Math.abs(netProfit))}/mo at current settings.`;

    const confidence = Math.min(97, 78 + Math.abs(profitMargin > 0 ? 10 : -5));

    return { summary, findings, recommendations, confidence: Math.round(confidence) };
  }
}
