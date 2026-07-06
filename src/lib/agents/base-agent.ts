import { SimulationResult } from "@/lib/simulation/types";

export type AgentStatus = "idle" | "thinking" | "running" | "completed" | "error";

export interface AgentFinding {
  label: string;
  detail: string;
  severity: "info" | "warning" | "critical" | "positive";
}

export interface AgentReport {
  agentId: string;
  agentName: string;
  role: string;
  status: AgentStatus;
  summary: string;
  findings: AgentFinding[];
  recommendations: string[];
  confidence: number; // 0-100
  runtimeMs: number;
}

/**
 * Base class all specialist agents extend. Each agent receives the current
 * (and optionally previous) simulation result and produces a structured
 * report. Agents are deterministic/rule-based over the simulation output —
 * this keeps them fast, explainable, and free of external API dependency,
 * while still being wired to call an LLM via `lib/ai/client.ts` for the
 * natural-language command center layer.
 */
export abstract class BaseAgent {
  abstract id: string;
  abstract name: string;
  abstract role: string;

  protected abstract analyze(current: SimulationResult, previous?: SimulationResult): {
    summary: string;
    findings: AgentFinding[];
    recommendations: string[];
    confidence: number;
  };

  async run(current: SimulationResult, previous?: SimulationResult): Promise<AgentReport> {
    const start = Date.now();
    // Simulate realistic agent "thinking" latency proportional to complexity.
    await new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 260));

    const { summary, findings, recommendations, confidence } = this.analyze(current, previous);
    const runtimeMs = Date.now() - start;

    return {
      agentId: this.id,
      agentName: this.name,
      role: this.role,
      status: "completed",
      summary,
      findings,
      recommendations,
      confidence,
      runtimeMs,
    };
  }
}
