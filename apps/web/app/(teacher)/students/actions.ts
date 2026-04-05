"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function createStudent(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const token = await getToken();
  const name = formData.get("name") as string;
  const notes = formData.get("notes") as string;

  try {
    await api("/students", {
      method: "POST",
      body: JSON.stringify({ name, notes: notes || undefined }),
      token,
    });
    redirect("/students");
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "生徒の登録に失敗しました" };
  }
}

export async function generateInvite(studentId: string): Promise<{ inviteUrl: string }> {
  const token = await getToken();
  const result = await api<{ inviteUrl: string }>(`/students/${studentId}/invite`, {
    method: "POST",
    token,
  });
  return result;
}
