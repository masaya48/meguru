"use client";

import { useState, useEffect } from "react";
import { sendLessonNote, generateMonthlySummary, sendMonthlySummary } from "./actions";

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

interface MonthlySummary {
  id: string;
  status: string;
  year: number;
  month: number;
  student: { id: string; name: string };
  course: { id: string; name: string };
}

interface Student {
  id: string;
  name: string;
  courses: { id: string; name: string }[];
}

const REPORT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "下書き",
  SENT: "送信済み",
};

const REPORT_STATUS_CLASSES: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  SENT: "bg-green-100 text-green-800",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function ReportsPage() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<"lesson" | "monthly">("lesson");
  const [lessonNotes, setLessonNotes] = useState<LessonNote[]>([]);
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [summaryYear, setSummaryYear] = useState(now.getFullYear());
  const [summaryMonth, setSummaryMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadLessonNotes = () => {
    fetch("/api/lesson-notes", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLessonNotes(data);
      })
      .catch(() => {});
  };

  const loadSummaries = (y: number, m: number) => {
    fetch(`/api/monthly-summaries?year=${y}&month=${m}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSummaries(data);
      })
      .catch(() => {});
  };

  const loadStudents = () => {
    fetch("/api/students", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setStudents(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/lesson-notes", { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/monthly-summaries?year=${summaryYear}&month=${summaryMonth}`, {
        credentials: "include",
      }).then((r) => r.json()),
      fetch("/api/students", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([notes, sums, studs]) => {
        if (Array.isArray(notes)) setLessonNotes(notes);
        if (Array.isArray(sums)) setSummaries(sums);
        if (Array.isArray(studs)) setStudents(studs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) loadSummaries(summaryYear, summaryMonth);
  }, [summaryYear, summaryMonth]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSendNote = async (id: string) => {
    setProcessingId(id);
    const result = await sendLessonNote(id);
    setProcessingId(null);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", "レポートを送信しました");
      loadLessonNotes();
    }
  };

  const handleGenerateSummary = async (studentId: string, courseId: string) => {
    setProcessingId(`gen-${studentId}-${courseId}`);
    const result = await generateMonthlySummary(studentId, courseId, summaryYear, summaryMonth);
    setProcessingId(null);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", "月次サマリーを生成しました");
      loadSummaries(summaryYear, summaryMonth);
    }
  };

  const handleSendSummary = async (id: string) => {
    setProcessingId(id);
    const result = await sendMonthlySummary(id);
    setProcessingId(null);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", "月次サマリーを送信しました");
      loadSummaries(summaryYear, summaryMonth);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">レポート管理</h1>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("lesson")}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "lesson"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-ink-light hover:text-ink"
          }`}
        >
          レッスンレポート
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "monthly"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-ink-light hover:text-ink"
          }`}
        >
          月次サマリー
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">読み込み中...</p>
        </div>
      ) : activeTab === "lesson" ? (
        /* Lesson notes tab */
        lessonNotes.length === 0 ? (
          <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
            <p className="text-ink-light">レッスンレポートはありません</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lessonNotes.map((note) => {
              const statusClass =
                REPORT_STATUS_CLASSES[note.reportStatus] ?? "bg-gray-100 text-gray-800";
              const statusLabel = REPORT_STATUS_LABELS[note.reportStatus] ?? note.reportStatus;
              const isDraft = note.reportStatus === "DRAFT";
              const isProcessing = processingId === note.id;

              return (
                <div key={note.id} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-ink">
                          {note.session?.student?.name ?? "不明"}
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-sm text-ink-light mt-0.5">
                        {note.session?.date ? formatDate(note.session.date) : ""} —{" "}
                        {note.session?.course?.name ?? ""}
                      </p>
                      {note.memo && (
                        <p className="text-xs text-ink-muted mt-1 line-clamp-2">{note.memo}</p>
                      )}
                    </div>
                    {isDraft && (
                      <button
                        onClick={() => handleSendNote(note.id)}
                        disabled={isProcessing}
                        className="shrink-0 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        {isProcessing ? "送信中..." : "送信"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Monthly summary tab */
        <div className="space-y-4">
          {/* Month selector */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">年</label>
                <input
                  type="number"
                  value={summaryYear}
                  onChange={(e) => setSummaryYear(Number(e.target.value))}
                  className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">月</label>
                <select
                  value={summaryMonth}
                  onChange={(e) => setSummaryMonth(Number(e.target.value))}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}月
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Generate buttons per student/course */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h3 className="text-sm font-medium text-ink mb-3">サマリー生成</h3>
              <div className="flex flex-col gap-2">
                {students.flatMap((student) =>
                  student.courses.map((course) => {
                    const genKey = `gen-${student.id}-${course.id}`;
                    const isProcessing = processingId === genKey;
                    return (
                      <div key={genKey} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-ink">{student.name}</p>
                          <p className="text-xs text-ink-light">{course.name}</p>
                        </div>
                        <button
                          onClick={() => handleGenerateSummary(student.id, course.id)}
                          disabled={isProcessing}
                          className="rounded-lg border border-brand-600 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-50"
                        >
                          {isProcessing ? "生成中..." : "生成"}
                        </button>
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          )}

          {summaries.length === 0 ? (
            <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
              <p className="text-ink-light">この月の月次サマリーはありません</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {summaries.map((summary) => {
                const statusClass =
                  REPORT_STATUS_CLASSES[summary.status] ?? "bg-gray-100 text-gray-800";
                const statusLabel = REPORT_STATUS_LABELS[summary.status] ?? summary.status;
                const isDraft = summary.status === "DRAFT";
                const isProcessing = processingId === summary.id;

                return (
                  <div key={summary.id} className="bg-white rounded-xl p-4 shadow-sm border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-ink">{summary.student.name}</p>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-sm text-ink-light mt-0.5">{summary.course.name}</p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {summary.year}年{summary.month}月
                        </p>
                      </div>
                      {isDraft && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleSendSummary(summary.id)}
                            disabled={isProcessing}
                            className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                          >
                            {isProcessing ? "送信中..." : "送信"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
