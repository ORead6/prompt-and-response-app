import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '@/app/register/page';
import '@testing-library/jest-dom'
import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// Type the mocked functions
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockedRedirect = jest.requireMock('next/navigation').redirect as jest.MockedFunction<(path: string) => void>;

// Mock the dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    redirect: jest.fn(),
}));

// Mock Create Client
jest.mock('@/src/utils/supabase/client', () => ({
    createClient: jest.fn(),
}));

// Mock the theme switch component
jest.mock('@/src/components/themeSwitch', () => ({
    __esModule: true,
    default: () => <div data-testid="theme-switch">Theme Switch</div>,
}));

describe("Register Page", () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
    });

    test("Loads The Register Form Correctly", () => {
        render(<RegisterPage />);

        // Check for title and description
        expect(screen.getByText('Create an account')).toBeInTheDocument();
        expect(screen.getByText('Enter your details to sign up')).toBeInTheDocument();

        // Check for form elements
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        
        expect(screen.getByPlaceholderText('johndoe')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
        expect(screen.getAllByPlaceholderText('••••••••').length).toBe(2);

        // Check for buttons and links
        expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
        expect(screen.getByText('Already have an account?')).toBeInTheDocument();
        expect(screen.getByText('Sign in')).toBeInTheDocument();

        // Check for theme switch
        expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
    });

    test('allows entering form fields', () => {
        render(<RegisterPage />);

        const usernameInput = screen.getByLabelText('Username');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');

        // Enter values
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

        // Check if values are updated
        expect(usernameInput).toHaveValue('testuser');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
        expect(confirmPasswordInput).toHaveValue('password123');
    });

    test('shows loading state when submitting the form', async () => {
        // Mock the supabase response to delay the promise resolution
        const mockSignUp = jest.fn().mockReturnValue(new Promise(resolve => {
            setTimeout(() => resolve({ 
                data: { user: { id: 'test-user-id' } }, 
                error: null 
            }), 100);
        }));

        const mockInsert = jest.fn().mockReturnValue(new Promise(resolve => {
            setTimeout(() => resolve({ data: {}, error: null }), 100);
        }));

        // Type assertion for the mock
        (mockedCreateClient as jest.Mock).mockReturnValue({
            auth: {
                signUp: mockSignUp,
            },
            from: jest.fn().mockReturnValue({
                insert: mockInsert
            })
        });

        render(<RegisterPage />);

        // Fill the form
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

        // Check loading state
        expect(screen.getByText('Creating account...')).toBeInTheDocument();

        // Wait for the loading state to change
        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    test('calls supabase signUp with correct parameters and adds user profile', async () => {
        const mockSignUp = jest.fn().mockResolvedValue({ 
            data: { user: { id: 'test-user-id' } }, 
            error: null 
        });

        const mockInsert = jest.fn().mockResolvedValue({ data: {}, error: null });

        const mockFrom = jest.fn().mockReturnValue({
            insert: mockInsert
        });

        // Type assertion for the mock
        (mockedCreateClient as jest.Mock).mockReturnValue({
            auth: {
                signUp: mockSignUp,
            },
            from: mockFrom
        });

        render(<RegisterPage />);

        // Fill the form
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

        // Check if supabase was called with the right parameters
        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });

        // Check if profile was created
        await waitFor(() => {
            expect(mockFrom).toHaveBeenCalledWith('profiles');
            expect(mockInsert).toHaveBeenCalledWith([
                expect.objectContaining({
                    id: 'test-user-id',
                    username: 'testuser',
                    email: 'test@example.com',
                })
            ]);
        });
    });

    test('redirects to /prompts on successful registration', async () => {
        const mockSignUp = jest.fn().mockResolvedValue({ 
            data: { user: { id: 'test-user-id' } }, 
            error: null 
        });

        const mockInsert = jest.fn().mockResolvedValue({ data: {}, error: null });

        // Type assertion for the mock
        (mockedCreateClient as jest.Mock).mockReturnValue({
            auth: {
                signUp: mockSignUp,
            },
            from: jest.fn().mockReturnValue({
                insert: mockInsert
            })
        });

        render(<RegisterPage />);

        // Fill the form
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

        // Check redirection
        await waitFor(() => {
            expect(mockedRedirect).toHaveBeenCalledWith('/prompts');
        });
    });

    test('handles password mismatch correctly', async () => {
        // We need to mock the event prevent default since we're going to use it
        const preventDefaultMock = jest.fn();
        
        // Temporarily store original console.log
        const originalConsoleLog = console.log;
        console.log = jest.fn();

        // No need to mock createClient since we're testing that it's NOT called
        render(<RegisterPage />);

        // Fill the form with mismatched passwords
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password456' } });

        // Submit the form with the mock event
        const form = screen.getByRole('button', { name: 'Sign up' });
        fireEvent.click(form, { preventDefault: preventDefaultMock });

        // We need to wait a moment to ensure that the async function gets processed
        await waitFor(() => {
            // Since passwords don't match, isLoading should not be set to true
            expect(screen.queryByText('Creating account...')).not.toBeInTheDocument();
            // Restore console.log
            console.log = originalConsoleLog;
        });
    });

    test('handles registration error correctly', async () => {
        // Temporarily store original console.log
        const originalConsoleLog = console.log;
        console.log = jest.fn();
        
        // Set up mocks
        const mockSignUp = jest.fn().mockResolvedValue({ 
            data: { user: { id: 'test-user-id' } }, 
            error: null 
        });

        const mockInsert = jest.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Error creating profile' } 
        });

        // Type assertion for the mock
        (mockedCreateClient as jest.Mock).mockReturnValue({
            auth: {
                signUp: mockSignUp,
            },
            from: jest.fn().mockReturnValue({
                insert: mockInsert
            })
        });

        render(<RegisterPage />);

        // Fill the form
        fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

        // Wait for the async operation to complete
        await waitFor(() => {
            expect(mockInsert).toHaveBeenCalled();
        });

        // We need to wait a bit longer to let the error handling happen
        await waitFor(() => {
            // Should not redirect
            expect(mockedRedirect).not.toHaveBeenCalled();
            // Restore console.log
            console.log = originalConsoleLog;
        });
    });
});