from datetime import datetime, timezone


def utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow_naive)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow_naive, onupdate=utcnow_naive)


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)


class AdminSettings(TimestampMixin, Base):
    __tablename__ = "admin_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    provider_settings: Mapped[dict] = mapped_column(JSON, default=dict)
    feature_flags: Mapped[dict] = mapped_column(JSON, default=dict)


class Region(Base):
    __tablename__ = "regions"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))


class Realm(Base):
    __tablename__ = "realms"

    id: Mapped[int] = mapped_column(primary_key=True)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"), index=True)
    slug: Mapped[str] = mapped_column(String(120), index=True)
    name: Mapped[str] = mapped_column(String(120))
    region: Mapped["Region"] = relationship()


class WowClass(Base):
    __tablename__ = "classes"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)


class Spec(Base):
    __tablename__ = "specs"

    id: Mapped[int] = mapped_column(primary_key=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id"))
    name: Mapped[str] = mapped_column(String(80))
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    wow_class: Mapped["WowClass"] = relationship()


class Guild(TimestampMixin, Base):
    __tablename__ = "guilds"

    id: Mapped[int] = mapped_column(primary_key=True)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"), index=True)
    realm_id: Mapped[int] = mapped_column(ForeignKey("realms.id"), index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    slug: Mapped[str] = mapped_column(String(255), index=True)
    faction: Mapped[str | None] = mapped_column(String(32), nullable=True)
    recruitment_status: Mapped[str | None] = mapped_column(String(64), nullable=True)

    region: Mapped["Region"] = relationship()
    realm: Mapped["Realm"] = relationship()
    roster: Mapped[list["GuildRosterMember"]] = relationship(back_populates="guild")


class Character(TimestampMixin, Base):
    __tablename__ = "characters"

    id: Mapped[int] = mapped_column(primary_key=True)
    region_id: Mapped[int] = mapped_column(ForeignKey("regions.id"), index=True)
    realm_id: Mapped[int] = mapped_column(ForeignKey("realms.id"), index=True)
    guild_id: Mapped[int | None] = mapped_column(ForeignKey("guilds.id"), nullable=True, index=True)
    class_id: Mapped[int | None] = mapped_column(ForeignKey("classes.id"), nullable=True)
    spec_id: Mapped[int | None] = mapped_column(ForeignKey("specs.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    item_level: Mapped[float] = mapped_column(Float, default=0)
    mythic_plus_score: Mapped[float] = mapped_column(Float, default=0)
    achievements: Mapped[dict] = mapped_column(JSON, default=dict)

    region: Mapped["Region"] = relationship()
    realm: Mapped["Realm"] = relationship()
    guild: Mapped["Guild"] = relationship()
    wow_class: Mapped["WowClass"] = relationship()
    spec: Mapped["Spec"] = relationship()


class GuildRosterMember(Base):
    __tablename__ = "guild_roster_members"

    id: Mapped[int] = mapped_column(primary_key=True)
    guild_id: Mapped[int] = mapped_column(ForeignKey("guilds.id"), index=True)
    character_id: Mapped[int] = mapped_column(ForeignKey("characters.id"), index=True)
    role: Mapped[str | None] = mapped_column(String(32), nullable=True)

    guild: Mapped["Guild"] = relationship(back_populates="roster")
    character: Mapped["Character"] = relationship()


class Raid(Base):
    __tablename__ = "raids"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expansion: Mapped[str | None] = mapped_column(String(120), nullable=True)
    season: Mapped[str | None] = mapped_column(String(120), nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)


class Boss(Base):
    __tablename__ = "bosses"

    id: Mapped[int] = mapped_column(primary_key=True)
    raid_id: Mapped[int] = mapped_column(ForeignKey("raids.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    raid: Mapped["Raid"] = relationship()


class GuildRaidProgress(TimestampMixin, Base):
    __tablename__ = "guild_raid_progress"

    id: Mapped[int] = mapped_column(primary_key=True)
    guild_id: Mapped[int] = mapped_column(ForeignKey("guilds.id"), index=True)
    raid_id: Mapped[int] = mapped_column(ForeignKey("raids.id"), index=True)
    boss_id: Mapped[int] = mapped_column(ForeignKey("bosses.id"), index=True)
    difficulty: Mapped[str] = mapped_column(String(32))
    defeated: Mapped[bool] = mapped_column(Boolean, default=False)
    pulls: Mapped[int] = mapped_column(Integer, default=0)
    kill_timestamp: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    guild: Mapped["Guild"] = relationship()
    raid: Mapped["Raid"] = relationship()
    boss: Mapped["Boss"] = relationship()


class CharacterProgress(TimestampMixin, Base):
    __tablename__ = "character_progress"

    id: Mapped[int] = mapped_column(primary_key=True)
    character_id: Mapped[int] = mapped_column(ForeignKey("characters.id"), index=True)
    raid_id: Mapped[int] = mapped_column(ForeignKey("raids.id"), index=True)
    performance_metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    character: Mapped["Character"] = relationship()
    raid: Mapped["Raid"] = relationship()


class MythicDungeon(Base):
    __tablename__ = "mythic_dungeons"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    season: Mapped[str | None] = mapped_column(String(120), nullable=True)


class MythicRun(TimestampMixin, Base):
    __tablename__ = "mythic_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    dungeon_id: Mapped[int] = mapped_column(ForeignKey("mythic_dungeons.id"), index=True)
    guild_id: Mapped[int | None] = mapped_column(ForeignKey("guilds.id"), nullable=True)
    score: Mapped[float] = mapped_column(Float, default=0)
    keystone_level: Mapped[int] = mapped_column(Integer, default=0)
    completed_in_time: Mapped[bool] = mapped_column(Boolean, default=False)

    dungeon: Mapped["MythicDungeon"] = relationship()
    guild: Mapped["Guild"] = relationship()


class RankingSnapshot(TimestampMixin, Base):
    __tablename__ = "ranking_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    ladder_type: Mapped[str] = mapped_column(String(64), index=True)
    scope: Mapped[str] = mapped_column(String(64), index=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)


class ProviderSyncJob(TimestampMixin, Base):
    __tablename__ = "provider_sync_jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    provider: Mapped[str] = mapped_column(String(64), index=True)
    job_type: Mapped[str] = mapped_column(String(64), index=True)
    status: Mapped[str] = mapped_column(String(32), default="queued")
    payload: Mapped[dict] = mapped_column(JSON, default=dict)


class EntityScoreSnapshot(TimestampMixin, Base):
    __tablename__ = "entity_score_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    entity_type: Mapped[str] = mapped_column(String(32), index=True)
    entity_id: Mapped[int] = mapped_column(Integer, index=True)
    entity_label: Mapped[str] = mapped_column(String(255), index=True)
    scope: Mapped[str] = mapped_column(String(64), default="world", index=True)
    rank_position: Mapped[int | None] = mapped_column(Integer, nullable=True)
    score: Mapped[float] = mapped_column(Float, default=0)
    grade: Mapped[str | None] = mapped_column(String(8), nullable=True)
    tier: Mapped[str | None] = mapped_column(String(64), nullable=True)
    trend: Mapped[str | None] = mapped_column(String(32), nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    dimensions: Mapped[dict] = mapped_column(JSON, default=dict)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)


class AuditLog(TimestampMixin, Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    actor: Mapped[str | None] = mapped_column(String(255), nullable=True)
    action: Mapped[str] = mapped_column(String(255))
    details: Mapped[dict] = mapped_column(JSON, default=dict)


class MetaCompositionSnapshot(TimestampMixin, Base):
    __tablename__ = "meta_composition_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    scope: Mapped[str] = mapped_column(String(120))
    data: Mapped[dict] = mapped_column(JSON, default=dict)


class ProgressForecast(TimestampMixin, Base):
    __tablename__ = "progress_forecasts"

    id: Mapped[int] = mapped_column(primary_key=True)
    guild_id: Mapped[int] = mapped_column(ForeignKey("guilds.id"), index=True)
    raid_id: Mapped[int] = mapped_column(ForeignKey("raids.id"), index=True)
    confidence: Mapped[float] = mapped_column(Float, default=0)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    guild: Mapped["Guild"] = relationship()
    raid: Mapped["Raid"] = relationship()
