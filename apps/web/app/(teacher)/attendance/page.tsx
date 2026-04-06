"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface LessonSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  student: { id: string; name: string };
  course: { id: string; name: string };
  attendance?: { status: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "予定",
  COMPLETED: "完了",
  CANCELLED: "キャンセル",
};

const STATUS_CLASSES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const ATTENDANCE_LABELS: Record<string, string> = {
  PRESENT: "出席",
  ABSENT: "欠席",
  LATE: "遅刻",
  EXCUSED: "公欠",
};

const ATTENDANCE_CLASSES: Record<string, string> = {
  PRESENT: "bg-green-100 text-green-800",
  ABSENT: "bg-red-100 text-red-800",
  LATE: "bg-yellow-100 text-yellow-800",
  EXCUSED: "bg-gray-100 text-gray-800",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function toInputDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function AttendancePage() {
  const [date, setDate] = useState(toInputDate(new Date()));
  const [sessions, setSessions] = useState<LessonSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lessons/daily?date=${date}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSessions(data);
        else setSessions([]);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">出欠管理</h1>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <label className="block text-sm font-medium text-ink mb-2">日付</label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setLoading(true);
            setDate(e.target.value);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {date && <p className="mt-1 text-sm text-ink-light">{formatDate(date)}</p>}
      </div>

      {loading ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">読み込み中...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">この日のセッションはありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const statusClass = STATUS_CLASSES[session.status] ?? "bg-gray-100 text-gray-800";
            const statusLabel = STATUS_LABELS[session.status] ?? session.status;
            const attClass = session.attendance
              ? (ATTENDANCE_CLASSES[session.attendance.status] ?? "bg-gray-100 text-gray-800")
              : null;
            const attLabel = session.attendance
              ? (ATTENDANCE_LABELS[session.attendance.status] ?? session.attendance.status)
              : null;

            return (
              <Link
                key={session.id}
                href={`/attendance/${session.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-light">
                      {session.startTime} - {session.endTime}
                    </p>
                    <p className="text-lg font-bold text-ink mt-0.5 truncate">
                      {session.student.name}
                    </p>
                    <p className="text-xs text-ink-muted">{session.course.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                    {attLabel && attClass && (
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${attClass}`}
                      >
                        {attLabel}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
