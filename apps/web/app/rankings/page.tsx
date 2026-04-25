import Link from "next/link";

import { DataStateBanner } from "@/components/data-state-banner";
import { IconFrame, WarboardSigilIcon } from "@/components/nexus-icons";
import { RankingTable } from "@/components/ranking-table";
import { ScenePanel } from "@/components/scene-panel";
import { getGuildLadder, isFallbackData } from "@/lib/api";

export default async function RankingsPage() {
  const ladder = await getGuildLadder();
  const tierLegend = ladder.entries.filter((entry: { tier?: string }) => entry.tier === "Legend" || entry.tier === "Mythic Elite").length;

  return (
    <div className="page-shell space-y-8">
      {isFallbackData(ladder) ? (
        <DataStateBanner
          description="Os rankings publicos nao responderam a tempo. Esta warboard page continua funcional, mas os valores reais ainda nao foram entregues por este ciclo."
          error={ladder._requestError}
        />
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">World rankings</p>
              <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">Guild ladders forged as an astral war board.</h1>
              <p className="mt-6 max-w-3xl lead-copy">
                The ladder now reads like a chamber of strategy: ornate, high-contrast, and clear about who is rising, who is pressured, and why every score sits where it does.
              </p>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="gold">
              <WarboardSigilIcon className="h-8 w-8" />
            </IconFrame>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="data-slab">
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/75">Tier system</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Mythic Elite to Aspirant
              </div>
              <p className="mt-3 text-sm text-white/60">A scale designed to feel ceremonial and legible instead of sterile.</p>
            </div>
            <div className="data-slab">
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/75">Current elite count</div>
              <div className="mt-3 score-number tone-gold">{tierLegend}</div>
              <p className="mt-3 text-sm text-white/60">Guilds currently marked as Legend or Mythic Elite in the loaded world board.</p>
            </div>
            <div className="data-slab">
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/75">Score dimensions</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Progression / Execution / Roster / Activity
              </div>
              <p className="mt-3 text-sm text-white/60">Each entry carries clear notes for leadership, scouting, and bragging rights.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/compare" className="arcane-button">
              Open compare chamber
            </Link>
            <Link href="/search" className="arcane-button-secondary">
              Search the archives
            </Link>
          </div>
        </div>

        <ScenePanel
          eyebrow="High command"
          title="A ranking surface anchored by a real Azerothian command room."
          description="This scenic panel gives the ladder a place and a mood before the data grid takes over, which helps the product feel premium without hiding the numbers."
          imageSrc="/images/nexus-warboard-card.png"
          imageAlt="Celestial war room with a glowing strategic map table above the clouds."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="gold">
              <WarboardSigilIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge="World board"
          href="/compare"
          actionLabel="Open compare chamber"
        />
      </section>

      <RankingTable title="World Guild Ranking" entries={ladder.entries} />
    </div>
  );
}
