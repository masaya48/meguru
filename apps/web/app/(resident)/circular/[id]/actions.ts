"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface SubmitResult {
  success?: boolean;
  error?: string;
}

export async function submitAnswer(
  circularId: string,
  questionId: string,
  answer: unknown,
): Promise<SubmitResult> {
  const token = await getToken();
  if (!token) return { error: "ログインが必要です" };

  try {
    await api(`/circulars/${circularId}/answers`, {
      method: "POST",
      token,
      body: JSON.stringify({ questionId, answer }),
    });
    revalidatePath(`/circular/${circularId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "回答の送信に失敗しました" };
  }
}
