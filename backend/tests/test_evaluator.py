import pytest
from app.utils.evaluator import evaluator

def test_bleed_through_detection():
    # fishing.com response containing household terms should trigger bleed
    text = "To catch a fish, you first need a manual to repair your dryer hook."
    result = evaluator.evaluate_response(text, "fishing.com")
    
    # Based on actual lexicons in evaluator.py
    # 'manual', 'repair', 'dryer' are in householdmanuals.com lexicon
    assert result["is_bleeding"] is True
    assert any(ev["source_domain"] == "householdmanuals.com" for ev in result["bleed_events"])

def test_no_bleed_through():
    text = "The bass are biting on the northern shore of the lake today."
    result = evaluator.evaluate_response(text, "fishing.com")
    assert result["is_bleeding"] is False
