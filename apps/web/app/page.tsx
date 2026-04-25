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

function uniqueRealmsFromLadder(subtitles: Array<string | undefined>) {
  return Array.from(
    new Set(
      subtitles
        .map((subtitle) => subtitle?.split("Â·").join("·").split("·")[1]?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).length;
}

function bossDifficultyToken(boss: { difficulty?: string | null; status?: string | null }) {
  const difficulty = (boss.difficulty ?? boss.status ?? "").toLowerCase();
  if (difficulty.includes("mythic")) {
    return { label: "M", className: "mythic" };
  }
  if (difficulty.includes("heroic")) {
    return { label: "H", className: "heroic" };
  }
  return { label: "N", className: "normal" };
}

function activityTone(type: string) {
  if (type === "guild") return "guild";
  if (type === "character") return "char";
  if (type === "mythic_plus" || type === "mythic-plus" || type === "dungeon") return "mythic";
  return "raid";
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
  const uniqueRealms = uniqueRealmsFromLadder(ladder.entries.map((entry) => entry.subtitle));
  const metricDetails = copy.hero.readings.slice(0, 4);
  const metrics: HeroMetric[] = [
    {
      label: metricDetails[0]?.label ?? "Tracked entities",
      value: String(ladder.entries.length),
      detail: metricDetails[0]?.detail,
      tone: "gold",
    },
    {
      label: metricDetails[1]?.label ?? "Visible realms",
      value: String(uniqueRealms),
      detail: metricDetails[1]?.detail,
      tone: "default",
    },
    {
      label: metricDetails[2]?.label ?? "Live events",
      value: String(activity.items.length),
      detail: metricDetails[2]?.detail,
      tone: "cyan",
    },
    {
      label: metricDetails[3]?.label ?? "Update cycle",
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
      },
      {
        label: copy.home.signalState,
        value: hasFallback ? copy.shared.partial : copy.shared.stable,
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
    <section>
      {isFallbackData(ladder) ? (
        <div className="mb-5">
          <DataStateBanner
            title={copy.home.rankingBannerTitle}
            description={copy.home.rankingBannerDescription}
            error={ladder._requestError}
            detailLabel={copy.dataState.technicalDetail}
          />
        </div>
      ) : null}

      <div className="an-section-head an-animate-in an-delay-1">
        <div className="an-section-label">
          <div className="an-section-eyebrow">{copy.home.rankingsEyebrow}</div>
          <h2 className="an-section-title">{copy.home.rankingsTitle}</h2>
        </div>
        <Link href="/rankings" className="an-section-action">
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
    <section>
      {hasFallback ? (
        <div className="mb-5">
          <DataStateBanner
            title={copy.home.intelligenceBannerTitle}
            description={copy.home.intelligenceBannerDescription}
            error={[activity, mythic, raid].find(isFallbackData)?._requestError ?? null}
            detailLabel={copy.dataState.technicalDetail}
          />
        </div>
      ) : null}

      <div className="an-section-head">
        <div className="an-section-label">
          <div className="an-section-eyebrow">{copy.home.intelligenceEyebrow}</div>
          <h2 className="an-section-title">{copy.home.intelligenceTitle}</h2>
        </div>
      </div>

      <div className="an-bottom-grid">
        <div className="an-panel an-animate-in an-delay-1">
          <div className="an-panel-head">
            <span className="an-panel-label gold">{copy.home.activityFeed}</span>
            <span className="an-panel-count">
              {activity.items.length} {copy.home.eventsLabel}
            </span>
          </div>
          <div className="an-panel-body">
            {activity.items.length ? (
              activity.items.slice(0, 6).map((item) => (
                <div key={`${item.type}-${item.title}-${item.created_at}`} className="an-activity-item">
                  <div className={`an-activity-dot ${activityTone(item.type)}`} />
                  <div>
                    <div className="an-activity-name">{item.title}</div>
                    <div className="an-activity-sub">{item.subtitle ?? "--"}</div>
                  </div>
                  <span className="an-activity-time">{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))
            ) : (
              <div className="an-panel-empty">{copy.home.noActivity}</div>
            )}
          </div>
        </div>

        <div className="an-panel an-animate-in an-delay-2">
          <div className="an-panel-head">
            <span className="an-panel-label cyan">{copy.home.mythicMeta}</span>
            <span className="an-panel-count cyan">
              {mythic.meta_analysis?.timed_ratio ? `${mythic.meta_analysis.timed_ratio}% ${copy.home.timedSuffix}` : "--"}
            </span>
          </div>
          <div className="an-panel-body">
            {popularDungeons.length ? (
              popularDungeons.slice(0, 8).map((dungeon: string, index: number) => {
                const width = Math.max(55, 92 - index * 6);
                return (
                  <div key={dungeon} className="an-dungeon-item">
                    <span className="an-dungeon-name">{dungeon}</span>
                    <div className="an-dungeon-bar-wrap">
                      <div className="an-dungeon-bar" style={{ width: `${width}%` }} />
                    </div>
                    <span className="an-dungeon-pct">{width}%</span>
                  </div>
                );
              })
            ) : (
              <div className="an-panel-empty">{copy.home.noMythicRoutes}</div>
            )}
          </div>
        </div>

        <div className="an-panel an-animate-in an-delay-3">
          <div className="an-panel-head">
            <span className="an-panel-label purple">{raid.raid?.name ?? copy.home.currentRaid}</span>
            <span className="an-panel-count purple">
              {raid.bosses.length} {copy.home.bossesVisible}
            </span>
          </div>
          <div className="an-panel-body">
            {raid.bosses.length ? (
              raid.bosses.slice(0, 8).map((boss, index) => {
                const difficulty = bossDifficultyToken(boss);
                return (
                  <div key={`${boss.slug ?? boss.name ?? index}`} className="an-boss-item">
                    <span className="an-boss-num">{String(index + 1).padStart(2, "0")}</span>
                    <span className="an-boss-name">{boss.name ?? "--"}</span>
                    <span className={`an-boss-diff ${difficulty.className}`}>{difficulty.label}</span>
                  </div>
                );
              })
            ) : (
              <div className="an-panel-empty">{copy.home.currentRaid}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeCtaSection({ copy }: { copy: Awaited<ReturnType<typeof getDictionary>>["copy"] }) {
  return (
    <section className="an-cta-strip an-animate-in an-delay-1">
      <div className="an-cta-text">
        <div className="an-cta-title">{copy.home.ctaTitle}</div>
        <div className="an-cta-sub">{copy.home.ctaDescription}</div>
      </div>
      <div className="an-cta-actions">
        <Link href="/compare" className="an-btn an-btn-primary">
          {copy.home.openCompare}
          <span>→</span>
        </Link>
        <Link href="/admin" className="an-btn an-btn-secondary">
          {copy.home.adminPanel}
        </Link>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const { copy } = await getDictionary();

  return (
    <div className="space-y-14">
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
