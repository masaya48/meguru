"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateInvite } from "../actions";

interface InviteButtonProps {
  studentId: string;
}

export function InviteButton({ studentId }: InviteButtonProps) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const result = await generateInvite(studentId);
      setInviteUrl(result.inviteUrl);
    } catch {
      setError("招待リンクの生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
      >
        {loading ? "生成中..." : "招待リンクを生成"}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {inviteUrl && (
        <div className="rounded-lg bg-gray-50 border p-3 space-y-2">
          <p className="text-xs text-ink-light font-medium">招待リンク</p>
          <p className="text-sm text-ink break-all">{inviteUrl}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(inviteUrl)}
            className="text-xs text-brand-600 hover:underline"
          >
            コピー
          </button>
        </div>
      )}
    </div>
  );
}
