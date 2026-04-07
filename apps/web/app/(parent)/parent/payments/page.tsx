import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Payment {
  id: string;
  status: string;
  amount: number;
  dueDate?: string;
  student: { id: string; name: string };
  course: { id: string; name: string };
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

export default async function ParentPaymentsPage() {
  const token = await getToken();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  let payments: Payment[] = [];
  try {
    payments = await api<Payment[]>(`/payments?year=${year}&month=${month}`, { token });
  } catch {
    // ignore
  }

  const sorted = [...payments].sort((a, b) => {
    if (a.dueDate && b.dueDate) return b.dueDate.localeCompare(a.dueDate);
    return 0;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink">月謝履歴</h2>
        <p className="text-sm text-ink-light mt-0.5">
          {year}年{month}月
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl bg-white border p-8 text-center shadow-sm">
          <p className="text-ink-light">支払い履歴はありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((payment) => {
            const statusClass = STATUS_CLASSES[payment.status] ?? "bg-gray-100 text-gray-800";
            const statusLabel = STATUS_LABELS[payment.status] ?? payment.status;

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
                    <p className="text-xl font-bold text-ink mt-1">{formatFee(payment.amount)}</p>
                    {payment.dueDate && (
                      <p className="text-xs text-ink-muted mt-0.5">
                        支払期限:{" "}
                        {new Date(payment.dueDate).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
