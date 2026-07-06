"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useBusinessStore } from "@/lib/store/business-store";
import { AgentCard } from "@/components/agents/agent-card";
import { Button } from "@/components/ui/button";
import { AGENT_LIST } from "@/lib/agents/orchestrator";
import { AgentReport, AgentStatus } from "@/lib/agents/base-agent";

export default function AgentsPage() {
  const { current, previous } = useBusinessStore();
  const [reports, setReports] = useState<Record<string, AgentReport>>({});
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [runningAll, setRunningAll] = useState(false);

  async function runAgent(agentId: string) {
    setStatuses((s) => ({ ...s, [agentId]: "thinking" }));
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, previous, agentId }),
      });
      const data = await res.json();
      if (data.success) {
        const report: AgentReport = data.reports[0];
        setReports((r) => ({ ...r, [agentId]: report }));
        setStatuses((s) => ({ ...s, [agentId]: "completed" }));
      } else {
        setStatuses((s) => ({ ...s, [agentId]: "error" }));
      }
    } catch {
      setStatuses((s) => ({ ...s, [agentId]: "error" }));
    }
  }

  async function runAll() {
    setRunningAll(true);
    AGENT_LIST.forEach((a) => setStatuses((s) => ({ ...s, [a.id]: "thinking" })));
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, previous }),
      });
      const data = await res.json();
      if (data.success) {
        const nextReports: Record<string, AgentReport> = {};
        const nextStatuses: Record<string, AgentStatus> = {};
        (data.reports as AgentReport[]).forEach((r) => {
          nextReports[r.agentId] = r;
          nextStatuses[r.agentId] = "completed";
        });
        setReports((r) => ({ ...r, ...nextReports }));
        setStatuses((s) => ({ ...s, ...nextStatuses }));
      }
    } finally {
      setRunningAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Ten autonomous specialists analyzing your business in parallel.</p>
        </div>
        <Button onClick={runAll} disabled={runningAll}>
          <Zap className="h-4 w-4" /> {runningAll ? "Running all agents…" : "Run All Agents"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {AGENT_LIST.map((agent) => (
          <AgentCard
            key={agent.id}
            name={agent.name}
            role={agent.role}
            status={statuses[agent.id] ?? "idle"}
            report={reports[agent.id]}
            onRun={() => runAgent(agent.id)}
          />
        ))}
      </div>
    </div>
  );
}
