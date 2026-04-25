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

type RankingTableLabels = {
  eyebrow: string;
  visibleEntries: string;
  allRegions: string;
  guildWarboard: string;
  liveScore: string;
  rankingReadout: string;
  columns: {
    rank: string;
    guild: string;
    regionRealm: string;
    score: string;
    progress: string;
    tier: string;
    trend: string;
  };
  confidence: string;
  calibrating: string;
  empty: string;
};

function trendTone(trend?: string) {
  if (trend === "surging" || trend === "rising") return "text-emerald-100";
  if (trend === "pressured") return "text-rose-200";
  return "text-white/60";
}

function progressWidth(entry: Entry) {
  return `${Math.max(8, Math.min(100, Math.round(entry.score)))}%`;
}

export function RankingTable({
  title,
  entries,
  labels,
}: {
  title: string;
  entries: Entry[];
  labels: RankingTableLabels;
}) {
  const visibleRegions = Array.from(
    new Set(
      entries
        .map((entry) => entry.subtitle?.split("·")[0]?.replace("Â", "").trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).slice(0, 4);
  const maxScore = entries.reduce((highest, entry) => Math.max(highest, entry.score), 0);
  const columnLabels = [
    labels.columns.rank,
    labels.columns.guild,
    labels.columns.regionRealm,
    labels.columns.score,
    labels.columns.progress,
    labels.columns.tier,
    labels.columns.trend,
  ];

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.98),rgba(8,13,24,0.98))] shadow-[0_28px_64px_rgba(0,0,0,0.36)]">
      <div className="border-b border-white/8 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow">{labels.eyebrow}</div>
            <h2 className="mt-4 text-[1.8rem] text-white" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-white/55">
            {entries.length} {labels.visibleEntries}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-2 rounded-[10px] border border-white/8 bg-white/[0.03] p-1">
              <span className="rounded-[8px] border border-gold/25 bg-[rgba(18,28,50,0.94)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">
                {labels.allRegions}
              </span>
              {visibleRegions.map((region) => (
                <span
                  key={region}
                  className="rounded-[8px] border border-transparent px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/50"
                >
                  {region}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 rounded-[10px] border border-white/8 bg-white/[0.03] p-1">
              <span className="rounded-[8px] border border-gold/25 bg-[rgba(18,28,50,0.94)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold">
                {labels.guildWarboard}
              </span>
              <span className="rounded-[8px] border border-transparent px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/50">
                {labels.liveScore}
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-[10px] border border-white/8 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/55">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M2 4h12M5 8h6M7 12h2" strokeLinecap="round" />
            </svg>
            {labels.rankingReadout}
          </div>
        </div>
      </div>

      {entries.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/[0.03]">
                {columnLabels.map((label) => (
                  <th
                    key={label}
                    className="border-b border-white/8 px-4 py-3 text-left text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/42"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={`${entry.rank}-${entry.label}`} className="transition hover:bg-white/[0.025]">
                  <td className="border-b border-white/8 px-4 py-4 align-top">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                        entry.rank <= 3
                          ? "border-gold/25 bg-gold/10 text-gold"
                          : "border-white/10 bg-white/[0.04] text-white/70"
                      }`}
                    >
                      {String(entry.rank).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-gold">
                        {entry.label.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-white">{entry.label}</div>
                        {entry.explanation ? <div className="mt-1 max-w-md text-sm text-white/50">{entry.explanation}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top">
                    <span className="font-['Space_Mono',monospace] text-xs text-white/45">{entry.subtitle ?? "--"}</span>
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top">
                    <div className="font-['Space_Mono',monospace] text-lg font-bold text-white">{entry.score.toFixed(1)}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/38">
                      {typeof entry.confidence === "number"
                        ? `${labels.confidence} ${entry.confidence.toFixed(0)}%`
                        : labels.calibrating}
                    </div>
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top">
                    <div className="flex min-w-[140px] items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#C19340,rgba(193,147,64,0.25))]"
                          style={{ width: maxScore > 0 ? `${Math.max(12, (entry.score / maxScore) * 100)}%` : progressWidth(entry) }}
                        />
                      </div>
                      <span className="font-['Space_Mono',monospace] text-xs text-white/45">
                        {maxScore > 0 ? `${Math.round((entry.score / maxScore) * 100)}%` : `${entry.score.toFixed(0)}%`}
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {entry.tier ? (
                        <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-gold">
                          {entry.tier}
                        </span>
                      ) : (
                        <span className="text-sm text-white/40">--</span>
                      )}
                      {entry.grade ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/65">
                          {entry.grade}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="border-b border-white/8 px-4 py-4 align-top">
                    <span className={`text-sm font-semibold uppercase tracking-[0.16em] ${trendTone(entry.trend)}`}>
                      {entry.trend ?? "--"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-10 text-sm text-white/55 sm:px-6">{labels.empty}</div>
      )}
    </section>
  );
}
