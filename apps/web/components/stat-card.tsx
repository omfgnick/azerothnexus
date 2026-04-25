import { ReactNode } from "react";

export function StatCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon?: ReactNode }) {
  return (
    <div className="data-slab h-full">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/75">{label}</p>
        {icon ? <div className="shrink-0">{icon}</div> : null}
      </div>
      <p className="mt-4 score-number tone-gold">{value}</p>
      {detail ? <p className="mt-3 text-sm text-white/60">{detail}</p> : null}
    </div>
  );
}
