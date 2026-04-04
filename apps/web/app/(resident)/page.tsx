import { api } from "@/lib/api";
import { getToken, parseJwt } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CircularCard } from "@/components/circular-card";

interface Circular {
  id: string;
  title: string;
  type: "NOTICE" | "SURVEY" | "ATTENDANCE";
  status: string;
  publishedAt: string;
  deadline: string | null;
  reads: { userId: string }[];
  questions: { id: string }[];
  _count?: { reads: number; questions: number };
}

interface Answer {
  question: { id: string };
}

export default async function ResidentHome() {
  const token = await getToken();
  if (!token) redirect("/auth/login");

  const payload = parseJwt(token);
  if (!payload) redirect("/auth/login");

  let circulars: Circular[] = [];
  try {
    circulars = await api<Circular[]>("/circulars", { token });
  } catch {
    // If API is down, show empty state
  }

  // Fetch my answers for each circular that has questions
  const myAnswerMap = new Map<string, Set<string>>();
  for (const c of circulars) {
    if (c._count?.questions && c._count.questions > 0) {
      try {
        const answers = await api<Answer[]>(`/circulars/${c.id}/answers/mine`, { token });
        myAnswerMap.set(c.id, new Set(answers.map((a) => a.question.id)));
      } catch {
        // ignore
      }
    }
  }

  // Determine read status for current user
  const readCircularIds = new Set(
    circulars.filter((c) => c.reads?.some((r) => r.userId === payload.userId)).map((c) => c.id),
  );

  // Sort: unread first, then by date desc
  const sorted = [...circulars].sort((a, b) => {
    const aRead = readCircularIds.has(a.id);
    const bRead = readCircularIds.has(b.id);
    if (aRead !== bRead) return aRead ? 1 : -1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <div className="space-y-4">
      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-ink-light">回覧はまだありません</p>
        </div>
      ) : (
        sorted.map((c) => {
          const needsAnswer = c.type !== "NOTICE" && (c._count?.questions ?? 0) > 0;
          const answeredQuestions = myAnswerMap.get(c.id);
          const totalQuestions = c._count?.questions ?? 0;
          const hasAnswer =
            needsAnswer && !!answeredQuestions && answeredQuestions.size >= totalQuestions;

          return (
            <CircularCard
              key={c.id}
              id={c.id}
              title={c.title}
              type={c.type}
              publishedAt={c.publishedAt}
              isRead={readCircularIds.has(c.id)}
              hasAnswer={hasAnswer}
              needsAnswer={needsAnswer}
              deadline={c.deadline}
            />
          );
        })
      )}
    </div>
  );
}
