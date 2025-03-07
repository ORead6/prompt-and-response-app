import { render, screen, fireEvent } from '@testing-library/react';
import CreatePromptPage from '@/app/(auth)/create-prompt/page';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import CreatePromptForm from "@/components/createPromptForm";

// Mock the dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock the CreatePromptForm component
jest.mock('@/src/components/createPromptForm', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(({ maxLength }) => (
        <div data-testid="create-prompt-form" data-max-length={maxLength}>
            Mock Create Prompt Form
        </div>
    )),
}));

// Type the mocked functions
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("Create Prompt Page", () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup router mock
        (mockedUseRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    test("renders the page title correctly", () => {
        render(<CreatePromptPage />);

        // Check for page title
        expect(screen.getByText('Create Prompt')).toBeInTheDocument();
    });

    test("renders the back button", () => {
        render(<CreatePromptPage />);

        // Check for back button with correct text and icon
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();

        // Check if ArrowLeft icon is in the button (indirectly by checking class name)
        expect(backButton.querySelector('svg')).toBeInTheDocument();
    });

    test("clicking back button navigates to prompts page", () => {
        render(<CreatePromptPage />);

        // Get the push method from the mocked router
        const push = mockedUseRouter().push;

        // Click the back button
        fireEvent.click(screen.getByRole('button', { name: /back/i }));

        // Check if push was called with the correct path
        expect(push).toHaveBeenCalledWith('/prompts');
    });

    test("renders the CreatePromptForm component with correct props", () => {
        render(<CreatePromptPage />);

        // Check if form component is rendered
        const formComponent = screen.getByTestId('create-prompt-form');
        expect(formComponent).toBeInTheDocument();

        // Check if maxLength prop is correctly passed (300)
        expect(formComponent).toHaveAttribute('data-max-length', '300');
    });
});