import { ReactNode } from "react";

const toneMap = {
  gold: {
    shell: "border-gold/18",
    label: "text-gold/72",
    value: "tone-gold",
    divider: "from-gold/80 via-gold/20 to-transparent",
  },
  arcane: {
    shell: "border-sky-300/18",
    label: "text-sky-100/78",
    value: "tone-arcane",
    divider: "from-sky-300/80 via-sky-300/20 to-transparent",
  },
  violet: {
    shell: "border-violet-300/18",
    label: "text-violet-100/78",
    value: "text-violet-100",
    divider: "from-violet-300/80 via-violet-300/20 to-transparent",
  },
  emerald: {
    shell: "border-emerald-300/18",
    label: "text-emerald-100/78",
    value: "text-emerald-100",
    divider: "from-emerald-300/80 via-emerald-300/20 to-transparent",
  },
} as const;

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: keyof typeof toneMap;
};

export function StatCard({ label, value, detail, icon, tone = "gold" }: StatCardProps) {
  const palette = toneMap[tone];

  return (
    <div className={`data-slab h-full ${palette.shell}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-[0.68rem] uppercase tracking-[0.34em] ${palette.label}`}>{label}</p>
          <div className={`mt-4 score-number ${palette.value}`}>{value}</div>
        </div>
        {icon ? <div className="shrink-0">{icon}</div> : null}
      </div>
      <div className={`mt-4 h-px w-full bg-gradient-to-r ${palette.divider}`} />
      {detail ? <p className="mt-4 text-sm leading-7 text-white/62">{detail}</p> : null}
    </div>
  );
}
