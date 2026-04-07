"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardCheck, ArrowLeftRight, Banknote, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/attendance", label: "出欠", icon: ClipboardCheck },
  { href: "/reschedules", label: "振替", icon: ArrowLeftRight },
  { href: "/payments", label: "月謝", icon: Banknote },
  { href: "/settings", label: "設定", icon: Settings },
];

export function TeacherBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200">
      <div className="mx-auto max-w-lg">
        <ul className="flex items-stretch">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2 pb-safe text-xs transition-colors ${
                    isActive ? "text-brand-600" : "text-gray-400"
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
