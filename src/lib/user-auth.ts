import { NextRequest } from "next/server";

/**
 * Extracts and validates the anonymous user key sent by the client.
 * Returns null when the header is missing or malformed.
 */
export function getUserKey(req: NextRequest): string | null {
  const key = req.headers.get("x-user-key");
  if (!key || key.length < 8 || key.length > 64) return null;
  return key;
}

export function unauthorized() {
  return Response.json({ error: "Missing or invalid x-user-key header" }, { status: 401 });
}
