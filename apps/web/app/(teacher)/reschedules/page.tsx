"use client";

import { useState, useEffect } from "react";
import { approveReschedule, rejectReschedule } from "./actions";

interface RescheduleRequest {
  id: string;
  status: string;
  requestedDate: string;
  reason?: string;
  student: { id: string; name: string };
  session: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    course: { id: string; name: string };
  };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "承認待ち",
  APPROVED: "承認済み",
  REJECTED: "却下",
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function ReschedulesPage() {
  const [requests, setRequests] = useState<RescheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING">("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadRequests = (status?: string) => {
    const url =
      status && status !== "ALL" ? `/api/reschedules?status=${status}` : "/api/reschedules";
    setLoading(true);
    fetch(url, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRequests(data);
        else setRequests([]);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests(filter);
  }, [filter]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const result = await approveReschedule(id);
    setProcessingId(null);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", "振替リクエストを承認しました");
      loadRequests(filter);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("このリクエストを却下しますか？")) return;
    setProcessingId(id);
    const result = await rejectReschedule(id);
    setProcessingId(null);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", "振替リクエストを却下しました");
      loadRequests(filter);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">振替リクエスト</h1>
      </div>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["PENDING", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-300 text-ink hover:bg-gray-50"
            }`}
          >
            {f === "PENDING" ? "承認待ち" : "すべて"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">読み込み中...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">振替リクエストはありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((req) => {
            const statusClass = STATUS_CLASSES[req.status] ?? "bg-gray-100 text-gray-800";
            const statusLabel = STATUS_LABELS[req.status] ?? req.status;
            const isPending = req.status === "PENDING";
            const isProcessing = processingId === req.id;

            return (
              <div key={req.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-ink">{req.student.name}</p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-ink-light mt-1">
                      元のレッスン: {formatDate(req.session.date)} {req.session.startTime} -{" "}
                      {req.session.endTime}
                    </p>
                    <p className="text-xs text-ink-muted">{req.session.course.name}</p>
                    {req.requestedDate && (
                      <p className="text-sm text-ink-light mt-1">
                        振替希望日: {formatDate(req.requestedDate)}
                      </p>
                    )}
                    {req.reason && (
                      <p className="text-xs text-ink-muted mt-1 italic">理由: {req.reason}</p>
                    )}
                  </div>
                </div>

                {isPending && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={isProcessing}
                      className="flex-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {isProcessing ? "処理中..." : "承認"}
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={isProcessing}
                      className="flex-1 rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      却下
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
