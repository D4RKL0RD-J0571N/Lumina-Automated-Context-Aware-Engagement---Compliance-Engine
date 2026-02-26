from typing import List, Optional
from pydantic import BaseModel
from enum import Enum

class GuardrailClassification(str, Enum):
    SECURITY_VIOLATION = "security_violation"
    LEGAL_VIOLATION = "legal_violation"
    MEDICAL_VIOLATION = "medical_violation"
    AD_POLICY_VIOLATION = "ad_policy_violation"
    OUT_OF_SCOPE = "out_of_scope"
    IN_SCOPE = "in_scope"

class GuardrailResult(BaseModel):
    classification: GuardrailClassification
    triggered_keywords: List[str]
    is_safe: bool
    rejection_message: Optional[str] = None
