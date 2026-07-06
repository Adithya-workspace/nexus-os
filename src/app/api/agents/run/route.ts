import { NextRequest, NextResponse } from "next/server";
import { runAllAgents, runSingleAgent } from "@/lib/agents/orchestrator";
import { SimulationResult } from "@/lib/simulation/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current: SimulationResult = body.current;
    const previous: SimulationResult | undefined = body.previous;
    const agentId: string | undefined = body.agentId;

    if (!current) {
      return NextResponse.json({ success: false, error: "Missing `current` simulation result." }, { status: 400 });
    }

    if (agentId) {
      const report = await runSingleAgent(agentId, current, previous);
      return NextResponse.json({ success: true, reports: [report] });
    }

    const reports = await runAllAgents(current, previous);
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
