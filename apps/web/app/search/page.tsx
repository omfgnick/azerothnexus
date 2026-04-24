import Link from "next/link";

import { SearchCommandPalette } from "@/components/search-command-palette";
import { getSearchResults } from "@/lib/api";

const typeDescriptions: Record<string, string> = {
  guild: "Guild profile and progression page",
  character: "Character profile and performance page",
  realm: "Realm-focused discovery result",
  region: "Region-focused discovery result",
  raid: "Raid discovery result"
};

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
      <section className="panel panel-section-lg">
        <p className="eyebrow">Archive search</p>
        <h1 className="mt-6 display-title text-[clamp(2.8rem,4.6vw,4.9rem)]">Search by name, realm, guild, or region through a proper scrying chamber.</h1>
        <p className="mt-6 max-w-3xl lead-copy">
          Query public guild and character pages with a presentation that feels ritualistic, premium, and unmistakably Azerothian instead of generic product chrome.
        </p>
        <SearchCommandPalette initialQuery={query} initialRegion={region} initialRealm={realm} initialGuild={guild} initialType={type} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="panel panel-section">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Filter state</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Current attunement
              </h2>
            </div>
            <div className="rune-pill">{query ? "Runes aligned" : "Awaiting a query"}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rune-chip">Query: {query || "none"}</span>
            <span className="rune-chip">Region: {region || "all"}</span>
            <span className="rune-chip">Realm: {realm || "any"}</span>
            <span className="rune-chip">Guild: {guild || "any"}</span>
            <span className="rune-chip">Type: {type}</span>
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
              <div className="data-slab text-sm text-white/60">Run a search to reveal grouped matches by entity type.</div>
            )}
          </div>
        </div>

        <div className="panel panel-section">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Public returns</p>
              <h2 className="mt-4 text-3xl text-white" style={{ fontFamily: "var(--font-display)" }}>
                Search results
              </h2>
              <p className="mt-3 text-sm text-white/60">
                {results.total_results} matching result{results.total_results === 1 ? "" : "s"} found in the current public scan.
              </p>
            </div>
            {query ? <div className="rune-pill">Live public lookup</div> : null}
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
                    {item.match_reason ? <span>Match: {item.match_reason}</span> : null}
                    {item.region ? <span>Region: {item.region.toUpperCase()}</span> : null}
                    {item.realm ? <span>Realm: {item.realm}</span> : null}
                    {item.guild ? <span>Guild: {item.guild}</span> : null}
                  </div>
                  <p className="mt-3 text-sm text-white/55">{typeDescriptions[item.type] ?? "Public search result"}</p>
                </Link>
              ))
            ) : (
              <div className="data-slab text-center text-white/60">
                {query ? "No public results matched this search. Broaden the realm or guild filter and try another scry." : "Type a name, realm, region, or guild above to begin the scan."}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
