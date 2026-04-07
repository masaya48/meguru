import Link from "next/link";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Course {
  id: string;
  name: string;
}

interface Parent {
  id: string;
  lineLinked: boolean;
}

interface Student {
  id: string;
  name: string;
  courses: Course[];
  parents: Parent[];
}

export default async function StudentsPage() {
  const token = await getToken();

  let students: Student[] = [];
  try {
    students = await api<Student[]>("/students", { token });
  } catch {
    // Show empty state on error
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">生徒一覧</h1>
        <Link
          href="/students/new"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
        >
          新規登録
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">生徒が登録されていません</p>
          <Link
            href="/students/new"
            className="mt-4 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
          >
            最初の生徒を登録する
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((student) => {
            const lineLinkedCount = student.parents.filter((p) => p.lineLinked).length;
            const courseNames =
              student.courses.length > 0
                ? student.courses.map((c) => c.name).join("、")
                : "コースなし";

            return (
              <Link
                key={student.id}
                href={`/students/${student.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-ink">{student.name}</p>
                    <p className="text-sm text-ink-light mt-0.5 truncate">{courseNames}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-ink-light">
                      保護者 {student.parents.length}名
                    </span>
                    {lineLinkedCount > 0 && (
                      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                        LINE連携済
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
