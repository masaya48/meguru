"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSlot(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const token = await getToken();
  const courseId = formData.get("courseId") as string;
  const studentId = formData.get("studentId") as string;
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  try {
    await api("/lessons/slots", {
      method: "POST",
      body: JSON.stringify({ courseId, studentId, dayOfWeek, startTime, endTime }),
      token,
    });
    revalidatePath("/schedule");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "枠の追加に失敗しました" };
  }
}

export async function deleteSlot(id: string): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api(`/lessons/slots/${id}`, {
      method: "DELETE",
      token,
    });
    revalidatePath("/schedule");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "枠の削除に失敗しました" };
  }
}

export async function generateSessions(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const token = await getToken();
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));

  try {
    await api("/lessons/generate", {
      method: "POST",
      body: JSON.stringify({ year, month }),
      token,
    });
    revalidatePath("/schedule");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "セッションの生成に失敗しました" };
  }
}
