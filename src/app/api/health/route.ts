import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "SignalSkin",
    mode: process.env.SIGNALSKIN_DEFAULT_MODE ?? "demo",
    tinyFishConfigured: Boolean(
      process.env.TINYFISH_API_KEY ?? process.env.MINO_API_KEY
    ),
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
}
