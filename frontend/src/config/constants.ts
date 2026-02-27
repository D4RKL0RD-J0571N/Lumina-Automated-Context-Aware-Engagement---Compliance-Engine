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
        COMPLIANCE_HEALTH_CHANGE: '0.2% from last hour', // To be dynamic in Phase 3
    }
};
