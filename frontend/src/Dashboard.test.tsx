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

import { APP_CONFIG } from './config/constants';

describe('Dashboard Component', () => {
    it('renders the Dashboard header', () => {
        render(<Dashboard />);
        expect(screen.getByText(APP_CONFIG.NAME)).toBeInTheDocument();
        expect(screen.getByText(/Pending connection/i)).toBeInTheDocument();
    });
});
