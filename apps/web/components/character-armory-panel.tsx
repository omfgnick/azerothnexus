type CharacterProfileSummary = {
  race_name?: string | null;
  faction_name?: string | null;
  gender_name?: string | null;
  level?: number | null;
  achievement_points?: number | null;
  active_title?: string | null;
  active_spec_name?: string | null;
};

type CharacterEquipmentItem = {
  slot: string;
  slot_key: string;
  name: string;
  item_level?: number | null;
  quality?: string | null;
  inventory_type?: string | null;
  enchantments?: string[];
  sockets?: string[];
  bonuses?: string[];
  set_name?: string | null;
  is_tier_item?: boolean;
};

type CharacterTalentNode = {
  name: string;
  talent_type: string;
  rank?: number | null;
  max_rank?: number | null;
  description?: string | null;
  choice_of?: string | null;
};

type CharacterTalentLoadout = {
  name?: string | null;
  spec_name?: string | null;
  hero_tree_name?: string | null;
  loadout_code?: string | null;
  class_talents?: CharacterTalentNode[];
  spec_talents?: CharacterTalentNode[];
  hero_talents?: CharacterTalentNode[];
  pvp_talents?: CharacterTalentNode[];
  available_loadouts?: string[];
};

type CharacterArmoryPanelProps = {
  name: string;
  profileSummary?: CharacterProfileSummary | null;
  equipment?: CharacterEquipmentItem[];
  talentLoadout?: CharacterTalentLoadout | null;
};

const LEFT_SLOTS = new Set(["head", "neck", "shoulder", "back", "chest", "wrist", "hands", "waist"]);

function splitEquipment(equipment: CharacterEquipmentItem[]) {
  const left: CharacterEquipmentItem[] = [];
  const right: CharacterEquipmentItem[] = [];

  for (const item of equipment) {
    if (LEFT_SLOTS.has(item.slot_key)) {
      left.push(item);
      continue;
    }
    right.push(item);
  }

  return { left, right };
}

function qualityTone(quality?: string | null) {
  const value = quality?.toLowerCase();
  if (value?.includes("legendary")) return "text-amber-200";
  if (value?.includes("epic")) return "text-violet-100";
  if (value?.includes("rare")) return "text-sky-100";
  if (value?.includes("uncommon")) return "text-emerald-100";
  return "text-white";
}

function TalentGroup({ title, tone, talents }: { title: string; tone: string; talents: CharacterTalentNode[] }) {
  if (!talents.length) {
    return null;
  }

  return (
    <div className="data-slab h-full">
      <div className="flex items-center justify-between gap-3">
        <div className={`text-[0.66rem] uppercase tracking-[0.34em] ${tone}`}>{title}</div>
        <div className="rune-chip">{talents.length}</div>
      </div>

      <div className="mt-4 grid gap-3">
        {talents.map((talent) => (
          <div key={`${title}-${talent.name}`} className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div
                className="text-[1.05rem] leading-tight text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {talent.name}
              </div>
              {talent.rank ? (
                <div className="text-xs uppercase tracking-[0.2em] text-white/55">
                  {talent.max_rank ? `${talent.rank}/${talent.max_rank}` : talent.rank}
                </div>
              ) : null}
            </div>
            {talent.choice_of ? <div className="mt-2 text-xs uppercase tracking-[0.16em] text-gold/70">Choice: {talent.choice_of}</div> : null}
            {talent.description ? <p className="mt-2 text-sm leading-6 text-white/58">{talent.description}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CharacterArmoryPanel({
  name,
  profileSummary,
  equipment = [],
  talentLoadout,
}: CharacterArmoryPanelProps) {
  const { left, right } = splitEquipment(equipment);
  const loadoutNames = talentLoadout?.available_loadouts ?? [];
  const hasEquipment = equipment.length > 0;
  const hasTalents =
    !!talentLoadout &&
    [
      talentLoadout.class_talents?.length ?? 0,
      talentLoadout.spec_talents?.length ?? 0,
      talentLoadout.hero_talents?.length ?? 0,
      talentLoadout.pvp_talents?.length ?? 0,
    ].some((count) => count > 0);

  return (
    <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="panel panel-section-lg panel-legendary">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Armory loadout</p>
            <h2 className="mt-4 section-title">{name} equipped for live inspection.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
              Slot-by-slot equipment in an Azeroth-style layout, with item level, enchantments, sockets, and tier pieces when Blizzard sync is available.
            </p>
          </div>
          <div className="rune-pill">{hasEquipment ? "Blizzard armory sync" : "Awaiting armory sync"}</div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Race</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {profileSummary?.race_name ?? "Unknown"}
            </div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Faction</div>
            <div className="mt-3 text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>
              {profileSummary?.faction_name ?? "Unknown"}
            </div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Level</div>
            <div className="mt-3 score-number tone-gold">{profileSummary?.level ?? "--"}</div>
          </div>
          <div className="data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Achievement points</div>
            <div className="mt-3 score-number tone-arcane">{profileSummary?.achievement_points ?? 0}</div>
          </div>
        </div>

        {hasEquipment ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[left, right].map((column, columnIndex) => (
              <div key={columnIndex} className="grid gap-3">
                {column.map((item) => (
                  <div key={`${item.slot_key}-${item.name}`} className="data-slab">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/72">{item.slot}</div>
                        <div
                          className={`mt-3 break-words text-[1.2rem] leading-tight sm:text-[1.35rem] ${qualityTone(item.quality)}`}
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {item.name}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-[0.62rem] uppercase tracking-[0.26em] text-white/45">Item level</div>
                        <div className="mt-2 text-xl text-white">{item.item_level ?? "--"}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.quality ? <span className="rune-chip">{item.quality}</span> : null}
                      {item.is_tier_item && item.set_name ? <span className="rune-chip">{item.set_name}</span> : null}
                      {item.inventory_type ? <span className="rune-chip">{item.inventory_type}</span> : null}
                    </div>

                    {item.enchantments?.length ? <p className="mt-4 text-sm leading-6 text-white/62">Enchant: {item.enchantments.join(" · ")}</p> : null}
                    {item.sockets?.length ? <p className="mt-2 text-sm leading-6 text-white/62">Sockets: {item.sockets.join(" · ")}</p> : null}
                    {item.bonuses?.length ? <p className="mt-2 text-sm leading-6 text-white/55">Effects: {item.bonuses.join(" · ")}</p> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Loadout sync</div>
            <p className="mt-4 text-sm leading-7 text-white/62">
              No equipped items were returned yet. Trigger a manual update or wait for the automatic 10-minute refresh after Blizzard credentials are configured.
            </p>
          </div>
        )}
      </div>

      <div className="panel panel-section-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Talent codex</p>
            <h2 className="mt-4 section-title">Active loadout and selected talents.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
              Blizzard specialization data rendered as a build sheet, closer to Armory and Raider.IO than a plain stat box.
            </p>
          </div>
          <div className="rune-pill">{hasTalents ? "Loadout attuned" : "Awaiting talent sync"}</div>
        </div>

        {talentLoadout ? (
          <div className="mt-6 space-y-4">
            <div className="data-slab border-sky-300/20">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-[0.66rem] uppercase tracking-[0.34em] text-sky-100/80">
                    {talentLoadout.spec_name ?? profileSummary?.active_spec_name ?? "Active spec"}
                  </div>
                  <div className="mt-3 text-[1.6rem] leading-tight text-white sm:text-[2rem]" style={{ fontFamily: "var(--font-display)" }}>
                    {talentLoadout.name ?? "Current Loadout"}
                  </div>
                  {talentLoadout.hero_tree_name ? <div className="mt-3 text-sm uppercase tracking-[0.2em] text-gold/72">Hero tree: {talentLoadout.hero_tree_name}</div> : null}
                  {profileSummary?.active_title ? <div className="mt-2 text-sm uppercase tracking-[0.2em] text-white/45">{profileSummary.active_title}</div> : null}
                </div>
                {talentLoadout.loadout_code ? <div className="rune-chip break-all">{talentLoadout.loadout_code}</div> : null}
              </div>

              {loadoutNames.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {loadoutNames.map((label) => (
                    <span key={label} className="rune-chip">
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <TalentGroup title="Class talents" tone="text-gold/75" talents={talentLoadout.class_talents ?? []} />
              <TalentGroup title="Spec talents" tone="text-sky-100/78" talents={talentLoadout.spec_talents ?? []} />
              <TalentGroup title="Hero talents" tone="text-violet-100/78" talents={talentLoadout.hero_talents ?? []} />
              <TalentGroup title="PvP talents" tone="text-emerald-100/78" talents={talentLoadout.pvp_talents ?? []} />
            </div>
          </div>
        ) : (
          <div className="mt-6 data-slab">
            <div className="text-[0.66rem] uppercase tracking-[0.34em] text-gold/75">Talent sync</div>
            <p className="mt-4 text-sm leading-7 text-white/62">
              No loadout was returned yet. Blizzard may need the character profile to be freshly available in their public data, and the next server refresh will keep trying automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
