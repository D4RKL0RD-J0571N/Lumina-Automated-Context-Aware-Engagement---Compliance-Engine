from typing import List, Optional, Tuple
from app.schemas.guardrail import GuardrailClassification, GuardrailResult

class GuardrailEngine:
    # 🔹 CORE SETTINGS: High-Risk Deterministic Boundaries
    # These override any LLM prompt instructions.
    
    SECURITY_VIOLATION_KEYWORDS = [
        "hacker", "exploit", "sql injection", "bypass authentication",
        "maldito", "pendejo", "estúpido", # Multilingual abuse (from CRM repo)
        "idiot", "dumbass", "fuck", "bitch"
    ]
    
    LEGAL_KEYWORDS = [
        "lawsuit", "legal advice", "sue you", "legal document",
        "abogado", "ley", "demanda", "juicio"
    ]
    
    MEDICAL_KEYWORDS = [
        "diagnose", "treatment plan", "medical advice", "prescription",
        "médico", "herida", "sangre", "hospital", "ambulancia"
    ]

    # 🔹 AD-POLICY & REVENUE PROTECTION (Unique to Lumina)
    AD_POLICY_KEYWORDS = [
        "buy direct", "get rich quick", "pyramid scheme", "scam",
        "click here for free money", "casino", "gambling", "adult content"
    ]

    @classmethod
    def scan_output(cls, message: str, domain_context: str = "") -> GuardrailResult:
        """
        Deterministically scan AI-generated output (or user input)
        against the Compliance Lexicon.
        """
        msg_lower = message.lower()
        
        # 1. Security Check (Highest Priority)
        security_triggers = [kw for kw in cls.SECURITY_VIOLATION_KEYWORDS if kw in msg_lower]
        if security_triggers:
            return GuardrailResult(
                classification=GuardrailClassification.SECURITY_VIOLATION,
                triggered_keywords=security_triggers,
                is_safe=False,
                rejection_message="This output contains prohibited security-sensitive content."
            )
        
        # 2. Medical Check (High Risk)
        medical_triggers = [kw for kw in cls.MEDICAL_KEYWORDS if kw in msg_lower]
        if medical_triggers:
            return GuardrailResult(
                classification=GuardrailClassification.MEDICAL_VIOLATION,
                triggered_keywords=medical_triggers,
                is_safe=False,
                rejection_message="I cannot provide medical advice or handle medical emergencies."
            )

        # 3. Legal Check (Risk Mitigation)
        legal_triggers = [kw for kw in cls.LEGAL_KEYWORDS if kw in msg_lower]
        if legal_triggers:
            return GuardrailResult(
                classification=GuardrailClassification.LEGAL_VIOLATION,
                triggered_keywords=legal_triggers,
                is_safe=False,
                rejection_message="I am not authorized to provide legal advice or discuss pending litigation."
            )

        # 4. Ad-Policy / Monetization Check
        ad_triggers = [kw for kw in cls.AD_POLICY_KEYWORDS if kw in msg_lower]
        if ad_triggers:
            return GuardrailResult(
                classification=GuardrailClassification.AD_POLICY_VIOLATION,
                triggered_keywords=ad_triggers,
                is_safe=False,
                rejection_message="This content violates our advertising and monetization safety guidelines."
            )
            
        return GuardrailResult(
            classification=GuardrailClassification.IN_SCOPE,
            triggered_keywords=[],
            is_safe=True
        )

guardrail_engine = GuardrailEngine()
