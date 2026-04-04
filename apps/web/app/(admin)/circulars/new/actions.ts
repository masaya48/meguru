"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface CreateResult {
  error?: string;
  circularId?: string;
}

export async function createCircular(
  _prevState: CreateResult,
  formData: FormData,
): Promise<CreateResult> {
  const token = await getToken();
  if (!token) return { error: "ログインが必要です" };

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const type = formData.get("type") as string;
  const targetType = formData.get("targetType") as string;
  const deadline = formData.get("deadline") as string;
  const questionsJson = formData.get("questions") as string;

  const questions = questionsJson ? JSON.parse(questionsJson) : undefined;

  try {
    const res = await api<{ id: string }>("/circulars", {
      method: "POST",
      token,
      body: JSON.stringify({
        title,
        body,
        type,
        targetType: targetType || "ALL",
        deadline: deadline || undefined,
        questions,
      }),
    });

    revalidatePath("/circulars");
    revalidatePath("/dashboard");
    return { circularId: res.id };
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "回覧の作成に失敗しました" };
  }
}

export async function publishCircular(circularId: string): Promise<{ error?: string }> {
  const token = await getToken();
  if (!token) return { error: "ログインが必要です" };

  try {
    await api(`/circulars/${circularId}/publish`, { method: "POST", token });
    revalidatePath("/circulars");
    revalidatePath("/dashboard");
    redirect(`/circulars/${circularId}`);
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "配信に失敗しました" };
  }
  return {};
}
