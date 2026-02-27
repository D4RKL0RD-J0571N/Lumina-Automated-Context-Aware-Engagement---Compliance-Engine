import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatWidget from './ChatWidget';
import '@testing-library/jest-dom';

vi.mock('../services/api', () => ({
    orchestrateAPI: {
        getDomains: vi.fn(() => Promise.resolve({
            domains: {
                'fishing.com': { persona: 'Guide' }
            }
        })),
        orchestrateStream: vi.fn(),
    },
}));

describe('ChatWidget Component', () => {
    it('renders closed initially', () => {
        render(<ChatWidget />);
        // Checking for the toggle button which should always be present
        expect(screen.getByRole('button')).toBeInTheDocument();
        // Specific chat header text shouldn't be fully visible if it's closed, but since it's conditional rendered with animatePresence...
    });
});
