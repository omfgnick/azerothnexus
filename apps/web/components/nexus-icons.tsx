import { ReactNode } from "react";

type IconProps = {
  className?: string;
};

type IconFrameProps = {
  children: ReactNode;
  className?: string;
  tone?: "gold" | "arcane" | "violet" | "emerald";
};

const toneClasses: Record<NonNullable<IconFrameProps["tone"]>, string> = {
  gold: "border-gold/30 bg-[linear-gradient(180deg,rgba(214,190,144,0.18),rgba(110,203,255,0.08)),rgba(8,16,31,0.94)] text-gold shadow-[0_0_30px_rgba(212,168,79,0.14)]",
  arcane: "border-sky-300/30 bg-[linear-gradient(180deg,rgba(110,203,255,0.18),rgba(122,104,255,0.08)),rgba(8,16,31,0.94)] text-sky-100 shadow-[0_0_30px_rgba(110,203,255,0.14)]",
  violet: "border-violet-300/30 bg-[linear-gradient(180deg,rgba(122,104,255,0.18),rgba(214,190,144,0.08)),rgba(8,16,31,0.94)] text-violet-100 shadow-[0_0_30px_rgba(122,104,255,0.14)]",
  emerald: "border-emerald-300/30 bg-[linear-gradient(180deg,rgba(52,211,153,0.18),rgba(110,203,255,0.08)),rgba(8,16,31,0.94)] text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.14)]"
};

export function IconFrame({ children, className = "", tone = "gold" }: IconFrameProps) {
  return (
    <div
      className={`relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] border backdrop-blur-sm ${toneClasses[tone]} ${className}`}
    >
      <span className="pointer-events-none absolute inset-[6px] rounded-[0.95rem] border border-white/10" />
      <span className="relative z-10">{children}</span>
    </div>
  );
}

export function NexusCrestIcon({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="23" stroke="currentColor" strokeWidth="1.8" opacity="0.24" />
      <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="1.8" />
      <path d="M32 9v11M32 44v11M9 32h11M44 32h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M16.5 16.5 24 24M40 40l7.5 7.5M47.5 16.5 40 24M24 40l-7.5 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="m32 22 6.5 10L32 42l-6.5-10L32 22Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="3.2" fill="currentColor" opacity="0.82" />
    </svg>
  );
}

export function ArchiveSigilIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M14 18c4.8-2.9 8.9-4.3 13.5-4.3V46c-4.6-1.8-8.7-1.7-13.5 0V18Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M50 18c-4.8-2.9-8.9-4.3-13.5-4.3V46c4.6-1.8 8.7-1.7 13.5 0V18Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M32 16v28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m32 22 2.4 4.8 4.8 2.4-4.8 2.4L32 36.4l-2.4-4.8-4.8-2.4 4.8-2.4L32 22Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function WarboardSigilIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <rect x="13" y="16" width="38" height="24" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19 30 27 24l9 8 9-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="30" r="2.2" fill="currentColor" />
      <circle cx="27" cy="24" r="2.2" fill="currentColor" opacity="0.92" />
      <circle cx="36" cy="32" r="2.2" fill="currentColor" opacity="0.82" />
      <circle cx="45" cy="20" r="2.2" fill="currentColor" opacity="0.72" />
      <path d="M26 40v8M38 40v8M22 48h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SearchSigilIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="28" cy="28" r="12" stroke="currentColor" strokeWidth="1.8" />
      <path d="m36.5 36.5 11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m28 22 2.1 4.3 4.3 2.1-4.3 2.1L28 34.8l-2.1-4.3-4.3-2.1 4.3-2.1L28 22Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function CompareSigilIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="m22 14-8 6v18l8 6 8-6V20l-8-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m42 14-8 6v18l8 6 8-6V20l-8-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M22 20v18M42 20v18M28 29h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m33 25 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GuildSigilIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M18 48V24l14-10 14 10v24" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M24 48V33h16v15M22 24h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 20v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M32 12c1.5 2.4 3.5 3.9 6 4.6-2.5.8-4.5 2.3-6 4.4-1.5-2.1-3.5-3.6-6-4.4 2.5-.7 4.5-2.2 6-4.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function ChampionSigilIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="m32 12 5 9-5 6-5-6 5-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M32 27v21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 32h16M27 38h10M22 48h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m20 17 4.4 2.3L27 24l2.6-4.7L34 17l-4.4-2.1L27 10l-2.6 4.9L20 17Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

export function RaidSigilIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M18 46V25l14-11 14 11v21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M24 46V32h16v14" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M27 21h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m32 10 2.2 4.3 4.3 2.2-4.3 2.2L32 23l-2.2-4.3-4.3-2.2 4.3-2.2L32 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
