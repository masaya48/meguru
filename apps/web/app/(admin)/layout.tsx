import { redirect } from "next/navigation";
import { getToken, parseJwt } from "@/lib/auth";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { AdminMobileNav } from "@/components/layouts/admin-mobile-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  if (!token) redirect("/auth/login");

  const payload = parseJwt(token);
  if (!payload) redirect("/auth/login");

  // Only admins can access admin pages
  if (payload.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminMobileNav />
      <main className="md:ml-52 p-5">{children}</main>
    </div>
  );
}
