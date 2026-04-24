from app.services.rank_intelligence import RankIntelligenceService


def test_grade_and_tier_mapping():
    service = RankIntelligenceService()
    assert service._grade_from_score(94) == "S"
    assert service._tier_from_score(84) == "Legend"
    assert service._tier_from_score(55) == "Challenger"
