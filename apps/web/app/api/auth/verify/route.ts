import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:3001";
const TOKEN_COOKIE = "meguru_token";

function parseJwt(token: string): { role: string } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(base64, "base64").toString());
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Verify magic link token with NestJS API
  const res = await fetch(`${API_URL}/auth/verify?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    // Redirect to verify page with error flag
    return NextResponse.redirect(new URL("/auth/verify?error=invalid", request.url));
  }

  const { accessToken } = await res.json();

  // Set cookie in Route Handler (allowed)
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // Redirect based on role
  const payload = parseJwt(accessToken);
  if (payload?.role === "TEACHER") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.redirect(new URL("/", request.url));
}
