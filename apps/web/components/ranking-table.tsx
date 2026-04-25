type Dimension = {
  key: string;
  label: string;
  score: number;
  grade: string;
  note: string;
};

type Entry = {
  rank: number;
  label: string;
  score: number;
  subtitle?: string;
  grade?: string;
  tier?: string;
  trend?: string;
  confidence?: number;
  explanation?: string;
  dimensions?: Dimension[];
  metadata?: Record<string, unknown>;
};

function trendTone(trend?: string) {
  if (trend === "surging") return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
  if (trend === "rising") return "border-sky-400/30 bg-sky-500/10 text-sky-100";
  if (trend === "pressured") return "border-rose-400/30 bg-rose-500/10 text-rose-100";
  if (trend === "forming") return "border-amber-400/30 bg-amber-500/10 text-amber-100";
  return "border-white/15 bg-white/5 text-white/75";
}

export function RankingTable({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <section className="panel panel-legendary overflow-hidden">
      <div className="relative border-b border-white/10 px-6 py-6 md:px-8">
        <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Guild warboard</p>
            <h2 className="mt-4 section-title">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
              Composite scoring, rank intelligence, tier seals, momentum reads, and dimension notes arranged as a ceremonial command ledger.
            </p>
          </div>
          <div className="rune-pill">Composite score matrix</div>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {entries.map((entry) => {
          const dimensions = entry.dimensions ?? [];
          const topDimensions = dimensions.slice(0, 2);

          return (
            <article key={`${entry.rank}-${entry.label}`} className="relative px-6 py-6 md:px-8">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />
              <div className="grid gap-5 xl:grid-cols-[120px_1fr_250px]">
                <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-[2rem] border border-gold/25 bg-[radial-gradient(circle,rgba(214,190,144,0.18),rgba(110,203,255,0.08),rgba(3,6,14,0.88))] text-center shadow-[0_18px_44px_rgba(0,0,0,0.32)]">
                  <div className="absolute inset-[8px] rounded-[1.55rem] border border-white/10" />
                  <div className="relative text-[0.6rem] uppercase tracking-[0.34em] text-gold/75">Rank</div>
                  <div className="relative mt-2 text-3xl text-gold" style={{ fontFamily: "var(--font-display)" }}>
                    #{entry.rank}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[1.9rem] text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {entry.label}
                    </div>
                    {entry.grade ? (
                      <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-violet-100">
                        {entry.grade}
                      </span>
                    ) : null}
                    {entry.tier ? (
                      <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold">
                        {entry.tier}
                      </span>
                    ) : null}
                    {entry.trend ? (
                      <span className={`rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] ${trendTone(entry.trend)}`}>
                        {entry.trend}
                      </span>
                    ) : null}
                  </div>

                  {entry.subtitle ? <div className="text-sm uppercase tracking-[0.22em] text-white/38">{entry.subtitle}</div> : null}
                  {entry.explanation ? <p className="max-w-3xl text-sm leading-7 text-white/70">{entry.explanation}</p> : null}

                  {topDimensions.length ? (
                    <div className="flex flex-wrap gap-2">
                      {topDimensions.map((dimension) => (
                        <span
                          key={`${entry.label}-${dimension.key}`}
                          className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.72rem] uppercase tracking-[0.16em] text-white/75"
                          title={dimension.note}
                        >
                          {dimension.label}: {dimension.score.toFixed(1)} / {dimension.grade}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="data-slab text-right">
                  <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Composite</div>
                  <div className="mt-3 score-number tone-gold">{entry.score.toFixed(1)}</div>
                  {typeof entry.confidence === "number" ? (
                    <div className="mt-4 text-sm uppercase tracking-[0.16em] text-white/60">Confidence {entry.confidence.toFixed(1)}%</div>
                  ) : (
                    <div className="mt-4 text-sm uppercase tracking-[0.16em] text-white/40">Confidence calibrating</div>
                  )}
                </div>
              </div>

              {dimensions.length ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {dimensions.map((dimension) => (
                    <div key={`${entry.label}-${dimension.key}-card`} className="data-slab h-full">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[0.68rem] uppercase tracking-[0.3em] text-gold/75">{dimension.label}</div>
                        <div className="text-sm font-semibold text-white/80">{dimension.grade}</div>
                      </div>
                      <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                        {dimension.score.toFixed(1)}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/60">{dimension.note}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
