import { redirect } from "next/navigation";
import { getToken, parseJwt } from "@/lib/auth";
import { TeacherBottomNav } from "@/components/layouts/teacher-bottom-nav";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();

  if (!token) {
    redirect("/auth/login");
  }

  const payload = parseJwt(token);

  if (!payload || payload.role !== "TEACHER") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <main className="mx-auto max-w-lg px-4 py-4">{children}</main>
      <TeacherBottomNav />
    </div>
  );
}
