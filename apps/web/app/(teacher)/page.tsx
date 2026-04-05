import Link from "next/link";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface LessonSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  student: { id: string; name: string };
  course: { id: string; name: string };
  attendance?: { status: string } | null;
  lessonNote?: { id: string; reportStatus: string } | null;
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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default async function TeacherHomePage() {
  const token = await getToken();
  const today = new Date().toISOString().split("T")[0];

  let sessions: LessonSession[] = [];
  try {
    sessions = await api<LessonSession[]>(`/lessons/daily?date=${today}`, { token });
  } catch {
    // Show empty state on error
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink">今日のレッスン</h1>
        <p className="text-sm text-ink-light">{formatDate(today)}</p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">今日のレッスンはありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const statusClass = STATUS_CLASSES[session.status] ?? "bg-gray-100 text-gray-800";
            const statusLabel = STATUS_LABELS[session.status] ?? session.status;

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
                    {session.attendance && (
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-ink-light">
                        {ATTENDANCE_LABELS[session.attendance.status] ?? session.attendance.status}
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
