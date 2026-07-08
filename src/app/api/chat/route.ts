import { NextRequest, NextResponse } from "next/server";
import { parseCommand } from "@/lib/agents/command-parser";
import { detectGoalMetric, generateGoalAdvice } from "@/lib/agents/goal-advisor";
import { SimulationEngine } from "@/lib/simulation/engine";
import { BusinessInputs } from "@/lib/simulation/types";

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

    if (parsed.intent !== "unrecognized") {
      const nextInputs = { ...currentInputs, ...parsed.patch };
      const after = SimulationEngine.run(nextInputs);
      const deltas = SimulationEngine.diff(before, after);

      return NextResponse.json({
        success: true,
        type: "action",
        intent: parsed.intent,
        explanation: parsed.explanation,
        nextInputs,
        before,
        after,
        deltas,
      });
    }

    const metric = detectGoalMetric(message);
    if (metric) {
      const advice = generateGoalAdvice(metric, currentInputs);
      return NextResponse.json({
        success: true,
        type: "advice",
        advice,
      });
    }

    return NextResponse.json({
      success: true,
      type: "unrecognized",
      explanation: parsed.explanation,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}