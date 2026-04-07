"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createStudent } from "../actions";

export default function NewStudentPage() {
  const [state, action, pending] = useActionState(createStudent, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/students" className="text-sm text-brand-600 hover:underline">
          ← 生徒一覧
        </Link>
      </div>

      <h1 className="text-xl font-bold text-ink">生徒登録</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink-light mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="例: 山田 太郎"
              required
              className="rounded-lg px-4 py-3 text-base"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-ink-light mb-1">
              メモ
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="アレルギーや特記事項など"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-brand-600 px-6 py-3 text-base font-bold text-white hover:bg-brand-700"
            >
              {pending ? "登録中..." : "登録する"}
            </Button>
            <Link
              href="/students"
              className="flex-1 rounded-xl border px-6 py-3 text-base font-bold text-ink text-center hover:bg-gray-50"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
