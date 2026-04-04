import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Circular {
  id: string;
  title: string;
  type: string;
  status: string;
  publishedAt: string | null;
  _count: { reads: number; questions: number };
}

const TYPE_LABELS: Record<string, string> = {
  NOTICE: "お知らせ",
  SURVEY: "アンケート",
  ATTENDANCE: "出欠確認",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "下書き",
  PUBLISHED: "配信中",
  CLOSED: "終了",
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    PUBLISHED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? ""}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    NOTICE: "bg-purple-100 text-purple-700",
    ATTENDANCE: "bg-blue-100 text-blue-700",
    SURVEY: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[type] ?? ""}`}>
      {TYPE_LABELS[type]}
    </span>
  );
}

export default async function DashboardPage() {
  const token = await getToken();
  if (!token) redirect("/auth/login");

  let circulars: Circular[] = [];
  try {
    circulars = await api<Circular[]>("/circulars", { token });
  } catch {
    // API down
  }

  const published = circulars.filter((c) => c.status === "PUBLISHED").length;
  const drafts = circulars.filter((c) => c.status === "DRAFT").length;
  const thisMonth = circulars.filter((c) => {
    if (!c.publishedAt) return false;
    const d = new Date(c.publishedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink">ダッシュボード</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <p className="text-xs text-ink-light">配信中</p>
          <p className="text-3xl font-bold text-brand-800">{published}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <p className="text-xs text-ink-light">下書き</p>
          <p className="text-3xl font-bold text-ink">{drafts}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <p className="text-xs text-ink-light">今月の配信</p>
          <p className="text-3xl font-bold text-green-600">{thisMonth}</p>
        </div>
      </div>

      {/* Recent Circulars Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h2 className="text-base font-bold text-ink">最近の回覧</h2>
          <Link
            href="/circulars/new"
            className="text-sm text-brand-800 font-medium hover:underline"
          >
            + 新規作成
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs text-ink-light font-medium">タイトル</th>
              <th className="px-5 py-3 text-xs text-ink-light font-medium">種類</th>
              <th className="px-5 py-3 text-xs text-ink-light font-medium">状態</th>
            </tr>
          </thead>
          <tbody>
            {circulars.slice(0, 10).map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3">
                  <Link
                    href={`/circulars/${c.id}`}
                    className="font-medium text-ink hover:text-brand-800"
                  >
                    {c.title}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <TypeBadge type={c.type} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
            {circulars.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-ink-light">
                  回覧はまだありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
