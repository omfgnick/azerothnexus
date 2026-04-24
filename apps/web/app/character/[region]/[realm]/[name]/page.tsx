import { ScoreHistoryChart } from "@/components/score-history-chart";
import { getCharacter, getCharacterHistory } from "@/lib/api";

export default async function CharacterPage({ params }: { params: Promise<{ region: string; realm: string; name: string }> }) {
  const resolved = await params;
  const [character, history] = await Promise.all([
    getCharacter(resolved.region, resolved.realm, resolved.name),
    getCharacterHistory(resolved.region, resolved.realm, resolved.name)
  ]);

  return (
    <div className="page-shell space-y-8">
      <section className="panel panel-section-lg">
        <p className="eyebrow">Champion dossier</p>
        <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">{character.name}</h1>
        <p className="mt-6 max-w-3xl lead-copy">{character.rank_profile.explanation}</p>

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
      </section>

      <ScoreHistoryChart title="Character score history" points={history.points} />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel panel-section">
          <p className="eyebrow">Power lattice</p>
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
