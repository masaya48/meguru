"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogoMark } from "@/components/logo";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  FilePlus,
  Users,
  Layers,
  FileText,
  Settings,
  LayoutDashboard,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/circulars", label: "回覧一覧", icon: ClipboardList },
  { href: "/circulars/new", label: "新規作成", icon: FilePlus },
  { href: "/members", label: "住民管理", icon: Users },
  { href: "/groups", label: "グループ", icon: Layers },
  { href: "/templates", label: "テンプレート", icon: FileText },
  { href: "/admin-settings", label: "設定", icon: Settings },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden sticky top-0 z-10 flex items-center justify-between bg-ink px-4 py-3">
      <div className="flex items-center gap-2">
        <LogoMark size={24} />
        <span className="text-white font-bold text-sm">めぐる</span>
      </div>
      <Sheet>
        <SheetTrigger render={<button className="text-white p-1" />}>
          <Menu size={24} />
        </SheetTrigger>
        <SheetContent side="left" className="bg-ink border-none w-64 p-0">
          <div className="px-4 py-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <LogoMark size={24} />
              <span className="text-white font-bold text-sm">めぐる</span>
            </div>
          </div>
          <nav className="px-3 py-4 space-y-1">
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
