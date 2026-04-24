class ProgressEngine:
    def progression_velocity(self, defeated_bosses: int, elapsed_days: int) -> float:
        if elapsed_days <= 0:
            return float(defeated_bosses)
        return round(defeated_bosses / elapsed_days, 2)

    def momentum_score(self, recent_kills: int, roster_stability: float, wipe_efficiency: float) -> float:
        return round((recent_kills * 8) + (roster_stability * 35) + (wipe_efficiency * 25), 2)
