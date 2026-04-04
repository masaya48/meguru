"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { setToken, parseJwt } from "@/lib/auth";

interface LoginResult {
  error?: string;
  sent?: boolean;
}

export async function loginWithPassword(
  _prevState: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await api<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    await setToken(res.accessToken);
    const payload = parseJwt(res.accessToken);
    if (payload?.role === "ADMIN") {
      redirect("/dashboard");
    } else {
      redirect("/");
    }
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e; // Next.js redirect
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }
}

export async function requestMagicLink(
  _prevState: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const tenantSlug = formData.get("tenantSlug") as string;

  try {
    // First resolve tenant
    const tenant = await api<{ id: string } | null>(`/tenants/${tenantSlug}`);
    if (!tenant) {
      return { error: "町内会が見つかりません" };
    }

    await api("/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email, tenantId: tenant.id }),
    });

    return { sent: true };
  } catch {
    return { error: "ログインリンクの送信に失敗しました" };
  }
}
