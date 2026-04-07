"use client";

import { useState, useActionState, useEffect } from "react";
import { createSlot, deleteSlot, generateSessions } from "./actions";

interface LessonSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  student: { id: string; name: string };
  course: { id: string; name: string };
}

interface Course {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

function SlotForm({
  courses,
  students,
  onClose,
}: {
  courses: Course[];
  students: Student[];
  onClose: () => void;
}) {
  const action = async (_prev: { error?: string }, formData: FormData) => {
    const result = await createSlot(_prev, formData);
    if (!result.error) onClose();
    return result;
  };
  const [state, formAction] = useActionState(action, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md mx-4">
        <h2 className="text-lg font-bold text-ink mb-4">枠を追加</h2>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              コース <span className="text-red-500">*</span>
            </label>
            <select
              name="courseId"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">選択してください</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              生徒 <span className="text-red-500">*</span>
            </label>
            <select
              name="studentId"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">選択してください</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              曜日 <span className="text-red-500">*</span>
            </label>
            <select
              name="dayOfWeek"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {DAY_ORDER.map((d) => (
                <option key={d} value={d}>
                  {DAY_LABELS[d]}曜日
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink mb-1">
                開始時刻 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink mb-1">
                終了時刻 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GenerateForm({ onClose }: { onClose: () => void }) {
  const now = new Date();
  const action = async (_prev: { error?: string }, formData: FormData) => {
    const result = await generateSessions(_prev, formData);
    if (!result.error) onClose();
    return result;
  };
  const [state, formAction] = useActionState(action, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm mx-4">
        <h2 className="text-lg font-bold text-ink mb-4">セッション生成</h2>
        <form action={formAction} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink mb-1">年</label>
              <input
                type="number"
                name="year"
                defaultValue={now.getFullYear()}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink mb-1">月</label>
              <select
                name="month"
                defaultValue={now.getMonth() + 1}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
            </div>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
            >
              生成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [slots, setSlots] = useState<LessonSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const loadData = () => {
    Promise.all([
      fetch("/api/lessons/slots", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/courses", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/students", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([slotsData, coursesData, studentsData]) => {
        if (Array.isArray(slotsData)) setSlots(slotsData);
        if (Array.isArray(coursesData)) setCourses(coursesData);
        if (Array.isArray(studentsData)) setStudents(studentsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteSlot = async (id: string) => {
    if (!confirm("この枠を削除しますか？")) return;
    const result = await deleteSlot(id);
    if (!result.error) {
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert(result.error);
    }
  };

  const slotsByDay = DAY_ORDER.map((day) => ({
    day,
    slots: slots
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter((g) => g.slots.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">スケジュール</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSlotForm(true)}
            className="rounded-xl border border-brand-600 px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
          >
            枠追加
          </button>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-bold text-white hover:bg-brand-700"
          >
            セッション生成
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">読み込み中...</p>
        </div>
      ) : slotsByDay.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">スケジュールが登録されていません</p>
          <button
            onClick={() => setShowSlotForm(true)}
            className="mt-4 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
          >
            最初の枠を追加する
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {slotsByDay.map(({ day, slots: daySlots }) => (
            <div key={day} className="bg-white rounded-xl shadow-sm border">
              <div className="border-b px-4 py-3">
                <h2 className="font-bold text-ink">{DAY_LABELS[day]}曜日</h2>
              </div>
              <div className="divide-y">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-light">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="font-medium text-ink">{slot.student.name}</p>
                      <p className="text-xs text-ink-muted">{slot.course.name}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSlotForm && (
        <SlotForm
          courses={courses}
          students={students}
          onClose={() => {
            setShowSlotForm(false);
            loadData();
          }}
        />
      )}

      {showGenerateForm && (
        <GenerateForm
          onClose={() => {
            setShowGenerateForm(false);
          }}
        />
      )}
    </div>
  );
}
