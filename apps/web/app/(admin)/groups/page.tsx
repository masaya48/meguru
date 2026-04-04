import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GroupForm } from "./group-form";
import { deleteGroup } from "./actions";
import { Trash2 } from "lucide-react";

interface Group {
  id: string;
  name: string;
  _count: { users: number };
}

export default async function GroupsPage() {
  const token = await getToken();
  if (!token) redirect("/auth/login");

  let groups: Group[] = [];
  try {
    groups = await api<Group[]>("/groups", { token });
  } catch {}

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-ink">グループ管理</h1>

      <GroupForm />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-5 py-3 text-left text-xs text-ink-light">グループ名</th>
              <th className="px-5 py-3 text-left text-xs text-ink-light">メンバー数</th>
              <th className="px-5 py-3 text-right text-xs text-ink-light">操作</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-t">
                <td className="px-5 py-3 font-medium">{g.name}</td>
                <td className="px-5 py-3 text-ink-light">{g._count.users}名</td>
                <td className="px-5 py-3 text-right">
                  <form action={deleteGroup.bind(null, g.id)} className="inline">
                    <button className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-ink-muted">
                  グループはまだありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
