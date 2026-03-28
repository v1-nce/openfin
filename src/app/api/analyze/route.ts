import { NextResponse } from "next/server";

import { analyzeProduct } from "@/orchestration";
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from "@/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = AnalyzeRequestSchema.parse(body);
    const report = await analyzeProduct(parsed);
    const payload = AnalyzeResponseSchema.parse({ report });

    return NextResponse.json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "SignalSkin could not analyze this request.";

    return NextResponse.json(
      {
        error: message
      },
      {
        status: 400
      }
    );
  }
}
