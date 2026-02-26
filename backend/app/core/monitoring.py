from prometheus_client import Counter, Histogram, Gauge
import time

# 📊 METRICS DEFINITIONS
# (Objective for Phase 4: Observability)

REQUEST_COUNT = Counter(
    'lumina_requests_total', 
    'Total number of AI orchestration requests',
    ['domain', 'status']
)

LATENCY = Histogram(
    'lumina_request_latency_seconds', 
    'Latency of AI orchestration in seconds',
    ['domain']
)

GUARDRAIL_VIOLATIONS = Counter(
    'lumina_guardrail_violations_total', 
    'Total number of intercepted compliance violations',
    ['domain', 'classification']
)

BLEED_THROUGH_EVENTS = Counter(
    'lumina_bleed_through_total', 
    'Total number of detected context leak events',
    ['domain', 'source_domain']
)

ACTIVE_SESSIONS = Gauge(
    'lumina_active_sessions', 
    'Number of active chat sessions'
)

class MetricsInstrumentor:
    """
    Helper to record metrics across the engine.
    """
    @staticmethod
    def record_request(domain: str, status: str = "success"):
        REQUEST_COUNT.labels(domain=domain, status=status).inc()

    @staticmethod
    def record_latency(domain: str, seconds: float):
        LATENCY.labels(domain=domain).observe(seconds)

    @staticmethod
    def record_violation(domain: str, classification: str):
        GUARDRAIL_VIOLATIONS.labels(domain=domain, classification=classification).inc()

    @staticmethod
    def record_bleed(domain: str, source_domain: str):
        BLEED_THROUGH_EVENTS.labels(domain=domain, source_domain=source_domain).inc()

metrics_manager = MetricsInstrumentor()
