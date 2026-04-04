"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createGroup(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "ログインが必要です" };

  const name = formData.get("name") as string;
  try {
    await api("/groups", {
      method: "POST",
      token,
      body: JSON.stringify({ name }),
    });
    revalidatePath("/groups");
    return {};
  } catch {
    return { error: "グループの作成に失敗しました" };
  }
}

export async function deleteGroup(groupId: string) {
  const token = await getToken();
  if (!token) return;
  await api(`/groups/${groupId}`, { method: "DELETE", token });
  revalidatePath("/groups");
}
