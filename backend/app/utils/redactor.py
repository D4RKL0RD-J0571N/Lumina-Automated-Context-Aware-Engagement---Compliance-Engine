import re

class PIIRedactor:
    """
    Utility to redact PII (Personally Identifiable Information) from strings.
    Focuses on:
    - Email addresses
    - Phone numbers (US formats)
    - Potential credit card numbers (simple 16-digit patterns)
    """

    # Email pattern
    EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
    
    # Phone pattern (Supports 10-digit and 7-digit variants)
    PHONE_PATTERN = re.compile(r'(\+?\d{1,2}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{3}[-.\s]?\d{4}\b')

    # Credit Card pattern (Simple 16-digit)
    CC_PATTERN = re.compile(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b')

    @classmethod
    def redact(cls, text: str) -> str:
        if not text:
            return ""
        
        # Redact Emails
        text = cls.EMAIL_PATTERN.sub("[EMAIL_REDACTED]", text)
        
        # Redact Phones
        text = cls.PHONE_PATTERN.sub("[PHONE_REDACTED]", text)
        
        # Redact Credit Cards
        text = cls.CC_PATTERN.sub("[CARD_REDACTED]", text)
        
        return text

# Singleton
redactor = PIIRedactor()
