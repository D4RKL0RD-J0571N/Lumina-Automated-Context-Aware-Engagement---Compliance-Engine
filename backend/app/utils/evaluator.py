from typing import Dict, List, Any
import re

class BleedThroughEvaluator:
    """
    Analyzes AI responses for 'Bleed-through'—when information from 
    one domain incorrectly appears in another.
    (Objective for Phase 2: Optimization)
    """

    # 🔹 Domain-specific signature keywords (Lexicons)
    SIGNATURES: Dict[str, List[str]] = {
        "fishing.com": ["fishing", "bass", "lure", "tackle", "bait", "hook", "water", "catch", "release"],
        "householdmanuals.com": ["manual", "repair", "dryer", "hvac", "appliance", "breaker", "electrical", "diy", "fixit"],
        "localnews.org": ["council", "meeting", "local", "community", "news", "reporting", "detour", "street", "park proposal"]
    }

    @classmethod
    def evaluate_response(cls, response: str, current_domain: str) -> Dict[str, Any]:
        """
        Scans response for keywords of OTHER domains.
        """
        response_lower = response.lower()
        bleed_events = []
        is_bleeding = False

        for domain, keywords in cls.SIGNATURES.items():
            if domain == current_domain.lower():
                continue
            
            # Find any keyword from another domain
            found_keywords = [kw for kw in keywords if re.search(rf'\b{kw}\b', response_lower)]
            
            if found_keywords:
                is_bleeding = True
                bleed_events.append({
                    "source_domain": domain,
                    "leaked_context": found_keywords
                })

        return {
            "is_bleeding": is_bleeding,
            "bleed_events": bleed_events,
            "current_domain": current_domain
        }

evaluator = BleedThroughEvaluator()
