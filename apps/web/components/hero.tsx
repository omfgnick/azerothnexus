import { SearchCommandPalette } from "@/components/search-command-palette";

export type HeroMetric = {
  label: string;
  value: string;
  detail?: string;
  tone?: "gold" | "cyan" | "green" | "default";
};

export type HeroOverview = {
  badge: string;
  metrics: HeroMetric[];
  details: Array<{ label: string; value: string; tone?: "gold" | "cyan" | "green" | "default" }>;
};

type HeroProps = {
  copy: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    title: string;
    description: string;
    readings: Array<{ label: string; detail: string }>;
    observatoryEyebrow: string;
    observatoryTitle: string;
    warboardLabel: string;
    warboardDetail: string;
    archiveLabel: string;
    archiveDetail: string;
    signatureLabel: string;
    signatureTitle: string;
    signatureDescription: string;
    commandLabel: string;
    commandDescription: string;
    warboardValue: string;
    archiveValue: string;
  };
  metrics: HeroMetric[];
  overview: HeroOverview;
};

function metricValueClass(tone?: HeroMetric["tone"]) {
  if (tone === "gold") return "an-intel-metric-val gold";
  if (tone === "cyan") return "an-intel-metric-val cyan";
  return "an-intel-metric-val";
}

function detailValueClass(tone?: HeroMetric["tone"]) {
  if (tone === "gold") return "an-intel-info-val gold";
  if (tone === "cyan") return "an-intel-info-val cyan";
  if (tone === "green") return "an-intel-info-val green";
  return "an-intel-info-val";
}

export function Hero({ copy, metrics, overview }: HeroProps) {
  return (
    <section className="an-hero">
      <div className="an-hero-grid">
        <div className="an-animate-in">
          <div className="an-hero-eyebrow">{copy.eyebrow}</div>
          <h1 className="an-hero-title">
            {copy.titleLead}
            <span>{copy.titleAccent}</span>
          </h1>
          <p className="an-hero-desc">{copy.description}</p>

          <SearchCommandPalette compact />

          <div className="an-hero-stats">
            {metrics.map((metric, index) => (
              <div key={metric.label} className="an-hero-stat-group">
                <div className="an-hero-stat-item">
                  <span className="an-hero-stat-value">{metric.value}</span>
                  <span className="an-hero-stat-label">{metric.label}</span>
                </div>
                {index < metrics.length - 1 ? <div className="an-hero-stat-div" /> : null}
              </div>
            ))}
          </div>
        </div>

        <aside className="an-intel-panel an-animate-in an-delay-2">
          <div className="an-intel-header">
            <span className="an-intel-title">{copy.observatoryEyebrow}</span>
            <span className="an-intel-badge">{overview.badge}</span>
          </div>

          <div className="an-intel-metrics">
            {overview.metrics.map((metric) => (
              <div key={metric.label} className="an-intel-metric">
                <div className={metricValueClass(metric.tone)}>{metric.value}</div>
                <div className="an-intel-metric-label">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="an-intel-info">
            {overview.details.map((detail) => (
              <div key={detail.label} className="an-intel-info-row">
                <span className="an-intel-info-key">{detail.label}</span>
                <span className={detailValueClass(detail.tone)}>{detail.value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
