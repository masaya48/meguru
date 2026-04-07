"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { recordAttendance, saveMemo, generateReport, sendReport } from "../actions";

interface SessionDetail {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  student: { id: string; name: string };
  course: { id: string; name: string };
  attendance?: { id: string; status: string } | null;
  lessonNote?: { id: string; memo: string; reportStatus: string; reportContent?: string } | null;
}

const ATTENDANCE_OPTIONS = [
  {
    status: "PRESENT",
    label: "⭕ 出席",
    className: "border-green-400 bg-green-50 text-green-700 hover:bg-green-100",
  },
  {
    status: "ABSENT",
    label: "❌ 欠席",
    className: "border-red-400 bg-red-50 text-red-700 hover:bg-red-100",
  },
  {
    status: "LATE",
    label: "△ 遅刻",
    className: "border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
  },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState("");
  const [savingMemo, setSavingMemo] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/lessons/${sessionId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: SessionDetail) => {
        setSession(data);
        if (data.attendance) setAttendanceStatus(data.attendance.status);
        if (data.lessonNote) {
          setMemo(data.lessonNote.memo ?? "");
          setNoteId(data.lessonNote.id);
          setReportContent(data.lessonNote.reportContent ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAttendance = async (status: string) => {
    const result = await recordAttendance(sessionId, status);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      setAttendanceStatus(status);
      showMessage("success", "出欠を記録しました");
    }
  };

  const handleSaveMemo = async () => {
    setSavingMemo(true);
    const result = await saveMemo(sessionId, memo);
    setSavingMemo(false);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      if (result.id) setNoteId(result.id);
      showMessage("success", "メモを保存しました");
    }
  };

  const handleGenerateReport = async () => {
    if (!noteId) {
      showMessage("error", "先にメモを保存してください");
      return;
    }
    setGeneratingReport(true);
    const result = await generateReport(noteId);
    setGeneratingReport(false);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      setReportContent(result.report ?? "");
      showMessage("success", "レポートを生成しました");
    }
  };

  const handleSendReport = async () => {
    if (!noteId) return;
    setSendingReport(true);
    const result = await sendReport(noteId, reportContent);
    setSendingReport(false);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", "レポートをLINEで送信しました");
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
        <p className="text-ink-light">読み込み中...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
        <p className="text-ink-light">セッションが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Session info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h1 className="text-xl font-bold text-ink">{session.student.name}</h1>
        <p className="text-sm text-ink-light mt-1">{session.course.name}</p>
        <p className="text-sm text-ink-muted mt-0.5">
          {formatDate(session.date)} {session.startTime} - {session.endTime}
        </p>
      </div>

      {/* Attendance buttons */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h2 className="font-bold text-ink mb-3">出欠記録</h2>
        <div className="flex gap-3">
          {ATTENDANCE_OPTIONS.map((opt) => (
            <button
              key={opt.status}
              onClick={() => handleAttendance(opt.status)}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-colors ${opt.className} ${
                attendanceStatus === opt.status ? "ring-2 ring-offset-1 ring-brand-500" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {attendanceStatus && (
          <p className="mt-2 text-xs text-ink-light text-center">
            現在:{" "}
            {ATTENDANCE_OPTIONS.find((o) => o.status === attendanceStatus)?.label ??
              attendanceStatus}
          </p>
        )}
      </div>

      {/* Lesson memo */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h2 className="font-bold text-ink mb-3">レッスンメモ</h2>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          placeholder="本日のレッスン内容を記録してください..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <button
          onClick={handleSaveMemo}
          disabled={savingMemo}
          className="mt-2 w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {savingMemo ? "保存中..." : "メモを保存"}
        </button>
      </div>

      {/* AI Report */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h2 className="font-bold text-ink mb-3">AIレポート</h2>
        <button
          onClick={handleGenerateReport}
          disabled={generatingReport || !noteId}
          className="w-full rounded-xl border border-brand-600 px-4 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
        >
          {generatingReport ? "生成中..." : "AIレポート生成"}
        </button>

        {reportContent && (
          <>
            <div className="mt-3">
              <label className="block text-sm font-medium text-ink mb-1">
                レポートプレビュー（編集可）
              </label>
              <textarea
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
            <button
              onClick={handleSendReport}
              disabled={sendingReport}
              className="mt-2 w-full rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {sendingReport ? "送信中..." : "LINE送信"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
