from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from statistics import mean

from app.models import Boss, Character, Guild, GuildRaidProgress, GuildRosterMember, MythicRun
from app.schemas.ranking import RankProfile, ScoreDimension
from app.services.progress_engine import ProgressEngine


@dataclass
class GuildScoreData:
    profile: RankProfile
    boss_kills: int
    progression_velocity: float
    momentum_score: float
    recent_kills: int
    total_pulls: int
    score_breakdown: dict


@dataclass
class MythicScoreData:
    profile: RankProfile
    timed_ratio: float
    score_breakdown: dict


@dataclass
class CharacterScoreData:
    profile: RankProfile
    parse_estimate: float
    score_breakdown: dict


class RankIntelligenceService:
    def __init__(self):
        self.progress_engine = ProgressEngine()

    def build_guild_score(
        self,
        guild: Guild,
        rows: list[GuildRaidProgress],
        roster: list[GuildRosterMember],
        total_bosses: int,
    ) -> GuildScoreData:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        roster_characters = [member.character for member in roster if member.character]
        roster_size = len(roster_characters)
        avg_ilvl = mean([character.item_level for character in roster_characters]) if roster_characters else 0.0
        avg_mplus = mean([character.mythic_plus_score for character in roster_characters]) if roster_characters else 0.0

        defeated_rows = [row for row in rows if row.defeated]
        boss_kills = len(defeated_rows)
        total_pulls = sum(row.pulls for row in rows)
        recent_kills = sum(
            1
            for row in defeated_rows
            if row.kill_timestamp and row.kill_timestamp >= now - timedelta(hours=36)
        )

        total_bosses = max(total_bosses, len(rows), 1)
        completion = self._clamp((boss_kills / total_bosses) * 100, 0, 100)

        avg_pulls_per_kill = total_pulls / max(boss_kills, 1)
        efficiency = self._clamp(100 - max(avg_pulls_per_kill - 8, 0) * 4.2 - max(total_pulls - (boss_kills * 12), 0) * 0.12, 32, 99)
        roster_strength = self._clamp(42 + min(roster_size * 6.5, 28) + max(avg_ilvl - 640, 0) * 0.55, 35, 98)
        activity = self._clamp((avg_mplus / 40 if avg_mplus else 25) + recent_kills * 9 + min(roster_size * 2.2, 18), 28, 100)
        momentum = self._clamp(
            self.progress_engine.momentum_score(
                recent_kills=recent_kills,
                roster_stability=min(roster_strength / 100, 1),
                wipe_efficiency=min(efficiency / 100, 1),
            ),
            0,
            100,
        )

        composite = round(
            (completion * 0.38)
            + (efficiency * 0.20)
            + (roster_strength * 0.18)
            + (activity * 0.14)
            + (momentum * 0.10),
            2,
        )

        confidence = round(self._clamp(48 + len(rows) * 6 + roster_size * 2.5, 45, 98), 1)
        trend = self._trend_from_guild_metrics(recent_kills=recent_kills, completion=completion, efficiency=efficiency, total_pulls=total_pulls)

        progression_velocity = round(
            self.progress_engine.progression_velocity(
                defeated_bosses=boss_kills,
                elapsed_days=self._elapsed_days(defeated_rows),
            ),
            2,
        )

        dimensions = [
            self._dimension("progression", "Progression", completion, self._guild_progress_note(completion, total_bosses, boss_kills)),
            self._dimension("execution", "Execution", efficiency, self._guild_execution_note(efficiency, total_pulls, boss_kills)),
            self._dimension("roster", "Roster", roster_strength, self._guild_roster_note(roster_size, avg_ilvl)),
            self._dimension("activity", "Activity", activity, self._guild_activity_note(recent_kills, avg_mplus)),
            self._dimension("momentum", "Momentum", momentum, self._guild_momentum_note(momentum, trend)),
        ]

        explanation = self._compose_explanation(
            label=guild.name,
            tier=self._tier_from_score(composite),
            grade=self._grade_from_score(composite),
            strongest=max(dimensions, key=lambda item: item.score),
            weakest=min(dimensions, key=lambda item: item.score),
        )

        profile = RankProfile(
            score=composite,
            grade=self._grade_from_score(composite),
            tier=self._tier_from_score(composite),
            trend=trend,
            confidence=confidence,
            explanation=explanation,
            dimensions=dimensions,
        )

        return GuildScoreData(
            profile=profile,
            boss_kills=boss_kills,
            progression_velocity=progression_velocity,
            momentum_score=round(momentum, 2),
            recent_kills=recent_kills,
            total_pulls=total_pulls,
            score_breakdown={
                "completion": round(completion, 2),
                "efficiency": round(efficiency, 2),
                "roster_strength": round(roster_strength, 2),
                "activity": round(activity, 2),
                "momentum": round(momentum, 2),
            },
        )

    def build_mythic_score(self, run: MythicRun, peer_runs: list[MythicRun], top_score: float) -> MythicScoreData:
        top_score = max(top_score, run.score, 1)
        best_level = max((candidate.keystone_level for candidate in peer_runs), default=run.keystone_level)
        timed_ratio = round(
            (sum(1 for candidate in peer_runs if candidate.completed_in_time) / max(len(peer_runs), 1)) * 100,
            1,
        )
        score_power = self._clamp((run.score / top_score) * 100, 0, 100)
        execution = self._clamp(52 + (18 if run.completed_in_time else -8) + run.keystone_level * 2.3, 30, 99)
        route_stability = self._clamp(40 + timed_ratio * 0.45 + best_level * 1.4, 35, 97)
        pressure = self._clamp(35 + run.keystone_level * 3.4 + (12 if run.completed_in_time else 0), 30, 99)
        composite = round((score_power * 0.45) + (execution * 0.25) + (route_stability * 0.18) + (pressure * 0.12), 2)
        trend = "surging" if run.completed_in_time and run.keystone_level >= 18 else "rising" if run.completed_in_time else "steady"

        dimensions = [
            self._dimension("run_score", "Run Score", score_power, f"Normalized against the current ladder leader at {top_score:.1f}."),
            self._dimension("execution", "Execution", execution, "Timing the key and maintaining clean execution pushes this score." if run.completed_in_time else "Untimed key reduces execution confidence."),
            self._dimension("consistency", "Consistency", route_stability, f"Timed ratio across recent runs is {timed_ratio:.1f}% for this team sample."),
            self._dimension("pressure", "Pressure", pressure, f"Key level {run.keystone_level} drives the pressure and prestige component."),
        ]

        profile = RankProfile(
            score=composite,
            grade=self._grade_from_score(composite),
            tier=self._tier_from_score(composite),
            trend=trend,
            confidence=round(self._clamp(55 + len(peer_runs) * 5, 50, 97), 1),
            explanation=self._compose_explanation(
                label=run.guild.name if run.guild else f"Team {run.id}",
                tier=self._tier_from_score(composite),
                grade=self._grade_from_score(composite),
                strongest=max(dimensions, key=lambda item: item.score),
                weakest=min(dimensions, key=lambda item: item.score),
            ),
            dimensions=dimensions,
        )
        return MythicScoreData(
            profile=profile,
            timed_ratio=timed_ratio,
            score_breakdown={
                "score_power": round(score_power, 2),
                "execution": round(execution, 2),
                "route_stability": round(route_stability, 2),
                "pressure": round(pressure, 2),
            },
        )

    def build_character_score(
        self,
        character: Character,
        guild_profile: RankProfile | None = None,
        live_parse_estimate: float | None = None,
        parse_source: str | None = None,
    ) -> CharacterScoreData:
        achievement_names = list((character.achievements or {}).keys())
        achievement_weight = 0
        achievement_weights = {
            "cutting edge": 34,
            "ahead of the curve": 22,
            "mythic raider": 20,
            "keystone hero": 18,
            "keystone master": 14,
        }
        for name in achievement_names:
            achievement_weight += achievement_weights.get(name.lower(), 10)
        achievement_score = self._clamp(35 + achievement_weight, 35, 98)
        mplus_score = self._clamp(character.mythic_plus_score / 38, 0, 100)
        gear_score = self._clamp(28 + max(character.item_level - 630, 0) * 1.45, 25, 98)
        parse_estimate = live_parse_estimate
        if parse_estimate is None:
            parse_estimate = self._clamp((mplus_score * 0.55) + (achievement_score * 0.25) + (gear_score * 0.20), 30, 99)
        else:
            parse_estimate = self._clamp(parse_estimate, 0, 99)
        guild_influence = guild_profile.score if guild_profile else 55.0
        composite = round(
            (mplus_score * 0.34)
            + (gear_score * 0.22)
            + (achievement_score * 0.20)
            + (parse_estimate * 0.14)
            + (guild_influence * 0.10),
            2,
        )
        trend = "surging" if character.mythic_plus_score >= 3400 else "rising" if character.mythic_plus_score >= 3000 else "steady"
        dimensions = [
            self._dimension("dungeons", "Dungeon Form", mplus_score, f"Mythic+ score currently sits at {character.mythic_plus_score:.1f}."),
            self._dimension("gear", "Gear Readiness", gear_score, f"Item level {character.item_level:.1f} keeps this profile raid-ready."),
            self._dimension("accolades", "Accolades", achievement_score, f"Tracked achievement weight reached {achievement_weight} points."),
            self._dimension(
                "execution",
                "Execution",
                parse_estimate,
                "Derived from live Warcraft Logs parse data." if parse_source == "warcraftlogs" else "Estimated from score, gear, and accolades until live logs are connected.",
            ),
        ]
        profile = RankProfile(
            score=composite,
            grade=self._grade_from_score(composite),
            tier=self._tier_from_score(composite),
            trend=trend,
            confidence=round(self._clamp(58 + len(achievement_names) * 7 + (8 if character.guild_id else 0), 52, 96), 1),
            explanation=self._compose_explanation(
                label=character.name,
                tier=self._tier_from_score(composite),
                grade=self._grade_from_score(composite),
                strongest=max(dimensions, key=lambda item: item.score),
                weakest=min(dimensions, key=lambda item: item.score),
            ),
            dimensions=dimensions,
        )
        return CharacterScoreData(
            profile=profile,
            parse_estimate=round(parse_estimate, 1),
            score_breakdown={
                "mplus": round(mplus_score, 2),
                "gear": round(gear_score, 2),
                "achievements": round(achievement_score, 2),
                "execution": round(parse_estimate, 2),
                "guild_influence": round(guild_influence, 2),
            },
        )

    def infer_total_bosses(self, bosses: list[Boss], rows: list[GuildRaidProgress]) -> int:
        return max(len(bosses), len({row.boss_id for row in rows}), 1)

    def _elapsed_days(self, defeated_rows: list[GuildRaidProgress]) -> int:
        timestamps = [row.kill_timestamp for row in defeated_rows if row.kill_timestamp]
        if len(timestamps) < 2:
            return 1 if timestamps else 0
        elapsed = max(timestamps) - min(timestamps)
        return max(elapsed.days, 1)

    def _dimension(self, key: str, label: str, score: float, note: str) -> ScoreDimension:
        score = round(score, 1)
        return ScoreDimension(
            key=key,
            label=label,
            score=score,
            grade=self._grade_from_score(score),
            note=note,
        )

    def _guild_progress_note(self, completion: float, total_bosses: int, boss_kills: int) -> str:
        return f"{boss_kills}/{total_bosses} tracked bosses defeated, setting the core prestige weight for the ladder."

    def _guild_execution_note(self, efficiency: float, total_pulls: int, boss_kills: int) -> str:
        if boss_kills == 0:
            return "No confirmed kills yet, so execution is based on attempt pressure only."
        avg_pulls = total_pulls / max(boss_kills, 1)
        return f"Average pull load sits at {avg_pulls:.1f} per kill across {total_pulls} total pulls."

    def _guild_roster_note(self, roster_size: int, avg_ilvl: float) -> str:
        return f"Roster sample includes {roster_size} visible characters with average item level {avg_ilvl:.1f}."

    def _guild_activity_note(self, recent_kills: int, avg_mplus: float) -> str:
        return f"Recent kill pressure is {recent_kills} and average Mythic+ form sits at {avg_mplus:.1f}."

    def _guild_momentum_note(self, momentum: float, trend: str) -> str:
        return f"Momentum currently reads as {trend}, anchored by a momentum score of {momentum:.1f}."

    def _compose_explanation(self, label: str, tier: str, grade: str, strongest: ScoreDimension, weakest: ScoreDimension) -> str:
        return (
            f"{label} lands in tier {tier} with grade {grade}. "
            f"Best dimension: {strongest.label} ({strongest.score:.1f}). "
            f"Biggest upgrade path: {weakest.label} ({weakest.score:.1f})."
        )

    def _trend_from_guild_metrics(self, recent_kills: int, completion: float, efficiency: float, total_pulls: int) -> str:
        if recent_kills >= 2 and efficiency >= 68:
            return "surging"
        if recent_kills >= 1 or completion >= 45:
            return "rising"
        if total_pulls >= 55 and efficiency < 55:
            return "pressured"
        if completion < 15:
            return "forming"
        return "steady"

    def _grade_from_score(self, score: float) -> str:
        thresholds = [
            (96, "S+"),
            (92, "S"),
            (88, "A+"),
            (82, "A"),
            (76, "A-"),
            (70, "B+"),
            (64, "B"),
            (58, "B-"),
            (52, "C+"),
            (46, "C"),
            (40, "C-"),
            (0, "D"),
        ]
        for threshold, grade in thresholds:
            if score >= threshold:
                return grade
        return "D"

    def _tier_from_score(self, score: float) -> str:
        if score >= 92:
            return "Mythic Elite"
        if score >= 82:
            return "Legend"
        if score >= 72:
            return "Champion"
        if score >= 60:
            return "Contender"
        if score >= 48:
            return "Challenger"
        return "Aspirant"

    def _clamp(self, value: float, minimum: float, maximum: float) -> float:
        return max(minimum, min(value, maximum))
