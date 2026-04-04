import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TemplateForm } from "./template-form";
import { deleteTemplate } from "./actions";
import { Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  NOTICE: "お知らせ",
  SURVEY: "アンケート",
  ATTENDANCE: "出欠確認",
};

export default async function TemplatesPage() {
  const token = await getToken();
  if (!token) redirect("/auth/login");

  let templates: Template[] = [];
  try {
    templates = await api<Template[]>("/templates", { token });
  } catch {}

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-ink">テンプレート管理</h1>

      <TemplateForm />

      <div className="space-y-3">
        {templates.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-ink">{t.name}</p>
              <p className="text-xs text-ink-light">
                {TYPE_LABELS[t.type]}
                {t.description ? ` — ${t.description}` : ""}
              </p>
            </div>
            <form action={deleteTemplate.bind(null, t.id)}>
              <button className="text-red-500 hover:text-red-700 p-1">
                <Trash2 size={16} />
              </button>
            </form>
          </div>
        ))}
        {templates.length === 0 && (
          <p className="text-center text-ink-muted py-8">テンプレートはまだありません</p>
        )}
      </div>
    </div>
  );
}
