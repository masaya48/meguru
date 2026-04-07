"use client";

import { useState, useActionState } from "react";
import { createCourse, updateCourse, deleteCourse } from "./actions";

interface Course {
  id: string;
  name: string;
  monthlyFee: number;
  maxMonthlyReschedules: number;
}

function formatFee(fee: number): string {
  return `¥${fee.toLocaleString("ja-JP")}`;
}

function CourseForm({ course, onClose }: { course?: Course; onClose: () => void }) {
  const isEdit = !!course;

  const createAction = async (_prev: { error?: string }, formData: FormData) => {
    const result = await createCourse(_prev, formData);
    if (!result.error) onClose();
    return result;
  };

  const updateAction = async (_prev: { error?: string }, formData: FormData) => {
    const result = await updateCourse(course!.id, _prev, formData);
    if (!result.error) onClose();
    return result;
  };

  const [createState, createFormAction] = useActionState(createAction, {});
  const [updateState, updateFormAction] = useActionState(updateAction, {});

  const state = isEdit ? updateState : createState;
  const formAction = isEdit ? updateFormAction : createFormAction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md mx-4">
        <h2 className="text-lg font-bold text-ink mb-4">
          {isEdit ? "コースを編集" : "コースを追加"}
        </h2>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              コース名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              defaultValue={course?.name}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="例: ピアノ基礎コース"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              月謝 (円) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="monthlyFee"
              defaultValue={course?.monthlyFee}
              required
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="例: 8000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">月間振替上限回数</label>
            <input
              type="number"
              name="maxMonthlyReschedules"
              defaultValue={course?.maxMonthlyReschedules ?? 2}
              required
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
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
              {isEdit ? "更新" : "追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();

  // Load courses on mount
  useState(() => {
    fetch("/api/courses", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  });

  const handleDelete = async (id: string) => {
    if (!confirm("このコースを削除しますか？")) return;
    const result = await deleteCourse(id);
    if (!result.error) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(result.error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCourse(undefined);
    // Refresh courses
    fetch("/api/courses", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">コース管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
        >
          新規追加
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">読み込み中...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">コースが登録されていません</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
          >
            最初のコースを追加する
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-ink">{course.name}</p>
                  <p className="text-sm text-ink-light mt-0.5">
                    月謝: {formatFee(course.monthlyFee)}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    振替上限: 月{course.maxMonthlyReschedules}回
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setShowForm(true);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-ink hover:bg-gray-50"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editingCourse) && (
        <CourseForm course={editingCourse} onClose={handleFormClose} />
      )}
    </div>
  );
}
