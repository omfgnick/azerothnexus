export function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="data-slab h-full">
      <p className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/75">{label}</p>
      <p className="mt-4 score-number tone-gold">{value}</p>
      {detail ? <p className="mt-3 text-sm text-white/60">{detail}</p> : null}
    </div>
  );
}
