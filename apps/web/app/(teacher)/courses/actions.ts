"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCourse(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const token = await getToken();
  const name = formData.get("name") as string;
  const monthlyFee = Number(formData.get("monthlyFee"));
  const maxMonthlyReschedules = Number(formData.get("maxMonthlyReschedules"));

  try {
    await api("/courses", {
      method: "POST",
      body: JSON.stringify({ name, monthlyFee, maxMonthlyReschedules }),
      token,
    });
    revalidatePath("/courses");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "コースの登録に失敗しました" };
  }
}

export async function updateCourse(
  id: string,
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const token = await getToken();
  const name = formData.get("name") as string;
  const monthlyFee = Number(formData.get("monthlyFee"));
  const maxMonthlyReschedules = Number(formData.get("maxMonthlyReschedules"));

  try {
    await api(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name, monthlyFee, maxMonthlyReschedules }),
      token,
    });
    revalidatePath("/courses");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "コースの更新に失敗しました" };
  }
}

export async function deleteCourse(id: string): Promise<{ error?: string }> {
  const token = await getToken();
  try {
    await api(`/courses/${id}`, {
      method: "DELETE",
      token,
    });
    revalidatePath("/courses");
    return {};
  } catch (e: unknown) {
    if (e instanceof Error && "digest" in e) throw e;
    return { error: "コースの削除に失敗しました" };
  }
}
