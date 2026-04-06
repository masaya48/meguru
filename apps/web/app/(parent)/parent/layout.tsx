import { redirect } from "next/navigation";
import { getToken, parseJwt } from "@/lib/auth";
import { api } from "@/lib/api";

interface Tenant {
  name: string;
}

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();

  if (!token) {
    redirect("/auth/login");
  }

  const payload = parseJwt(token);

  if (!payload || payload.role !== "PARENT") {
    redirect("/auth/login");
  }

  let tenantName = "まなぶん";
  try {
    const tenant = await api<Tenant>("/tenants/me", { token });
    if (tenant?.name) {
      tenantName = tenant.name;
    }
  } catch {
    // Graceful fallback
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-lg">
          <p className="text-xs text-ink-light">まなぶん</p>
          <h1 className="text-base font-bold text-ink">{tenantName}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-5">{children}</main>
    </div>
  );
}
