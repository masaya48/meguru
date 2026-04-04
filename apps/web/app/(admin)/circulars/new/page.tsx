"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCircular, publishCircular } from "./actions";

interface Question {
  questionText: string;
  type: string;
  options?: string[];
}

export default function NewCircularPage() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createCircular, {});
  const [type, setType] = useState("NOTICE");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [publishing, setPublishing] = useState(false);

  // After creation, offer publish
  if (state.circularId) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold text-ink">回覧を作成しました</h1>
        <div className="flex gap-3">
          <Button
            onClick={async () => {
              setPublishing(true);
              await publishCircular(state.circularId!);
            }}
            disabled={publishing}
            className="bg-brand-800 text-white hover:bg-brand-700"
          >
            {publishing ? "配信中..." : "今すぐ配信する"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/circulars")}>
            下書きのまま保存
          </Button>
        </div>
      </div>
    );
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      { questionText: "", type: "YES_NO", options: ["参加する", "不参加"] },
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: string, value: string) {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-ink">新規回覧作成</h1>

      <form action={action} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">タイトル</label>
          <Input name="title" required placeholder="回覧のタイトル" />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">本文</label>
          <textarea
            name="body"
            required
            rows={8}
            placeholder="回覧の本文を入力..."
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">種類</label>
          <select
            name="type"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value === "NOTICE") setQuestions([]);
            }}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="NOTICE">お知らせ</option>
            <option value="ATTENDANCE">出欠確認</option>
            <option value="SURVEY">アンケート</option>
          </select>
        </div>

        {/* Target */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">配信先</label>
          <select
            name="targetType"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="ALL">全員</option>
            <option value="GROUP">グループ指定</option>
          </select>
        </div>

        {/* Deadline */}
        {type !== "NOTICE" && (
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">回答期限</label>
            <Input name="deadline" type="datetime-local" />
          </div>
        )}

        {/* Questions */}
        {type !== "NOTICE" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-ink-light">質問</label>
              <button
                type="button"
                onClick={addQuestion}
                className="text-sm text-brand-800 font-medium hover:underline"
              >
                + 質問を追加
              </button>
            </div>
            {questions.length === 0 && type === "ATTENDANCE" && (
              <button
                type="button"
                onClick={() =>
                  setQuestions([
                    {
                      questionText: "参加できますか？",
                      type: "YES_NO",
                      options: ["参加する", "不参加"],
                    },
                  ])
                }
                className="w-full rounded-md border-2 border-dashed border-gray-300 py-4 text-sm text-ink-light hover:border-brand-500 hover:text-brand-800"
              >
                出欠確認の質問を追加
              </button>
            )}
            {questions.map((q, i) => (
              <div key={i} className="rounded-md border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-light">質問 {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    削除
                  </button>
                </div>
                <Input
                  value={q.questionText}
                  onChange={(e) => updateQuestion(i, "questionText", e.target.value)}
                  placeholder="質問文"
                />
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(i, "type", e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="YES_NO">はい/いいえ</option>
                  <option value="SINGLE_CHOICE">単一選択</option>
                  <option value="MULTI_CHOICE">複数選択</option>
                  <option value="FREE_TEXT">自由記述</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Hidden questions JSON */}
        <input
          type="hidden"
          name="questions"
          value={JSON.stringify(questions.length > 0 ? questions : undefined)}
        />

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-brand-800 text-white hover:bg-brand-700"
        >
          {pending ? "作成中..." : "回覧を作成"}
        </Button>
      </form>
    </div>
  );
}
