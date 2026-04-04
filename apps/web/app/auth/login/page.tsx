"use client";

import { useActionState } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginWithPassword, requestMagicLink } from "./actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "magic">("magic");
  const [passwordState, passwordAction, passwordPending] = useActionState(loginWithPassword, {});
  const [magicState, magicAction, magicPending] = useActionState(requestMagicLink, { sent: false });
  const magicSent = magicState.sent === true;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img src="/logo.svg" alt="めぐる" className="mx-auto h-16" />
          <p className="mt-2 text-ink-light text-sm">地域をつなぐ、情報がめぐる</p>
        </div>

        {mode === "magic" ? (
          /* Magic Link Mode */
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-ink text-center">ログイン</h1>
            {magicSent ? (
              <div className="rounded-xl bg-brand-100 p-6 text-center">
                <p className="text-lg font-bold text-brand-800">メールを送信しました</p>
                <p className="mt-2 text-sm text-ink-light">
                  メールに届いたリンクをタップしてログインしてください
                </p>
              </div>
            ) : (
              <form action={magicAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-light mb-1">町内会ID</label>
                  <Input
                    name="tenantSlug"
                    placeholder="例: sakura-cho"
                    required
                    className="rounded-lg px-4 py-3 text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-light mb-1">
                    メールアドレス
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="rounded-lg px-4 py-3 text-lg"
                  />
                </div>
                {magicState.error && <p className="text-sm text-red-600">{magicState.error}</p>}
                <Button
                  type="submit"
                  disabled={magicPending}
                  className="w-full rounded-xl bg-brand-800 px-6 py-4 text-lg font-bold text-white hover:bg-brand-700"
                >
                  {magicPending ? "送信中..." : "ログインリンクを送信"}
                </Button>
              </form>
            )}
            <button
              type="button"
              onClick={() => setMode("password")}
              className="block w-full text-center text-sm text-brand-800 underline"
            >
              パスワードでログイン（管理者向け）
            </button>
          </div>
        ) : (
          /* Password Mode */
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-ink text-center">管理者ログイン</h1>
            <form action={passwordAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-light mb-1">
                  メールアドレス
                </label>
                <Input
                  name="email"
                  type="email"
                  required
                  className="rounded-lg px-4 py-3 text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-light mb-1">パスワード</label>
                <Input
                  name="password"
                  type="password"
                  required
                  className="rounded-lg px-4 py-3 text-lg"
                />
              </div>
              {passwordState.error && <p className="text-sm text-red-600">{passwordState.error}</p>}
              <Button
                type="submit"
                disabled={passwordPending}
                className="w-full rounded-xl bg-brand-800 px-6 py-4 text-lg font-bold text-white hover:bg-brand-700"
              >
                {passwordPending ? "ログイン中..." : "ログイン"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className="block w-full text-center text-sm text-brand-800 underline"
            >
              メールリンクでログイン
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
