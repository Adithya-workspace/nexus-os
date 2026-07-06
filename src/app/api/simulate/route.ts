import { NextRequest, NextResponse } from "next/server";
import { SimulationEngine } from "@/lib/simulation/engine";
import { BusinessInputs } from "@/lib/simulation/types";
import { DEFAULT_INPUTS } from "@/lib/simulation/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputs: BusinessInputs = { ...DEFAULT_INPUTS, ...body };
    const result = SimulationEngine.run(inputs);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function GET() {
  const result = SimulationEngine.run(DEFAULT_INPUTS);
  return NextResponse.json({ success: true, result });
}
