import { NextResponse } from "next/server";

import { analyzeProductStream } from "@/orchestration";
import { AnalyzeRequestSchema, AnalysisStreamEventSchema } from "@/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = AnalyzeRequestSchema.parse(body);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(": ping\n\n"));
        }, 10_000);
        const send = (event: Parameters<typeof AnalysisStreamEventSchema.parse>[0]) => {
          const payload = AnalysisStreamEventSchema.parse(event);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        };

        try {
          await analyzeProductStream(parsed, send);
        } catch (error) {
          send({
            type: "error",
            error:
              error instanceof Error
                ? error.message
                : "SignalSkin could not complete the analysis."
          });
        } finally {
          clearInterval(heartbeat);
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });
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
