
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: 60 }
    });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getGuildLadder() {
  return safeFetch("/api/rankings/guilds", {
    ladder: "guilds",
    scope: "world",
    source: "fallback",
    generated_at: null,
    entries: [
      {
        rank: 1,
        label: "Void Vanguard",
        score: 86.4,
        subtitle: "US · Stormrage",
        grade: "A",
        tier: "Legend",
        trend: "surging",
        confidence: 91.4,
        explanation: "Void Vanguard lands in tier Legend with grade A. Best dimension: Progression (88.0). Biggest upgrade path: Execution (76.0).",
        dimensions: [
          { key: "progression", label: "Progression", score: 88, grade: "A+", note: "3/4 tracked bosses defeated with strong current raid traction." },
          { key: "execution", label: "Execution", score: 76, grade: "A-", note: "Pull conversion is healthy, but cleaner kills still improve the ladder note." },
          { key: "roster", label: "Roster", score: 82, grade: "A", note: "Roster quality stays high with geared visible characters." },
          { key: "activity", label: "Activity", score: 84, grade: "A", note: "Recent kills and Mythic+ form keep the profile hot." }
        ],
        metadata: { momentum_score: 89.3, progression_velocity: 2.0 }
      },
      {
        rank: 2,
        label: "Astral Dominion",
        score: 74.6,
        subtitle: "EU · Tarren Mill",
        grade: "B+",
        tier: "Champion",
        trend: "rising",
        confidence: 87.1,
        explanation: "Astral Dominion lands in tier Champion with grade B+. Best dimension: Activity (81.0). Biggest upgrade path: Progression (54.0).",
        dimensions: [
          { key: "progression", label: "Progression", score: 54, grade: "C+", note: "One early boss kill is on the board, but the raid clear still has room to grow." },
          { key: "execution", label: "Execution", score: 72, grade: "B+", note: "Pull load is under control for current boss depth." },
          { key: "roster", label: "Roster", score: 78, grade: "A-", note: "Stable core roster with good gear quality." },
          { key: "activity", label: "Activity", score: 81, grade: "A", note: "Strong dungeon form keeps the team relevant between raid kills." }
        ],
        metadata: { momentum_score: 75.5, progression_velocity: 1.0 }
      },
      {
        rank: 3,
        label: "Obsidian Crown",
        score: 71.2,
        subtitle: "US · Illidan",
        grade: "B+",
        tier: "Champion",
        trend: "steady",
        confidence: 84.8,
        explanation: "Obsidian Crown lands in tier Champion with grade B+. Best dimension: Execution (74.0). Biggest upgrade path: Progression (50.0).",
        dimensions: [
          { key: "progression", label: "Progression", score: 50, grade: "C", note: "The first confirmed boss is secured, but deeper progression is still pending." },
          { key: "execution", label: "Execution", score: 74, grade: "B+", note: "Attempts remain efficient enough to keep the score healthy." },
          { key: "roster", label: "Roster", score: 76, grade: "A-", note: "Compact but competent roster footprint." },
          { key: "activity", label: "Activity", score: 77, grade: "A-", note: "Daily activity is stable, though not spiking yet." }
        ],
        metadata: { momentum_score: 71.4, progression_velocity: 1.0 }
      }
    ]
  });
}

export async function getRaidDashboard() {
  return safeFetch("/api/raids/current", {
    raid: { name: "Citadel of the Void", slug: "citadel-of-the-void", season: "Season X" },
    bosses: [
      { name: "Harbinger Vex", order: 1 },
      { name: "The Hollow Maw", order: 2 },
      { name: "Queen of Shattered Stars", order: 3 }
    ],
    world_first_tracker: [],
    heatmap_ready: true
  });
}

export async function getMythicDashboard() {
  return safeFetch("/api/mythic-plus/dashboard", {
    dungeons: [
      { name: "Echoing Depths", slug: "echoing-depths" },
      { name: "Sunken Reliquary", slug: "sunken-reliquary" }
    ],
    top_runs: [
      { guild: "Void Vanguard", dungeon: "Echoing Depths", score: 389.4, keystone_level: 18, timed: true },
      { guild: "Astral Dominion", dungeon: "Sunken Reliquary", score: 377.2, keystone_level: 17, timed: true }
    ],
    meta_analysis: { healer_priority: ["Restoration Druid", "Holy Paladin"], timed_ratio: 73, most_played_dungeons: ["Echoing Depths", "Sunken Reliquary"] }
  });
}

export async function getActivityFeed() {
  return safeFetch("/api/activity/feed", {
    items: [
      {
        type: "kill",
        title: "Void Vanguard defeated Harbinger Vex",
        subtitle: "Citadel of the Void · Mythic",
        created_at: new Date().toISOString(),
        metadata: { pulls: 18 }
      }
    ]
  });
}

export async function getGuild(region: string, realm: string, guildName: string) {
  return safeFetch(`/api/guilds/${region}/${realm}/${guildName}`, {
    name: "Void Vanguard",
    region: region.toUpperCase(),
    realm: "Stormrage",
    faction: "Alliance",
    ranking_position: 1,
    roster: [
      { character_name: "Aethryl", role: "dps", spec: "Arcane", item_level: 671.4 },
      { character_name: "Lumivale", role: "healer", spec: "Discipline", item_level: 669.2 }
    ],
    boss_progress: [
      { boss_name: "Harbinger Vex", difficulty: "mythic", defeated: true, pulls: 18 },
      { boss_name: "The Hollow Maw", difficulty: "mythic", defeated: true, pulls: 42 },
      { boss_name: "Queen of Shattered Stars", difficulty: "mythic", defeated: false, pulls: 67 }
    ],
    progression_velocity: 8.9,
    momentum_score: 91.2,
    rank_profile: {
      score: 86.4,
      grade: "A",
      tier: "Legend",
      trend: "surging",
      confidence: 91.4,
      explanation: "Void Vanguard lands in tier Legend with grade A. Best dimension: Progression (88.0). Biggest upgrade path: Execution (76.0).",
      dimensions: []
    },
    score_breakdown: { completion: 88, efficiency: 76, roster_strength: 82, activity: 84, momentum: 89 },
    recent_history: [
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), score: 74.0, rank_position: 3, grade: "B+", tier: "Champion", trend: "rising", confidence: 77 },
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), score: 81.8, rank_position: 2, grade: "A", tier: "Legend", trend: "rising", confidence: 85 },
      { captured_at: new Date().toISOString(), score: 86.4, rank_position: 1, grade: "A", tier: "Legend", trend: "surging", confidence: 91.4 }
    ]
  });
}

export async function getCharacter(region: string, realm: string, characterName: string) {
  return safeFetch(`/api/characters/${region}/${realm}/${characterName}`, {
    name: characterName,
    region: region.toUpperCase(),
    realm: "Stormrage",
    class_name: "Mage",
    spec_name: "Arcane",
    guild_name: "Void Vanguard",
    mythic_plus_score: 3421.7,
    item_level: 671.4,
    raid_parses: {
      overall_estimate: 87.2,
      bosses_logged: 0,
      source: "scaffold-estimate",
      best_performance_average: 0,
      median_performance_average: 0,
      all_stars: null
    },
    achievements: ["Ahead of the Curve", "Keystone Hero"],
    rank_profile: {
      score: 84.8,
      grade: "A",
      tier: "Legend",
      trend: "surging",
      confidence: 88.2,
      explanation: "Aethryl lands in tier Legend with grade A. Best dimension: Dungeon Form (90.0). Biggest upgrade path: Accolades (71.0).",
      dimensions: []
    },
    score_breakdown: { mplus: 90, gear: 80, achievements: 71, execution: 86, guild_influence: 86 },
    recent_history: [
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), score: 77.2, grade: "A-", tier: "Legend", trend: "rising", confidence: 79 },
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), score: 81.3, grade: "A", tier: "Legend", trend: "rising", confidence: 84 },
      { captured_at: new Date().toISOString(), score: 84.8, grade: "A", tier: "Legend", trend: "surging", confidence: 88.2 }
    ],
    profile_summary: {
      race_name: "Blood Elf",
      faction_name: "Horde",
      gender_name: "Female",
      level: 80,
      achievement_points: 28450,
      active_title: "the Dreaming",
      active_spec_name: "Arcane"
    },
    equipment: [
      { slot: "Head", slot_key: "head", name: "Aethermancer's Hood", item_level: 678, quality: "Epic", inventory_type: "Head", enchantments: ["Starlit Intellect"], sockets: ["Deadly Sapphire"], bonuses: [], set_name: "Aethermancer Regalia", is_tier_item: true },
      { slot: "Neck", slot_key: "neck", name: "Starforged Choker", item_level: 675, quality: "Epic", inventory_type: "Neck", enchantments: [], sockets: [], bonuses: ["Astral Resonance"], set_name: null, is_tier_item: false },
      { slot: "Shoulder", slot_key: "shoulder", name: "Mantle of the Scrying Court", item_level: 678, quality: "Epic", inventory_type: "Shoulder", enchantments: [], sockets: [], bonuses: [], set_name: "Aethermancer Regalia", is_tier_item: true },
      { slot: "Back", slot_key: "back", name: "Cloak of the Violet Horizon", item_level: 676, quality: "Epic", inventory_type: "Back", enchantments: ["Whisper of Leech"], sockets: [], bonuses: [], set_name: null, is_tier_item: false },
      { slot: "Chest", slot_key: "chest", name: "Astral Archivist Robes", item_level: 678, quality: "Epic", inventory_type: "Chest", enchantments: ["Crystalline Stats"], sockets: [], bonuses: [], set_name: "Aethermancer Regalia", is_tier_item: true },
      { slot: "Wrist", slot_key: "wrist", name: "Manacles of Living Leylines", item_level: 672, quality: "Epic", inventory_type: "Wrist", enchantments: ["Devotion of Speed"], sockets: [], bonuses: [], set_name: null, is_tier_item: false },
      { slot: "Hands", slot_key: "hands", name: "Grips of Arcane Pressure", item_level: 676, quality: "Epic", inventory_type: "Hands", enchantments: ["Authority of Fiery Resolve"], sockets: [], bonuses: [], set_name: "Aethermancer Regalia", is_tier_item: true },
      { slot: "Waist", slot_key: "waist", name: "Spellwoven Sash", item_level: 671, quality: "Epic", inventory_type: "Waist", enchantments: [], sockets: ["Quick Onyx"], bonuses: [], set_name: null, is_tier_item: false },
      { slot: "Legs", slot_key: "legs", name: "Leggings of the Arc Observatory", item_level: 678, quality: "Epic", inventory_type: "Legs", enchantments: ["Daybreak Spellthread"], sockets: [], bonuses: [], set_name: null, is_tier_item: false },
      { slot: "Feet", slot_key: "feet", name: "Cloudstride Slippers", item_level: 675, quality: "Epic", inventory_type: "Feet", enchantments: ["Defender's March"], sockets: [], bonuses: [], set_name: null, is_tier_item: false },
      { slot: "Finger 1", slot_key: "finger-1", name: "Signet of Shifting Skies", item_level: 675, quality: "Epic", inventory_type: "Finger", enchantments: ["Radiant Haste"], sockets: [], bonuses: [], set_name: null, is_tier_item: false },
      { slot: "Finger 2", slot_key: "finger-2", name: "Loop of the Astral Current", item_level: 672, quality: "Epic", inventory_type: "Finger", enchantments: ["Radiant Mastery"], sockets: ["Versatile Ruby"], bonuses: [], set_name: null, is_tier_item: false },
      { slot: "Trinket 1", slot_key: "trinket-1", name: "Time-Breaching Lens", item_level: 678, quality: "Epic", inventory_type: "Trinket", enchantments: [], sockets: [], bonuses: ["On-use burst"], set_name: null, is_tier_item: false },
      { slot: "Trinket 2", slot_key: "trinket-2", name: "Resonant Spellbeacon", item_level: 675, quality: "Epic", inventory_type: "Trinket", enchantments: [], sockets: [], bonuses: ["Passive intellect proc"], set_name: null, is_tier_item: false },
      { slot: "Main Hand", slot_key: "main-hand", name: "Voidglass Spire", item_level: 678, quality: "Epic", inventory_type: "Staff", enchantments: ["Council's Intellect"], sockets: [], bonuses: ["Arcane nova proc"], set_name: null, is_tier_item: false },
      { slot: "Off Hand", slot_key: "off-hand", name: "Astral Cipher Orb", item_level: 672, quality: "Epic", inventory_type: "Held In Off-hand", enchantments: [], sockets: [], bonuses: [], set_name: null, is_tier_item: false }
    ],
    talent_loadout: {
      name: "Raid Arcane",
      spec_name: "Arcane",
      hero_tree_name: "Spellslinger",
      loadout_code: "CAEAAAAAAAAAAAAAAAAAAAAA",
      available_loadouts: ["Raid Arcane", "Mythic+ Burst", "Solo / Open World"],
      class_talents: [
        { name: "Shimmer", talent_type: "class", rank: 1, max_rank: 1, description: "Blink has 1 additional charge.", choice_of: null },
        { name: "Ice Block", talent_type: "class", rank: 1, max_rank: 1, description: "Encases you in a block of ice.", choice_of: null },
        { name: "Mass Barrier", talent_type: "class", rank: 1, max_rank: 1, description: "Conjures a barrier for allies.", choice_of: null }
      ],
      spec_talents: [
        { name: "Arcane Surge", talent_type: "spec", rank: 1, max_rank: 1, description: "Release arcane energy to empower your spells.", choice_of: null },
        { name: "Aether Attunement", talent_type: "spec", rank: 2, max_rank: 2, description: "Amplifies Arcane Barrage and Missiles.", choice_of: null },
        { name: "Magi's Spark", talent_type: "spec", rank: 1, max_rank: 1, description: "Marks a target to echo your damage.", choice_of: null }
      ],
      hero_talents: [
        { name: "Spellfire Spheres", talent_type: "hero", rank: 1, max_rank: 1, description: "Your barrage calls orbiting spellfire.", choice_of: null },
        { name: "Siphoned Malice", talent_type: "hero", rank: 1, max_rank: 1, description: "Arcane burst siphons ambient power.", choice_of: null }
      ],
      pvp_talents: [
        { name: "Temporal Shield", talent_type: "pvp", rank: 1, max_rank: 1, description: "Rewinds recent damage taken.", choice_of: null },
        { name: "Master Shepherd", talent_type: "pvp", rank: 1, max_rank: 1, description: "Amplifies crowd control setups.", choice_of: null }
      ]
    }
  });
}

export async function getGuildHistory(region: string, realm: string, guildName: string) {
  return safeFetch(`/api/guilds/${region}/${realm}/${guildName}/history`, {
    entity_type: "guild",
    entity_label: "Void Vanguard",
    scope: "world",
    points: [
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(), score: 78.3, rank_position: 2, grade: "A-", tier: "Legend", trend: "rising", confidence: 81 },
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), score: 81.8, rank_position: 2, grade: "A", tier: "Legend", trend: "rising", confidence: 85 },
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), score: 84.9, rank_position: 1, grade: "A", tier: "Legend", trend: "surging", confidence: 89 },
      { captured_at: new Date().toISOString(), score: 86.4, rank_position: 1, grade: "A", tier: "Legend", trend: "surging", confidence: 91.4 }
    ],
    summary: { latest_score: 86.4, best_score: 86.4, score_delta: 8.1, rank_delta: 1, momentum_label: "surging" }
  });
}

export async function getCharacterHistory(region: string, realm: string, characterName: string) {
  return safeFetch(`/api/characters/${region}/${realm}/${characterName}/history`, {
    entity_type: "character",
    entity_label: characterName,
    scope: "world",
    points: [
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(), score: 79.6, grade: "A-", tier: "Legend", trend: "rising", confidence: 82 },
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), score: 81.3, grade: "A", tier: "Legend", trend: "rising", confidence: 84 },
      { captured_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), score: 83.9, grade: "A", tier: "Legend", trend: "surging", confidence: 86 },
      { captured_at: new Date().toISOString(), score: 84.8, grade: "A", tier: "Legend", trend: "surging", confidence: 88.2 }
    ],
    summary: { latest_score: 84.8, best_score: 84.8, score_delta: 5.2, rank_delta: 0, momentum_label: "surging" }
  });
}

export async function compareGuilds() {
  return safeFetch("/api/compare/guilds?left_region=us&left_realm=stormrage&left_name=Void%20Vanguard&right_region=eu&right_realm=tarren-mill&right_name=Astral%20Dominion", {
    entity_type: "guild",
    left: {
      label: "Void Vanguard",
      subtitle: "US · Stormrage",
      score: 86.4,
      grade: "A",
      tier: "Legend",
      trend: "surging",
      confidence: 91.4,
      rank_position: 1,
      score_breakdown: { completion: 88, efficiency: 76, roster_strength: 82, activity: 84, momentum: 89 },
      history: { latest_score: 86.4, best_score: 86.4, score_delta: 15.3, rank_delta: 2, momentum_label: "surging" }
    },
    right: {
      label: "Astral Dominion",
      subtitle: "EU · Tarren Mill",
      score: 74.6,
      grade: "B+",
      tier: "Champion",
      trend: "rising",
      confidence: 87.1,
      rank_position: 2,
      score_breakdown: { completion: 54, efficiency: 72, roster_strength: 78, activity: 81, momentum: 75.5 },
      history: { latest_score: 74.6, best_score: 74.6, score_delta: 8.4, rank_delta: 0, momentum_label: "rising" }
    },
    dimensions: [
      { key: "completion", label: "Progression", left_score: 88, right_score: 54, delta: 34, winner: "left", note: "Progression currently gives the left side a clear edge of 34.0 points." },
      { key: "efficiency", label: "Execution", left_score: 76, right_score: 72, delta: 4, winner: "left", note: "Execution currently gives the left side a solid edge of 4.0 points." },
      { key: "roster_strength", label: "Roster", left_score: 82, right_score: 78, delta: 4, winner: "left", note: "Roster currently gives the left side a solid edge of 4.0 points." },
      { key: "activity", label: "Activity", left_score: 84, right_score: 81, delta: 3, winner: "left", note: "Activity currently gives the left side a slight edge of 3.0 points." },
      { key: "momentum", label: "Momentum", left_score: 89, right_score: 75.5, delta: 13.5, winner: "left", note: "Momentum currently gives the left side a clear edge of 13.5 points." }
    ],
    verdict: "Void Vanguard leads the comparison by 11.8 composite points."
  });
}

export async function compareCharacters() {
  return safeFetch("/api/compare/characters?left_region=us&left_realm=stormrage&left_name=Aethryl&right_region=eu&right_realm=tarren-mill&right_name=Seraphae", {
    entity_type: "character",
    left: {
      label: "Aethryl",
      subtitle: "Mage · Arcane",
      score: 84.8,
      grade: "A",
      tier: "Legend",
      trend: "surging",
      confidence: 88.2,
      score_breakdown: { mplus: 90, gear: 80, achievements: 71, execution: 86, guild_influence: 86 },
      history: { latest_score: 84.8, best_score: 84.8, score_delta: 10.0, rank_delta: 0, momentum_label: "surging" }
    },
    right: {
      label: "Seraphae",
      subtitle: "Evoker · Augmentation",
      score: 82.7,
      grade: "A",
      tier: "Legend",
      trend: "rising",
      confidence: 87,
      score_breakdown: { mplus: 89, gear: 79, achievements: 79, execution: 87, guild_influence: 75 },
      history: { latest_score: 82.7, best_score: 82.7, score_delta: 6.6, rank_delta: 0, momentum_label: "rising" }
    },
    dimensions: [
      { key: "mplus", label: "Dungeon Form", left_score: 90, right_score: 89, delta: 1, winner: "left", note: "Dungeon Form currently gives the left side a slight edge of 1.0 points." },
      { key: "gear", label: "Gear Readiness", left_score: 80, right_score: 79, delta: 1, winner: "left", note: "Gear Readiness currently gives the left side a slight edge of 1.0 points." },
      { key: "achievements", label: "Accolades", left_score: 71, right_score: 79, delta: -8, winner: "right", note: "Accolades currently gives the right side a clear edge of 8.0 points." },
      { key: "execution", label: "Execution", left_score: 86, right_score: 87, delta: -1, winner: "right", note: "Execution currently gives the right side a slight edge of 1.0 points." },
      { key: "guild_influence", label: "Guild Influence", left_score: 86, right_score: 75, delta: 11, winner: "left", note: "Guild Influence currently gives the left side a clear edge of 11.0 points." }
    ],
    verdict: "Aethryl leads the comparison by 2.1 composite points."
  });
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

export async function getSearchResults(filters: SearchFilters): Promise<SearchResponse> {
  const queryString = buildSearchParams(filters);
  return safeFetch(`/api/search?${queryString}`, {
    query: filters.q,
    filters: {
      region: filters.region ?? null,
      realm: filters.realm ?? null,
      guild: filters.guild ?? null,
      type: filters.type ?? "all",
      limit: filters.limit ?? 12
    },
    total_results: 0,
    group_counts: [],
    results: []
  });
}

export async function getSearchAutocomplete(filters: SearchFilters): Promise<SearchResponse> {
  const queryString = buildSearchParams({ ...filters, limit: filters.limit ?? 8 });
  return safeFetch(`/api/search/autocomplete?${queryString}`, {
    query: filters.q,
    filters: {
      region: filters.region ?? null,
      realm: filters.realm ?? null,
      guild: filters.guild ?? null,
      type: filters.type ?? "all",
      limit: filters.limit ?? 8
    },
    total_results: 0,
    group_counts: [],
    results: []
  });
}

export function resolveInternalApiBaseUrl() {
  const candidates = [
    process.env.INTERNAL_API_BASE_URL,
    process.env.API_BASE_URL_INTERNAL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    "http://localhost:8000"
  ];

  for (const candidate of candidates) {
    if (candidate && /^https?:\/\//.test(candidate)) {
      return candidate.replace(/\/$/, "");
    }
  }

  return "http://localhost:8000";
}

async function safeAdminFetch<T>(path: string, fallback: T): Promise<T> {
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) {
    return fallback;
  }

  try {
    const response = await fetch(`${resolveInternalApiBaseUrl()}${path}`, {
      headers: {
        "X-Admin-Token": adminToken
      },
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error(`Admin request failed with ${response.status}`);
    }
    return await response.json();
  } catch {
    return fallback;
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
      latest_cycle_status: process.env.ADMIN_API_TOKEN ? "unavailable" : "missing-token",
      last_error_at: null,
      last_error_payload: null
    },
    backups: {
      directory: "/var/backups/azerothnexus",
      count: 0,
      latest: null
    },
    audit_summary: {
      total_recent: 0,
      request_logs: 0,
      admin_actions: 0,
      backup_actions: 0
    },
    missing_admin_token: !process.env.ADMIN_API_TOKEN
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
        client_secret_configured: false
      },
      raiderio: {
        enabled: true,
        configured: true,
        api_base_url: "https://raider.io/api"
      },
      warcraftlogs: {
        enabled: true,
        configured: false,
        client_id: "",
        client_secret: "",
        client_secret_configured: false
      }
    },
    feature_flags: {
      request_logging: true
    }
  });
}

export async function getAdminBackups() {
  return safeAdminFetch("/api/admin/backups", {
    directory: "/var/backups/azerothnexus",
    count: 0,
    items: []
  });
}

export async function getAdminLogs() {
  return safeAdminFetch("/api/admin/logs?limit=120", {
    timeline: [],
    summary: {
      total_recent: 0,
      request_logs: 0,
      admin_actions: 0,
      backup_actions: 0
    }
  });
}
