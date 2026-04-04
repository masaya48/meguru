import Link from "next/link";
import { Settings } from "lucide-react";
import { LogoMark } from "@/components/logo";

interface ResidentHeaderProps {
  tenantName: string;
}

export function ResidentHeader({ tenantName }: ResidentHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-brand-800 py-4 px-5">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="w-8" /> {/* Spacer */}
        <div className="flex items-center gap-2">
          <LogoMark size={28} />
          <span className="text-xl font-bold text-white">{tenantName}</span>
        </div>
        <Link href="/settings" className="text-white/80 hover:text-white">
          <Settings size={24} />
        </Link>
      </div>
    </header>
  );
}
