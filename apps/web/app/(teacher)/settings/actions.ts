"use server";

import { clearToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function logout(): Promise<void> {
  await clearToken();
  redirect("/auth/login");
}
