from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from app.schemas.guardrail import GuardrailResult

class OrchestrateRequest(BaseModel):
    user_input: str
    domain_name: str
    rag_context: Optional[str] = None
    stream: bool = False

class OrchestrateResponse(BaseModel):
    domain: str
    persona: str
    ai_response: str
    guardrail_result: GuardrailResult
    is_bleeding: bool = False
    bleed_events: List[Dict[str, Any]] = []
    latency_ms: Optional[float] = None
    tokens_used: Optional[int] = None
