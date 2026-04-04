"use client";

import { useState, useTransition } from "react";
import { AnswerButton } from "@/components/answer-button";
import { Button } from "@/components/ui/button";
import { submitAnswer } from "./actions";

interface Question {
  id: string;
  questionText: string;
  type: "YES_NO" | "SINGLE_CHOICE" | "MULTI_CHOICE" | "FREE_TEXT";
  options: string[] | null;
  sortOrder: number;
}

interface AnswerSectionProps {
  circularId: string;
  questions: Question[];
  myAnswerMap: Record<string, unknown>;
  deadline: string | null;
  isOverdue: boolean;
}

export function AnswerSection({
  circularId,
  questions,
  myAnswerMap,
  deadline,
  isOverdue,
}: AnswerSectionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>(myAnswerMap);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(Object.keys(myAnswerMap).length >= questions.length);
  const [error, setError] = useState<string | null>(null);

  const question = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const currentAnswer = answers[question?.id];

  if (submitted) {
    return (
      <div className="rounded-xl bg-brand-100 p-6 text-center">
        <p className="text-lg font-bold text-brand-800">回答済みです</p>
        <p className="mt-1 text-sm text-ink-light">ありがとうございました</p>
      </div>
    );
  }

  if (isOverdue) {
    return (
      <div className="rounded-xl bg-gray-100 p-6 text-center">
        <p className="text-lg font-bold text-ink-light">回答期限を過ぎました</p>
      </div>
    );
  }

  function selectAnswer(value: unknown) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  async function handleSubmit() {
    setError(null);
    startTransition(async () => {
      // Submit all answers
      for (const q of questions) {
        const ans = answers[q.id];
        if (ans !== undefined) {
          const result = await submitAnswer(circularId, q.id, ans);
          if (result.error) {
            setError(result.error);
            return;
          }
        }
      }
      setSubmitted(true);
    });
  }

  function handleNext() {
    if (currentAnswer === undefined) return;
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  return (
    <div className="rounded-xl bg-brand-50 p-6 space-y-4">
      {/* Progress */}
      {questions.length > 1 && (
        <div className="text-center text-sm text-ink-light">
          {currentStep + 1} / {questions.length}
        </div>
      )}

      {/* Question */}
      <p className="text-xl font-bold text-ink text-center">{question.questionText}</p>

      {/* YES_NO */}
      {question.type === "YES_NO" && question.options && (
        <div className="flex gap-3">
          <AnswerButton
            label={question.options[0] ?? "はい"}
            emoji="⭕"
            variant="success"
            selected={currentAnswer === question.options[0]}
            disabled={isPending}
            onClick={() => selectAnswer(question.options![0])}
          />
          <AnswerButton
            label={question.options[1] ?? "いいえ"}
            emoji="❌"
            variant="danger"
            selected={currentAnswer === question.options[1]}
            disabled={isPending}
            onClick={() => selectAnswer(question.options![1])}
          />
        </div>
      )}

      {/* SINGLE_CHOICE */}
      {question.type === "SINGLE_CHOICE" && question.options && (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={isPending}
              onClick={() => selectAnswer(opt)}
              className={`w-full rounded-xl border-2 px-5 py-4 text-lg font-bold text-left transition-all ${
                currentAnswer === opt
                  ? "border-brand-800 bg-brand-100 text-brand-800"
                  : "border-gray-200 bg-white text-ink"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* MULTI_CHOICE */}
      {question.type === "MULTI_CHOICE" && question.options && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const selected = Array.isArray(currentAnswer) && currentAnswer.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                disabled={isPending}
                onClick={() => {
                  const prev = Array.isArray(currentAnswer) ? currentAnswer : [];
                  selectAnswer(selected ? prev.filter((v: string) => v !== opt) : [...prev, opt]);
                }}
                className={`w-full rounded-xl border-2 px-5 py-4 text-lg font-bold text-left transition-all ${
                  selected
                    ? "border-brand-800 bg-brand-100 text-brand-800"
                    : "border-gray-200 bg-white text-ink"
                }`}
              >
                {selected ? "☑ " : "☐ "}
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* FREE_TEXT */}
      {question.type === "FREE_TEXT" && (
        <textarea
          value={(currentAnswer as string) ?? ""}
          onChange={(e) => selectAnswer(e.target.value)}
          disabled={isPending}
          placeholder="回答を入力してください"
          rows={4}
          className="w-full rounded-xl border-2 border-gray-200 px-5 py-4 text-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {currentStep > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={isPending}
            className="flex-1 rounded-xl py-4 text-lg"
          >
            戻る
          </Button>
        )}
        <Button
          type="button"
          onClick={handleNext}
          disabled={currentAnswer === undefined || isPending}
          className="flex-1 rounded-xl bg-brand-800 py-4 text-lg font-bold text-white hover:bg-brand-700"
        >
          {isPending ? "送信中..." : isLastStep ? "回答を送信" : "次へ"}
        </Button>
      </div>

      {/* Deadline */}
      {deadline && (
        <p className="text-center text-xs text-ink-muted">
          回答期限: {new Date(deadline).toLocaleDateString("ja-JP")}
        </p>
      )}
    </div>
  );
}
