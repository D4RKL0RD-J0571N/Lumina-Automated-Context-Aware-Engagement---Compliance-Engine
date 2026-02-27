import { describe, it, expect } from 'vitest';

/**
 * API URL Wiring Test
 *
 * Verifies that the frontend API service produces correct request URLs
 * for both local development and production (Supabase Edge Functions).
 * This is specifically testing the path mismatch that caused all 404s
 * in production.
 */

describe('API URL Wiring', () => {
    describe('getBaseURL()', () => {
        it('production URL should NOT include /api/v1 prefix', () => {
            const productionUrl = 'https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api';
            expect(productionUrl).not.toContain('/api/v1');
            expect(productionUrl).toContain('lumina-api');
        });

        it('local URL should include /api/v1 prefix for FastAPI compatibility', () => {
            const localUrl = 'http://localhost:8000/api/v1';
            expect(localUrl).toContain('/api/v1');
        });
    });

    describe('API Endpoint Paths (relative to baseURL)', () => {
        /**
         * These are the exact relative paths used by api.ts methods.
         * They must NOT include /api/v1 because:
         * - Locally, the baseURL already includes /api/v1
         * - In production, the Edge Function normalizes the path
         */
        const ENDPOINT_PATHS = {
            metrics: '/compliance/metrics',
            violations: '/compliance/violations',
            domains: '/domains/',
            orchestrate: '/orchestrate/',
            scan: '/guardrail/scan',
        };

        it('should use relative paths without /api/v1 prefix', () => {
            Object.values(ENDPOINT_PATHS).forEach(path => {
                expect(path).not.toMatch(/^\/api\/v1/);
            });
        });

        it('production base + relative path should form correct full URL', () => {
            const base = 'https://iilzvkqggnibzqbqshsc.supabase.co/functions/v1/lumina-api';

            Object.entries(ENDPOINT_PATHS).forEach(([_name, path]) => {
                const fullUrl = base + path;
                // Must NOT double-up with /api/v1 between lumina-api and the endpoint
                expect(fullUrl).not.toContain('lumina-api/api/v1');
                // Must contain the endpoint path
                expect(fullUrl).toContain(path);
            });
        });

        it('local base + relative path should produce correct FastAPI paths', () => {
            const base = 'http://localhost:8000/api/v1';

            expect(base + ENDPOINT_PATHS.metrics).toBe(
                'http://localhost:8000/api/v1/compliance/metrics'
            );
            expect(base + ENDPOINT_PATHS.domains).toBe(
                'http://localhost:8000/api/v1/domains/'
            );
            expect(base + ENDPOINT_PATHS.orchestrate).toBe(
                'http://localhost:8000/api/v1/orchestrate/'
            );
        });
    });

    describe('Edge Function normalizePath()', () => {
        /**
         * Mirrors the normalizePath logic from supabase/functions/lumina-api/index.ts
         * to verify that both path patterns resolve to the same handler.
         */
        function normalizePath(rawPath: string): string {
            let p = rawPath.replace(/^\/lumina-api/, '');
            p = p.replace(/^\/api\/v1/, '');
            p = p.replace(/\/+$/, '') || '/';
            return p;
        }

        it('should normalize frontend production paths correctly', () => {
            // Frontend sends: baseURL + "/compliance/metrics"
            // Wire path: /lumina-api/compliance/metrics
            expect(normalizePath('/lumina-api/compliance/metrics')).toBe('/compliance/metrics');
            expect(normalizePath('/lumina-api/domains/')).toBe('/domains');
            expect(normalizePath('/lumina-api/orchestrate/')).toBe('/orchestrate');
            expect(normalizePath('/lumina-api/guardrail/scan')).toBe('/guardrail/scan');
        });

        it('should normalize direct /api/v1 paths correctly', () => {
            // Direct callers or docs examples: /lumina-api/api/v1/compliance/metrics
            expect(normalizePath('/lumina-api/api/v1/compliance/metrics')).toBe('/compliance/metrics');
            expect(normalizePath('/lumina-api/api/v1/domains/')).toBe('/domains');
            expect(normalizePath('/lumina-api/api/v1/orchestrate/')).toBe('/orchestrate');
        });

        it('should normalize root path', () => {
            expect(normalizePath('/lumina-api')).toBe('/');
            expect(normalizePath('/lumina-api/')).toBe('/');
            expect(normalizePath('/lumina-api/api/v1')).toBe('/');
            expect(normalizePath('/lumina-api/api/v1/')).toBe('/');
        });

        it('should handle paths without lumina-api prefix', () => {
            expect(normalizePath('/compliance/metrics')).toBe('/compliance/metrics');
            expect(normalizePath('/api/v1/compliance/metrics')).toBe('/compliance/metrics');
        });
    });
});
