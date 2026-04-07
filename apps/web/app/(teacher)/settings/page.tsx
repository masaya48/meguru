"use client";

import { useState, useEffect } from "react";
import { logout } from "./actions";

interface TenantInfo {
  id: string;
  name: string;
  genre?: string;
  lineOfficialAccountId?: string;
}

export default function SettingsPage() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/tenants/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: TenantInfo) => setTenant(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    if (!confirm("ログアウトしますか？")) return;
    setLoggingOut(true);
    await logout();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">設定</h1>

      {loading ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">読み込み中...</p>
        </div>
      ) : (
        <>
          {/* Classroom info */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h2 className="text-sm font-bold text-ink-light uppercase tracking-wide mb-3">
              教室情報
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-ink-muted">教室名</p>
                <p className="font-medium text-ink">{tenant?.name ?? "未設定"}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">ジャンル</p>
                <p className="font-medium text-ink">{tenant?.genre ?? "未設定"}</p>
              </div>
            </div>
          </div>

          {/* LINE account */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h2 className="text-sm font-bold text-ink-light uppercase tracking-wide mb-3">
              LINE公式アカウント
            </h2>
            {tenant?.lineOfficialAccountId ? (
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  連携済み
                </span>
                <p className="text-sm text-ink-light">{tenant.lineOfficialAccountId}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  未連携
                </span>
                <p className="text-sm text-ink-light">LINE公式アカウントが連携されていません</p>
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h2 className="text-sm font-bold text-ink-light uppercase tracking-wide mb-3">
              アカウント
            </h2>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-xl border border-red-300 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {loggingOut ? "ログアウト中..." : "ログアウト"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
