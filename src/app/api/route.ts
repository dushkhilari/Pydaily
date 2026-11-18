import { NextResponse } from "next/server";

/** Health check for the PyDaily API. */
export async function GET() {
  return NextResponse.json({ status: "ok", service: "pydaily-api" });
}
