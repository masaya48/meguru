"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";

interface RegisterResult {
  error?: string;
}

export async function registerUser(
  _prevState: RegisterResult,
  formData: FormData,
): Promise<RegisterResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const tenantSlug = formData.get("tenantSlug") as string;
  const inviteToken = formData.get("inviteToken") as string | null;

  try {
    // Resolve tenant
    const tenant = await api<{ id: string } | null>(`/tenants/${tenantSlug}`);
    if (!tenant) {
      return { error: "町内会が見つかりません" };
    }

    const res = await api<{ accessToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        tenantId: tenant.id,
        name,
        email,
        ...(inviteToken ? { inviteToken } : {}),
      }),
    });

    await setToken(res.accessToken);
    redirect("/");
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "登録に失敗しました。既に登録済みの可能性があります。" };
  }
}
