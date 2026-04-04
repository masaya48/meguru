"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTemplate(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "ログインが必要です" };

  const name = formData.get("name") as string;
  const bodyTemplate = formData.get("bodyTemplate") as string;
  const type = formData.get("type") as string;

  try {
    await api("/templates", {
      method: "POST",
      token,
      body: JSON.stringify({ name, bodyTemplate, type }),
    });
    revalidatePath("/templates");
    return {};
  } catch {
    return { error: "テンプレートの作成に失敗しました" };
  }
}

export async function deleteTemplate(templateId: string) {
  const token = await getToken();
  if (!token) return;
  await api(`/templates/${templateId}`, { method: "DELETE", token });
  revalidatePath("/templates");
}
