from fastapi import APIRouter
from app.schemas.guardrail import GuardrailResult
from app.core.guardrail import guardrail_engine

router = APIRouter()

@router.post("/scan", response_model=GuardrailResult)
async def scan_content(content: str):
    """
    Direct access to the Guardrail Engine to test compliance 
    without generating a full LLM response.
    """
    return guardrail_engine.scan_output(content)

@router.get("/rules")
async def list_active_rules():
    """
    Exposes the active Compliance Lexicon rules categories.
    """
    return {
        "security": len(guardrail_engine.SECURITY_VIOLATION_KEYWORDS),
        "legal": len(guardrail_engine.LEGAL_KEYWORDS),
        "medical": len(guardrail_engine.MEDICAL_KEYWORDS),
        "ad_policy": len(guardrail_engine.AD_POLICY_KEYWORDS)
    }
