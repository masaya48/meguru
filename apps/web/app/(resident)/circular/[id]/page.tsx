import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { getToken, parseJwt } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AnswerSection } from "./answer-section";

interface Question {
  id: string;
  questionText: string;
  type: "YES_NO" | "SINGLE_CHOICE" | "MULTI_CHOICE" | "FREE_TEXT";
  options: string[] | null;
  sortOrder: number;
}

interface MyAnswer {
  question: { id: string };
  answer: unknown;
}

interface CircularDetail {
  id: string;
  title: string;
  body: string;
  type: "NOTICE" | "SURVEY" | "ATTENDANCE";
  status: string;
  publishedAt: string;
  deadline: string | null;
  createdBy: { id: string; name: string };
  questions: Question[];
}

const TYPE_LABELS: Record<string, string> = {
  NOTICE: "お知らせ",
  SURVEY: "アンケート",
  ATTENDANCE: "出欠確認",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default async function CircularDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken();
  if (!token) redirect("/auth/login");

  const payload = parseJwt(token);
  if (!payload) redirect("/auth/login");

  let circular: CircularDetail;
  try {
    circular = await api<CircularDetail>(`/circulars/${id}`, { token });
  } catch {
    notFound();
  }

  // Mark as read (fire-and-forget)
  api(`/circulars/${id}/reads`, { method: "POST", token }).catch(() => {});

  // Fetch my existing answers
  let myAnswers: MyAnswer[] = [];
  if (circular.questions.length > 0) {
    try {
      myAnswers = await api<MyAnswer[]>(`/circulars/${id}/answers/mine`, { token });
    } catch {
      // ignore
    }
  }

  const myAnswerMap = new Map(myAnswers.map((a) => [a.question.id, a.answer]));

  const isOverdue = circular.deadline ? new Date(circular.deadline) < new Date() : false;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center gap-1 text-brand-800 text-lg">
        <ArrowLeft size={24} />
        <span>戻る</span>
      </Link>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{TYPE_LABELS[circular.type]}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-ink leading-tight">{circular.title}</h1>
        <p className="mt-1 text-sm text-ink-light">
          {circular.createdBy.name} ・ {formatDate(circular.publishedAt)}
        </p>
      </div>

      {/* Body */}
      <div className="rounded-xl bg-gray-50 p-5">
        <div
          className="text-lg leading-relaxed text-ink whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: circular.body }}
        />
      </div>

      {/* Answer Section */}
      {circular.questions.length > 0 && (
        <AnswerSection
          circularId={circular.id}
          questions={circular.questions}
          myAnswerMap={Object.fromEntries(myAnswerMap)}
          deadline={circular.deadline}
          isOverdue={isOverdue}
        />
      )}
    </div>
  );
}
