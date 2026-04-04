import { redirect } from "next/navigation";
import { getToken, parseJwt } from "@/lib/auth";
import { api } from "@/lib/api";
import { ResidentHeader } from "@/components/layouts/resident-header";

export default async function ResidentLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  if (!token) redirect("/auth/login");

  const payload = parseJwt(token);
  if (!payload) redirect("/auth/login");

  let tenantName = "めぐる";
  try {
    const user = await api<{ tenant?: { name: string } }>(`/users/${payload.userId}`, { token });
    tenantName = user.tenant?.name ?? tenantName;
  } catch {
    // fallback to default
  }

  return (
    <div className="min-h-screen bg-white">
      <ResidentHeader tenantName={tenantName} />
      <main className="px-4 py-5 max-w-lg mx-auto">{children}</main>
    </div>
  );
}
