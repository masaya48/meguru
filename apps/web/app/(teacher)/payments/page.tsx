"use client";

import { useState, useEffect } from "react";
import { generatePayments, markPaid } from "./actions";

interface Payment {
  id: string;
  status: string;
  amount: number;
  dueDate?: string;
  student: { id: string; name: string };
  course: { id: string; name: string };
}

interface PaymentSummary {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "未納",
  PAID: "入金済み",
  OVERDUE: "延滞",
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
};

function formatFee(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export default function PaymentsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = (y: number, m: number) => {
    setLoading(true);
    Promise.all([
      fetch(`/api/payments?year=${y}&month=${m}`, { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/payments/summary?year=${y}&month=${m}`, { credentials: "include" }).then((r) =>
        r.json(),
      ),
    ])
      .then(([paymentsData, summaryData]) => {
        if (Array.isArray(paymentsData)) setPayments(paymentsData);
        else setPayments([]);
        if (summaryData && typeof summaryData === "object")
          setSummary(summaryData as PaymentSummary);
      })
      .catch(() => {
        setPayments([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData(year, month);
  }, [year, month]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleGenerate = async () => {
    if (!confirm(`${year}年${month}月の支払いを一括生成しますか？`)) return;
    setGenerating(true);
    const result = await generatePayments(year, month);
    setGenerating(false);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", "支払いを生成しました");
      loadData(year, month);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setProcessingId(id);
    const result = await markPaid(id);
    setProcessingId(null);
    if (result.error) {
      showMessage("error", result.error);
    } else {
      showMessage("success", "入金を確認しました");
      loadData(year, month);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">支払い管理</h1>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {generating ? "生成中..." : "一括生成"}
        </button>
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

      {/* Month selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">年</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">月</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
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

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-xs text-ink-light">合計件数</p>
            <p className="text-2xl font-bold text-ink">{summary.total}件</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-xs text-ink-light">入金済み</p>
            <p className="text-2xl font-bold text-green-600">{summary.paid}件</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-xs text-ink-light">未納</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.unpaid}件</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-xs text-ink-light">延滞</p>
            <p className="text-2xl font-bold text-red-600">{summary.overdue}件</p>
          </div>
        </div>
      )}

      {/* Payments list */}
      {loading ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">読み込み中...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">支払いデータがありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((payment) => {
            const statusClass = STATUS_CLASSES[payment.status] ?? "bg-gray-100 text-gray-800";
            const statusLabel = STATUS_LABELS[payment.status] ?? payment.status;
            const isPending = payment.status === "PENDING" || payment.status === "OVERDUE";
            const isProcessing = processingId === payment.id;

            return (
              <div key={payment.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-ink">{payment.student.name}</p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-ink-light mt-0.5">{payment.course.name}</p>
                    <p className="text-lg font-bold text-ink mt-1">{formatFee(payment.amount)}</p>
                  </div>
                  {isPending && (
                    <button
                      onClick={() => handleMarkPaid(payment.id)}
                      disabled={isProcessing}
                      className="shrink-0 rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {isProcessing ? "処理中..." : "入金確認"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
