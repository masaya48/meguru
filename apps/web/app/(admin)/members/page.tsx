import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { approveUser } from "./actions";

interface User {
  id: string;
  name: string;
  email: string | null;
  role: string;
  status: string;
  group: { name: string } | null;
  lineUserId: string | null;
}

export default async function MembersPage() {
  const token = await getToken();
  if (!token) redirect("/auth/login");

  let users: User[] = [];
  try {
    users = await api<User[]>("/users", { token });
  } catch {}

  const pending = users.filter((u) => u.status === "PENDING");
  const active = users.filter((u) => u.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink">住民管理</h1>

      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h2 className="text-base font-bold text-amber-800 mb-3">承認待ち ({pending.length}名)</h2>
          {pending.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between py-2 border-b border-amber-100 last:border-0"
            >
              <div>
                <p className="font-medium text-ink">{u.name}</p>
                <p className="text-xs text-ink-light">{u.email}</p>
              </div>
              <form action={approveUser.bind(null, u.id)}>
                <button className="rounded-md bg-brand-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
                  承認
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-5 py-3 text-left text-xs text-ink-light">名前</th>
              <th className="px-5 py-3 text-left text-xs text-ink-light hidden sm:table-cell">
                メール
              </th>
              <th className="px-5 py-3 text-left text-xs text-ink-light">グループ</th>
              <th className="px-5 py-3 text-left text-xs text-ink-light">役割</th>
              <th className="px-5 py-3 text-left text-xs text-ink-light">LINE</th>
            </tr>
          </thead>
          <tbody>
            {active.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-ink-light hidden sm:table-cell">{u.email ?? "—"}</td>
                <td className="px-5 py-3 text-ink-light">{u.group?.name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={u.role === "ADMIN" ? "text-brand-800 font-medium" : "text-ink-light"}
                  >
                    {u.role === "ADMIN" ? "管理者" : "住民"}
                  </span>
                </td>
                <td className="px-5 py-3">{u.lineUserId ? "✅" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
