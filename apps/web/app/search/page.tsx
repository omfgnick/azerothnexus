import Link from "next/link";

import { DataStateBanner } from "@/components/data-state-banner";
import { ArchiveSigilIcon, IconFrame, SearchSigilIcon } from "@/components/nexus-icons";
import { ScenePanel } from "@/components/scene-panel";
import { SearchCommandPalette } from "@/components/search-command-palette";
import { getSearchResults, isFallbackData } from "@/lib/api";
import { getDictionary } from "@/lib/locale";

type SearchPageProps = {
  searchParams?: {
    q?: string;
    region?: string;
    realm?: string;
    guild?: string;
    type?: string;
  };
};

function pillTone(type: string) {
  if (type === "guild") return "border-gold/30 bg-gold/10 text-gold";
  if (type === "character") return "border-sky-400/30 bg-sky-500/10 text-sky-100";
  if (type === "realm") return "border-violet-400/30 bg-violet-500/10 text-violet-100";
  if (type === "region") return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
  if (type === "raid") return "border-amber-400/30 bg-amber-500/10 text-amber-100";
  return "border-white/10 bg-white/5 text-white/80";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { copy } = await getDictionary();
  const labels = copy.searchPage;
  const query = searchParams?.q?.trim() ?? "";
  const region = searchParams?.region?.trim() ?? "";
  const realm = searchParams?.realm?.trim() ?? "";
  const guild = searchParams?.guild?.trim() ?? "";
  const type = searchParams?.type?.trim() ?? "all";

  const results = query
    ? await getSearchResults({ q: query, region, realm, guild, type, limit: 18 })
    : { query: "", filters: { region: null, realm: null, guild: null, type: "all", limit: 18 }, total_results: 0, group_counts: [], results: [] };

  return (
    <div className="page-shell space-y-8">
      {query && isFallbackData(results) ? (
        <DataStateBanner
          title={copy.shared.publicDataUnavailable}
          description={labels.bannerDescription}
          error={results._requestError}
          detailLabel={copy.dataState.technicalDetail}
        />
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="panel panel-section-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{labels.heroEyebrow}</p>
              <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.9rem)]">{labels.heroTitle}</h1>
              <p className="mt-6 max-w-3xl lead-copy">{labels.heroDescription}</p>
            </div>
            <IconFrame className="hidden h-16 w-16 rounded-[1.45rem] md:inline-flex" tone="arcane">
              <SearchSigilIcon className="h-8 w-8" />
            </IconFrame>
          </div>
          <SearchCommandPalette initialQuery={query} initialRegion={region} initialRealm={realm} initialGuild={guild} initialType={type} />
        </div>

        <ScenePanel
          eyebrow={labels.sceneEyebrow}
          title={labels.sceneTitle}
          description={labels.sceneDescription}
          imageSrc="/images/astral-archives-card.png"
          imageAlt="Mystical archive chamber with floating books, celestial maps, and blue arcane light."
          icon={
            <IconFrame className="h-16 w-16 rounded-[1.45rem]" tone="arcane">
              <ArchiveSigilIcon className="h-8 w-8" />
            </IconFrame>
          }
          badge={query ? labels.sceneBadgeActive : labels.sceneBadgeIdle}
          href="/rankings"
          actionLabel={labels.sceneAction}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="panel panel-section">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">{labels.filterEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.filterTitle}
              </h2>
            </div>
            <div className="rune-pill">{query ? labels.aligned : labels.awaiting}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rune-chip">{labels.queryLabel}: {query || copy.shared.none}</span>
            <span className="rune-chip">{labels.regionLabel}: {region || labels.all}</span>
            <span className="rune-chip">{labels.realmLabel}: {realm || labels.any}</span>
            <span className="rune-chip">{labels.guildLabel}: {guild || labels.any}</span>
            <span className="rune-chip">{labels.typeLabel}: {type}</span>
          </div>

          <div className="mt-6 space-y-3">
            {results.group_counts.length ? (
              results.group_counts.map((group) => (
                <div key={group.type} className="data-slab">
                  <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">{group.type}</div>
                  <div className="mt-3 score-number tone-gold">{group.count}</div>
                </div>
              ))
            ) : (
              <div className="data-slab text-sm text-white/60">{labels.groupPrompt}</div>
            )}
          </div>
        </div>

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">{labels.publicReturnsEyebrow}</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                {labels.publicReturnsTitle}
              </h2>
              <p className="mt-3 text-sm text-white/60">
                {results.total_results} {results.total_results === 1 ? labels.matchingResult : labels.matchingResults}
              </p>
            </div>
            {query ? <div className="rune-pill">{labels.liveLookup}</div> : null}
          </div>

          <div className="mt-6 space-y-3">
            {results.results.length ? (
              results.results.map((item) => (
                <Link key={`${item.type}-${item.url}`} href={item.url} className="block data-slab transition hover:border-gold/20 hover:bg-white/[0.05]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.24em] ${pillTone(item.type)}`}>
                      {item.type}
                    </span>
                    <span className="text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                      {item.label}
                    </span>
                    {typeof item.score === "number" ? <span className="text-xs uppercase tracking-[0.14em] text-white/40">score {item.score.toFixed(1)}</span> : null}
                  </div>
                  {item.subtitle ? <div className="mt-2 text-sm text-white/60">{item.subtitle}</div> : null}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-white/45">
                    {item.match_reason ? <span>{labels.matchLabel}: {item.match_reason}</span> : null}
                    {item.region ? <span>{labels.regionInfo}: {item.region.toUpperCase()}</span> : null}
                    {item.realm ? <span>{labels.realmInfo}: {item.realm}</span> : null}
                    {item.guild ? <span>{labels.guildInfo}: {item.guild}</span> : null}
                  </div>
                  <p className="mt-3 text-sm text-white/55">{labels.typeDescriptions[item.type] ?? labels.genericResult}</p>
                </Link>
              ))
            ) : (
              <div className="data-slab text-center text-white/60">
                {query ? labels.noResults : labels.noQuery}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
