
from datetime import datetime, timedelta, timezone

from app.db.session import Base, SessionLocal, engine
from app.models import (
    Boss,
    Character,
    EntityScoreSnapshot,
    Guild,
    GuildRaidProgress,
    GuildRosterMember,
    MythicDungeon,
    MythicRun,
    ProviderSyncJob,
    Raid,
    RankingSnapshot,
    Realm,
    Region,
    Spec,
    WowClass,
)


NOW = datetime.now(timezone.utc).replace(tzinfo=None)


def add_entity_history(db, entity_type: str, entity_id: int, entity_label: str, scope: str, points: list[dict]):
    for point in points:
        snapshot = EntityScoreSnapshot(
            entity_type=entity_type,
            entity_id=entity_id,
            entity_label=entity_label,
            scope=scope,
            rank_position=point.get("rank_position"),
            score=point.get("score", 0.0),
            grade=point.get("grade"),
            tier=point.get("tier"),
            trend=point.get("trend"),
            confidence=point.get("confidence"),
            dimensions=point.get("dimensions", {}),
            payload=point.get("metadata", {}),
            created_at=point["created_at"],
            updated_at=point["created_at"],
        )
        db.add(snapshot)


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Region).count() > 0:
        print("Seed data already exists.")
        db.close()
        return

    us = Region(code="us", name="United States")
    eu = Region(code="eu", name="Europe")
    db.add_all([us, eu])
    db.flush()

    stormrage = Realm(region_id=us.id, slug="stormrage", name="Stormrage")
    illidan = Realm(region_id=us.id, slug="illidan", name="Illidan")
    tarren = Realm(region_id=eu.id, slug="tarren-mill", name="Tarren Mill")
    db.add_all([stormrage, illidan, tarren])
    db.flush()

    mage = WowClass(name="Mage", slug="mage")
    priest = WowClass(name="Priest", slug="priest")
    druid = WowClass(name="Druid", slug="druid")
    evoker = WowClass(name="Evoker", slug="evoker")
    db.add_all([mage, priest, druid, evoker])
    db.flush()

    arcane = Spec(class_id=mage.id, name="Arcane", slug="arcane")
    discipline = Spec(class_id=priest.id, name="Discipline", slug="discipline")
    restoration = Spec(class_id=druid.id, name="Restoration", slug="restoration")
    augmentation = Spec(class_id=evoker.id, name="Augmentation", slug="augmentation")
    db.add_all([arcane, discipline, restoration, augmentation])
    db.flush()

    guilds = [
        Guild(region_id=us.id, realm_id=stormrage.id, name="Void Vanguard", slug="void-vanguard", faction="Alliance", recruitment_status="Open for ranged DPS"),
        Guild(region_id=eu.id, realm_id=tarren.id, name="Astral Dominion", slug="astral-dominion", faction="Horde", recruitment_status="Closed"),
        Guild(region_id=us.id, realm_id=illidan.id, name="Obsidian Crown", slug="obsidian-crown", faction="Horde", recruitment_status="Open for healer"),
    ]
    db.add_all(guilds)
    db.flush()

    roster_specs = [
        ("Aethryl", guilds[0], mage, arcane, 671.4, 3421.7, {"Ahead of the Curve": True, "Keystone Hero": True}),
        ("Lumivale", guilds[0], priest, discipline, 669.2, 3198.4, {"Keystone Hero": True}),
        ("Thornwake", guilds[0], druid, restoration, 667.9, 3311.1, {"Mythic Raider": True}),
        ("Seraphae", guilds[1], evoker, augmentation, 670.7, 3388.2, {"Cutting Edge": True}),
        ("Moonshiver", guilds[1], mage, arcane, 668.8, 3152.4, {"Ahead of the Curve": True}),
        ("Duskwhorl", guilds[2], priest, discipline, 666.3, 3097.0, {"Keystone Master": True}),
    ]

    characters = []
    for name, guild, wow_class, spec, ilvl, score, achievements in roster_specs:
        region = us if guild.region_id == us.id else eu
        realm = stormrage if guild.realm_id == stormrage.id else illidan if guild.realm_id == illidan.id else tarren
        character = Character(
            region_id=region.id,
            realm_id=realm.id,
            guild_id=guild.id,
            class_id=wow_class.id,
            spec_id=spec.id,
            name=name,
            item_level=ilvl,
            mythic_plus_score=score,
            achievements=achievements,
        )
        db.add(character)
        characters.append(character)
    db.flush()

    for character, role in zip(characters, ["dps", "healer", "healer", "support", "dps", "healer"]):
        db.add(GuildRosterMember(guild_id=character.guild_id, character_id=character.id, role=role))

    raid = Raid(name="Citadel of the Void", slug="citadel-of-the-void", expansion="The War Within", season="Season X", is_current=True)
    db.add(raid)
    db.flush()

    bosses = [
        Boss(raid_id=raid.id, name="Harbinger Vex", order_index=1),
        Boss(raid_id=raid.id, name="The Hollow Maw", order_index=2),
        Boss(raid_id=raid.id, name="Queen of Shattered Stars", order_index=3),
        Boss(raid_id=raid.id, name="Empress of Ashen Night", order_index=4),
    ]
    db.add_all(bosses)
    db.flush()

    progress_rows = [
        GuildRaidProgress(guild_id=guilds[0].id, raid_id=raid.id, boss_id=bosses[0].id, difficulty="mythic", defeated=True, pulls=18, kill_timestamp=NOW - timedelta(hours=9)),
        GuildRaidProgress(guild_id=guilds[0].id, raid_id=raid.id, boss_id=bosses[1].id, difficulty="mythic", defeated=True, pulls=42, kill_timestamp=NOW - timedelta(hours=6)),
        GuildRaidProgress(guild_id=guilds[0].id, raid_id=raid.id, boss_id=bosses[2].id, difficulty="mythic", defeated=False, pulls=67),
        GuildRaidProgress(guild_id=guilds[1].id, raid_id=raid.id, boss_id=bosses[0].id, difficulty="mythic", defeated=True, pulls=15, kill_timestamp=NOW - timedelta(hours=10)),
        GuildRaidProgress(guild_id=guilds[1].id, raid_id=raid.id, boss_id=bosses[1].id, difficulty="mythic", defeated=False, pulls=58),
        GuildRaidProgress(guild_id=guilds[2].id, raid_id=raid.id, boss_id=bosses[0].id, difficulty="mythic", defeated=True, pulls=21, kill_timestamp=NOW - timedelta(hours=8)),
    ]
    db.add_all(progress_rows)

    dungeons = [
        MythicDungeon(slug="echoing-depths", name="Echoing Depths", season="Season X"),
        MythicDungeon(slug="sunken-reliquary", name="Sunken Reliquary", season="Season X"),
    ]
    db.add_all(dungeons)
    db.flush()

    mythic_runs = [
        MythicRun(dungeon_id=dungeons[0].id, guild_id=guilds[0].id, score=389.4, keystone_level=18, completed_in_time=True),
        MythicRun(dungeon_id=dungeons[1].id, guild_id=guilds[1].id, score=377.2, keystone_level=17, completed_in_time=True),
        MythicRun(dungeon_id=dungeons[0].id, guild_id=guilds[2].id, score=369.1, keystone_level=17, completed_in_time=False),
        MythicRun(dungeon_id=dungeons[1].id, guild_id=guilds[0].id, score=364.0, keystone_level=16, completed_in_time=True),
    ]
    db.add_all(mythic_runs)

    db.add_all(
        [
            ProviderSyncJob(provider="blizzard", job_type="sync-realms", status="success", payload={"count": 3}),
            ProviderSyncJob(provider="raiderio", job_type="sync-guilds", status="success", payload={"count": 3}),
            ProviderSyncJob(provider="warcraftlogs", job_type="sync-raid-performance", status="success", payload={"reports": 12}),
        ]
    )

    db.add_all(
        [
            RankingSnapshot(
                ladder_type="guilds",
                scope="world",
                payload={
                    "ladder": "guilds",
                    "scope": "world",
                    "source": "snapshot",
                    "generated_at": (NOW - timedelta(minutes=15)).isoformat() + "Z",
                    "filters": {"region": "world"},
                    "entries": [
                        {
                            "rank": 1,
                            "label": "Void Vanguard",
                            "score": 86.4,
                            "subtitle": "US · Stormrage",
                            "grade": "A",
                            "tier": "Legend",
                            "trend": "surging",
                            "confidence": 91.4,
                            "explanation": "Void Vanguard lands in tier Legend with grade A. Best dimension: Progression (88.0). Biggest upgrade path: Execution (76.0).",
                            "dimensions": [
                                {"key": "progression", "label": "Progression", "score": 88.0, "grade": "A+", "note": "2/4 tracked bosses defeated, putting this guild clearly ahead of the field."},
                                {"key": "execution", "label": "Execution", "score": 76.0, "grade": "A-", "note": "Kill conversion remains healthy, but pull cleanup still has upside."},
                                {"key": "roster", "label": "Roster", "score": 82.0, "grade": "A", "note": "Visible roster quality stays high with strong gear and role spread."},
                                {"key": "activity", "label": "Activity", "score": 84.0, "grade": "A", "note": "Recent kills and dungeon form keep this profile hot."},
                            ],
                            "metadata": {"boss_kills": 2, "momentum_score": 89.3, "progression_velocity": 2.0},
                        },
                        {
                            "rank": 2,
                            "label": "Astral Dominion",
                            "score": 74.6,
                            "subtitle": "EU · Tarren Mill",
                            "grade": "B+",
                            "tier": "Champion",
                            "trend": "rising",
                            "confidence": 87.1,
                            "explanation": "Astral Dominion lands in tier Champion with grade B+. Best dimension: Activity (81.0). Biggest upgrade path: Progression (54.0).",
                            "dimensions": [
                                {"key": "progression", "label": "Progression", "score": 54.0, "grade": "C+", "note": "One early mythic kill is secured, but deeper progression is still pending."},
                                {"key": "execution", "label": "Execution", "score": 72.0, "grade": "B+", "note": "Attempts remain efficient enough to protect the overall note."},
                                {"key": "roster", "label": "Roster", "score": 78.0, "grade": "A-", "note": "Roster quality is stable and well-geared."},
                                {"key": "activity", "label": "Activity", "score": 81.0, "grade": "A", "note": "Strong Mythic+ tempo keeps the guild highly visible."},
                            ],
                            "metadata": {"boss_kills": 1, "momentum_score": 75.5, "progression_velocity": 1.0},
                        },
                        {
                            "rank": 3,
                            "label": "Obsidian Crown",
                            "score": 71.2,
                            "subtitle": "US · Illidan",
                            "grade": "B+",
                            "tier": "Champion",
                            "trend": "steady",
                            "confidence": 84.8,
                            "explanation": "Obsidian Crown lands in tier Champion with grade B+. Best dimension: Execution (74.0). Biggest upgrade path: Progression (50.0).",
                            "dimensions": [
                                {"key": "progression", "label": "Progression", "score": 50.0, "grade": "C", "note": "The first confirmed boss is secured, but progression depth remains shallow."},
                                {"key": "execution", "label": "Execution", "score": 74.0, "grade": "B+", "note": "Pulls are being converted efficiently enough to stay competitive."},
                                {"key": "roster", "label": "Roster", "score": 76.0, "grade": "A-", "note": "Compact roster footprint, but the visible core remains solid."},
                                {"key": "activity", "label": "Activity", "score": 77.0, "grade": "A-", "note": "Activity is stable even without a recent progression spike."},
                            ],
                            "metadata": {"boss_kills": 1, "momentum_score": 71.4, "progression_velocity": 1.0},
                        },
                    ],
                },
            ),
            RankingSnapshot(
                ladder_type="mythic-plus",
                scope="world",
                payload={
                    "ladder": "mythic-plus",
                    "scope": "world",
                    "source": "snapshot",
                    "generated_at": (NOW - timedelta(minutes=12)).isoformat() + "Z",
                    "filters": {"region": "world"},
                    "entries": [
                        {
                            "rank": 1,
                            "label": "Void Vanguard",
                            "score": 89.2,
                            "subtitle": "Echoing Depths",
                            "grade": "A+",
                            "tier": "Legend",
                            "trend": "surging",
                            "confidence": 89.0,
                            "explanation": "Void Vanguard lands in tier Legend with grade A+. Best dimension: Run Score (100.0). Biggest upgrade path: Consistency (77.0).",
                            "dimensions": [
                                {"key": "run_score", "label": "Run Score", "score": 100.0, "grade": "S+", "note": "Current ladder-leading raw run score."},
                                {"key": "execution", "label": "Execution", "score": 92.0, "grade": "S", "note": "Timed high key with strong pressure handling."},
                                {"key": "consistency", "label": "Consistency", "score": 77.0, "grade": "A-", "note": "Good timed ratio across tracked runs."},
                                {"key": "pressure", "label": "Pressure", "score": 83.0, "grade": "A", "note": "Key level 18 keeps this result premium."},
                            ],
                            "metadata": {"keystone_level": 18, "timed": True, "raw_score": 389.4, "timed_ratio": 100.0},
                        },
                        {
                            "rank": 2,
                            "label": "Astral Dominion",
                            "score": 85.7,
                            "subtitle": "Sunken Reliquary",
                            "grade": "A",
                            "tier": "Legend",
                            "trend": "rising",
                            "confidence": 84.0,
                            "explanation": "Astral Dominion lands in tier Legend with grade A. Best dimension: Execution (91.0). Biggest upgrade path: Consistency (71.0).",
                            "dimensions": [
                                {"key": "run_score", "label": "Run Score", "score": 96.9, "grade": "S+", "note": "Very close to the current ladder leader."},
                                {"key": "execution", "label": "Execution", "score": 91.0, "grade": "S", "note": "Timed key with elite execution quality."},
                                {"key": "consistency", "label": "Consistency", "score": 71.0, "grade": "B+", "note": "One clean logged sample so far."},
                                {"key": "pressure", "label": "Pressure", "score": 79.0, "grade": "A-", "note": "Key level 17 still carries premium difficulty weight."},
                            ],
                            "metadata": {"keystone_level": 17, "timed": True, "raw_score": 377.2, "timed_ratio": 100.0},
                        },
                        {
                            "rank": 3,
                            "label": "Obsidian Crown",
                            "score": 72.4,
                            "subtitle": "Echoing Depths",
                            "grade": "B+",
                            "tier": "Champion",
                            "trend": "steady",
                            "confidence": 80.0,
                            "explanation": "Obsidian Crown lands in tier Champion with grade B+. Best dimension: Run Score (94.8). Biggest upgrade path: Execution (69.0).",
                            "dimensions": [
                                {"key": "run_score", "label": "Run Score", "score": 94.8, "grade": "S", "note": "Raw score remains highly competitive."},
                                {"key": "execution", "label": "Execution", "score": 69.0, "grade": "B", "note": "Untimed completion drags the execution note down."},
                                {"key": "consistency", "label": "Consistency", "score": 65.0, "grade": "B", "note": "Only one tracked run in sample and it was not timed."},
                                {"key": "pressure", "label": "Pressure", "score": 74.0, "grade": "B+", "note": "Key level 17 still keeps this run relevant."},
                            ],
                            "metadata": {"keystone_level": 17, "timed": False, "raw_score": 369.1, "timed_ratio": 0.0},
                        },
                    ],
                },
            ),
        ]
    )

    guild_history_seed = {
        guilds[0].id: [
            {"created_at": NOW - timedelta(days=15), "score": 71.1, "rank_position": 3, "grade": "B+", "tier": "Champion", "trend": "forming", "confidence": 74.0},
            {"created_at": NOW - timedelta(days=12), "score": 74.0, "rank_position": 3, "grade": "B+", "tier": "Champion", "trend": "rising", "confidence": 77.0},
            {"created_at": NOW - timedelta(days=9), "score": 78.3, "rank_position": 2, "grade": "A-", "tier": "Legend", "trend": "rising", "confidence": 81.0},
            {"created_at": NOW - timedelta(days=6), "score": 81.8, "rank_position": 2, "grade": "A", "tier": "Legend", "trend": "rising", "confidence": 85.0},
            {"created_at": NOW - timedelta(days=3), "score": 84.9, "rank_position": 1, "grade": "A", "tier": "Legend", "trend": "surging", "confidence": 89.0},
            {"created_at": NOW - timedelta(hours=4), "score": 86.4, "rank_position": 1, "grade": "A", "tier": "Legend", "trend": "surging", "confidence": 91.4},
        ],
        guilds[1].id: [
            {"created_at": NOW - timedelta(days=15), "score": 66.2, "rank_position": 2, "grade": "B", "tier": "Contender", "trend": "steady", "confidence": 73.0},
            {"created_at": NOW - timedelta(days=12), "score": 67.5, "rank_position": 2, "grade": "B", "tier": "Contender", "trend": "steady", "confidence": 75.0},
            {"created_at": NOW - timedelta(days=9), "score": 69.8, "rank_position": 2, "grade": "B+", "tier": "Champion", "trend": "rising", "confidence": 78.0},
            {"created_at": NOW - timedelta(days=6), "score": 71.4, "rank_position": 2, "grade": "B+", "tier": "Champion", "trend": "rising", "confidence": 81.0},
            {"created_at": NOW - timedelta(days=3), "score": 73.2, "rank_position": 2, "grade": "B+", "tier": "Champion", "trend": "rising", "confidence": 84.0},
            {"created_at": NOW - timedelta(hours=4), "score": 74.6, "rank_position": 2, "grade": "B+", "tier": "Champion", "trend": "rising", "confidence": 87.1},
        ],
        guilds[2].id: [
            {"created_at": NOW - timedelta(days=15), "score": 63.4, "rank_position": 4, "grade": "B", "tier": "Contender", "trend": "forming", "confidence": 70.0},
            {"created_at": NOW - timedelta(days=12), "score": 65.2, "rank_position": 4, "grade": "B", "tier": "Contender", "trend": "steady", "confidence": 72.0},
            {"created_at": NOW - timedelta(days=9), "score": 67.9, "rank_position": 3, "grade": "B", "tier": "Contender", "trend": "rising", "confidence": 75.0},
            {"created_at": NOW - timedelta(days=6), "score": 69.1, "rank_position": 3, "grade": "B+", "tier": "Champion", "trend": "steady", "confidence": 78.0},
            {"created_at": NOW - timedelta(days=3), "score": 70.4, "rank_position": 3, "grade": "B+", "tier": "Champion", "trend": "steady", "confidence": 81.0},
            {"created_at": NOW - timedelta(hours=4), "score": 71.2, "rank_position": 3, "grade": "B+", "tier": "Champion", "trend": "steady", "confidence": 84.8},
        ],
    }

    for guild in guilds:
        add_entity_history(db, "guild", guild.id, guild.name, "world", guild_history_seed[guild.id])

    character_history_seed = {
        characters[0].id: [
            {"created_at": NOW - timedelta(days=15), "score": 74.8, "grade": "B+", "tier": "Champion", "trend": "rising", "confidence": 76.0},
            {"created_at": NOW - timedelta(days=12), "score": 77.2, "grade": "A-", "tier": "Legend", "trend": "rising", "confidence": 79.0},
            {"created_at": NOW - timedelta(days=9), "score": 79.6, "grade": "A-", "tier": "Legend", "trend": "rising", "confidence": 82.0},
            {"created_at": NOW - timedelta(days=6), "score": 81.3, "grade": "A", "tier": "Legend", "trend": "rising", "confidence": 84.0},
            {"created_at": NOW - timedelta(days=3), "score": 83.9, "grade": "A", "tier": "Legend", "trend": "surging", "confidence": 86.0},
            {"created_at": NOW - timedelta(hours=4), "score": 84.8, "grade": "A", "tier": "Legend", "trend": "surging", "confidence": 88.2},
        ],
        characters[3].id: [
            {"created_at": NOW - timedelta(days=15), "score": 76.1, "grade": "A-", "tier": "Legend", "trend": "steady", "confidence": 77.0},
            {"created_at": NOW - timedelta(days=12), "score": 77.0, "grade": "A-", "tier": "Legend", "trend": "steady", "confidence": 79.0},
            {"created_at": NOW - timedelta(days=9), "score": 78.5, "grade": "A-", "tier": "Legend", "trend": "rising", "confidence": 81.0},
            {"created_at": NOW - timedelta(days=6), "score": 80.1, "grade": "A", "tier": "Legend", "trend": "rising", "confidence": 83.0},
            {"created_at": NOW - timedelta(days=3), "score": 81.5, "grade": "A", "tier": "Legend", "trend": "rising", "confidence": 85.0},
            {"created_at": NOW - timedelta(hours=4), "score": 82.7, "grade": "A", "tier": "Legend", "trend": "rising", "confidence": 87.0},
        ],
        characters[5].id: [
            {"created_at": NOW - timedelta(days=15), "score": 68.0, "grade": "B+", "tier": "Champion", "trend": "forming", "confidence": 72.0},
            {"created_at": NOW - timedelta(days=12), "score": 69.4, "grade": "B+", "tier": "Champion", "trend": "steady", "confidence": 74.0},
            {"created_at": NOW - timedelta(days=9), "score": 70.3, "grade": "B+", "tier": "Champion", "trend": "steady", "confidence": 76.0},
            {"created_at": NOW - timedelta(days=6), "score": 71.1, "grade": "B+", "tier": "Champion", "trend": "steady", "confidence": 79.0},
            {"created_at": NOW - timedelta(days=3), "score": 72.2, "grade": "B+", "tier": "Champion", "trend": "rising", "confidence": 81.0},
            {"created_at": NOW - timedelta(hours=4), "score": 73.4, "grade": "B+", "tier": "Champion", "trend": "rising", "confidence": 83.5},
        ],
    }

    for character in characters:
        if character.id in character_history_seed:
            add_entity_history(db, "character", character.id, character.name, "world", character_history_seed[character.id])

    db.commit()
    db.close()
    print("Seed complete.")


if __name__ == "__main__":
    run()
