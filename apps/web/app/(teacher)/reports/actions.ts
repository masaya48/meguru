"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendLessonNote(id: string): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api(`/lesson-notes/${id}/send`, {
      method: "POST",
      token,
    });
    revalidatePath("/reports");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "レポートの送信に失敗しました" };
  }
}

export async function generateMonthlySummary(
  studentId: string,
  courseId: string,
  year: number,
  month: number,
): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api("/monthly-summaries/generate", {
      method: "POST",
      body: JSON.stringify({ studentId, courseId, year, month }),
      token,
    });
    revalidatePath("/reports");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "月次サマリーの生成に失敗しました" };
  }
}

export async function sendMonthlySummary(id: string): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api(`/monthly-summaries/${id}/send`, {
      method: "POST",
      token,
    });
    revalidatePath("/reports");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "月次サマリーの送信に失敗しました" };
  }
}
