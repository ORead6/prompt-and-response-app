import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '@/app/page';
import '@testing-library/jest-dom';
import React from 'react';
import { useRouter } from 'next/navigation';

// Type the mocked functions
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock the dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick }: any) => (
            <div className={className} onClick={onClick}>
                {children}
            </div>
        ),
        h1: ({ children, className }: any) => (
            <h1 className={className}>{children}</h1>
        ),
        h2: ({ children, className }: any) => (
            <h2 className={className}>{children}</h2>
        ),
    },
}));

// Mock the theme switch component
jest.mock('@/src/components/themeSwitch', () => ({
    __esModule: true,
    default: () => <div data-testid="theme-switch">Theme Switch</div>,
}));

describe("Landing Page", () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
    });

    test("Loads the landing page correctly", () => {
        render(<LandingPage />);

        // Check for title and subtitle
        expect(screen.getByText('Creative Writing Prompt & Response App')).toBeInTheDocument();
        expect(screen.getByText('Made by Owen Read')).toBeInTheDocument();

        // Check for theme switch
        expect(screen.getByTestId('theme-switch')).toBeInTheDocument();

        // Check for main app button
        expect(screen.getByRole('button', { name: 'Go to Main App' })).toBeInTheDocument();
    });

    test("Navigates to prompts page when button is clicked", () => {
        // Setup router mock
        const pushMock = jest.fn();
        (mockedUseRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });

        render(<LandingPage />);

        // Find and click the button
        const button = screen.getByRole('button', { name: 'Go to Main App' });
        fireEvent.click(button);

        // Check if router.push was called with the correct path
        expect(pushMock).toHaveBeenCalledWith('/prompts');
    });

    test("Theme switch component is rendered in the correct position", () => {
        render(<LandingPage />);

        // Find the theme switch container
        const themeSwitchContainer = screen.getByTestId('theme-switch').closest('div');
        
        // Check if it has the absolute positioning class
        expect(themeSwitchContainer?.parentElement).toHaveClass('absolute');
        expect(themeSwitchContainer?.parentElement).toHaveClass('top-4');
        expect(themeSwitchContainer?.parentElement).toHaveClass('right-4');
    });

    test("Page has the correct responsive text classes", () => {
        render(<LandingPage />);

        // Check for responsive heading classes
        const heading = screen.getByText('Creative Writing Prompt & Response App');
        expect(heading).toHaveClass('text-4xl');
        expect(heading).toHaveClass('md:text-5xl');
        expect(heading).toHaveClass('lg:text-6xl');

        // Check for responsive subtitle classes
        const subtitle = screen.getByText('Made by Owen Read');
        expect(subtitle).toHaveClass('text-lg');
        expect(subtitle).toHaveClass('md:text-xl');
    });

    test("Button has the correct styling", () => {
        render(<LandingPage />);

        const button = screen.getByRole('button', { name: 'Go to Main App' });
        expect(button).toHaveClass('px-6');
        expect(button).toHaveClass('py-3');
        expect(button).toHaveClass('text-lg');
    });

    test("Page has a min-height of screen", () => {
        render(<LandingPage />);

        // Find the main container div
        const mainContainer = screen.getByText('Creative Writing Prompt & Response App').closest('div')?.parentElement;
        expect(mainContainer).toHaveClass('min-h-screen');
    });

    test("Page has proper flex layout", () => {
        render(<LandingPage />);

        // Find the main container div
        const mainContainer = screen.getByText('Creative Writing Prompt & Response App').closest('div')?.parentElement;
        expect(mainContainer).toHaveClass('flex');
        expect(mainContainer).toHaveClass('flex-col');
        expect(mainContainer).toHaveClass('items-center');
        expect(mainContainer).toHaveClass('justify-center');
    });

    test("Page has the correct background and text colors", () => {
        render(<LandingPage />);

        // Find the main container div
        const mainContainer = screen.getByText('Creative Writing Prompt & Response App').closest('div')?.parentElement;
        expect(mainContainer).toHaveClass('bg-white');
        expect(mainContainer).toHaveClass('dark:bg-gray-900');
        
        // Check heading text color
        const heading = screen.getByText('Creative Writing Prompt & Response App');
        expect(heading).toHaveClass('text-gray-900');
        expect(heading).toHaveClass('dark:text-white');
        
        // Check subtitle text color
        const subtitle = screen.getByText('Made by Owen Read');
        expect(subtitle).toHaveClass('text-gray-600');
        expect(subtitle).toHaveClass('dark:text-gray-400');
    });
});