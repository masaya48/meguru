export function Logo({ className }: { className?: string }) {
  return <img src="/logo.svg" alt="めぐる" className={className} />;
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 155 100 A 45 45 0 0 1 102.2 144.3"
        fill="none"
        stroke="#2D6A4F"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 87.5 139.0 A 45 45 0 0 1 75.5 71.1"
        fill="none"
        stroke="#52B788"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 87.5 61.0 A 45 45 0 0 1 152.3 84.6"
        fill="none"
        stroke="#E76F51"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="110" cy="100" r="6" fill="#2D6A4F" />
      <circle cx="110" cy="100" r="3" fill="#E76F51" />
    </svg>
  );
}
