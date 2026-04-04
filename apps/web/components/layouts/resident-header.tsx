import { LogoMark } from "@/components/logo";

interface ResidentHeaderProps {
  tenantName: string;
}

export function ResidentHeader({ tenantName }: ResidentHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-brand-800 py-4 px-5">
      <div className="flex items-center justify-center gap-2">
        <LogoMark size={28} />
        <span className="text-xl font-bold text-white">{tenantName}</span>
      </div>
    </header>
  );
}
