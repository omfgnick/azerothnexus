import { isAbsoluteUrl, joinApiUrl, normalizeBaseUrl, resolvePublicApiBaseUrl } from "@/lib/api-url";

export type RequestState = "live" | "fallback";
export type RequestStatePayload = {
  _requestState: RequestState;
  _requestError: string | null;
};

export type ApiResult<T extends Record<string, unknown>> = T & RequestStatePayload;

export type LadderDimension = {
  key: string;
  label: string;
  score: number;
  grade: string;
  note: string;
};

export type LadderEntry = {
  rank: number;
  label: string;
  score: number;
  subtitle?: string;
  grade?: string;
  tier?: string;
  trend?: string;
  confidence?: number;
  explanation?: string;
  dimensions?: LadderDimension[];
  metadata?: Record<string, unknown>;
};

export type GuildLadderResponse = {
  ladder: string;
  scope: string;
  source: string;
  generated_at: string | null;
  entries: LadderEntry[];
};

export type RaidDashboardResponse = {
  raid: {
    name: string | null;
    slug: string | null;
    season: string | null;
  };
  bosses: Array<{
    name: string | null;
    slug?: string | null;
    difficulty?: string | null;
    status?: string | null;
    order?: number | null;
  }>;
  world_first_tracker: Array<Record<string, unknown>>;
  heatmap_ready: boolean;
};

export type MythicDashboardResponse = {
  dungeons: Array<Record<string, unknown>>;
  top_runs: Array<Record<string, unknown>>;
  meta_analysis: {
    healer_priority: string[];
    timed_ratio: number | null;
    most_played_dungeons: string[];
  };
};

export type ActivityFeedResponse = {
  items: Array<{
    type: string;
    title: string;
    subtitle?: string | null;
    created_at: string;
  }>;
};

const PUBLIC_API_BASE_URL = resolvePublicApiBaseUrl();
const FETCH_TIMEOUT_MS = 4500;

function withRequestState<T extends Record<string, unknown>>(
  payload: T,
  requestState: RequestState,
  requestError: string | null = null,
): ApiResult<T> {
  return {
    ...payload,
    _requestState: requestState,
    _requestError: requestError,
  };
}

export function isFallbackData(value: unknown): value is RequestStatePayload {
  return Boolean(
    value &&
      typeof value === "object" &&
      "_requestState" in value &&
      (value as RequestStatePayload)._requestState === "fallback",
  );
}

function resolveApiBaseUrl() {
  if (typeof window === "undefined") {
    return resolveInternalApiBaseUrl();
  }

  return PUBLIC_API_BASE_URL;
}

async function fetchJsonWithFallback<T extends Record<string, unknown>>(
  path: string,
  fallback: T,
  init?: RequestInit & {
    next?: {
      revalidate?: number;
    };
  },
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(joinApiUrl(resolveApiBaseUrl(), path), {
      ...init,
      signal: controller.signal,
    });
    if (!response.ok) {
      return withRequestState(fallback, "fallback", `Request failed with ${response.status}.`);
    }

    const payload = (await response.json()) as T;
    return withRequestState(payload, "live");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";
    return withRequestState(fallback, "fallback", message);
  } finally {
    clearTimeout(timeout);
  }
}

async function safeFetch<T extends Record<string, unknown>>(path: string, fallback: T, revalidate = 60): Promise<ApiResult<T>> {
  return fetchJsonWithFallback(path, fallback, {
    next: { revalidate },
  });
}

export async function getGuildLadder(): Promise<ApiResult<GuildLadderResponse>> {
  return safeFetch(
    "/api/rankings/guilds",
    {
      ladder: "guilds",
      scope: "world",
      source: "fallback",
      generated_at: null,
      entries: [],
    },
    30,
  );
}

export async function getRaidDashboard(): Promise<ApiResult<RaidDashboardResponse>> {
  return safeFetch(
    "/api/raids/current",
    {
      raid: { name: null, slug: null, season: null },
      bosses: [],
      world_first_tracker: [],
      heatmap_ready: false,
    },
    300,
  );
}

export async function getMythicDashboard(): Promise<ApiResult<MythicDashboardResponse>> {
  return safeFetch(
    "/api/mythic-plus/dashboard",
    {
      dungeons: [],
      top_runs: [],
      meta_analysis: {
        healer_priority: [],
        timed_ratio: null,
        most_played_dungeons: [],
      },
    },
    60,
  );
}

export async function getActivityFeed(): Promise<ApiResult<ActivityFeedResponse>> {
  return safeFetch(
    "/api/activity/feed",
    {
      items: [],
    },
    30,
  );
}

export async function getGuild(region: string, realm: string, guildName: string) {
  return safeFetch(
    `/api/guilds/${region}/${realm}/${guildName}`,
    {
      name: guildName,
      region: region.toUpperCase(),
      realm: realm.replace(/-/g, " "),
      faction: null,
      ranking_position: null,
      roster: [],
      boss_progress: [],
      progression_velocity: 0,
      momentum_score: 0,
      rank_profile: {
        score: 0,
        grade: "Unavailable",
        tier: "Unavailable",
        trend: "awaiting data",
        confidence: 0,
        explanation: "Public guild data is unavailable right now. Try again after the next refresh cycle.",
        dimensions: [],
      },
      score_breakdown: {},
      recent_history: [],
    },
    60,
  );
}

export async function getCharacter(region: string, realm: string, characterName: string) {
  return safeFetch(
    `/api/characters/${region}/${realm}/${characterName}`,
    {
      name: characterName,
      region: region.toUpperCase(),
      realm: realm.replace(/-/g, " "),
      class_name: "Unknown",
      spec_name: "Unknown",
      guild_name: null,
      mythic_plus_score: 0,
      item_level: 0,
      raid_parses: {
        overall_estimate: 0,
        bosses_logged: 0,
        source: "fallback",
        best_performance_average: 0,
        median_performance_average: 0,
        all_stars: null,
      },
      achievements: [],
      rank_profile: {
        score: 0,
        grade: "Unavailable",
        tier: "Unavailable",
        trend: "awaiting data",
        confidence: 0,
        explanation: "Public character data is unavailable right now. Try again after the next refresh cycle.",
        dimensions: [],
      },
      score_breakdown: {},
      recent_history: [],
      profile_summary: {},
      equipment: [],
      talent_loadout: null,
    },
    60,
  );
}

export async function getGuildHistory(region: string, realm: string, guildName: string) {
  return safeFetch(
    `/api/guilds/${region}/${realm}/${guildName}/history`,
    {
      entity_type: "guild",
      entity_label: guildName,
      scope: "world",
      points: [],
      summary: {
        latest_score: 0,
        best_score: 0,
        score_delta: 0,
        rank_delta: 0,
        momentum_label: "unavailable",
      },
    },
    60,
  );
}

export async function getCharacterHistory(region: string, realm: string, characterName: string) {
  return safeFetch(
    `/api/characters/${region}/${realm}/${characterName}/history`,
    {
      entity_type: "character",
      entity_label: characterName,
      scope: "world",
      points: [],
      summary: {
        latest_score: 0,
        best_score: 0,
        score_delta: 0,
        rank_delta: 0,
        momentum_label: "unavailable",
      },
    },
    60,
  );
}

export async function compareGuilds() {
  return safeFetch(
    "/api/compare/guilds?left_region=us&left_realm=stormrage&left_name=Void%20Vanguard&right_region=eu&right_realm=tarren-mill&right_name=Astral%20Dominion",
    {
      entity_type: "guild",
      left: {
        label: "Unavailable",
        subtitle: "Left guild",
        score: 0,
        grade: "Unavailable",
        tier: "Unavailable",
        trend: "awaiting data",
        confidence: 0,
        rank_position: null,
        score_breakdown: {},
        history: {
          latest_score: 0,
          best_score: 0,
          score_delta: 0,
          rank_delta: 0,
          momentum_label: "unavailable",
        },
      },
      right: {
        label: "Unavailable",
        subtitle: "Right guild",
        score: 0,
        grade: "Unavailable",
        tier: "Unavailable",
        trend: "awaiting data",
        confidence: 0,
        rank_position: null,
        score_breakdown: {},
        history: {
          latest_score: 0,
          best_score: 0,
          score_delta: 0,
          rank_delta: 0,
          momentum_label: "unavailable",
        },
      },
      dimensions: [],
      verdict: "Comparison data is unavailable right now.",
    },
    30,
  );
}

export async function compareCharacters() {
  return safeFetch(
    "/api/compare/characters?left_region=us&left_realm=stormrage&left_name=Aethryl&right_region=eu&right_realm=tarren-mill&right_name=Seraphae",
    {
      entity_type: "character",
      left: {
        label: "Unavailable",
        subtitle: "Left character",
        score: 0,
        grade: "Unavailable",
        tier: "Unavailable",
        trend: "awaiting data",
        confidence: 0,
        score_breakdown: {},
        history: {
          latest_score: 0,
          best_score: 0,
          score_delta: 0,
          rank_delta: 0,
          momentum_label: "unavailable",
        },
      },
      right: {
        label: "Unavailable",
        subtitle: "Right character",
        score: 0,
        grade: "Unavailable",
        tier: "Unavailable",
        trend: "awaiting data",
        confidence: 0,
        score_breakdown: {},
        history: {
          latest_score: 0,
          best_score: 0,
          score_delta: 0,
          rank_delta: 0,
          momentum_label: "unavailable",
        },
      },
      dimensions: [],
      verdict: "Comparison data is unavailable right now.",
    },
    30,
  );
}

export type SearchFilters = {
  q: string;
  region?: string;
  realm?: string;
  guild?: string;
  type?: string;
  limit?: number;
};

export type SearchItem = {
  type: string;
  label: string;
  slug: string;
  subtitle?: string | null;
  region?: string | null;
  realm?: string | null;
  guild?: string | null;
  url: string;
  match_reason?: string | null;
  score: number;
  metadata?: Record<string, unknown>;
};

export type SearchResponse = {
  query: string;
  filters: {
    region?: string | null;
    realm?: string | null;
    guild?: string | null;
    type: string;
    limit: number;
  };
  total_results: number;
  group_counts: { type: string; count: number }[];
  results: SearchItem[];
};

function buildSearchParams(filters: SearchFilters) {
  const params = new URLSearchParams();
  params.set("q", filters.q);
  if (filters.region) params.set("region", filters.region);
  if (filters.realm) params.set("realm", filters.realm);
  if (filters.guild) params.set("guild", filters.guild);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (typeof filters.limit === "number") params.set("limit", String(filters.limit));
  return params.toString();
}

export async function getSearchResults(filters: SearchFilters): Promise<ApiResult<SearchResponse>> {
  const queryString = buildSearchParams(filters);
  return safeFetch(
    `/api/search?${queryString}`,
    {
      query: filters.q,
      filters: {
        region: filters.region ?? null,
        realm: filters.realm ?? null,
        guild: filters.guild ?? null,
        type: filters.type ?? "all",
        limit: filters.limit ?? 12,
      },
      total_results: 0,
      group_counts: [],
      results: [],
    },
    30,
  );
}

export async function getSearchAutocomplete(filters: SearchFilters): Promise<ApiResult<SearchResponse>> {
  const queryString = buildSearchParams({ ...filters, limit: filters.limit ?? 8 });
  return safeFetch(
    `/api/search/autocomplete?${queryString}`,
    {
      query: filters.q,
      filters: {
        region: filters.region ?? null,
        realm: filters.realm ?? null,
        guild: filters.guild ?? null,
        type: filters.type ?? "all",
        limit: filters.limit ?? 8,
      },
      total_results: 0,
      group_counts: [],
      results: [],
    },
    30,
  );
}

export function resolveInternalApiBaseUrl() {
  const candidates = [
    process.env.INTERNAL_API_BASE_URL,
    process.env.API_BASE_URL_INTERNAL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "http://localhost:8000",
  ];

  for (const candidate of candidates) {
    if (candidate && isAbsoluteUrl(candidate)) {
      return normalizeBaseUrl(candidate);
    }
  }

  return "http://localhost:8000";
}

async function safeAdminFetch<T extends Record<string, unknown>>(path: string, fallback: T): Promise<ApiResult<T>> {
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) {
    return withRequestState(fallback, "fallback", "Admin proxy is not configured in the web app.");
  }

  try {
    const response = await fetch(joinApiUrl(resolveInternalApiBaseUrl(), path), {
      headers: {
        "X-Admin-Token": adminToken,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Admin request failed with ${response.status}`);
    }

    const payload = (await response.json()) as T;
    return withRequestState(payload, "live");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin request failed.";
    return withRequestState(fallback, "fallback", message);
  }
}

export async function getAdminDashboard() {
  return safeAdminFetch("/api/admin/dashboard", {
    tracked_counts: { guilds: 0, characters: 0, realms: 0 },
    sync_plan: { jobs: [], circuit_breakers: {} },
    providers: [],
    integrations: { providers: {}, feature_flags: { request_logging: true } },
    latest_jobs: [],
    latest_errors: [],
    latest_snapshots: [],
    auto_refresh: {
      interval_seconds: 600,
      latest_cycle_at: null,
      latest_cycle_status: "unavailable",
      last_error_at: null,
      last_error_payload: null,
    },
    backups: {
      directory: "/var/backups/azerothnexus",
      count: 0,
      latest: null,
    },
    audit_summary: {
      total_recent: 0,
      request_logs: 0,
      admin_actions: 0,
      backup_actions: 0,
    },
  });
}

export async function getAdminIntegrations() {
  return safeAdminFetch("/api/admin/settings/integrations", {
    providers: {
      blizzard: {
        enabled: true,
        configured: false,
        region: "us",
        client_id: "",
        client_secret: "",
        client_secret_configured: false,
      },
      raiderio: {
        enabled: true,
        configured: true,
        api_base_url: "https://raider.io/api",
      },
      warcraftlogs: {
        enabled: true,
        configured: false,
        client_id: "",
        client_secret: "",
        client_secret_configured: false,
      },
    },
    feature_flags: {
      request_logging: true,
    },
  });
}

export async function getAdminBackups() {
  return safeAdminFetch("/api/admin/backups", {
    directory: "/var/backups/azerothnexus",
    count: 0,
    items: [],
  });
}

export async function getAdminLogs() {
  return safeAdminFetch("/api/admin/logs?limit=120", {
    timeline: [],
    summary: {
      total_recent: 0,
      request_logs: 0,
      admin_actions: 0,
      backup_actions: 0,
    },
  });
}
