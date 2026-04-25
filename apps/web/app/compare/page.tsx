import { ComparePanel } from "@/components/compare-panel";
import { CompareSigilIcon, IconFrame } from "@/components/nexus-icons";
import { ScenePanel } from "@/components/scene-panel";
import { compareCharacters, compareGuilds } from "@/lib/api";

export default async function ComparePage() {
  const [guildComparison, characterComparison] = await Promise.all([compareGuilds(), compareCharacters()]);

  return (
    <div className="page-shell space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Comparison chamber</p>
              <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">Side-by-side intelligence with more ritual, more clarity, and more consequence.</h1>
              <p className="mt-6 max-w-3xl lead-copy">
                Compare guilds or champions inside a judgement chamber that feels worthy of raid leaders, recruitment officers, and stat-obsessed arena tacticians.
              </p>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="violet">
              <CompareSigilIcon className="h-8 w-8" />
            </IconFrame>
          </div>
        </div>

        <ScenePanel
          eyebrow="Judgement hall"
          title="A comparison surface that reads like a ceremonial verdict room."
          description="The page now opens with a stronger sense of place before the scorecards begin, which helps the compare flow feel deliberate and prestigious."
          imageSrc="/images/nexus-observatory-hero.png"
          imageAlt="Arcane observatory terrace overlooking a magical skyline and nexus beams."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="violet">
              <CompareSigilIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge="Side-by-side verdicts"
          href="/rankings"
          actionLabel="Return to rankings"
        />
      </section>

      <ComparePanel title="Guild vs Guild" comparison={guildComparison} />
      <ComparePanel title="Character vs Character" comparison={characterComparison} />
    </div>
  );
}
