import { DataStateBanner } from "@/components/data-state-banner";
import { ComparePanel } from "@/components/compare-panel";
import { CompareSigilIcon, IconFrame } from "@/components/nexus-icons";
import { ScenePanel } from "@/components/scene-panel";
import { compareCharacters, compareGuilds, isFallbackData } from "@/lib/api";
import { getDictionary } from "@/lib/locale";

export default async function ComparePage() {
  const { copy } = await getDictionary();
  const labels = copy.comparePage;
  const [guildComparison, characterComparison] = await Promise.all([compareGuilds(), compareCharacters()]);

  return (
    <div className="page-shell space-y-8">
      {isFallbackData(guildComparison) || isFallbackData(characterComparison) ? (
        <DataStateBanner
          title={copy.shared.publicDataUnavailable}
          description={labels.bannerDescription}
          error={guildComparison._requestError ?? characterComparison._requestError}
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
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="violet">
              <CompareSigilIcon className="h-8 w-8" />
            </IconFrame>
          </div>
        </div>

        <ScenePanel
          eyebrow={labels.sceneEyebrow}
          title={labels.sceneTitle}
          description={labels.sceneDescription}
          imageSrc="/images/nexus-observatory-hero.png"
          imageAlt="Arcane observatory terrace overlooking a magical skyline and nexus beams."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="violet">
              <CompareSigilIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge={labels.sceneBadge}
          href="/rankings"
          actionLabel={labels.sceneAction}
        />
      </section>

      <ComparePanel title={labels.guildTitle} comparison={guildComparison} labels={copy.comparePanel} />
      <ComparePanel title={labels.characterTitle} comparison={characterComparison} labels={copy.comparePanel} />
    </div>
  );
}
