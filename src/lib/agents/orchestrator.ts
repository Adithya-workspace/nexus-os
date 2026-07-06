import { SimulationResult } from "@/lib/simulation/types";
import { AgentReport } from "./base-agent";
import { CeoAgent } from "./ceo-agent";
import { FinanceAgent } from "./finance-agent";
import { InventoryAgent } from "./inventory-agent";
import { CustomerAgent } from "./customer-agent";
import { SalesAgent } from "./sales-agent";
import { OperationsAgent } from "./operations-agent";
import { AnalyticsAgent } from "./analytics-agent";
import { RiskAgent } from "./risk-agent";
import { RootCauseAgent } from "./root-cause-agent";
import { StrategyAgent } from "./strategy-agent";

export const SPECIALIST_AGENTS = {
  finance: new FinanceAgent(),
  inventory: new InventoryAgent(),
  customer: new CustomerAgent(),
  sales: new SalesAgent(),
  operations: new OperationsAgent(),
  analytics: new AnalyticsAgent(),
  risk: new RiskAgent(),
  "root-cause": new RootCauseAgent(),
  strategy: new StrategyAgent(),
} as const;

export type SpecialistAgentId = keyof typeof SPECIALIST_AGENTS;

export const AGENT_LIST = [
  { id: "ceo", name: "CEO Agent", role: "Synthesizes all agent findings into an executive decision brief" },
  { id: "finance", name: "Finance Agent", role: "Monitors margin, cash flow, and profitability" },
  { id: "inventory", name: "Inventory Agent", role: "Tracks stock health, demand coverage, and stockout risk" },
  { id: "customer", name: "Customer Agent", role: "Watches satisfaction, churn, and retention signals" },
  { id: "sales", name: "Sales Agent", role: "Analyzes revenue drivers, demand, and growth trajectory" },
  { id: "operations", name: "Operations Agent", role: "Evaluates fulfillment capacity, delivery speed, and workforce load" },
  { id: "analytics", name: "Analytics Agent", role: "Surfaces statistical patterns and forward-looking forecasts" },
  { id: "risk", name: "Risk Agent", role: "Quantifies financial, operational, and market risk exposure" },
  { id: "root-cause", name: "Root Cause Agent", role: "Diagnoses why key metrics moved and ranks contributing factors" },
  { id: "strategy", name: "Strategy Agent", role: "Tests alternative moves and recommends the highest-leverage action" },
] as const;

/**
 * Runs every specialist agent in parallel, then feeds their reports into the
 * CEO Agent for an executive synthesis. This mirrors a real multi-agent
 * pipeline: fan-out to specialists, fan-in to a coordinator.
 */
export async function runAllAgents(current: SimulationResult, previous?: SimulationResult): Promise<AgentReport[]> {
  const specialistEntries = Object.values(SPECIALIST_AGENTS);
  const specialistReports = await Promise.all(specialistEntries.map((agent) => agent.run(current, previous)));

  const ceo = new CeoAgent().withReports(specialistReports);
  const ceoReport = await ceo.run(current, previous);

  return [ceoReport, ...specialistReports];
}

/** Run a single agent by id — used for the per-agent "Run" button in the UI. */
export async function runSingleAgent(agentId: string, current: SimulationResult, previous?: SimulationResult): Promise<AgentReport> {
  if (agentId === "ceo") {
    const specialistReports = await Promise.all(Object.values(SPECIALIST_AGENTS).map((agent) => agent.run(current, previous)));
    return new CeoAgent().withReports(specialistReports).run(current, previous);
  }
  const agent = SPECIALIST_AGENTS[agentId as SpecialistAgentId];
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  return agent.run(current, previous);
}
