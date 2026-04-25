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
  filter: string;
  regionTabs: {
    us: string;
    eu: string;
    kr: string;
    tw: string;
  };
  modeTabs: {
    raid: string;
    mythicPlus: string;
    combined: string;
  };
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

function normalizeSubtitle(subtitle?: string) {
  return subtitle?.split("Â·").join("·").split("Ã‚").join("").trim() ?? "";
}

function regionKeyFromSubtitle(subtitle?: string) {
  const normalized = normalizeSubtitle(subtitle);
  return normalized.split("·")[0]?.trim().toLowerCase() ?? "";
}

function realmFromSubtitle(subtitle?: string) {
  const normalized = normalizeSubtitle(subtitle);
  const parts = normalized.split("·").map((part) => part.trim()).filter(Boolean);
  return parts[1] ?? normalized;
}

function trendClass(trend?: string) {
  const normalized = trend?.toLowerCase() ?? "";
  if (normalized.includes("surg") || normalized.includes("ris") || normalized.includes("up")) {
    return "an-trend up";
  }
  if (normalized.includes("press") || normalized.includes("down") || normalized.includes("drop")) {
    return "an-trend down";
  }
  return "an-trend flat";
}

function trendIcon(trend?: string) {
  const normalized = trend?.toLowerCase() ?? "";
  if (normalized.includes("surg") || normalized.includes("ris") || normalized.includes("up")) {
    return "↑";
  }
  if (normalized.includes("press") || normalized.includes("down") || normalized.includes("drop")) {
    return "↓";
  }
  return "→";
}

function tierClass(tier?: string) {
  const normalized = tier?.toLowerCase() ?? "";
  if (normalized.includes("legend")) return "an-tier-badge an-tier-legend";
  if (normalized.includes("mythic")) return "an-tier-badge an-tier-mythic";
  return "an-tier-badge an-tier-epic";
}

function progressWidth(score: number, maxScore: number) {
  if (maxScore <= 0) {
    return "8%";
  }

  return `${Math.max(12, Math.round((score / maxScore) * 100))}%`;
}

function progressText(entry: Entry, maxScore: number) {
  const metadata = entry.metadata ?? {};
  const direct =
    typeof metadata.progress_label === "string"
      ? metadata.progress_label
      : typeof metadata.progress === "string"
        ? metadata.progress
        : null;

  if (direct) {
    return direct;
  }

  if (maxScore > 0) {
    return `${Math.round((entry.score / maxScore) * 100)}%`;
  }

  return "--";
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
  const maxScore = entries.reduce((highest, entry) => Math.max(highest, entry.score), 0);
  const visibleRegions = Array.from(
    new Set(entries.map((entry) => regionKeyFromSubtitle(entry.subtitle)).filter(Boolean)),
  ).slice(0, 4);
  const regionLabelMap = {
    us: labels.regionTabs.us,
    eu: labels.regionTabs.eu,
    kr: labels.regionTabs.kr,
    tw: labels.regionTabs.tw,
  };

  return (
    <section className="an-table-wrap an-animate-in an-delay-2">
      <div className="an-table-toolbar">
        <div className="an-tab-group">
          <button type="button" className="an-tab active">
            {labels.allRegions}
          </button>
          {visibleRegions.map((region) => (
            <button key={region} type="button" className="an-tab">
              {regionLabelMap[region as keyof typeof regionLabelMap] ?? region.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="an-tab-group">
          <button type="button" className="an-tab active">
            {labels.modeTabs.raid}
          </button>
          <button type="button" className="an-tab">
            {labels.modeTabs.mythicPlus}
          </button>
          <button type="button" className="an-tab">
            {labels.modeTabs.combined}
          </button>
        </div>

        <button type="button" className="an-filter-btn">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="5" y1="8" x2="11" y2="8" />
            <line x1="7" y1="12" x2="9" y2="12" />
          </svg>
          {labels.filter}
        </button>
      </div>

      {entries.length ? (
        <table>
          <thead>
            <tr>
              <th style={{ width: "52px" }}>{labels.columns.rank}</th>
              <th>{labels.columns.guild}</th>
              <th>{labels.columns.regionRealm}</th>
              <th className="an-sort-desc">{labels.columns.score}</th>
              <th>{labels.columns.progress}</th>
              <th>{labels.columns.tier}</th>
              <th>{labels.columns.trend}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={`${entry.rank}-${entry.label}`}>
                <td>
                  <span className={`an-rank-num ${entry.rank <= 3 ? "top3" : ""}`}>{String(entry.rank).padStart(2, "0")}</span>
                </td>
                <td>
                  <div className="an-guild-cell">
                    <div className="an-guild-avatar">{entry.label.slice(0, 1).toUpperCase()}</div>
                    <div>
                      <div className="an-guild-name">{entry.label}</div>
                      <div className="an-guild-realm">{realmFromSubtitle(entry.subtitle) || "--"}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="an-region-realm">{normalizeSubtitle(entry.subtitle) || "--"}</span>
                </td>
                <td>
                  <span className="an-score-cell">{entry.score.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                  <div className="an-score-subcopy">
                    {typeof entry.confidence === "number"
                      ? `${labels.confidence} ${entry.confidence.toFixed(0)}%`
                      : labels.calibrating}
                  </div>
                </td>
                <td>
                  <div className="an-progress-cell">
                    <div className="an-progress-bar-wrap">
                      <div className="an-progress-bar" style={{ width: progressWidth(entry.score, maxScore) }} />
                    </div>
                    <span className="an-progress-label">{progressText(entry, maxScore)}</span>
                  </div>
                </td>
                <td>
                  {entry.tier ? <span className={tierClass(entry.tier)}>{entry.tier}</span> : <span className="an-empty-cell">--</span>}
                </td>
                <td>
                  <span className={trendClass(entry.trend)}>
                    <span className="an-trend-icon">{trendIcon(entry.trend)}</span>
                    {entry.trend ?? "--"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="an-table-empty">{labels.empty}</div>
      )}
    </section>
  );
}
