from app.services.progress_engine import ProgressEngine


def test_progression_velocity():
    engine = ProgressEngine()
    assert engine.progression_velocity(6, 3) == 2.0


def test_momentum_score():
    engine = ProgressEngine()
    assert engine.momentum_score(3, 0.9, 0.8) > 0
