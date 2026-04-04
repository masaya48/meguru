import { getToken, parseJwt } from "@/lib/auth";
import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { logout } from "./actions";

interface UserInfo {
  id: string;
  name: string;
  email: string | null;
  role: string;
  group: { name: string } | null;
  lineUserId: string | null;
}

export default async function SettingsPage() {
  const token = await getToken();
  if (!token) redirect("/auth/login");

  const payload = parseJwt(token);
  if (!payload) redirect("/auth/login");

  let user: UserInfo | null = null;
  try {
    user = await api<UserInfo>(`/users/${payload.userId}`, { token });
  } catch {
    // fallback
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
        <Settings size={24} />
        設定
      </h1>

      {/* Profile */}
      <div className="rounded-xl bg-gray-50 p-5 space-y-3">
        <h2 className="text-lg font-bold text-ink">プロフィール</h2>
        <div className="space-y-2 text-lg">
          <div className="flex justify-between">
            <span className="text-ink-light">名前</span>
            <span className="text-ink font-medium">{user?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-light">メール</span>
            <span className="text-ink font-medium">{user?.email ?? "—"}</span>
          </div>
          {user?.group && (
            <div className="flex justify-between">
              <span className="text-ink-light">グループ</span>
              <span className="text-ink font-medium">{user.group.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* LINE連携 */}
      <div className="rounded-xl bg-gray-50 p-5 space-y-3">
        <h2 className="text-lg font-bold text-ink">LINE連携</h2>
        {user?.lineUserId ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-lg">&#x2705;</span>
            <span className="text-lg text-ink">LINE連携済み</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-ink-light">
              LINEと連携すると、新しい回覧の通知を受け取れます
            </p>
            <p className="text-sm text-ink-muted">※ LINE連携機能は準備中です</p>
          </div>
        )}
      </div>

      {/* Logout */}
      <form action={logout}>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-6 py-4 text-lg font-bold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          ログアウト
        </button>
      </form>
    </div>
  );
}
