import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

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

export const orchestrateAPI = {
    orchestrate: async (data: { user_input: string; domain_name: string; rag_context?: string }) => {
        const response = await api.post('/orchestrate/', data);
        return response.data;
    },
    orchestrateStream: async (data: { user_input: string; domain_name: string; rag_context?: string }, onToken: (token: string) => void, onFinal: (metadata: any) => void) => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const AI_MODEL_URL = import.meta.env.VITE_AI_MODEL_URL || 'http://localhost:8000/api/v1';
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
    getMetrics: async () => {
        const response = await api.get('/compliance/metrics');
        return response.data;
    },
    getDomains: async () => {
        const response = await api.get('/domains/');
        return response.data;
    },
};

export default api;
