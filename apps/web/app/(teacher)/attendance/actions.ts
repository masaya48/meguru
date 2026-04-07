"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function recordAttendance(
  sessionId: string,
  status: string,
): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api("/attendance", {
      method: "POST",
      body: JSON.stringify({ sessionId, status }),
      token,
    });
    revalidatePath(`/attendance/${sessionId}`);
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "出欠の記録に失敗しました" };
  }
}

export async function saveMemo(
  sessionId: string,
  memo: string,
): Promise<{ id?: string; error?: string }> {
  const token = await getToken();
  try {
    const result = await api<{ id: string }>("/lesson-notes", {
      method: "POST",
      body: JSON.stringify({ sessionId, memo }),
      token,
    });
    revalidatePath(`/attendance/${sessionId}`);
    return { id: result.id };
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "メモの保存に失敗しました" };
  }
}

export async function generateReport(noteId: string): Promise<{ report?: string; error?: string }> {
  const token = await getToken();
  try {
    const result = await api<{ report: string }>(`/lesson-notes/${noteId}/generate-report`, {
      method: "POST",
      token,
    });
    return { report: result.report };
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "レポートの生成に失敗しました" };
  }
}

export async function sendReport(noteId: string, report: string): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api(`/lesson-notes/${noteId}/send`, {
      method: "POST",
      body: JSON.stringify({ report }),
      token,
    });
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "レポートの送信に失敗しました" };
  }
}
