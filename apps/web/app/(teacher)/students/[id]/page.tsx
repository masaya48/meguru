import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { InviteButton } from "./invite-button";

interface Course {
  id: string;
  name: string;
  monthlyFee: number;
}

interface Parent {
  id: string;
  name: string;
  email: string;
  lineLinked: boolean;
}

interface Student {
  id: string;
  name: string;
  notes?: string;
  courses: Course[];
  parents: Parent[];
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  course: { name: string };
}

interface LessonNote {
  id: string;
  date: string;
  content: string;
  course: { name: string };
}

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
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken();

  let student: Student;
  try {
    student = await api<Student>(`/students/${id}`, { token });
  } catch {
    notFound();
  }

  let attendance: AttendanceRecord[] = [];
  try {
    attendance = await api<AttendanceRecord[]>(`/students/${id}/attendance`, { token });
  } catch {
    // ignore
  }

  let lessonNotes: LessonNote[] = [];
  try {
    lessonNotes = await api<LessonNote[]>(`/students/${id}/lesson-notes`, { token });
  } catch {
    // ignore
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/students" className="text-sm text-brand-600 hover:underline">
          ← 生徒一覧
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h1 className="text-2xl font-bold text-ink">{student.name}</h1>
        {student.notes && <p className="mt-2 text-sm text-ink-light">{student.notes}</p>}
      </div>

      {/* Courses */}
      <section className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
        <h2 className="text-base font-bold text-ink">受講コース</h2>
        {student.courses.length === 0 ? (
          <p className="text-sm text-ink-light">コースが登録されていません</p>
        ) : (
          <div className="flex flex-col gap-2">
            {student.courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between">
                <span className="text-sm text-ink">{course.name}</span>
                <span className="text-sm text-ink-light">
                  ¥{course.monthlyFee.toLocaleString()}/月
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Parents */}
      <section className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
        <h2 className="text-base font-bold text-ink">保護者</h2>
        {student.parents.length === 0 ? (
          <p className="text-sm text-ink-light">保護者が登録されていません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {student.parents.map((parent) => (
              <div key={parent.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{parent.name}</p>
                  <p className="text-xs text-ink-light">{parent.email}</p>
                </div>
                {parent.lineLinked ? (
                  <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                    LINE連携済
                  </span>
                ) : (
                  <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    未連携
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Invite */}
      <section className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
        <h2 className="text-base font-bold text-ink">招待リンク</h2>
        <p className="text-sm text-ink-light">保護者にLINE連携の招待リンクを送付できます</p>
        <InviteButton studentId={student.id} />
      </section>

      {/* Attendance History */}
      <section className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
        <h2 className="text-base font-bold text-ink">出欠履歴</h2>
        {attendance.length === 0 ? (
          <p className="text-sm text-ink-light">出欠記録がありません</p>
        ) : (
          <div className="flex flex-col gap-2">
            {attendance.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink">{formatDate(record.date)}</p>
                  <p className="text-xs text-ink-light">{record.course.name}</p>
                </div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ATTENDANCE_CLASSES[record.status] ?? "bg-gray-100 text-gray-800"}`}
                >
                  {ATTENDANCE_LABELS[record.status] ?? record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lesson Notes */}
      <section className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
        <h2 className="text-base font-bold text-ink">レッスンノート</h2>
        {lessonNotes.length === 0 ? (
          <p className="text-sm text-ink-light">レッスンノートがありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {lessonNotes.slice(0, 5).map((note) => (
              <div key={note.id} className="border-l-2 border-brand-600 pl-3">
                <p className="text-xs text-ink-light">
                  {formatDate(note.date)} · {note.course.name}
                </p>
                <p className="text-sm text-ink mt-0.5 line-clamp-2">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
