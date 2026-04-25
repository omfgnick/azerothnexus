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

function metricToneClass(tone?: HeroMetric["tone"]) {
  if (tone === "gold") return "text-gold";
  if (tone === "cyan") return "text-sky-100";
  if (tone === "green") return "text-emerald-100";
  return "text-white";
}

export function Hero({ copy, metrics, overview }: HeroProps) {
  return (
    <section className="grid gap-8 xl:grid-cols-[1fr_440px] xl:items-start">
      <div className="space-y-8">
        <div>
          <div className="eyebrow">{copy.eyebrow}</div>
          <h1 className="mt-6 display-title max-w-5xl">{copy.title}</h1>
          <p className="mt-6 max-w-4xl lead-copy">{copy.description}</p>
        </div>

        <SearchCommandPalette compact />

        <div className="grid gap-3 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.86),rgba(8,13,24,0.94))] p-4 shadow-[0_28px_60px_rgba(0,0,0,0.34)] sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <div className="text-[0.68rem] uppercase tracking-[0.24em] text-white/45">{metric.label}</div>
              <div className={`mt-3 font-['Space_Mono',monospace] text-[1.7rem] font-bold ${metricToneClass(metric.tone)}`}>
                {metric.value}
              </div>
              {metric.detail ? <p className="mt-2 text-sm leading-6 text-white/55">{metric.detail}</p> : null}
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.98),rgba(8,13,24,0.98))] p-5 shadow-[0_28px_64px_rgba(0,0,0,0.36)]">
        <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
          <div>
            <div className="text-[0.68rem] uppercase tracking-[0.26em] text-gold/75">{copy.observatoryEyebrow}</div>
            <h2 className="mt-3 text-[1.5rem] leading-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
              {copy.observatoryTitle}
            </h2>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-emerald-100">
            {overview.badge}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {overview.metrics.map((metric) => (
            <div key={metric.label} className="rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <div className="font-['Space_Mono',monospace] text-[1.55rem] font-bold tracking-tight text-white">
                <span className={metricToneClass(metric.tone)}>{metric.value}</span>
              </div>
              <div className="mt-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/45">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">
          {overview.details.map((detail, index) => (
            <div
              key={detail.label}
              className={`flex items-center justify-between gap-4 py-3 ${
                index < overview.details.length - 1 ? "border-b border-white/8" : ""
              }`}
            >
              <span className="text-sm text-white/55">{detail.label}</span>
              <span className={`text-right text-sm font-semibold ${metricToneClass(detail.tone)}`}>{detail.value}</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
