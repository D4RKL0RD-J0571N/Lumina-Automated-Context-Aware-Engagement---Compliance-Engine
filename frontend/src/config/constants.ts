export const APP_CONFIG = {
    NAME: import.meta.env.VITE_APP_NAME || 'Lumina Engine',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    RELEASE_PHASE: 'Phase 2 Optimized',
};

export const API_ROUTES = {
    BASE: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    LOGS: '/api/v1/logs',
};

// Unified fallback domains (Matching domains.yaml)
export const FALLBACK_DOMAINS = {
    'fishing.com': {
        persona: 'Fishing Guide',
        tone: 'Helpful, outdoorsy, and enthusiastic',
        domain_knowledge: 'Freshwater bass fishing and coastal saltwater techniques with sustainability focus'
    },
    'householdmanuals.com': {
        persona: 'DIY Repair Expert',
        tone: 'Educational, meticulous, and safety-conscious',
        domain_knowledge: 'Home maintenance and appliance repair with safety guidelines'
    },
    'localnews.org': {
        persona: 'Community Liaison',
        tone: 'Professional, objective, and community-focused',
        domain_knowledge: 'Community events and local interest stories with neutral reporting'
    }
};

export const UI_CONSTANTS = {
    DASHBOARD: {
        COMPLIANCE_HEALTH_CHANGE: '0.2% from last hour',
    }
};

export const FALLBACK_METRICS = {
    compliance_pass_rate: '99.7%',
    total_requests: 2857,
    security_violations: 4,
    legal_violations: 2,
    medical_violations: 1,
    ad_policy_violations: 1,
    bleed_through_events: 3,
    avg_latency_ms: 156.4,
};

export const FALLBACK_VIOLATIONS = [
    { type: 'Legal', site: 'householdmanuals.com', msg: 'Attempted unauthorized document signing', color: 'text-lumina-warning', time: '2m ago' },
    { type: 'Ad-Policy', site: 'localnews.org', msg: '"Click for Free Cash" phrase detected', color: 'text-lumina-danger', time: '5m ago' },
    { type: 'Medical', site: 'fishing.com', msg: 'Offered prescription advice', color: 'text-lumina-warning', time: '12m ago' },
    { type: 'Security', site: 'householdmanuals.com', msg: 'Abusive language detected', color: 'text-lumina-danger', time: '1h ago' },
];
