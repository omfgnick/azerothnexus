from app.db.session import Base, SessionLocal, engine
from app.models import Character, Guild, Realm, Region, Spec, WowClass
from app.services.search_service import SearchService


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def teardown_function():
    Base.metadata.drop_all(bind=engine)


def seed_search_data(db):
    us = Region(code="us", name="United States")
    eu = Region(code="eu", name="Europe")
    db.add_all([us, eu])
    db.flush()

    stormrage = Realm(region_id=us.id, slug="stormrage", name="Stormrage")
    tarren = Realm(region_id=eu.id, slug="tarren-mill", name="Tarren Mill")
    db.add_all([stormrage, tarren])
    db.flush()

    mage = WowClass(name="Mage", slug="mage")
    evoker = WowClass(name="Evoker", slug="evoker")
    db.add_all([mage, evoker])
    db.flush()

    arcane = Spec(class_id=mage.id, name="Arcane", slug="arcane")
    augmentation = Spec(class_id=evoker.id, name="Augmentation", slug="augmentation")
    db.add_all([arcane, augmentation])
    db.flush()

    guild_a = Guild(region_id=us.id, realm_id=stormrage.id, name="Void Vanguard", slug="void-vanguard", faction="Alliance")
    guild_b = Guild(region_id=eu.id, realm_id=tarren.id, name="Astral Dominion", slug="astral-dominion", faction="Horde")
    db.add_all([guild_a, guild_b])
    db.flush()

    db.add_all(
        [
            Character(
                region_id=us.id,
                realm_id=stormrage.id,
                guild_id=guild_a.id,
                class_id=mage.id,
                spec_id=arcane.id,
                name="Aethryl",
                mythic_plus_score=3420.0,
                item_level=671.1,
            ),
            Character(
                region_id=eu.id,
                realm_id=tarren.id,
                guild_id=guild_b.id,
                class_id=evoker.id,
                spec_id=augmentation.id,
                name="Seraphae",
                mythic_plus_score=3388.0,
                item_level=669.4,
            ),
        ]
    )
    db.commit()


def test_search_returns_guild_character_realm_region_context():
    db = SessionLocal()
    seed_search_data(db)

    result = SearchService(db).search("storm")
    types = {item.type for item in result.results}

    assert "guild" in types
    assert "character" in types
    assert "realm" in types
    assert result.total_results >= 3
    db.close()


def test_search_respects_region_and_type_filters():
    db = SessionLocal()
    seed_search_data(db)

    result = SearchService(db).search("astral", region="eu", entity_type="guild")

    assert result.total_results == 1
    assert result.results[0].type == "guild"
    assert result.results[0].region == "eu"
    assert result.results[0].label == "Astral Dominion"
    db.close()


def test_autocomplete_supports_guild_filter_for_characters():
    db = SessionLocal()
    seed_search_data(db)

    result = SearchService(db).autocomplete("ae", guild="Void Vanguard", entity_type="character")

    assert result.total_results == 1
    assert result.results[0].label == "Aethryl"
    assert result.results[0].guild == "Void Vanguard"
    db.close()
