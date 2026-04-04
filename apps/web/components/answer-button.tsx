"use client";

import { cn } from "@/lib/utils";

interface AnswerButtonProps {
  label: string;
  emoji: string;
  variant: "success" | "danger";
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function AnswerButton({
  label,
  emoji,
  variant,
  selected,
  disabled,
  onClick,
}: AnswerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 rounded-xl px-6 py-5 text-xl font-bold transition-all",
        "min-h-[72px] active:scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        variant === "success" && !selected && "bg-green-600 text-white",
        variant === "success" && selected && "bg-green-700 text-white ring-4 ring-green-300",
        variant === "danger" && !selected && "bg-red-600 text-white",
        variant === "danger" && selected && "bg-red-700 text-white ring-4 ring-red-300",
      )}
    >
      {emoji} {label}
    </button>
  );
}
