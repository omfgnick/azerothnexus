import { ComparePanel } from "@/components/compare-panel";
import { compareCharacters, compareGuilds } from "@/lib/api";

export default async function ComparePage() {
  const [guildComparison, characterComparison] = await Promise.all([compareGuilds(), compareCharacters()]);

  return (
    <div className="page-shell space-y-8">
      <section className="panel panel-section-lg">
        <p className="eyebrow">Comparison chamber</p>
        <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.8rem)]">Side-by-side intelligence with more ritual, more clarity, and more consequence.</h1>
        <p className="mt-6 max-w-3xl lead-copy">
          Compare guilds or champions inside a judgement chamber that feels worthy of raid leaders, recruitment officers, and stat-obsessed arena tacticians.
        </p>
      </section>

      <ComparePanel title="Guild vs Guild" comparison={guildComparison} />
      <ComparePanel title="Character vs Character" comparison={characterComparison} />
    </div>
  );
}
