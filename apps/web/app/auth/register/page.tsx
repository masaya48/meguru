"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "./actions";

export default function RegisterPage() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(registerUser, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img src="/logo.svg" alt="めぐる" className="mx-auto h-16" />
          <h1 className="mt-4 text-xl font-bold text-ink">参加登録</h1>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="inviteToken" value={params.get("token") ?? ""} />
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">町内会ID</label>
            <Input
              name="tenantSlug"
              defaultValue={params.get("tenant") ?? ""}
              placeholder="例: sakura-cho"
              required
              className="rounded-lg px-4 py-3 text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">お名前</label>
            <Input
              name="name"
              placeholder="山田 太郎"
              required
              className="rounded-lg px-4 py-3 text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">メールアドレス</label>
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="rounded-lg px-4 py-3 text-lg"
            />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-brand-800 px-6 py-4 text-lg font-bold text-white hover:bg-brand-700"
          >
            {pending ? "登録中..." : "参加する"}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-light">
          既にアカウントをお持ちですか？{" "}
          <a href="/auth/login" className="text-brand-800 underline">
            ログイン
          </a>
        </p>
      </div>
    </div>
  );
}
