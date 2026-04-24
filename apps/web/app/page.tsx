import { Hero } from "@/components/hero";
import { RankingTable } from "@/components/ranking-table";
import { StatCard } from "@/components/stat-card";
import { getActivityFeed, getGuildLadder, getMythicDashboard, getRaidDashboard } from "@/lib/api";

export default async function HomePage() {
  const [ladder, raid, mythic, activity] = await Promise.all([
    getGuildLadder(),
    getRaidDashboard(),
    getMythicDashboard(),
    getActivityFeed()
  ]);

  const topGuild = ladder.entries?.[0];

  return (
    <div className="page-shell space-y-10">
      <Hero />

      <section className="grid gap-5 md:grid-cols-4">
        <StatCard label="Tracked entities" value="18.4K" detail="Guilds, champions, realms, and regions standing ready for public scouting." />
        <StatCard label="Current raid" value={raid.raid?.name ?? "N/A"} detail="The active tier presented as a chamber of bosses, not a plain checklist." />
        <StatCard
          label="Top guild note"
          value={topGuild?.grade ?? "N/A"}
          detail={topGuild?.tier ? `${topGuild.tier} / ${topGuild.trend ?? "steady"}` : "Ranking intelligence ready"}
        />
        <StatCard label="Scrying layer" value="Live" detail="Autocomplete by name, realm, region, or guild with runic search treatment." />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <RankingTable title="Top Guild Ladder" entries={ladder.entries} />

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Raid constellation</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Current raid bosses
              </h2>
            </div>
            <div className="rune-pill">{raid.raid?.season ?? "Season watch"}</div>
          </div>

          <div className="mt-6 space-y-4">
            {raid.bosses.map((boss: { name: string; order: number }) => (
              <div key={boss.name} className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Boss {boss.order}</div>
                <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {boss.name}
                </div>
                <p className="mt-3 text-sm text-white/58">The observatory frames each encounter as a ritual step toward full raid domination.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel panel-section">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Astral traffic</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Live activity feed
              </h2>
            </div>
            <div className="rune-pill">Realm echoes</div>
          </div>

          <div className="mt-6 space-y-3">
            {activity.items.map((item: { type: string; title: string; subtitle?: string; created_at: string }) => (
              <div key={`${item.type}-${item.title}-${item.created_at}`} className="data-slab">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{item.type}</div>
                <div className="mt-3 text-xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {item.title}
                </div>
                {item.subtitle ? <div className="mt-2 text-sm text-white/60">{item.subtitle}</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Dungeon omens</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Mythic+ meta pulse
              </h2>
            </div>
            <div className="rune-pill">Season pressure</div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Timed ratio</div>
              <div className="mt-3 score-number tone-arcane">{mythic.meta_analysis?.timed_ratio ?? 0}%</div>
            </div>

            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Popular dungeons</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(mythic.meta_analysis?.most_played_dungeons ?? []).map((name: string) => (
                  <span key={name} className="rune-chip">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {topGuild ? (
              <div className="data-slab border-gold/20">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Top guild insight</div>
                <div className="mt-3 text-2xl text-gold" style={{ fontFamily: "var(--font-display)" }}>
                  {topGuild.label}
                </div>
                <div className="mt-3 text-sm text-white/68">{topGuild.explanation}</div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
