"use server";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
  const token = await getToken();
  if (!token) return;
  await api(`/users/${userId}/approve`, { method: "POST", token });
  revalidatePath("/members");
}
