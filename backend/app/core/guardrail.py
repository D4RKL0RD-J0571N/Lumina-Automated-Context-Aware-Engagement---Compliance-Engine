import re
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

    # 🔹 CROSS-DOMAIN SIGNATURES (For Out-of-Scope detection)
    DOMAIN_SIGNATURES = {
        "fishing.com": ["fishing", "bass", "lure", "tackle", "bait", "hook", "water", "catch", "release"],
        "householdmanuals.com": ["manual", "repair", "dryer", "hvac", "appliance", "breaker", "electrical", "diy", "fixit"],
        "localnews.org": ["council", "meeting", "local", "community", "news", "reporting", "detour", "street", "park proposal"]
    }

    # 🔹 GENERAL OUT-OF-SCOPE (Topics forbidden regardless of domain)
    FORBIDDEN_GENERAL_TOPICS = [
        "cars", "automotive", "sedan", "suv", "coupe", "convertible", "dealership",
        "astronomy", "space shuttle", "galaxies",
        "celebrity gossip", "hollywood",
        "sports scores", "nfl", "nba", "fifa",
        "recipe", "cooking tips", "how to bake",
        "food", "pizza", "burger", "restaurant", "taco bell", "mcdonalds",
        "ordering", "order for me", "delivery", "entregar", "comida", "pizzas",
        "ordenar", "restaurante", "hamburguesa",
        "stock market tips", "investment advice"
    ]

    @classmethod
    def scan_output(cls, message: str, domain_context: str = "") -> GuardrailResult:
        """
        Deterministically scan AI-generated output (or user input)
        against the Compliance Lexicon and Domain Boundaries.
        """
        msg_lower = message.lower()
        
        def find_trigger(keywords: List[str]) -> Optional[str]:
            for kw in keywords:
                # Use \b for word boundaries to prevent partial matches (e.g., "broadcast" catching "cast")
                if re.search(rf"\b{re.escape(kw.lower())}\b", msg_lower):
                    return kw
            return None

        # 1. Security Check (Highest Priority)
        security_trigger = find_trigger(cls.SECURITY_VIOLATION_KEYWORDS)
        if security_trigger:
            return GuardrailResult(
                classification=GuardrailClassification.SECURITY_VIOLATION,
                triggered_keywords=[security_trigger],
                is_safe=False,
                rejection_message="This output contains prohibited security-sensitive content."
            )
        
        # 2. General Knowledge / Out-of-Scope (Zero-Echo)
        general_trigger = find_trigger(cls.FORBIDDEN_GENERAL_TOPICS)
        if general_trigger:
             return GuardrailResult(
                classification=GuardrailClassification.OUT_OF_SCOPE,
                triggered_keywords=[general_trigger],
                is_safe=False,
                rejection_message=f"I am strictly authorized to assist with {domain_context or 'my assigned domain'}. General knowledge topics like '{general_trigger}' are outside my operational scope."
            )
        
        # 3. Medical Check (High Risk)
        medical_trigger = find_trigger(cls.MEDICAL_KEYWORDS)
        if medical_trigger:
            return GuardrailResult(
                classification=GuardrailClassification.MEDICAL_VIOLATION,
                triggered_keywords=[medical_trigger],
                is_safe=False,
                rejection_message="I cannot provide medical advice or handle medical emergencies."
            )

        # 4. Legal Check (Risk Mitigation)
        legal_trigger = find_trigger(cls.LEGAL_KEYWORDS)
        if legal_trigger:
            return GuardrailResult(
                classification=GuardrailClassification.LEGAL_VIOLATION,
                triggered_keywords=[legal_trigger],
                is_safe=False,
                rejection_message="I am not authorized to provide legal advice or discuss pending litigation."
            )

        # 5. Domain-Lock Check (Out of Scope)
        if domain_context:
            domain_context = domain_context.lower()
            for domain, keywords in cls.DOMAIN_SIGNATURES.items():
                if domain == domain_context:
                    continue
                
                # Count matches for sensitivity threshold
                matches = []
                for kw in keywords:
                    if re.search(rf"\b{re.escape(kw.lower())}\b", msg_lower):
                        matches.append(kw)
                
                # 💡 PROACTIVE RECOMMENDATION: 
                # Trigger if 2+ contextual keywords match, OR the primary (first) keyword matches.
                primary_match = re.search(rf"\b{re.escape(keywords[0].lower())}\b", msg_lower)
                
                if len(matches) >= 2 or (len(matches) == 1 and primary_match):
                    domain_label = domain.split('.')[0]
                    return GuardrailResult(
                        classification=GuardrailClassification.OUT_OF_SCOPE,
                        triggered_keywords=matches,
                        is_safe=False,
                        rejection_message=f"I am strictly authorized for {domain_context}. However, I detected interest in {domain_label}. Please switch to the {domain} domain for specialized assistance."
                    )

        # 6. Ad-Policy / Monetization Check
        ad_trigger = find_trigger(cls.AD_POLICY_KEYWORDS)
        if ad_trigger:
            return GuardrailResult(
                classification=GuardrailClassification.AD_POLICY_VIOLATION,
                triggered_keywords=[ad_trigger],
                is_safe=False,
                rejection_message="This content violates our advertising and monetization safety guidelines."
            )
            
        return GuardrailResult(
            classification=GuardrailClassification.IN_SCOPE,
            triggered_keywords=[],
            is_safe=True
        )

guardrail_engine = GuardrailEngine()
