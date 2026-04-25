import { AdminEntityRefreshSlot } from "@/components/admin-entity-refresh-slot";
import { DataStateBanner } from "@/components/data-state-banner";
import { GuildSigilIcon, IconFrame, RaidSigilIcon } from "@/components/nexus-icons";
import { ScenePanel } from "@/components/scene-panel";
import { ScoreHistoryChart } from "@/components/score-history-chart";
import { getGuild, getGuildHistory, isFallbackData } from "@/lib/api";
import { getDictionary } from "@/lib/locale";

export default async function GuildPage({ params }: { params: Promise<{ region: string; realm: string; guild: string }> }) {
  const resolved = await params;
  const { locale, copy } = await getDictionary();
  const labels = copy.guildPage;
  const realmLabel = resolved.realm.replace(/-/g, " ");
  const [guild, history] = await Promise.all([
    getGuild(resolved.region, resolved.realm, resolved.guild),
    getGuildHistory(resolved.region, resolved.realm, resolved.guild),
  ]);

  return (
    <div className="page-shell space-y-8">
      {isFallbackData(guild) || isFallbackData(history) ? (
        <DataStateBanner
          title={copy.shared.publicDataUnavailable}
          description={labels.bannerDescription}
          error={guild._requestError ?? history._requestError}
          detailLabel={copy.dataState.technicalDetail}
        />
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{labels.heroEyebrow}</p>
              <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">{guild.name}</h1>
              <p className="mt-6 max-w-3xl lead-copy">{guild.rank_profile.explanation}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="rune-pill">{labels.autoRefresh}</div>
                <AdminEntityRefreshSlot entityType="guild" region={resolved.region} realm={resolved.realm} name={guild.name} pathName={resolved.guild} />
              </div>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="gold">
              <GuildSigilIcon className="h-8 w-8" />
            </IconFrame>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.composite}</div>
              <div className="mt-3 score-number tone-gold">{guild.rank_profile.score.toFixed(1)}</div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.tier}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {guild.rank_profile.tier}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.trend}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {guild.rank_profile.trend}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.worldRank}</div>
              <div className="mt-3 score-number">#{guild.ranking_position ?? "-"}</div>
            </div>
          </div>
        </div>

        <ScenePanel
          eyebrow={labels.sceneEyebrow}
          title={labels.sceneTitle}
          description={labels.sceneDescription}
          imageSrc="/images/guild-warhall-scene.png"
          imageAlt="Grand Azeroth guild hall with banners, heroes, weapons, and a raid planning table."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="gold">
              <RaidSigilIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge={`${resolved.region.toUpperCase()} / ${realmLabel}`}
        />
      </section>

      <ScoreHistoryChart title={labels.historyTitle} points={history.points} labels={copy.scoreHistory} locale={locale} />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel panel-section">
          <p className="eyebrow">{labels.breakdownEyebrow}</p>
          <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            {labels.breakdownTitle}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(guild.score_breakdown).map(([key, value]) => (
              <div key={key} className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.3em] text-gold/75">{key.replace(/_/g, " ")}</div>
                <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {Number(value).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-section">
          <p className="eyebrow">{labels.progressEyebrow}</p>
          <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            {labels.progressTitle}
          </h2>
          <div className="mt-6 space-y-3">
            {guild.boss_progress.map((boss: { boss_name: string; difficulty: string; defeated: boolean; pulls: number }) => (
              <div key={boss.boss_name} className="data-slab">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[1.4rem] text-white sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
                      {boss.boss_name}
                    </div>
                    <div className="mt-2 text-sm uppercase tracking-[0.16em] text-white/55">{boss.difficulty}</div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">{boss.defeated ? labels.defeated : labels.progressing}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">{boss.pulls} {labels.pulls}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel-section">
        <p className="eyebrow">{labels.rosterEyebrow}</p>
        <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
          {labels.rosterTitle}
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {guild.roster.map((member: { character_name: string; role?: string; spec?: string; item_level?: number }) => (
            <div key={member.character_name} className="data-slab">
              <div className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {member.character_name}
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.16em] text-white/55">
                {member.spec ?? labels.unknownSpec} / {member.role ?? labels.unknownRole}
              </div>
              <div className="mt-4 text-sm text-white/75">{labels.itemLevel} {member.item_level?.toFixed(1) ?? "-"}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
