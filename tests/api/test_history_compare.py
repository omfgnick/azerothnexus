from datetime import datetime, timedelta, timezone

from app.db.session import Base, SessionLocal, engine
from app.models import Character, EntityScoreSnapshot, Guild, GuildRosterMember, Realm, Region, Spec, WowClass
from app.services.comparison_service import ComparisonService
from app.services.history_service import HistoryService


NOW = datetime.now(timezone.utc).replace(tzinfo=None)


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def teardown_function():
    Base.metadata.drop_all(bind=engine)


def seed_compare_data(db):
    region_us = Region(code="us", name="US")
    region_eu = Region(code="eu", name="EU")
    db.add_all([region_us, region_eu])
    db.flush()

    realm_us = Realm(region_id=region_us.id, slug="stormrage", name="Stormrage")
    realm_eu = Realm(region_id=region_eu.id, slug="tarren-mill", name="Tarren Mill")
    db.add_all([realm_us, realm_eu])
    db.flush()

    mage = WowClass(name="Mage", slug="mage")
    evoker = WowClass(name="Evoker", slug="evoker")
    db.add_all([mage, evoker])
    db.flush()

    arcane = Spec(class_id=mage.id, name="Arcane", slug="arcane")
    augmentation = Spec(class_id=evoker.id, name="Augmentation", slug="augmentation")
    db.add_all([arcane, augmentation])
    db.flush()

    left_guild = Guild(region_id=region_us.id, realm_id=realm_us.id, name="Void Vanguard", slug="void-vanguard", faction="Alliance")
    right_guild = Guild(region_id=region_eu.id, realm_id=realm_eu.id, name="Astral Dominion", slug="astral-dominion", faction="Horde")
    db.add_all([left_guild, right_guild])
    db.flush()

    left_character = Character(
        region_id=region_us.id,
        realm_id=realm_us.id,
        guild_id=left_guild.id,
        class_id=mage.id,
        spec_id=arcane.id,
        name="Aethryl",
        item_level=671.4,
        mythic_plus_score=3421.7,
        achievements={"Ahead of the Curve": True},
    )
    right_character = Character(
        region_id=region_eu.id,
        realm_id=realm_eu.id,
        guild_id=right_guild.id,
        class_id=evoker.id,
        spec_id=augmentation.id,
        name="Seraphae",
        item_level=670.0,
        mythic_plus_score=3388.0,
        achievements={"Cutting Edge": True},
    )
    db.add_all([left_character, right_character])
    db.flush()

    db.add_all([
        GuildRosterMember(guild_id=left_guild.id, character_id=left_character.id, role="dps"),
        GuildRosterMember(guild_id=right_guild.id, character_id=right_character.id, role="support"),
    ])

    for offset, score, rank in [(9, 78.3, 2), (6, 81.8, 2), (3, 84.9, 1), (0, 86.4, 1)]:
        db.add(
            EntityScoreSnapshot(
                entity_type="guild",
                entity_id=left_guild.id,
                entity_label=left_guild.name,
                scope="world",
                score=score,
                rank_position=rank,
                grade="A",
                tier="Legend",
                trend="surging",
                confidence=90.0,
                created_at=NOW - timedelta(days=offset),
                updated_at=NOW - timedelta(days=offset),
            )
        )
    for offset, score, rank in [(9, 69.8, 2), (6, 71.4, 2), (3, 73.2, 2), (0, 74.6, 2)]:
        db.add(
            EntityScoreSnapshot(
                entity_type="guild",
                entity_id=right_guild.id,
                entity_label=right_guild.name,
                scope="world",
                score=score,
                rank_position=rank,
                grade="B+",
                tier="Champion",
                trend="rising",
                confidence=85.0,
                created_at=NOW - timedelta(days=offset),
                updated_at=NOW - timedelta(days=offset),
            )
        )
    for offset, score in [(9, 79.6), (6, 81.3), (3, 83.9), (0, 84.8)]:
        db.add(
            EntityScoreSnapshot(
                entity_type="character",
                entity_id=left_character.id,
                entity_label=left_character.name,
                scope="world",
                score=score,
                grade="A",
                tier="Legend",
                trend="surging",
                confidence=88.0,
                created_at=NOW - timedelta(days=offset),
                updated_at=NOW - timedelta(days=offset),
            )
        )
    for offset, score in [(9, 78.5), (6, 80.1), (3, 81.5), (0, 82.7)]:
        db.add(
            EntityScoreSnapshot(
                entity_type="character",
                entity_id=right_character.id,
                entity_label=right_character.name,
                scope="world",
                score=score,
                grade="A",
                tier="Legend",
                trend="rising",
                confidence=86.0,
                created_at=NOW - timedelta(days=offset),
                updated_at=NOW - timedelta(days=offset),
            )
        )

    db.commit()


def test_history_service_returns_latest_points_in_order():
    db = SessionLocal()
    seed_compare_data(db)

    history = HistoryService(db).get_guild_history("us", "stormrage", "Void Vanguard", limit=3)
    assert history is not None
    assert len(history.points) == 3
    assert history.points[0].score == 81.8
    assert history.points[-1].score == 86.4
    assert history.summary.score_delta > 0
    db.close()


def test_comparison_service_builds_verdict():
    db = SessionLocal()
    seed_compare_data(db)

    comparison = ComparisonService(db).compare_characters(
        left_region="us",
        left_realm="stormrage",
        left_name="Aethryl",
        right_region="eu",
        right_realm="tarren-mill",
        right_name="Seraphae",
    )
    assert comparison is not None
    assert comparison.left.label == "Aethryl"
    assert comparison.right.label == "Seraphae"
    assert len(comparison.dimensions) >= 4
    assert "leads the comparison" in comparison.verdict or "nearly tied" in comparison.verdict
    db.close()
