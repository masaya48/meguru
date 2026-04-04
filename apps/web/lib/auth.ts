import { cookies } from "next/headers";

const TOKEN_COOKIE = "meguru_token";

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value;
}

export async function setToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearToken() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export function parseJwt(token: string): {
  userId: string;
  tenantId: string;
  role: string;
} | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString();
    return JSON.parse(json);
  } catch {
    return null;
  }
}
