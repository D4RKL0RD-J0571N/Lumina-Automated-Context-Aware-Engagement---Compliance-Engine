import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';
import '@testing-library/jest-dom';

vi.mock('./services/api', () => ({
    orchestrateAPI: {
        getMetrics: vi.fn(() => Promise.resolve({
            compliance_pass_rate: "99.0%",
            total_requests: 1234,
        })),
        getDomains: vi.fn(() => Promise.resolve({})),
        getViolations: vi.fn(() => Promise.resolve({ violations: [] })),
    },
}));

// Mock MetricsChart to prevent full Recharts DOM rendering in unit test
vi.mock('./components/MetricsChart', () => ({
    default: () => <div data-testid="metrics-chart-mock"></div>
}));

describe('Dashboard Component', () => {
    it('renders the Dashboard header with premium branding', async () => {
        render(<Dashboard />);
        // Use a resolver to match text across the span tags of the premium header
        const header = await screen.findByText((_, element) => {
            const hasText = (node: Element) => node.textContent === 'LUMINA.CORE';
            const nodeHasText = element ? hasText(element) : false;
            const childrenDontHaveText = Array.from(element?.children || []).every(
                child => !hasText(child)
            );
            return nodeHasText && childrenDontHaveText;
        });
        expect(header).toBeInTheDocument();
    });
});
