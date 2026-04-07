"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface AbsenceResult {
  error?: string;
  success?: boolean;
}

export async function reportAbsence(
  _prevState: AbsenceResult,
  formData: FormData,
): Promise<AbsenceResult> {
  const lessonSessionId = formData.get("lessonSessionId") as string;

  if (!lessonSessionId) {
    return { error: "レッスンを選択してください" };
  }

  try {
    const token = await getToken();
    await api("/absences", {
      method: "POST",
      token,
      body: JSON.stringify({ lessonSessionId }),
    });
    return { success: true };
  } catch {
    return { error: "欠席連絡の送信に失敗しました" };
  }
}
