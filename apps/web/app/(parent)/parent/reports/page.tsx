import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

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

export default async function ParentReportsPage() {
  const token = await getToken();

  let notes: LessonNote[] = [];
  try {
    notes = await api<LessonNote[]>("/lesson-notes", { token });
  } catch {
    // ignore
  }

  const sentNotes = notes
    .filter((n) => n.reportStatus === "SENT")
    .sort((a, b) => {
      const dateA = a.session?.date ?? a.createdAt;
      const dateB = b.session?.date ?? b.createdAt;
      return dateB.localeCompare(dateA);
    });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink">レッスンレポート</h2>
        <p className="text-sm text-ink-light mt-0.5">先生からのレポート一覧</p>
      </div>

      {sentNotes.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">レポートはまだありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sentNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-ink">{note.session?.student?.name ?? ""}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {note.session?.date ? formatDate(note.session.date) : ""} —{" "}
                    {note.session?.course?.name ?? ""}
                  </p>
                </div>
                <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 shrink-0">
                  受信済み
                </span>
              </div>
              {note.memo && (
                <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{note.memo}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
