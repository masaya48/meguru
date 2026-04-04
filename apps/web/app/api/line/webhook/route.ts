import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? "";
const API_URL = process.env.API_URL ?? "http://localhost:4000";

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto.createHmac("SHA256", LINE_CHANNEL_SECRET).update(body).digest("base64");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature") ?? "";

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Forward to NestJS
  try {
    const res = await fetch(`${API_URL}/line/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to forward" }, { status: 502 });
  }
}
