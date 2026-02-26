import pytest
from app.utils.redactor import redactor

def test_redact_email():
    text = "Contact me at test@example.com for more info."
    redacted = redactor.redact(text)
    assert "[EMAIL_REDACTED]" in redacted
    assert "test@example.com" not in redacted

def test_redact_phone():
    test_cases = [
        "Call 555-0199",
        "Reach me at (555) 555-0199",
        "International +1-800-555-0199"
    ]
    for case in test_cases:
        redacted = redactor.redact(case)
        assert "[PHONE_REDACTED]" in redacted
        assert "555-0199" not in redacted

def test_redact_credit_card():
    text = "My card number is 1234-5678-9012-3456."
    redacted = redactor.redact(text)
    assert "[CARD_REDACTED]" in redacted
    assert "1234" not in redacted

def test_no_pii_no_change():
    text = "This is a normal sentence about fishing."
    assert redactor.redact(text) == text
