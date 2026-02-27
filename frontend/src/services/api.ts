import axios from 'axios';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    // Use Supabase Edge Functions URL
    if (envUrl && envUrl.startsWith('http')) {
        return envUrl;
    }
    // Default to Supabase Edge Functions
    return 'https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('Lumina API initialized with Bridge:', getBaseURL());

export interface OrchestrateResponse {
    domain: string;
    persona: string;
    ai_response: string;
    guardrail_result: {
        is_safe: boolean;
        classification: string;
        rejection_message: string;
    };
    is_bleeding: boolean;
    bleed_events: Array<{
        source_domain: string;
        leaked_context: string[];
    }>;
    latency_ms: number;
    tokens_used: number;
}

/** Flat metadata received from the SSE stream's final payload */
export interface StreamFinalPayload {
    is_final: boolean;
    is_safe: boolean;
    classification: string;
    rejection_message: string;
    is_bleeding: boolean;
    bleed_events: Array<{
        source_domain: string;
        leaked_context: string[];
    }>;
    guardrail_result?: {
        is_safe: boolean;
        classification: string;
        rejection_message: string;
    };
    latency_ms?: number;
    tokens_used?: number;
}

export const orchestrateAPI = {
    orchestrate: async (data: { user_input: string; domain_name: string; rag_context?: string }) => {
        const response = await api.post('/orchestrate/', data);
        return response.data;
    },
    orchestrateStream: async (data: { user_input: string; domain_name: string; rag_context?: string }, onToken: (token: string) => void, onFinal: (metadata: StreamFinalPayload) => void) => {
        const API_BASE_URL = getBaseURL();
        const response = await fetch(`${API_BASE_URL}/orchestrate/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data, stream: true }),
        });

        if (!response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const payload = JSON.parse(line.slice(6));
                        if (payload.token) {
                            onToken(payload.token);
                        } else if (payload.is_final) {
                            onFinal(payload);
                        }
                    } catch (e) {
                        console.error('Error parsing SSE chunk', e);
                    }
                }
            }
        }
    },
    scan: async (content: string) => {
        const response = await api.post('/guardrail/scan', { content });
        return response.data;
    },
    getViolations: async () => {
        const response = await api.get('/compliance/violations');
        return response.data;
    },
    getMetrics: async () => {
        const response = await api.get('/compliance/metrics');
        return response.data;
    },
    getDomains: async () => {
        const response = await api.get('/domains/');
        return response.data.domains || response.data;
    },
};

export default api;
