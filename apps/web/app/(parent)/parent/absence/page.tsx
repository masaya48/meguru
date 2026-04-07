"use client";

import { useState, useEffect, useActionState } from "react";
import { reportAbsence } from "./actions";

interface LessonSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  student: { id: string; name: string };
  course: { id: string; name: string };
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日（${DAY_LABELS[d.getDay()]}）`;
}

export default function ParentAbsencePage() {
  const [sessions, setSessions] = useState<LessonSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, formAction, pending] = useActionState(reportAbsence, {});

  useEffect(() => {
    fetch("/api/lessons/weekly", { credentials: "include" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          const today = new Date().toISOString().split("T")[0];
          const upcoming = (data as LessonSession[])
            .filter((s) => s.date >= today && s.status === "SCHEDULED")
            .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
          setSessions(upcoming);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const success = state.success === true;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink">欠席連絡</h2>
        <p className="text-sm text-ink-light mt-0.5">欠席するレッスンを選択してください</p>
      </div>

      {success ? (
        <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
          <p className="text-lg font-bold text-green-800">欠席連絡を送信しました</p>
          <p className="mt-2 text-sm text-green-700">先生に通知されました。</p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {loading ? (
            <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
              <p className="text-ink-light">読み込み中...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
              <p className="text-ink-light">欠席連絡できるレッスンがありません</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium text-ink">レッスンを選択</p>
              </div>
              <div className="divide-y">
                {sessions.map((session) => (
                  <label
                    key={session.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="lessonSessionId"
                      value={session.id}
                      className="size-4 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {formatDateFull(session.date)} {session.startTime}
                      </p>
                      <p className="text-xs text-ink-light">
                        {session.student.name} — {session.course.name}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          {sessions.length > 0 && (
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-brand-600 px-6 py-4 text-base font-bold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {pending ? "送信中..." : "欠席を連絡する"}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
