import { ScoreHistoryChart } from "@/components/score-history-chart";
import { getGuild, getGuildHistory } from "@/lib/api";

export default async function GuildPage({ params }: { params: Promise<{ region: string; realm: string; guild: string }> }) {
  const resolved = await params;
  const [guild, history] = await Promise.all([
    getGuild(resolved.region, resolved.realm, resolved.guild),
    getGuildHistory(resolved.region, resolved.realm, resolved.guild)
  ]);

  return (
    <div className="page-shell space-y-8">
      <section className="panel panel-section-lg">
        <p className="eyebrow">Guild hall</p>
        <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">{guild.name}</h1>
        <p className="mt-6 max-w-3xl lead-copy">{guild.rank_profile.explanation}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Composite</div>
            <div className="mt-3 score-number tone-gold">{guild.rank_profile.score.toFixed(1)}</div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Tier</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {guild.rank_profile.tier}
            </div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Trend</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {guild.rank_profile.trend}
            </div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">World rank</div>
            <div className="mt-3 score-number">#{guild.ranking_position ?? "-"}</div>
          </div>
        </div>
      </section>

      <ScoreHistoryChart title="Guild score history" points={history.points} />

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel panel-section">
          <p className="eyebrow">Power lattice</p>
          <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            Score breakdown
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
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
          <p className="eyebrow">Raid progress</p>
          <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
            Boss ledger
          </h2>
          <div className="mt-6 space-y-3">
            {guild.boss_progress.map((boss: { boss_name: string; difficulty: string; defeated: boolean; pulls: number }) => (
              <div key={boss.boss_name} className="data-slab">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {boss.boss_name}
                    </div>
                    <div className="mt-2 text-sm uppercase tracking-[0.16em] text-white/55">{boss.difficulty}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">{boss.defeated ? "Defeated" : "Progressing"}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">{boss.pulls} pulls</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel-section">
        <p className="eyebrow">Roster manifest</p>
        <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
          Guild roster
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {guild.roster.map((member: { character_name: string; role?: string; spec?: string; item_level?: number }) => (
            <div key={member.character_name} className="data-slab">
              <div className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {member.character_name}
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.16em] text-white/55">
                {member.spec ?? "Unknown spec"} / {member.role ?? "Unknown role"}
              </div>
              <div className="mt-4 text-sm text-white/75">Item level {member.item_level?.toFixed(1) ?? "-"}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
