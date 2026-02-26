from fastapi import APIRouter
from app.core.guardrail import guardrail_engine

router = APIRouter()

@router.get("/metrics")
async def get_compliance_metrics():
    """
    Exposes Lumina Engine compliance and audit stats.
    Integrated into Prometheus/Grafana (per Technical Design).
    """
    # Mocked metrics (normally pulled from Redis or Prometheus client)
    return {
        "total_requests": 1420,
        "security_violations": 12,
        "legal_violations": 5,
        "medical_violations": 8,
        "ad_policy_violations": 15,
        "bleed_through_events": 22,
        "avg_latency_ms": 115.4,
        "compliance_pass_rate": "97.18%"
    }
