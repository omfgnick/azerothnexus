import Link from "next/link";

import { DataStateBanner } from "@/components/data-state-banner";
import { IconFrame, WarboardSigilIcon } from "@/components/nexus-icons";
import { RankingTable } from "@/components/ranking-table";
import { ScenePanel } from "@/components/scene-panel";
import { getGuildLadder, isFallbackData } from "@/lib/api";
import { getDictionary } from "@/lib/locale";

export default async function RankingsPage() {
  const { copy } = await getDictionary();
  const labels = copy.rankingsPage;
  const ladder = await getGuildLadder();
  const tierLegend = ladder.entries.filter((entry: { tier?: string }) => entry.tier === "Legend" || entry.tier === "Mythic Elite").length;

  return (
    <div className="page-shell space-y-8">
      {isFallbackData(ladder) ? (
        <DataStateBanner
          title={copy.shared.publicDataUnavailable}
          description={labels.bannerDescription}
          error={ladder._requestError}
          detailLabel={copy.dataState.technicalDetail}
        />
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{labels.heroEyebrow}</p>
              <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">{labels.heroTitle}</h1>
              <p className="mt-6 max-w-3xl lead-copy">{labels.heroDescription}</p>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="gold">
              <WarboardSigilIcon className="h-8 w-8" />
            </IconFrame>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="data-slab">
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/75">{labels.tierSystem}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.tierSystemValue}
              </div>
              <p className="mt-3 text-sm text-white/60">{labels.tierSystemDescription}</p>
            </div>
            <div className="data-slab">
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/75">{labels.currentEliteCount}</div>
              <div className="mt-3 score-number tone-gold">{tierLegend}</div>
              <p className="mt-3 text-sm text-white/60">{labels.currentEliteDescription}</p>
            </div>
            <div className="data-slab">
              <div className="text-[0.68rem] uppercase tracking-[0.34em] text-gold/75">{labels.scoreDimensions}</div>
              <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.scoreDimensionsValue}
              </div>
              <p className="mt-3 text-sm text-white/60">{labels.scoreDimensionsDescription}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/compare" className="arcane-button">
              {labels.compareAction}
            </Link>
            <Link href="/search" className="arcane-button-secondary">
              {labels.searchAction}
            </Link>
          </div>
        </div>

        <ScenePanel
          eyebrow={labels.sceneEyebrow}
          title={labels.sceneTitle}
          description={labels.sceneDescription}
          imageSrc="/images/nexus-warboard-card.png"
          imageAlt="Celestial war room with a glowing strategic map table above the clouds."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="gold">
              <WarboardSigilIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge={labels.sceneBadge}
          href="/compare"
          actionLabel={labels.sceneAction}
        />
      </section>

      <RankingTable title={labels.tableTitle} entries={ladder.entries} labels={copy.rankingTable} />
    </div>
  );
}
