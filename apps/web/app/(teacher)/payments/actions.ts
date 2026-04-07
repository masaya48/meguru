"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function generatePayments(year: number, month: number): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api("/payments/generate", {
      method: "POST",
      body: JSON.stringify({ year, month }),
      token,
    });
    revalidatePath("/payments");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "支払いの一括生成に失敗しました" };
  }
}

export async function markPaid(id: string): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api(`/payments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "PAID" }),
      token,
    });
    revalidatePath("/payments");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "入金確認に失敗しました" };
  }
}
