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
    <section className="nexus-hero-shell grid gap-8 xl:grid-cols-[1fr_480px] xl:items-start">
      <div className="space-y-8">
        <div>
          <div className="eyebrow">{copy.eyebrow}</div>
          <h1 className="mt-6 display-title max-w-5xl">{copy.title}</h1>
          <p className="mt-6 max-w-4xl lead-copy">{copy.description}</p>
        </div>

        <SearchCommandPalette compact />

        <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-6">
          {metrics.map((metric, index) => (
            <div key={metric.label} className="flex items-center gap-4">
              <div className="min-w-0">
                <div className={`font-['Space_Mono',monospace] text-[1.35rem] font-bold sm:text-[1.5rem] ${metricToneClass(metric.tone)}`}>
                  {metric.value}
                </div>
                <div className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-white/48">{metric.label}</div>
                {metric.detail ? <div className="mt-1 max-w-[14rem] text-sm text-white/50">{metric.detail}</div> : null}
              </div>
              {index < metrics.length - 1 ? <div className="hidden h-12 w-px bg-white/10 sm:block" /> : null}
            </div>
          ))}
        </div>
      </div>

      <aside className="panel panel-legendary p-5">
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

        <div className="mt-5 grid gap-px overflow-hidden rounded-[18px] border border-white/8 bg-white/8 sm:grid-cols-2">
          {overview.metrics.map((metric) => (
            <div key={metric.label} className="bg-[rgba(14,22,40,0.98)] px-4 py-4">
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
