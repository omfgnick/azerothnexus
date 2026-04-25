"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useLocaleCopy } from "@/components/locale-provider";
import { joinApiUrl, resolvePublicApiBaseUrl } from "@/lib/api-url";
import type { SearchItem } from "@/lib/api";

const API_BASE_URL = resolvePublicApiBaseUrl();

type Props = {
  initialQuery?: string;
  initialRegion?: string;
  initialRealm?: string;
  initialGuild?: string;
  initialType?: string;
  compact?: boolean;
};

function SearchSigil() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function buildAutocompleteUrl(query: string, region: string, realm: string, guild: string, type: string) {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("limit", "8");
  if (region) params.set("region", region);
  if (realm) params.set("realm", realm);
  if (guild) params.set("guild", guild);
  if (type && type !== "all") params.set("type", type);
  return joinApiUrl(API_BASE_URL, `/api/search/autocomplete?${params.toString()}`);
}

function buildSearchHref(query: string, region: string, realm: string, guild: string, type: string) {
  const params = new URLSearchParams();
  params.set("q", query);
  if (region) params.set("region", region);
  if (realm) params.set("realm", realm);
  if (guild) params.set("guild", guild);
  if (type && type !== "all") params.set("type", type);
  return `/search?${params.toString()}`;
}

function typeTone(type: string) {
  if (type === "guild") return "text-gold border-gold/30 bg-gold/10";
  if (type === "character") return "text-sky-100 border-sky-400/30 bg-sky-500/10";
  if (type === "realm") return "text-violet-100 border-violet-400/30 bg-violet-500/10";
  if (type === "region") return "text-emerald-100 border-emerald-400/30 bg-emerald-500/10";
  if (type === "raid") return "text-amber-100 border-amber-400/30 bg-amber-500/10";
  return "text-white/80 border-white/15 bg-white/5";
}

export function SearchCommandPalette({
  initialQuery = "",
  initialRegion = "",
  initialRealm = "",
  initialGuild = "",
  initialType = "all",
  compact = false,
}: Props) {
  const { copy } = useLocaleCopy();
  const labels = copy.searchPalette;
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState(initialRegion);
  const [realm, setRealm] = useState(initialRealm);
  const [guild, setGuild] = useState(initialGuild);
  const [type, setType] = useState(initialType);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const href = useMemo(() => buildSearchHref(query, region, realm, guild, type), [query, region, realm, guild, type]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(buildAutocompleteUrl(query.trim(), region, realm, guild, type), {
          signal: controller.signal,
          credentials: "include",
        });
        if (!response.ok) {
          setResults([]);
          return;
        }
        const payload = await response.json();
        setResults(payload.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, region, realm, guild, type]);

  return (
    <div className={`relative ${compact ? "" : "mt-8"}`}>
      <form action="/search" className={`relative overflow-visible ${compact ? "" : "panel panel-section"}`}>
        {compact ? (
          <>
            <div className="an-search-bar">
              <div className="an-search-icon">
                <SearchSigil />
              </div>
              <input
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => window.setTimeout(() => setFocused(false), 120)}
                placeholder={labels.compactPlaceholder}
                className="an-search-input"
              />
              <input type="hidden" name="type" value={type} />
              <div className="an-search-filters">
                {[
                  ["all", labels.all],
                  ["guild", labels.guild],
                  ["character", labels.character],
                  ["realm", labels.realm],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={`an-search-filter ${type === value ? "active" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="sr-only">
              {labels.openResults}
            </button>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(110,203,255,0.12),transparent_0_24%),radial-gradient(circle_at_right,rgba(214,190,144,0.12),transparent_0_24%)]" />
            <div className="relative space-y-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="eyebrow">{labels.searchAndDiscovery}</p>
                  <h2 className="mt-4 text-xl leading-tight text-white sm:text-2xl md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                    {labels.searchTitle}
                  </h2>
                </div>
                <div className="rune-pill">{loading ? labels.scanningRunes : labels.publicLookupActive}</div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.5fr_160px_170px]">
                <div>
                  <label className="field-label">{labels.searchLabel}</label>
                  <input
                    name="q"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => window.setTimeout(() => setFocused(false), 120)}
                    placeholder={labels.searchPagePlaceholder}
                    className="arcane-field"
                  />
                </div>
                <div>
                  <label className="field-label">{labels.regionLabel}</label>
                  <select name="region" value={region} onChange={(event) => setRegion(event.target.value)} className="arcane-field">
                    <option value="">{labels.allRegions}</option>
                    <option value="us">US</option>
                    <option value="eu">EU</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">{labels.typeLabel}</label>
                  <select name="type" value={type} onChange={(event) => setType(event.target.value)} className="arcane-field">
                    <option value="all">{labels.allEntities}</option>
                    <option value="guild">{labels.guilds}</option>
                    <option value="character">{labels.characters}</option>
                    <option value="realm">{labels.realms}</option>
                    <option value="region">{labels.regions}</option>
                    <option value="raid">{labels.raids}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="field-label">{labels.realmFilterLabel}</label>
                  <input
                    name="realm"
                    value={realm}
                    onChange={(event) => setRealm(event.target.value)}
                    placeholder={labels.realmPlaceholder}
                    className="arcane-field"
                  />
                </div>
                <div>
                  <label className="field-label">{labels.guildFilterLabel}</label>
                  <input
                    name="guild"
                    value={guild}
                    onChange={(event) => setGuild(event.target.value)}
                    placeholder={labels.guildPlaceholder}
                    className="arcane-field"
                  />
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
                  <button type="submit" className="arcane-button">
                    {labels.searchNow}
                  </button>
                  <Link href={href} className="arcane-button-secondary">
                    {labels.openResults}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </form>

      {focused && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+14px)] z-30 panel overflow-hidden bg-[#08111d]/95 shadow-[0_32px_80px_rgba(0,0,0,0.56)]">
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow text-[0.58rem]">{labels.liveSuggestions}</p>
              <p className="mt-3 text-sm text-white/60">{labels.suggestionsDescription}</p>
            </div>
            <div className="rune-pill">{loading ? labels.scanning : `${results.length} ${labels.echoesFound}`}</div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            {results.length ? (
              results.map((item) => (
                <Link
                  key={`${item.type}-${item.url}`}
                  href={item.url}
                  className="block rounded-[1.4rem] border border-transparent bg-white/[0.02] px-4 py-4 transition hover:border-gold/20 hover:bg-white/[0.05]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.24em] ${typeTone(item.type)}`}>
                      {item.type}
                    </span>
                    <span className="text-base text-white sm:text-lg" style={{ fontFamily: "var(--font-display)" }}>
                      {item.label}
                    </span>
                    {item.match_reason ? <span className="text-xs uppercase tracking-[0.12em] text-white/40">{item.match_reason}</span> : null}
                  </div>
                  {item.subtitle ? <div className="mt-2 text-sm text-white/60">{item.subtitle}</div> : null}
                </Link>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-6 text-sm text-white/55">
                {labels.noMatches}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
