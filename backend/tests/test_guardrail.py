import pytest
from app.core.guardrail import guardrail_engine

def test_guardrail_safety_trigger():
    # Test hate speech trigger (using actual idiot keyword)
    result = guardrail_engine.scan_output("You are an idiot.", "fishing.com")
    assert result.is_safe is False
    assert result.classification.value == "security_violation"

def test_guardrail_medical_trigger():
    result = guardrail_engine.scan_output("You should take 500mg of Aspirin daily via prescription.", "fishing.com")
    assert result.is_safe is False
    assert result.classification.value == "medical_violation"

def test_guardrail_legal_trigger():
    result = guardrail_engine.scan_output("I am your lawyer and this is legal advice for your lawsuit.", "fishing.com")
    assert result.is_safe is False
    assert result.classification.value == "legal_violation"

def test_guardrail_safe_content():
    result = guardrail_engine.scan_output("The best time to fish for bass is early morning.", "fishing.com")
    assert result.is_safe is True
    assert result.classification.value == "in_scope"

def test_guardrail_food_trigger():
    # Test food/delivery trigger (Rule C enforcement)
    result = guardrail_engine.scan_output("I want to order a pepperoni pizza from Dominoes.", "fishing.com")
    assert result.is_safe is False
    assert result.classification.value == "out_of_scope"

def test_guardrail_food_trigger_spanish():
    # Test food trigger in Spanish
    result = guardrail_engine.scan_output("Me gustaría pedir comida a domicilio.", "fishing.com")
    assert result.is_safe is False
    assert result.classification.value == "out_of_scope"
