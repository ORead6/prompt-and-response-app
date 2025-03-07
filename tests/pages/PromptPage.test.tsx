import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromptPage from "@/app/(auth)/prompts/page";
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import NoPromptsCard from "@/components/EmptyPromptPlaceholder";
import CategoryEntryBar from "@/components/CategoryEntryBar";
import CategoryDisplayBar from "@/components/CategoryDisplayBar";
import { act } from 'react-dom/test-utils';
import React from 'react';

// Mock the dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn();

// Mock child components
jest.mock('@/src/components/EmptyPromptPlaceholder', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => (
        <div data-testid="no-prompts-card">No prompts available</div>
    )),
}));

jest.mock('@/src/components/CategoryEntryBar', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(({ onStateChange }) => (
        <div data-testid="category-entry-bar">
            <button
                data-testid="add-category-button"
                onClick={() => onStateChange(['test-category'])}
            >
                Add Category
            </button>
        </div>
    )),
}));

jest.mock('@/src/components/CategoryDisplayBar', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(({ categories }) => (
        <div data-testid="category-display-bar">
            {categories.map((category: string) => (
                <span key={category} data-testid="category-chip">{category}</span>
            ))}
        </div>
    )),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: jest.fn().mockImplementation(({ children, ...props }) => (
            <div {...props}>{children}</div>
        )),
    },
    AnimatePresence: jest.fn().mockImplementation(({ children }) => children),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Type the mocked functions
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Sample prompt data for testing
const samplePrompts = [
    {
        id: '1',
        title: 'Test Prompt 1',
        prompt: 'This is a test prompt content',
        author: 'Test Author',
        created_at: '2023-01-01T00:00:00Z',
        categories: ['test', 'sample']
    },
    {
        id: '2',
        title: 'Test Prompt 2',
        prompt: 'Another test prompt content',
        author: 'Test Author 2',
        created_at: '2023-01-02T00:00:00Z',
        categories: ['example']
    }
];

describe("Prompt Page", () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup router mock
        (mockedUseRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });

        // Setup fetch mock with default response
        (mockedFetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ prompts: samplePrompts }),
            text: jest.fn().mockResolvedValue(""),
            status: 200
        });

        // Reset console error/log spies
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    test("renders the page title correctly", async () => {
        await act(async () => {
            render(<PromptPage />);
        });

        // Check for page title
        expect(screen.getByText('Prompts')).toBeInTheDocument();
    });

    test("renders the create prompt button", async () => {
        await act(async () => {
            render(<PromptPage />);
        });

        // Check for create button
        const createButton = screen.getByRole('button', { name: /create prompt/i });
        expect(createButton).toBeInTheDocument();
        expect(createButton.querySelector('svg')).toBeInTheDocument(); // Check for Plus icon
    });

    test("clicking create prompt button navigates to create prompt page", async () => {
        await act(async () => {
            render(<PromptPage />);
        });

        // Get the push method from the mocked router
        const push = mockedUseRouter().push;

        // Click the create button
        fireEvent.click(screen.getByRole('button', { name: /create prompt/i }));

        // Check if push was called with the correct path
        expect(push).toHaveBeenCalledWith('/create-prompt');
    });

    test("renders CategoryEntryBar component", async () => {
        await act(async () => {
            render(<PromptPage />);
        });

        // Check if category entry bar is rendered
        expect(screen.getByTestId('category-entry-bar')).toBeInTheDocument();
    });

    test("shows NoPromptsCard when no prompts are available", async () => {
        // Mock fetch to return empty prompts array
        (mockedFetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ prompts: [] }),
            status: 200
        });

        await act(async () => {
            render(<PromptPage />);
        });

        // Wait for the component to finish loading
        await waitFor(() => {
            expect(screen.getByTestId('no-prompts-card')).toBeInTheDocument();
        });
    });

    test("displays prompts when they are available", async () => {
        await act(async () => {
            render(<PromptPage />);
        });

        // Wait for the prompts to load
        await waitFor(() => {
            expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
            expect(screen.getByText('Test Prompt 2')).toBeInTheDocument();
            expect(screen.getByText('This is a test prompt content')).toBeInTheDocument();
            expect(screen.getByText('Another test prompt content')).toBeInTheDocument();
        });
    });

    test("displays category chips for each prompt", async () => {
        await act(async () => {
            render(<PromptPage />);
        });

        // Wait for prompts and their categories to load
        await waitFor(() => {
            const categoryBars = screen.getAllByTestId('category-display-bar');
            expect(categoryBars.length).toBe(2); // One for each prompt

            const categoryChips = screen.getAllByTestId('category-chip');
            expect(categoryChips.length).toBe(3); // 'test', 'sample', and 'example'
        });
    });

    test("navigates to prompt detail when clicking on a prompt", async () => {
        await act(async () => {
            render(<PromptPage />);
        });

        // Wait for prompts to load
        await waitFor(() => {
            expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
        });

        // Get the push method from the mocked router
        const push = mockedUseRouter().push;

        // Click on the first prompt
        fireEvent.click(screen.getByText('Test Prompt 1').closest('div')!);

        // Check if push was called with the correct path
        expect(push).toHaveBeenCalledWith('/prompts/1');
    });

    test("fetches prompts on initial load", async () => {
        await act(async () => {
            render(<PromptPage />);
        });

        // Check if fetch was called with the correct parameters
        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalledWith('/api/getPrompts', {
                method: 'POST',
                body: JSON.stringify({ page: 0, page_size: 10 }),
            });
        });
    });

    test("handles category selection and refetches prompts", async () => {
        await act(async () => {
            render(<PromptPage />);
        });

        // Wait for initial load
        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalled();
        });

        // Reset fetch mock to track new calls
        mockedFetch.mockClear();

        // Click the add category button (which our mock calls onStateChange with ['test-category'])
        fireEvent.click(screen.getByTestId('add-category-button'));

        // Check if fetch was called again with the category included
        await waitFor(() => {
            expect(mockedFetch).toHaveBeenCalledWith('/api/getPrompts', {
                method: 'POST',
                body: JSON.stringify({
                    page: 0,
                    page_size: 10,
                    categories: ['test-category']
                }),
            });
        });
    });

    test("handles fetch error gracefully", async () => {
        // Mock fetch to return an error
        (mockedFetch as jest.Mock).mockResolvedValue({
            ok: false,
            text: jest.fn().mockResolvedValue("Server Error"),
            status: 500
        });

        // Spy on console.error
        const consoleSpy = jest.spyOn(console, 'error');

        await act(async () => {
            render(<PromptPage />);
        });

        // Check if error was logged
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalled();
        });

        // Should show NoPromptsCard when fetch fails
        await waitFor(() => {
            expect(screen.getByTestId('no-prompts-card')).toBeInTheDocument();
        });
    });
});