import { EntityRefreshButton } from "@/components/entity-refresh-button";
import { ChampionSigilIcon, IconFrame, NexusCrestIcon } from "@/components/nexus-icons";
import { ScenePanel } from "@/components/scene-panel";
import { ScoreHistoryChart } from "@/components/score-history-chart";
import { getCharacter, getCharacterHistory } from "@/lib/api";
import { hasAdminSession } from "@/lib/admin-auth-server";

export default async function CharacterPage({ params }: { params: Promise<{ region: string; realm: string; name: string }> }) {
  const resolved = await params;
  const realmLabel = resolved.realm.replace(/-/g, " ");
  const [character, history, canRefresh] = await Promise.all([
    getCharacter(resolved.region, resolved.realm, resolved.name),
    getCharacterHistory(resolved.region, resolved.realm, resolved.name),
    hasAdminSession(),
  ]);

  return (
    <div className="page-shell space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Character profile</p>
              <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">{character.name}</h1>
              <p className="mt-6 max-w-3xl lead-copy">{character.rank_profile.explanation}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="rune-pill">Auto refresh every 10 minutes</div>
                {canRefresh ? (
                  <EntityRefreshButton entityType="character" region={resolved.region} realm={resolved.realm} name={character.name} pathName={resolved.name} />
                ) : null}
              </div>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="arcane">
              <ChampionSigilIcon className="h-8 w-8" />
            </IconFrame>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Composite</div>
              <div className="mt-3 score-number tone-gold">{character.rank_profile.score.toFixed(1)}</div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Class and spec</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {character.class_name} / {character.spec_name}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Mythic+</div>
              <div className="mt-3 score-number tone-arcane">{character.mythic_plus_score.toFixed(1)}</div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Item level</div>
              <div className="mt-3 score-number">{character.item_level.toFixed(1)}</div>
            </div>
          </div>
        </div>

        <ScenePanel
          eyebrow="Champion sanctum"
          title={`${character.name} now opens inside a heroic Warcraft-style sanctum.`}
          description="The profile now feels closer to a class hall or champion chamber, giving the page a stronger MMO identity before the stats and achievements take over."
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

      <ScoreHistoryChart title="Character score history" points={history.points} />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel panel-section">
          <p className="eyebrow">Character breakdown</p>
          <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            Score breakdown
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
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
          <p className="eyebrow">Snapshot facts</p>
          <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            Current reading
          </h2>
          <div className="mt-6 space-y-3">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Guild</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {character.guild_name ?? "Unaffiliated"}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Raid estimate</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {Number(character.raid_parses.overall_estimate ?? 0).toFixed(1)}
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.16em] text-white/55">
                {character.raid_parses.source === "warcraftlogs" ? "Warcraft Logs" : "Estimated"}
              </div>
            </div>
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Tier and trend</div>
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
            <p className="eyebrow">Raid logs</p>
            <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              Warcraft Logs reading
            </h2>
          </div>
          <div className="rune-pill">
            {character.raid_parses.source === "warcraftlogs" ? "Live parse source" : "Awaiting live logs"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Best average</div>
            <div className="mt-3 score-number tone-gold">{Number(character.raid_parses.best_performance_average ?? 0).toFixed(1)}</div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Median average</div>
            <div className="mt-3 score-number tone-arcane">{Number(character.raid_parses.median_performance_average ?? 0).toFixed(1)}</div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Bosses logged</div>
            <div className="mt-3 score-number">{Number(character.raid_parses.bosses_logged ?? 0)}</div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Source</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {character.raid_parses.source === "warcraftlogs" ? "Warcraft Logs" : "Scaffold"}
            </div>
          </div>
        </div>
      </section>

      <section className="panel panel-section">
        <p className="eyebrow">Honors</p>
        <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
          Achievements
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
