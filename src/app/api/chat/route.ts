import { NextRequest, NextResponse } from "next/server";
import { parseCommand } from "@/lib/agents/command-parser";
import { SimulationEngine } from "@/lib/simulation/engine";
import { BusinessInputs } from "@/lib/simulation/types";

/**
 * AI Command Center endpoint. Parses a natural-language instruction into a
 * concrete input patch, runs the simulation, and returns a structured
 * response the chat UI can render (before/after deltas + explanation).
 *
 * To upgrade this to a real LLM-backed parser, swap `parseCommand` for a
 * call through `lib/ai/client.ts` (see README for the abstraction point) —
 * the rest of the pipeline (simulate -> diff -> respond) stays the same.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = body.message;
    const currentInputs: BusinessInputs = body.inputs;

    if (!message || !currentInputs) {
      return NextResponse.json({ success: false, error: "Missing `message` or `inputs`." }, { status: 400 });
    }

    const before = SimulationEngine.run(currentInputs);
    const parsed = parseCommand(message, currentInputs);
    const nextInputs = { ...currentInputs, ...parsed.patch };
    const after = SimulationEngine.run(nextInputs);
    const deltas = SimulationEngine.diff(before, after);

    return NextResponse.json({
      success: true,
      intent: parsed.intent,
      explanation: parsed.explanation,
      nextInputs,
      before,
      after,
      deltas,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
