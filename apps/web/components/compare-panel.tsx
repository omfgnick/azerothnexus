type CompareResponse = {
  entity_type: string;
  left: {
    label: string;
    subtitle?: string;
    score: number;
    grade?: string;
    tier?: string;
    trend?: string;
    confidence?: number;
    rank_position?: number | null;
    history?: { latest_score: number; best_score: number; score_delta: number; rank_delta: number; momentum_label: string };
  };
  right: {
    label: string;
    subtitle?: string;
    score: number;
    grade?: string;
    tier?: string;
    trend?: string;
    confidence?: number;
    rank_position?: number | null;
    history?: { latest_score: number; best_score: number; score_delta: number; rank_delta: number; momentum_label: string };
  };
  dimensions: Array<{
    key: string;
    label: string;
    left_score: number;
    right_score: number;
    delta: number;
    winner: string;
    note: string;
  }>;
  verdict: string;
};

type ComparePanelLabels = {
  eyebrow: string;
  verdict: string;
  comparisonTarget: string;
  delta: string;
  momentum: string;
  evenFooting: string;
  sideEdge: string;
  dimensionsUnavailable: string;
};

function edgeTone(winner: string) {
  if (winner === "left") return "text-gold";
  if (winner === "right") return "text-sky-100";
  return "text-white/70";
}

export function ComparePanel({
  title,
  comparison,
  labels,
}: {
  title: string;
  comparison: CompareResponse;
  labels: ComparePanelLabels;
}) {
  return (
    <section className="panel panel-section">
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">{labels.eyebrow}</p>
            <h2 className="mt-4 section-title">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm text-white/60">{comparison.verdict}</p>
          </div>
          <div className="rune-pill">{labels.verdict}</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[comparison.left, comparison.right].map((side, index) => (
            <div
              key={side.label}
              className={`data-slab ${index === 0 ? "border-gold/20" : "border-sky-300/15"}`}
            >
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/75">{side.subtitle ?? labels.comparisonTarget}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {side.label}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-white/70">
                {side.grade ? <span className="rune-chip">{side.grade}</span> : null}
                {side.tier ? <span className="rune-chip">{side.tier}</span> : null}
                {side.trend ? <span className="rune-chip">{side.trend}</span> : null}
              </div>
              <div className="mt-5 score-number">{side.score.toFixed(1)}</div>
              {side.history ? (
                <div className="mt-4 text-sm text-white/60">
                  {labels.delta} {side.history.score_delta >= 0 ? "+" : ""}
                  {side.history.score_delta.toFixed(1)} / {labels.momentum} {side.history.momentum_label}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {comparison.dimensions.length ? (
          comparison.dimensions.map((dimension) => (
            <div key={dimension.key} className="data-slab">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.3em] text-gold/75">{dimension.label}</div>
                  <div className={`mt-2 text-sm font-semibold uppercase tracking-[0.16em] ${edgeTone(dimension.winner)}`}>
                    {dimension.winner === "tie" ? labels.evenFooting : `${dimension.winner} ${labels.sideEdge}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {dimension.left_score.toFixed(1)} / {dimension.right_score.toFixed(1)}
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                    delta {dimension.delta >= 0 ? "+" : ""}
                    {dimension.delta.toFixed(1)}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/60">{dimension.note}</p>
            </div>
          ))
        ) : (
          <div className="data-slab lg:col-span-2">
            <p className="text-sm leading-7 text-white/60">{labels.dimensionsUnavailable}</p>
          </div>
        )}
      </div>
    </section>
  );
}
