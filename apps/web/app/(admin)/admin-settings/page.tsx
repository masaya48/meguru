import { Settings } from "lucide-react";
import { logout } from "./actions";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-ink flex items-center gap-2">
        <Settings size={20} />
        設定
      </h1>

      <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
        <h2 className="text-base font-bold text-ink">アカウント</h2>
        <form action={logout}>
          <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            ログアウト
          </button>
        </form>
      </div>
    </div>
  );
}
