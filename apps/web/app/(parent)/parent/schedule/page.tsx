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

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日（${DAY_LABELS[d.getDay()]}）`;
}

export default async function ParentSchedulePage() {
  const token = await getToken();

  let sessions: LessonSession[] = [];
  try {
    sessions = await api<LessonSession[]>("/lessons/weekly", { token });
  } catch {
    // ignore
  }

  const sorted = [...sessions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
  );

  // Group by date
  const grouped = sorted.reduce<Record<string, LessonSession[]>>((acc, session) => {
    if (!acc[session.date]) acc[session.date] = [];
    acc[session.date].push(session);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink">レッスン予定</h2>
        <p className="text-sm text-ink-light mt-0.5">今週のスケジュール</p>
      </div>

      {dates.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">今週の予定はありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {dates.map((date) => (
            <div key={date} className="bg-white rounded-xl shadow-sm border">
              <div className="border-b px-4 py-3">
                <h3 className="font-bold text-ink">{formatDateFull(date)}</h3>
              </div>
              <div className="divide-y">
                {grouped[date].map((session) => {
                  const statusClass = STATUS_CLASSES[session.status] ?? "bg-gray-100 text-gray-800";
                  const statusLabel = STATUS_LABELS[session.status] ?? session.status;

                  return (
                    <div key={session.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink-light">
                            {session.startTime} - {session.endTime}
                          </p>
                          <p className="font-medium text-ink mt-0.5">{session.student.name}</p>
                          <p className="text-xs text-ink-muted">{session.course.name}</p>
                        </div>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
