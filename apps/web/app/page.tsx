import Link from "next/link";

import { Hero } from "@/components/hero";
import {
  ArchiveSigilIcon,
  IconFrame,
  NexusCrestIcon,
  RaidSigilIcon,
  SearchSigilIcon,
  WarboardSigilIcon,
} from "@/components/nexus-icons";
import { RankingTable } from "@/components/ranking-table";
import { ScenePanel } from "@/components/scene-panel";
import { StatCard } from "@/components/stat-card";
import { getActivityFeed, getGuildLadder, getMythicDashboard, getRaidDashboard } from "@/lib/api";
import { getDictionary } from "@/lib/locale";

export default async function HomePage() {
  const { copy } = await getDictionary();
  const [ladder, raid, mythic, activity] = await Promise.all([
    getGuildLadder(),
    getRaidDashboard(),
    getMythicDashboard(),
    getActivityFeed(),
  ]);

  const topGuild = ladder.entries?.[0];
  const popularDungeons = mythic.meta_analysis?.most_played_dungeons ?? [];

  return (
    <div className="page-shell space-y-10">
      <Hero copy={copy.hero} />

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-6">
          <ScenePanel
            eyebrow="Azeroth Nexus"
            title="A front page staged as a celestial fortress instead of a sterile product grid."
            description="The Nexus now opens with scenic chambers, command rooms, and places that feel forged for World of Warcraft intelligence rather than generic dashboard furniture."
            imageSrc="/images/nexus-observatory-hero.png"
            imageAlt="Azeroth Nexus observatory perched above a moonlit magical skyline."
            icon={
              <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="gold">
                <NexusCrestIcon className="h-8 w-8" />
              </IconFrame>
            }
            badge="Signature observatory"
            href="/search"
            actionLabel="Enter the observatory"
            priority
            className="legend-frame"
          />

          <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
            <ScenePanel
              eyebrow="Astral archives"
              title="Search through tomes, sigils, and public records."
              description="The search surface now opens like a ritual library, with real atmosphere and clearer narrative about what the Nexus knows."
              imageSrc="/images/astral-archives-card.png"
              imageAlt="Rune-lit fantasy archive filled with scrolls, celestial maps, and floating tomes."
              icon={
                <IconFrame className="h-14 w-14 rounded-[1.15rem]" tone="arcane">
                  <ArchiveSigilIcon className="h-6 w-6" />
                </IconFrame>
              }
              badge="Public search"
              href="/search"
              actionLabel="Open archive search"
              layout="portrait"
            />

            <ScenePanel
              eyebrow="Nexus warboard"
              title="Survey the strongest guilds from a live command chamber."
              description="Rankings read like leadership intelligence now, with a scenic anchor that frames the ladder before the score columns even begin."
              imageSrc="/images/nexus-warboard-card.png"
              imageAlt="High-altitude command chamber with a glowing warboard map suspended over clouds."
              icon={
                <IconFrame className="h-14 w-14 rounded-[1.15rem]" tone="gold">
                  <WarboardSigilIcon className="h-6 w-6" />
                </IconFrame>
              }
              badge="World rankings"
              href="/rankings"
              actionLabel="Open guild warboard"
            />
          </div>
        </div>

        <aside className="panel panel-section-lg panel-legendary legend-frame">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Nexus cartography</p>
              <h2 className="mt-4 section-title">Operational intelligence gathered into one ceremonial vault.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
                Signals from guild progress, search activity, raids, and Mythic+ are no longer spread flat across the screen. They now sit inside one high-command deck.
              </p>
            </div>
            <div className="rune-pill">Live lattice</div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Tracked entities"
              value="18.4K"
              detail="Guilds, champions, realms, and regions standing ready for scouting."
              tone="gold"
              icon={
                <IconFrame className="h-12 w-12 rounded-[1rem]" tone="gold">
                  <NexusCrestIcon className="h-5 w-5" />
                </IconFrame>
              }
            />
            <StatCard
              label="Guild apex"
              value={topGuild?.grade ?? "Legend"}
              detail={topGuild?.label ? `${topGuild.label} leads the current visible ladder.` : "Ranking intelligence primed for command review."}
              tone="violet"
              icon={
                <IconFrame className="h-12 w-12 rounded-[1rem]" tone="violet">
                  <WarboardSigilIcon className="h-5 w-5" />
                </IconFrame>
              }
            />
            <StatCard
              label="Timed ratio"
              value={`${mythic.meta_analysis?.timed_ratio ?? 0}%`}
              detail="Dungeon completion pressure visualized as a live seasonal omen."
              tone="arcane"
              icon={
                <IconFrame className="h-12 w-12 rounded-[1rem]" tone="arcane">
                  <RaidSigilIcon className="h-5 w-5" />
                </IconFrame>
              }
            />
            <StatCard
              label="Scrying layer"
              value="Live"
              detail="Autocomplete by name, realm, guild, or character from a proper runic dais."
              tone="emerald"
              icon={
                <IconFrame className="h-12 w-12 rounded-[1rem]" tone="emerald">
                  <SearchSigilIcon className="h-5 w-5" />
                </IconFrame>
              }
            />
          </div>

          {topGuild ? (
            <div className="mt-6 data-slab border-gold/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Warboard signal</div>
                  <div className="mt-3 text-[2rem] leading-none text-gold" style={{ fontFamily: "var(--font-display)" }}>
                    {topGuild.label}
                  </div>
                </div>
                <div className="rune-chip">{topGuild.tier ?? "Season watch"}</div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.18em] text-white/55">
                <span>Composite {topGuild.score.toFixed(1)}</span>
                {topGuild.trend ? <span>{topGuild.trend}</span> : null}
                {topGuild.grade ? <span>{topGuild.grade}</span> : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-white/66">{topGuild.explanation}</p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Raid season</div>
              <div className="mt-3 text-[1.85rem] leading-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
                {raid.raid?.name ?? "Current tier"}
              </div>
              <p className="mt-4 text-sm leading-7 text-white/62">
                {raid.raid?.season ?? "Season watch"} arranged as a sequence of encounters with more ritual presence.
              </p>
            </div>

            <div className="data-slab">
              <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Popular routes</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {popularDungeons.slice(0, 4).map((name: string) => (
                  <span key={name} className="rune-chip">
                    {name}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-white/62">Most-played Mythic+ dungeons surfaced as route pressure, not buried metadata.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
        <div className="legend-frame">
          <RankingTable title="Top Guild Ladder" entries={ladder.entries} />
        </div>

        <div className="panel panel-section-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Raid cathedral</p>
              <h2 className="mt-4 section-title">Current raid encounters arranged like a procession of omens.</h2>
            </div>
            <div className="rune-pill">{raid.raid?.season ?? "Season watch"}</div>
          </div>

          <div className="mt-6 space-y-4">
            {raid.bosses.map((boss: { name: string; order: number }) => (
              <div key={boss.name} className="data-slab">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border border-gold/25 bg-[radial-gradient(circle,rgba(214,190,144,0.18),rgba(110,203,255,0.08),rgba(4,8,18,0.84))]">
                    <span className="absolute inset-[6px] rounded-[1.1rem] border border-white/10" />
                    <span className="relative text-xl text-gold" style={{ fontFamily: "var(--font-display)" }}>
                      {String(boss.order).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Encounter {boss.order}</div>
                    <div className="mt-3 text-[1.75rem] leading-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {boss.name}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/62">
                      The observatory frames each boss as a named threshold on the path to tier domination rather than a flat list item.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="panel panel-section-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Astral traffic</p>
              <h2 className="mt-4 section-title">Live activity arrives like dispatches from across the realms.</h2>
            </div>
            <div className="rune-pill">Realm echoes</div>
          </div>

          <div className="mt-6 space-y-4">
            {activity.items.map((item: { type: string; title: string; subtitle?: string; created_at: string }) => (
              <div key={`${item.type}-${item.title}-${item.created_at}`} className="data-slab">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{item.type}</div>
                    <div className="mt-3 text-[1.4rem] leading-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {item.title}
                    </div>
                  </div>
                  <div className="rune-chip">Live</div>
                </div>
                {item.subtitle ? <div className="mt-3 text-sm leading-7 text-white/62">{item.subtitle}</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="panel panel-section-lg panel-legendary">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Dungeon omens</p>
                <h2 className="mt-4 section-title">Mythic+ pressure displayed as a seasonal pulse chamber.</h2>
              </div>
              <div className="rune-pill">Season pressure</div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
              <div className="data-slab border-sky-300/20">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-sky-100/78">Timed ratio</div>
                <div className="mt-4 score-number tone-arcane">{mythic.meta_analysis?.timed_ratio ?? 0}%</div>
                <p className="mt-4 text-sm leading-7 text-white/62">
                  A quick reading of how forgiving the current season feels across active dungeon traffic.
                </p>
              </div>

              <div className="data-slab border-gold/18">
                <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Most played dungeons</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {popularDungeons.map((name: string) => (
                    <span key={name} className="rune-chip">
                      {name}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-white/62">
                  The route layer is framed as strategic movement across the season, not just a popularity list.
                </p>
              </div>
            </div>
          </div>

          <div className="panel panel-section">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="eyebrow">Expedition routes</p>
                <h3 className="mt-4 text-[2rem] leading-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Move between scouting, compare, and control without breaking the mood of the Nexus.
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/compare" className="arcane-button">
                  Open compare chamber
                </Link>
                <Link href="/admin" className="arcane-button-secondary">
                  Enter admin sanctum
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
