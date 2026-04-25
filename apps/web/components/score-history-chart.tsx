type Point = {
  captured_at: string;
  score: number;
  rank_position?: number | null;
  grade?: string | null;
  tier?: string | null;
  trend?: string | null;
  confidence?: number | null;
};

function buildCoordinates(points: Point[], width: number, height: number, pad: number) {
  if (!points.length) return [];

  const scores = points.map((point) => point.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = Math.max(max - min, 1);

  return points.map((point, index) => ({
    point,
    x: pad + (index * (width - pad * 2)) / Math.max(points.length - 1, 1),
    y: height - pad - ((point.score - min) / range) * (height - pad * 2)
  }));
}

function buildAreaPath(coordinates: Array<{ x: number; y: number }>, height: number, pad: number) {
  if (!coordinates.length) return "";

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  const segments = coordinates.map(({ x, y }) => `L ${x} ${y}`).join(" ");

  return `M ${first.x} ${height - pad} ${segments} L ${last.x} ${height - pad} Z`;
}

export function ScoreHistoryChart({ title, points }: { title: string; points: Point[] }) {
  const width = 720;
  const height = 220;
  const pad = 20;
  const coordinates = buildCoordinates(points, width, height, pad);
  const polyline = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const areaPath = buildAreaPath(coordinates, height, pad);
  const gradientId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "score"}-gradient`;
  const areaId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "score"}-area`;

  return (
    <section className="panel panel-section">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Temporal trace</p>
          <h2 className="mt-4 section-title">{title}</h2>
          <p className="mt-3 text-sm text-white/60">A rune-lit reading of recent score movement across captured snapshots.</p>
        </div>
        {points.length ? <div className="rune-pill">Latest reading {points[points.length - 1].score.toFixed(1)}</div> : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25 p-3 sm:rounded-[1.8rem] sm:p-4">
        {points.length ? (
          <>
            <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full sm:h-56" preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(214,190,144,0.98)" />
                  <stop offset="55%" stopColor="rgba(110,203,255,0.95)" />
                  <stop offset="100%" stopColor="rgba(122,104,255,0.95)" />
                </linearGradient>
                <linearGradient id={areaId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(110,203,255,0.26)" />
                  <stop offset="100%" stopColor="rgba(110,203,255,0)" />
                </linearGradient>
              </defs>

              {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                <line
                  key={ratio}
                  x1={pad}
                  x2={width - pad}
                  y1={pad + (height - pad * 2) * ratio}
                  y2={pad + (height - pad * 2) * ratio}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="5 7"
                />
              ))}

              {coordinates.map(({ x }, index) => (
                <line
                  key={`column-${index}`}
                  x1={x}
                  x2={x}
                  y1={pad}
                  y2={height - pad}
                  stroke="rgba(255,255,255,0.03)"
                />
              ))}

              {areaPath ? <path d={areaPath} fill={`url(#${areaId})`} /> : null}
              {polyline ? <polyline fill="none" stroke={`url(#${gradientId})`} strokeWidth="4" points={polyline} strokeLinecap="round" strokeLinejoin="round" /> : null}

              {coordinates.map(({ point, x, y }, index) => (
                <g key={`${point.captured_at}-${index}`}>
                  <circle cx={x} cy={y} r="10" fill="rgba(110,203,255,0.08)" />
                  <circle cx={x} cy={y} r="4.5" fill="rgba(214,190,144,1)" />
                  <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.78)">
                    {point.score.toFixed(1)}
                  </text>
                </g>
              ))}
            </svg>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {points.map((point, index) => (
                <div key={`${point.captured_at}-${index}-meta`} className="data-slab">
                  <div className="text-[0.66rem] uppercase tracking-[0.32em] text-gold/75">Snapshot {index + 1}</div>
                  <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {point.score.toFixed(1)}
                  </div>
                  <div className="mt-2 text-sm text-white/55">{new Date(point.captured_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-white/12 bg-black/20 px-4 py-8 text-sm text-white/55">
            No captured score history is available for this entity yet.
          </div>
        )}
      </div>
    </section>
  );
}
