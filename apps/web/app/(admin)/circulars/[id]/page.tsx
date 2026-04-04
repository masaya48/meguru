import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { publishCircular, closeCircular, deleteCircular } from "./actions";

interface Stats {
  totalTargetUsers: number;
  readCount: number;
  readRate: number;
  circular: {
    id: string;
    title: string;
    body: string;
    type: string;
    status: string;
    publishedAt: string | null;
    deadline: string | null;
    createdBy: { name: string };
    reads: { userId: string; readAt: string }[];
  };
  questions: {
    id: string;
    questionText: string;
    type: string;
    answerCount: number;
    answerRate: number;
    answers: { user: { name: string }; answer: unknown }[];
  }[];
}

export default async function CircularDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken();
  if (!token) redirect("/auth/login");

  let stats: Stats;
  try {
    stats = await api<Stats>(`/circulars/${id}/stats`, { token });
  } catch {
    notFound();
  }

  const { circular } = stats;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/circulars" className="inline-flex items-center gap-1 text-sm text-brand-800">
        <ArrowLeft size={16} /> 回覧一覧
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">{circular.title}</h1>
          <p className="text-sm text-ink-light mt-1">
            {circular.createdBy.name}
            {circular.publishedAt &&
              ` ・ ${new Date(circular.publishedAt).toLocaleDateString("ja-JP")}`}
          </p>
        </div>
        <div className="flex gap-2">
          {circular.status === "DRAFT" && (
            <>
              <form action={publishCircular.bind(null, id)}>
                <button className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                  配信する
                </button>
              </form>
              <form action={deleteCircular.bind(null, id)}>
                <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  削除
                </button>
              </form>
            </>
          )}
          {circular.status === "PUBLISHED" && (
            <form action={closeCircular.bind(null, id)}>
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-ink-light hover:bg-gray-50">
                終了する
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-xs text-ink-light">対象者</p>
          <p className="text-2xl font-bold text-ink">{stats.totalTargetUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-xs text-ink-light">既読</p>
          <p className="text-2xl font-bold text-brand-800">{stats.readCount}</p>
          <p className="text-xs text-ink-muted">{stats.readRate}%</p>
        </div>
        {stats.questions.map((q) => (
          <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs text-ink-light">回答</p>
            <p className="text-2xl font-bold text-green-600">{q.answerCount}</p>
            <p className="text-xs text-ink-muted">{q.answerRate}%</p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-base font-bold text-ink mb-3">本文</h2>
        <div className="text-sm text-ink whitespace-pre-wrap">{circular.body}</div>
      </div>

      {/* Answers */}
      {stats.questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-base font-bold text-ink mb-3">回答一覧</h2>
          {stats.questions.map((q) => (
            <div key={q.id} className="mb-4">
              <p className="text-sm font-medium text-ink mb-2">{q.questionText}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs text-ink-light">名前</th>
                    <th className="px-3 py-2 text-left text-xs text-ink-light">回答</th>
                  </tr>
                </thead>
                <tbody>
                  {q.answers.map((a, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">{a.user.name}</td>
                      <td className="px-3 py-2">{String(a.answer)}</td>
                    </tr>
                  ))}
                  {q.answers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-3 py-4 text-center text-ink-muted">
                        まだ回答はありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Read list */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-base font-bold text-ink mb-3">既読一覧 ({stats.readCount}名)</h2>
        {circular.reads.length > 0 ? (
          <div className="text-sm text-ink-light space-y-1">
            {circular.reads.map((r, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-gray-100">
                <span>{r.userId.slice(0, 8)}...</span>
                <span>{new Date(r.readAt).toLocaleString("ja-JP")}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">まだ誰も読んでいません</p>
        )}
      </div>
    </div>
  );
}
