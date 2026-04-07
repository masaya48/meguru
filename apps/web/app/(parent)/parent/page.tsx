import Link from "next/link";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Student {
  id: string;
  name: string;
}

interface LessonSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  student: { id: string; name: string };
  course: { id: string; name: string };
}

interface LessonNote {
  id: string;
  reportStatus: string;
  memo: string;
  createdAt: string;
  session: {
    id: string;
    date: string;
    student: { id: string; name: string };
    course: { id: string; name: string };
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatDayShort(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
}

export default async function ParentHomePage() {
  const token = await getToken();

  let students: Student[] = [];
  let weeklySessions: LessonSession[] = [];
  let lessonNotes: LessonNote[] = [];

  try {
    students = await api<Student[]>("/students", { token });
  } catch {
    // ignore
  }

  try {
    weeklySessions = await api<LessonSession[]>("/lessons/weekly", { token });
  } catch {
    // ignore
  }

  try {
    lessonNotes = await api<LessonNote[]>("/lesson-notes", { token });
  } catch {
    // ignore
  }

  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = weeklySessions
    .filter((s) => s.date >= today && s.status === "SCHEDULED")
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const nextSession = upcomingSessions[0] ?? null;

  const sentNotes = lessonNotes
    .filter((n) => n.reportStatus === "SENT")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const latestNote = sentNotes[0] ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">お子さまの教室</h2>
        {students.length > 0 && (
          <p className="text-sm text-ink-light mt-0.5">{students.map((s) => s.name).join("・")}</p>
        )}
      </div>

      {/* Next lesson */}
      <div>
        <h3 className="text-sm font-medium text-ink-light mb-2">次のレッスン</h3>
        {nextSession ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-brand-600 font-medium">{formatDayShort(nextSession.date)}</p>
            <p className="text-lg font-bold text-ink mt-1">
              {nextSession.startTime} - {nextSession.endTime}
            </p>
            <p className="text-sm text-ink-light mt-0.5">{nextSession.student.name}</p>
            <p className="text-xs text-ink-muted">{nextSession.course.name}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <p className="text-ink-light text-sm">今週の予定はありません</p>
          </div>
        )}
      </div>

      {/* Latest report */}
      <div>
        <h3 className="text-sm font-medium text-ink-light mb-2">最新のレッスンレポート</h3>
        {latestNote ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-xs text-ink-muted">
              {latestNote.session?.date ? formatDate(latestNote.session.date) : ""}
              {latestNote.session?.student?.name ? ` — ${latestNote.session.student.name}` : ""}
            </p>
            <p className="text-sm text-ink-light mt-0.5">
              {latestNote.session?.course?.name ?? ""}
            </p>
            {latestNote.memo && (
              <p className="text-sm text-ink mt-2 leading-relaxed line-clamp-3">
                {latestNote.memo}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <p className="text-ink-light text-sm">レポートはまだありません</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/parent/reports"
          className="bg-white rounded-xl p-4 shadow-sm border text-center hover:shadow-md transition-shadow"
        >
          <p className="text-2xl mb-1">📋</p>
          <p className="text-sm font-medium text-ink">レポート一覧</p>
        </Link>
        <Link
          href="/parent/schedule"
          className="bg-white rounded-xl p-4 shadow-sm border text-center hover:shadow-md transition-shadow"
        >
          <p className="text-2xl mb-1">📅</p>
          <p className="text-sm font-medium text-ink">レッスン予定</p>
        </Link>
        <Link
          href="/parent/absence"
          className="bg-white rounded-xl p-4 shadow-sm border text-center hover:shadow-md transition-shadow"
        >
          <p className="text-2xl mb-1">🙏</p>
          <p className="text-sm font-medium text-ink">欠席連絡</p>
        </Link>
        <Link
          href="/parent/payments"
          className="bg-white rounded-xl p-4 shadow-sm border text-center hover:shadow-md transition-shadow"
        >
          <p className="text-2xl mb-1">💳</p>
          <p className="text-sm font-medium text-ink">月謝履歴</p>
        </Link>
      </div>
    </div>
  );
}
