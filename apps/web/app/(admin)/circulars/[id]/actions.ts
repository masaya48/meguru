"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function publishCircular(circularId: string) {
  const token = await getToken();
  if (!token) redirect("/auth/login");
  await api(`/circulars/${circularId}/publish`, { method: "POST", token });
  revalidatePath(`/circulars/${circularId}`);
  revalidatePath("/circulars");
  revalidatePath("/dashboard");
}

export async function closeCircular(circularId: string) {
  const token = await getToken();
  if (!token) redirect("/auth/login");
  await api(`/circulars/${circularId}/close`, { method: "POST", token });
  revalidatePath(`/circulars/${circularId}`);
  revalidatePath("/circulars");
}

export async function deleteCircular(circularId: string) {
  const token = await getToken();
  if (!token) redirect("/auth/login");
  await api(`/circulars/${circularId}`, { method: "DELETE", token });
  revalidatePath("/circulars");
  redirect("/circulars");
}
