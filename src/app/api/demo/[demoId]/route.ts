import { NextResponse } from "next/server";

import { getDemoCaseById } from "../../../../../fixtures/demo-cases";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ demoId: string }> }
) {
  const { demoId } = await context.params;
  const demoCase = getDemoCaseById(demoId);

  if (!demoCase) {
    return NextResponse.json(
      { error: "Demo case not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: demoCase.id,
    title: demoCase.title,
    summary: demoCase.summary,
    request: demoCase.request
  });
}
