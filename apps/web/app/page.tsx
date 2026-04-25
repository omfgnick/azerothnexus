import Link from "next/link";
import { Suspense } from "react";

import { DataStateBanner } from "@/components/data-state-banner";
import { Hero, type HeroMetric, type HeroOverview } from "@/components/hero";
import { RankingTable } from "@/components/ranking-table";
import { getActivityFeed, getGuildLadder, getMythicDashboard, getRaidDashboard, isFallbackData } from "@/lib/api";
import { getDictionary } from "@/lib/locale";

function HomeSectionSkeleton({ height = "h-[320px]" }: { height?: string }) {
  return (
    <div className={`animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03] ${height}`} />
  );
}

async function HomeHeroSection({
  copy,
}: {
  copy: Awaited<ReturnType<typeof getDictionary>>["copy"]["hero"];
}) {
  const [ladder, raid, mythic, activity] = await Promise.all([
    getGuildLadder(),
    getRaidDashboard(),
    getMythicDashboard(),
    getActivityFeed(),
  ]);

  const topGuild = ladder.entries?.[0];
  const hasFallback = [ladder, raid, mythic, activity].some(isFallbackData);
  const metricDetails = copy.readings.slice(0, 4);
  const metrics: HeroMetric[] = [
    {
      label: metricDetails[0]?.label ?? "Visible guilds",
      value: String(ladder.entries.length),
      detail: metricDetails[0]?.detail,
      tone: "gold" as const,
    },
    {
      label: metricDetails[1]?.label ?? "Live events",
      value: String(activity.items.length),
      detail: metricDetails[1]?.detail,
      tone: "cyan" as const,
    },
    {
      label: metricDetails[2]?.label ?? "Raid bosses",
      value: String(raid.bosses.length),
      detail: metricDetails[2]?.detail,
      tone: "default" as const,
    },
    {
      label: metricDetails[3]?.label ?? "Data feed",
      value: hasFallback ? "Fallback" : "Live",
      detail: metricDetails[3]?.detail,
      tone: hasFallback ? "default" : "green",
    },
  ];

  const overview: HeroOverview = {
    badge: hasFallback ? "Fallback" : "Live",
    metrics: [
      {
        label: copy.warboardLabel,
        value: topGuild ? topGuild.score.toFixed(1) : "--",
        tone: "gold" as const,
      },
      {
        label: copy.archiveLabel,
        value: mythic.meta_analysis?.timed_ratio ? `${mythic.meta_analysis.timed_ratio}%` : "--",
        tone: "cyan" as const,
      },
      {
        label: "Top guild tier",
        value: topGuild?.tier ?? "--",
        tone: "default" as const,
      },
      {
        label: "Signal state",
        value: hasFallback ? "Partial" : "Stable",
        tone: hasFallback ? "default" : "green",
      },
    ],
    details: [
      { label: "Current raid", value: raid.raid?.name ?? "--", tone: "gold" as const },
      { label: "Season", value: raid.raid?.season ?? "--" },
      { label: "Mythic bosses tracked", value: String(raid.bosses.length) },
      { label: "Most played route", value: mythic.meta_analysis?.most_played_dungeons?.[0] ?? "--", tone: "cyan" as const },
      { label: "Feed events", value: String(activity.items.length) },
    ],
  };

  return (
    <section className="space-y-5">
      {hasFallback ? (
        <DataStateBanner
          title="Parte dos dados esta indisponivel"
          description="Esta tela entrou em modo de contingencia. O layout continua operando, mas voce pode estar vendo dados vazios ou neutros enquanto a API se recompõe."
          error={[ladder, raid, mythic, activity].find(isFallbackData)?._requestError ?? null}
        />
      ) : null}
      <Hero copy={copy} metrics={metrics} overview={overview} />
    </section>
  );
}

async function HomeRankingSection() {
  const ladder = await getGuildLadder();

  return (
    <section className="space-y-5">
      {isFallbackData(ladder) ? (
        <DataStateBanner
          title="Warboard em modo de contingencia"
          description="Os rankings publicos nao responderam a tempo. O warboard continua acessivel, mas os dados reais ainda nao chegaram nesta leitura."
          error={ladder._requestError}
        />
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">World rankings</div>
          <h2 className="mt-4 section-title">Guild progression ladder</h2>
        </div>
        <Link href="/rankings" className="arcane-button-secondary">
          Open full warboard
        </Link>
      </div>

      <RankingTable title="Guild Progression Ladder" entries={ladder.entries} />
    </section>
  );
}

async function HomeIntelligenceSection() {
  const [activity, mythic, raid] = await Promise.all([
    getActivityFeed(),
    getMythicDashboard(),
    getRaidDashboard(),
  ]);

  const hasFallback = [activity, mythic, raid].some(isFallbackData);
  const popularDungeons = mythic.meta_analysis?.most_played_dungeons ?? [];

  return (
    <section className="space-y-5">
      {hasFallback ? (
        <DataStateBanner
          title="Inteligencia parcial"
          description="A camada de feed e meta nao conseguiu preencher todos os paineis. O Nexus mostra estados seguros e neutros ate a proxima sincronizacao."
          error={[activity, mythic, raid].find(isFallbackData)?._requestError ?? null}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.98),rgba(8,13,24,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[0.72rem] uppercase tracking-[0.24em] text-gold/75">Activity feed</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-white/55">
              {activity.items.length} events
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {activity.items.length ? (
              activity.items.slice(0, 6).map((item) => (
                <div key={`${item.type}-${item.title}-${item.created_at}`} className="rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      {item.subtitle ? <div className="mt-1 text-sm text-white/55">{item.subtitle}</div> : null}
                    </div>
                    <div className="text-[0.68rem] uppercase tracking-[0.18em] text-white/38">{item.type}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/12 bg-black/20 px-4 py-5 text-sm text-white/55">
                No public activity events are available right now.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.98),rgba(8,13,24,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[0.72rem] uppercase tracking-[0.24em] text-sky-100/80">Mythic+ meta</div>
            <div className="rounded-full border border-sky-300/14 bg-sky-500/10 px-3 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-sky-100/80">
              {mythic.meta_analysis?.timed_ratio ? `${mythic.meta_analysis.timed_ratio}% timed` : "--"}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {popularDungeons.length ? (
              popularDungeons.slice(0, 5).map((dungeon: string, index: number) => (
                <div key={dungeon} className="space-y-2 rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-white">{dungeon}</span>
                    <span className="font-['Space_Mono',monospace] text-xs text-white/45">
                      {Math.max(100 - index * 8, 64)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/6">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#4CC9F0,rgba(76,201,240,0.28))]"
                      style={{ width: `${Math.max(100 - index * 8, 64)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/12 bg-black/20 px-4 py-5 text-sm text-white/55">
                Mythic+ route data is not available right now.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.98),rgba(8,13,24,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[0.72rem] uppercase tracking-[0.24em] text-gold/75">Season watch</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-white/55">
              {raid.raid?.season ?? "--"}
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">
            {[
              ["Current raid", raid.raid?.name ?? "--"],
              ["Bosses visible", String(raid.bosses.length)],
              ["World tracker", String((raid.world_first_tracker ?? []).length)],
              ["Heatmap ready", raid.heatmap_ready ? "Yes" : "No"],
            ].map(([label, value], index, rows) => (
              <div
                key={label}
                className={`flex items-center justify-between gap-4 py-3 ${
                  index < rows.length - 1 ? "border-b border-white/8" : ""
                }`}
              >
                <span className="text-sm text-white/55">{label}</span>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/search" className="arcane-button">
              Search archive
            </Link>
            <Link href="/compare" className="arcane-button-secondary">
              Compare entities
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const { copy } = await getDictionary();

  return (
    <div className="page-shell space-y-12">
      <Suspense fallback={<HomeSectionSkeleton height="h-[420px]" />}>
        <HomeHeroSection copy={copy.hero} />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton height="h-[520px]" />}>
        <HomeRankingSection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton height="h-[360px]" />}>
        <HomeIntelligenceSection />
      </Suspense>
    </div>
  );
}
