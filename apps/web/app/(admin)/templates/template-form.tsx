"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTemplate } from "./actions";

export function TemplateForm() {
  const [state, action, pending] = useActionState(createTemplate, {});

  return (
    <form action={action} className="space-y-3 bg-white rounded-lg shadow-sm p-4">
      <Input name="name" placeholder="テンプレート名" required />
      <textarea
        name="bodyTemplate"
        placeholder="本文テンプレート..."
        rows={3}
        required
        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
      />
      <div className="flex gap-2">
        <select name="type" className="rounded-md border border-gray-200 px-3 py-2 text-sm">
          <option value="NOTICE">お知らせ</option>
          <option value="ATTENDANCE">出欠確認</option>
          <option value="SURVEY">アンケート</option>
        </select>
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-800 text-white hover:bg-brand-700"
        >
          {pending ? "作成中..." : "追加"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
