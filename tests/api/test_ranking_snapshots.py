from app.db.session import Base, SessionLocal, engine
from app.models import Guild, RankingSnapshot, Realm, Region
from app.services.ranking_engine import RankingEngine


def setup_function():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def teardown_function():
    Base.metadata.drop_all(bind=engine)


def test_snapshot_is_used_when_available():
    db = SessionLocal()
    snapshot = RankingSnapshot(
        ladder_type="guilds",
        scope="world",
        payload={
            "ladder": "guilds",
            "scope": "world",
            "entries": [{"rank": 1, "label": "Snapshot Guild", "score": 999.0, "metadata": {}}],
        },
    )
    db.add(snapshot)
    db.commit()

    response = RankingEngine(db).guild_ladder(region="world")
    assert response.source == "snapshot"
    assert response.entries[0].label == "Snapshot Guild"
    db.close()


def test_fresh_bypasses_snapshot():
    db = SessionLocal()
    region = Region(code="us", name="US")
    db.add(region)
    db.flush()
    realm = Realm(region_id=region.id, slug="stormrage", name="Stormrage")
    db.add(realm)
    db.flush()
    guild = Guild(region_id=region.id, realm_id=realm.id, name="Live Guild", slug="live-guild", faction="Alliance")
    db.add(guild)
    db.commit()

    response = RankingEngine(db).guild_ladder(region="world", use_snapshot=False)
    assert response.source == "computed"
    assert response.entries[0].label == "Live Guild"
    db.close()
