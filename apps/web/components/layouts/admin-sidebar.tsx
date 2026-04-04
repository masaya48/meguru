"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FilePlus,
  Users,
  Layers,
  FileText,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/circulars", label: "回覧一覧", icon: ClipboardList },
  { href: "/circulars/new", label: "新規作成", icon: FilePlus },
  { href: "/members", label: "住民管理", icon: Users },
  { href: "/groups", label: "グループ", icon: Layers },
  { href: "/templates", label: "テンプレート", icon: FileText },
  { href: "/admin-settings", label: "設定", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-52 md:flex-col md:fixed md:inset-y-0 bg-ink">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <LogoMark size={24} />
        <span className="text-white font-bold text-sm">めぐる</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-brand-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10",
              )}
            >
              <item.icon size={18} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
