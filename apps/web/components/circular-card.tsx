import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CircularCardProps {
  id: string;
  title: string;
  type: "NOTICE" | "SURVEY" | "ATTENDANCE";
  publishedAt: string;
  isRead: boolean;
  hasAnswer: boolean;
  needsAnswer: boolean;
  deadline?: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  NOTICE: "お知らせ",
  SURVEY: "アンケート",
  ATTENDANCE: "出欠確認",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function CircularCard({
  id,
  title,
  type,
  publishedAt,
  isRead,
  hasAnswer,
  needsAnswer,
  deadline,
}: CircularCardProps) {
  const isOverdue = deadline ? new Date(deadline) < new Date() : false;

  return (
    <Link href={`/circular/${id}`} className="block">
      <div
        className={
          isRead
            ? "rounded-xl bg-gray-100 p-5"
            : "rounded-xl bg-coral-100 border-l-4 border-l-coral-500 p-5"
        }
      >
        {/* Status + Date */}
        <div className="flex items-center gap-2 text-sm">
          {isRead ? (
            <span className="text-ink-light">既読 ・ {formatDate(publishedAt)}</span>
          ) : (
            <span className="text-coral-600 font-medium">未読 ・ {formatDate(publishedAt)}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-2 text-xl font-bold text-ink leading-snug">{title}</h3>

        {/* Type + Answer Status */}
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {TYPE_LABELS[type]}
          </Badge>
          {needsAnswer && !hasAnswer && !isOverdue && (
            <span className="text-sm text-coral-600 font-medium">回答をお願いします</span>
          )}
          {hasAnswer && <span className="text-sm text-ink-muted">回答済み</span>}
          {needsAnswer && isOverdue && !hasAnswer && (
            <span className="text-sm text-ink-muted">期限切れ</span>
          )}
        </div>

        {/* Answer button for unread + needs answer */}
        {!isRead && needsAnswer && !hasAnswer && !isOverdue && (
          <div className="mt-3">
            <span className="inline-block rounded-lg bg-coral-500 px-5 py-2 text-sm font-bold text-white">
              回答する
            </span>
          </div>
        )}

        {/* Deadline */}
        {deadline && !isOverdue && needsAnswer && !hasAnswer && (
          <p className="mt-2 text-xs text-ink-muted">回答期限: {formatDate(deadline)}</p>
        )}
      </div>
    </Link>
  );
}
