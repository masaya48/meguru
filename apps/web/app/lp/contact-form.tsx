"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitContact } from "./actions";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, {
    success: false,
  });

  if (state.success) {
    return (
      <div className="rounded-xl bg-brand-50 p-8 text-center">
        <p className="text-xl font-bold text-brand-800">お問い合わせありがとうございます</p>
        <p className="mt-2 text-base text-ink-light">内容を確認の上、折り返しご連絡いたします。</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-coral-50 px-4 py-3 text-sm text-coral-700">{state.error}</div>
      )}

      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
          お名前 <span className="text-coral-500">*</span>
        </label>
        <Input
          id="contact-name"
          name="name"
          required
          placeholder="山田 太郎"
          className="h-11 text-base"
        />
      </div>

      <div>
        <label htmlFor="contact-org" className="mb-1.5 block text-sm font-medium text-ink">
          自治会名
        </label>
        <Input
          id="contact-org"
          name="organizationName"
          placeholder="○○町内会"
          className="h-11 text-base"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
          メールアドレス <span className="text-coral-500">*</span>
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          placeholder="example@email.com"
          className="h-11 text-base"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
          メッセージ <span className="text-coral-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="ご質問・ご相談内容をお書きください"
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-base leading-relaxed transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-brand-800 text-base font-bold text-white hover:bg-brand-900"
      >
        {pending ? "送信中..." : "送信する"}
      </Button>
    </form>
  );
}
