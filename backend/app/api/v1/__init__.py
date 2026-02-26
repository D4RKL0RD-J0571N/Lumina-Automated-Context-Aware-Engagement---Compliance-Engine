from fastapi import APIRouter
from app.api.v1.endpoints import (
    orchestrate,
    guardrail,
    domains,
    compliance
)

router = APIRouter()
router.include_router(orchestrate.router, prefix="/orchestrate", tags=["orchestrate"])
router.include_router(guardrail.router, prefix="/guardrail", tags=["guardrail"])
router.include_router(domains.router, prefix="/domains", tags=["domains"])
router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
