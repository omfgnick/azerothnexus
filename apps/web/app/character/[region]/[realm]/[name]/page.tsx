import { AdminEntityRefreshSlot } from "@/components/admin-entity-refresh-slot";
import { CharacterArmoryPanel } from "@/components/character-armory-panel";
import { DataStateBanner } from "@/components/data-state-banner";
import { ChampionSigilIcon, IconFrame, NexusCrestIcon } from "@/components/nexus-icons";
import { ScenePanel } from "@/components/scene-panel";
import { ScoreHistoryChart } from "@/components/score-history-chart";
import { getCharacter, getCharacterHistory, isFallbackData } from "@/lib/api";
import { getDictionary } from "@/lib/locale";

export default async function CharacterPage({ params }: { params: Promise<{ region: string; realm: string; name: string }> }) {
  const resolved = await params;
  const { locale, copy } = await getDictionary();
  const labels = copy.characterPage;
  const realmLabel = resolved.realm.replace(/-/g, " ");
  const [character, history] = await Promise.all([
    getCharacter(resolved.region, resolved.realm, resolved.name),
    getCharacterHistory(resolved.region, resolved.realm, resolved.name),
  ]);

  return (
    <div className="page-shell space-y-8">
      {isFallbackData(character) || isFallbackData(history) ? (
        <DataStateBanner
          title={copy.shared.publicDataUnavailable}
          description={labels.bannerDescription}
          error={character._requestError ?? history._requestError}
          detailLabel={copy.dataState.technicalDetail}
        />
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{labels.heroEyebrow}</p>
              <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">{character.name}</h1>
              <p className="mt-6 max-w-3xl lead-copy">{character.rank_profile.explanation}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="rune-pill">{labels.autoRefresh}</div>
                <AdminEntityRefreshSlot entityType="character" region={resolved.region} realm={resolved.realm} name={character.name} pathName={resolved.name} />
              </div>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="arcane">
              <ChampionSigilIcon className="h-8 w-8" />
            </IconFrame>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.composite}</div>
              <div className="mt-3 score-number tone-gold">{character.rank_profile.score.toFixed(1)}</div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.classAndSpec}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {character.class_name} / {character.spec_name}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.mythicPlus}</div>
              <div className="mt-3 score-number tone-arcane">{character.mythic_plus_score.toFixed(1)}</div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.itemLevel}</div>
              <div className="mt-3 score-number">{character.item_level.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <ScenePanel
          eyebrow={labels.sceneEyebrow}
          title={labels.sceneTitle}
          description={labels.sceneDescription}
          imageSrc="/images/character-sanctum-scene.png"
          imageAlt="Heroic Azeroth champion sanctum with enchanted weapons, forge light, and a celestial ceiling."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="arcane">
              <NexusCrestIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge={`${resolved.region.toUpperCase()} / ${realmLabel}`}
        />
      </section>

      <CharacterArmoryPanel
        name={character.name}
        profileSummary={character.profile_summary}
        equipment={character.equipment}
        talentLoadout={character.talent_loadout}
        labels={copy.armory}
      />

      <ScoreHistoryChart title={labels.historyTitle} points={history.points} labels={copy.scoreHistory} locale={locale} />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel panel-section">
          <p className="eyebrow">{labels.breakdownEyebrow}</p>
          <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            {labels.breakdownTitle}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(character.score_breakdown).map(([key, value]) => (
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
          <p className="eyebrow">{labels.snapshotEyebrow}</p>
          <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            {labels.snapshotTitle}
          </h2>
          <div className="mt-6 space-y-3">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.guild}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {character.guild_name ?? labels.unaffiliated}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.raidEstimate}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {Number(character.raid_parses.overall_estimate ?? 0).toFixed(1)}
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.16em] text-white/55">
                {character.raid_parses.source === "warcraftlogs" ? "Warcraft Logs" : copy.shared.estimated}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.tierAndTrend}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {character.rank_profile.tier} / {character.rank_profile.trend}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel panel-section">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{labels.raidLogsEyebrow}</p>
            <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {labels.raidLogsTitle}
            </h2>
          </div>
          <div className="rune-pill">
            {character.raid_parses.source === "warcraftlogs" ? labels.liveParseSource : labels.awaitingLiveLogs}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.bestAverage}</div>
            <div className="mt-3 score-number tone-gold">{Number(character.raid_parses.best_performance_average ?? 0).toFixed(1)}</div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.medianAverage}</div>
            <div className="mt-3 score-number tone-arcane">{Number(character.raid_parses.median_performance_average ?? 0).toFixed(1)}</div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.bossesLogged}</div>
            <div className="mt-3 score-number">{Number(character.raid_parses.bosses_logged ?? 0)}</div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{labels.source}</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {character.raid_parses.source === "warcraftlogs" ? "Warcraft Logs" : copy.shared.scaffold}
            </div>
          </div>
        </div>
      </section>

      <section className="panel panel-section">
        <p className="eyebrow">{labels.honorsEyebrow}</p>
        <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
          {labels.honorsTitle}
        </h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {character.achievements.map((achievement: string) => (
            <span key={achievement} className="rune-chip">
              {achievement}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
