"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createGroup } from "./actions";

export function GroupForm() {
  const [state, action, pending] = useActionState(createGroup, {});

  return (
    <form action={action} className="flex gap-2">
      <Input name="name" placeholder="グループ名" required className="flex-1" />
      <Button
        type="submit"
        disabled={pending}
        className="bg-brand-800 text-white hover:bg-brand-700"
      >
        {pending ? "作成中..." : "追加"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
