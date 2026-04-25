import Link from "next/link";
import { Suspense } from "react";

import { DataStateBanner } from "@/components/data-state-banner";
import { Hero, type HeroMetric, type HeroOverview } from "@/components/hero";
import { RankingTable } from "@/components/ranking-table";
import { getActivityFeed, getGuildLadder, getMythicDashboard, getRaidDashboard, isFallbackData } from "@/lib/api";
import { getDictionary } from "@/lib/locale";

function HomeSectionSkeleton({ height = "h-[320px]" }: { height?: string }) {
  return <div className={`animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03] ${height}`} />;
}

async function HomeHeroSection({ copy }: { copy: Awaited<ReturnType<typeof getDictionary>>["copy"] }) {
  const [ladder, raid, mythic, activity] = await Promise.all([
    getGuildLadder(),
    getRaidDashboard(),
    getMythicDashboard(),
    getActivityFeed(),
  ]);

  const topGuild = ladder.entries?.[0];
  const hasFallback = [ladder, raid, mythic, activity].some(isFallbackData);
  const metricDetails = copy.hero.readings.slice(0, 4);
  const metrics: HeroMetric[] = [
    {
      label: metricDetails[0]?.label ?? "Visible guilds",
      value: String(ladder.entries.length),
      detail: metricDetails[0]?.detail,
      tone: "gold",
    },
    {
      label: metricDetails[1]?.label ?? "Live events",
      value: String(activity.items.length),
      detail: metricDetails[1]?.detail,
      tone: "cyan",
    },
    {
      label: metricDetails[2]?.label ?? "Raid bosses",
      value: String(raid.bosses.length),
      detail: metricDetails[2]?.detail,
      tone: "default",
    },
    {
      label: metricDetails[3]?.label ?? "Feed state",
      value: hasFallback ? copy.shared.fallback : copy.shared.live,
      detail: metricDetails[3]?.detail,
      tone: hasFallback ? "default" : "green",
    },
  ];

  const overview: HeroOverview = {
    badge: hasFallback ? copy.shared.fallback : copy.shared.live,
    metrics: [
      {
        label: copy.hero.warboardLabel,
        value: topGuild ? topGuild.score.toFixed(1) : "--",
        tone: "gold",
      },
      {
        label: copy.hero.archiveLabel,
        value: mythic.meta_analysis?.timed_ratio ? `${mythic.meta_analysis.timed_ratio}%` : "--",
        tone: "cyan",
      },
      {
        label: copy.home.topGuildTier,
        value: topGuild?.tier ?? "--",
        tone: "default",
      },
      {
        label: copy.home.signalState,
        value: hasFallback ? copy.shared.partial : copy.shared.stable,
        tone: hasFallback ? "default" : "green",
      },
    ],
    details: [
      { label: copy.home.currentRaid, value: raid.raid?.name ?? "--", tone: "gold" },
      { label: copy.home.season, value: raid.raid?.season ?? "--" },
      { label: copy.home.mythicBossesTracked, value: String(raid.bosses.length) },
      { label: copy.home.mostPlayedRoute, value: mythic.meta_analysis?.most_played_dungeons?.[0] ?? "--", tone: "cyan" },
      { label: copy.home.eventsLabel, value: String(activity.items.length) },
    ],
  };

  return (
    <section className="space-y-5">
      {hasFallback ? (
        <DataStateBanner
          title={copy.home.dataBannerTitle}
          description={copy.home.dataBannerDescription}
          error={[ladder, raid, mythic, activity].find(isFallbackData)?._requestError ?? null}
          detailLabel={copy.dataState.technicalDetail}
        />
      ) : null}
      <Hero copy={copy.hero} metrics={metrics} overview={overview} />
    </section>
  );
}

async function HomeRankingSection({ copy }: { copy: Awaited<ReturnType<typeof getDictionary>>["copy"] }) {
  const ladder = await getGuildLadder();

  return (
    <section className="space-y-5">
      {isFallbackData(ladder) ? (
        <DataStateBanner
          title={copy.home.rankingBannerTitle}
          description={copy.home.rankingBannerDescription}
          error={ladder._requestError}
          detailLabel={copy.dataState.technicalDetail}
        />
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="eyebrow">{copy.home.rankingsEyebrow}</div>
          <h2 className="section-title">{copy.home.rankingsTitle}</h2>
        </div>
        <Link href="/rankings" className="arcane-button-secondary">
          {copy.home.openWarboard}
        </Link>
      </div>

      <RankingTable title={copy.home.rankingsTitle} entries={ladder.entries} labels={copy.rankingTable} />
    </section>
  );
}

async function HomeIntelligenceSection({ copy }: { copy: Awaited<ReturnType<typeof getDictionary>>["copy"] }) {
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
          title={copy.home.intelligenceBannerTitle}
          description={copy.home.intelligenceBannerDescription}
          error={[activity, mythic, raid].find(isFallbackData)?._requestError ?? null}
          detailLabel={copy.dataState.technicalDetail}
        />
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="eyebrow">{copy.home.intelligenceEyebrow}</div>
          <h2 className="section-title">{copy.home.intelligenceTitle}</h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.98),rgba(8,13,24,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[0.72rem] uppercase tracking-[0.24em] text-gold/75">{copy.home.activityFeed}</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-white/55">
              {activity.items.length} {copy.home.eventsLabel}
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
                {copy.home.noActivity}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.98),rgba(8,13,24,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[0.72rem] uppercase tracking-[0.24em] text-sky-100/80">{copy.home.mythicMeta}</div>
            <div className="rounded-full border border-sky-300/14 bg-sky-500/10 px-3 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-sky-100/80">
              {mythic.meta_analysis?.timed_ratio ? `${mythic.meta_analysis.timed_ratio}% ${copy.home.timedSuffix}` : "--"}
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
                {copy.home.noMythicRoutes}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.98),rgba(8,13,24,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[0.72rem] uppercase tracking-[0.24em] text-gold/75">{copy.home.seasonWatch}</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-white/55">
              {raid.raid?.season ?? "--"}
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">
            {[
              [copy.home.currentRaid, raid.raid?.name ?? "--"],
              [copy.home.bossesVisible, String(raid.bosses.length)],
              [copy.home.worldTracker, String((raid.world_first_tracker ?? []).length)],
              [copy.home.heatmapReady, raid.heatmap_ready ? copy.shared.yes : copy.shared.no],
            ].map(([label, value], index, rows) => (
              <div
                key={label}
                className={`flex items-center justify-between gap-4 py-3 ${index < rows.length - 1 ? "border-b border-white/8" : ""}`}
              >
                <span className="text-sm text-white/55">{label}</span>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/search" className="arcane-button">
              {copy.home.searchArchive}
            </Link>
            <Link href="/compare" className="arcane-button-secondary">
              {copy.home.compareEntities}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeCtaSection({ copy }: { copy: Awaited<ReturnType<typeof getDictionary>>["copy"] }) {
  return (
    <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,22,40,0.96),rgba(8,13,24,0.98))] px-5 py-6 shadow-[0_28px_64px_rgba(0,0,0,0.36)] sm:px-7 sm:py-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[1.5rem] text-white sm:text-[1.9rem]" style={{ fontFamily: "var(--font-display)" }}>
            {copy.home.ctaTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">{copy.home.ctaDescription}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/compare" className="arcane-button">
            {copy.home.openCompare}
          </Link>
          <Link href="/admin" className="arcane-button-secondary">
            {copy.home.adminPanel}
          </Link>
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
        <HomeHeroSection copy={copy} />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton height="h-[520px]" />}>
        <HomeRankingSection copy={copy} />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton height="h-[360px]" />}>
        <HomeIntelligenceSection copy={copy} />
      </Suspense>

      <HomeCtaSection copy={copy} />
    </div>
  );
}
