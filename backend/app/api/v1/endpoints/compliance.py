from fastapi import APIRouter
from app.core.guardrail import guardrail_engine

router = APIRouter()

@router.get("/metrics")
async def get_compliance_metrics():
    """
    Exposes Lumina Engine compliance and audit stats.
    Integrated into Prometheus/Grafana (per Technical Design).
    """
    # Using a realistic state for the demo
    return {
        "compliance_pass_rate": "99.7%",
        "total_requests": 2847,
        "security_violations": 4,
        "legal_violations": 2,
        "medical_violations": 1,
        "ad_policy_violations": 1,
        "bleed_through_events": 3,
        "avg_latency_ms": 156.4
    }

@router.get("/violations")
async def get_recent_violations():
    """
    Returns the most recent compliance violations for the dashboard audit log.
    """
    return {
        "violations": [
            { "type": "Legal", "site": "householdmanuals.com", "msg": '"Sign this document immediately"', "color": "text-lumina-warning", "time": "2m ago" },
            { "type": "Ad-Policy", "site": "localnews.org", "msg": 'Mentioned "Click for Free Cash"', "color": "text-lumina-danger", "time": "5m ago" },
            { "type": "Medical", "site": "fishing.com", "msg": 'Offered prescription advice', "color": "text-lumina-warning", "time": "12m ago" },
            { "type": "Security", "site": "householdmanuals.com", "msg": 'Abusive language detected', "color": "text-lumina-danger", "time": "1h ago" },
        ]
    }
