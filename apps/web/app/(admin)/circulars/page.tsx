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

export default async function CircularsPage() {
  const token = await getToken();
  if (!token) redirect("/auth/login");

  let circulars: Circular[] = [];
  try {
    circulars = await api<Circular[]>("/circulars", { token });
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">回覧一覧</h1>
        <Link
          href="/circulars/new"
          className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + 新規作成
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs text-ink-light font-medium">タイトル</th>
              <th className="px-5 py-3 text-xs text-ink-light font-medium">種類</th>
              <th className="px-5 py-3 text-xs text-ink-light font-medium hidden sm:table-cell">
                既読数
              </th>
              <th className="px-5 py-3 text-xs text-ink-light font-medium">状態</th>
            </tr>
          </thead>
          <tbody>
            {circulars.map((c) => (
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
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.type === "NOTICE"
                        ? "bg-purple-100 text-purple-700"
                        : c.type === "ATTENDANCE"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {TYPE_LABELS[c.type]}
                  </span>
                </td>
                <td className="px-5 py-3 hidden sm:table-cell text-ink-light">{c._count.reads}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : c.status === "DRAFT"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {STATUS_LABELS[c.status]}
                  </span>
                </td>
              </tr>
            ))}
            {circulars.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-ink-light">
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
