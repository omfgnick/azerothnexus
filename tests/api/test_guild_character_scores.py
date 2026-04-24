from app.db.session import Base, SessionLocal, engine
from app.models import Boss, Character, Guild, GuildRaidProgress, GuildRosterMember, Raid, Realm, Region, Spec, WowClass
from app.services.character_service import CharacterService
from app.services.guild_service import GuildService


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def teardown_function():
    Base.metadata.drop_all(bind=engine)


def test_guild_detail_exposes_rank_profile():
    db = SessionLocal()
    region = Region(code="us", name="US")
    db.add(region)
    db.flush()
    realm = Realm(region_id=region.id, slug="stormrage", name="Stormrage")
    db.add(realm)
    db.flush()
    wow_class = WowClass(name="Mage", slug="mage")
    db.add(wow_class)
    db.flush()
    spec = Spec(class_id=wow_class.id, name="Arcane", slug="arcane")
    db.add(spec)
    db.flush()
    guild = Guild(region_id=region.id, realm_id=realm.id, name="Score Guild", slug="score-guild", faction="Alliance")
    db.add(guild)
    db.flush()
    character = Character(
        region_id=region.id,
        realm_id=realm.id,
        guild_id=guild.id,
        class_id=wow_class.id,
        spec_id=spec.id,
        name="Aethryl",
        item_level=671.4,
        mythic_plus_score=3421.7,
        achievements={"Ahead of the Curve": True},
    )
    db.add(character)
    db.flush()
    db.add(GuildRosterMember(guild_id=guild.id, character_id=character.id, role="dps"))
    raid = Raid(name="Citadel", slug="citadel", is_current=True)
    db.add(raid)
    db.flush()
    boss = Boss(raid_id=raid.id, name="Harbinger", order_index=1)
    db.add(boss)
    db.flush()
    db.add(GuildRaidProgress(guild_id=guild.id, raid_id=raid.id, boss_id=boss.id, difficulty="mythic", defeated=True, pulls=18))
    db.commit()

    detail = GuildService(db).get_guild("us", "stormrage", "Score Guild")
    assert detail is not None
    assert detail.rank_profile.grade is not None
    assert detail.rank_profile.tier is not None
    assert detail.score_breakdown["completion"] >= 0
    db.close()


def test_character_detail_exposes_rank_profile():
    db = SessionLocal()
    region = Region(code="us", name="US")
    db.add(region)
    db.flush()
    realm = Realm(region_id=region.id, slug="stormrage", name="Stormrage")
    db.add(realm)
    db.flush()
    wow_class = WowClass(name="Priest", slug="priest")
    db.add(wow_class)
    db.flush()
    spec = Spec(class_id=wow_class.id, name="Discipline", slug="discipline")
    db.add(spec)
    db.flush()
    character = Character(
        region_id=region.id,
        realm_id=realm.id,
        class_id=wow_class.id,
        spec_id=spec.id,
        name="Lumivale",
        item_level=668.2,
        mythic_plus_score=3188.4,
        achievements={"Keystone Hero": True},
    )
    db.add(character)
    db.commit()

    detail = CharacterService(db).get_character("us", "stormrage", "Lumivale")
    assert detail is not None
    assert detail.rank_profile.score > 0
    assert detail.raid_parses["source"] == "scaffold-estimate"
    db.close()
