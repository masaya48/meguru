"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveReschedule(id: string): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api(`/reschedules/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "APPROVED" }),
      token,
    });
    revalidatePath("/reschedules");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "振替リクエストの承認に失敗しました" };
  }
}

export async function rejectReschedule(id: string): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api(`/reschedules/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "REJECTED" }),
      token,
    });
    revalidatePath("/reschedules");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "振替リクエストの却下に失敗しました" };
  }
}
