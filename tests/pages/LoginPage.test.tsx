import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import '@testing-library/jest-dom'
import TestUtils from 'react-dom/test-utils';
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

describe("Login Page", () => {
    test("Loads The Login Form Correctly", () => {
        render(<LoginPage />);

        // Check for title and description
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Enter your email and password to sign in')).toBeInTheDocument();

        // Check for form elements
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();

        // Check for buttons and links
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
        expect(screen.getByText('Forgot password?')).toBeInTheDocument();
        expect(screen.getByText('Sign up')).toBeInTheDocument();

        // Check for theme switch
        expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
    })

    test('allows entering email and password', () => {
        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        // Enter values
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Check if values are updated
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    test('shows loading state when submitting the form', async () => {
        // Mock the supabase response to delay the promise resolution
        const mockSignIn = jest.fn().mockReturnValue(new Promise(resolve => {
            setTimeout(() => resolve({ error: null }), 100);
        }));

        (mockedCreateClient as jest.Mock).mockReturnValue({
            auth: {
                signInWithPassword: mockSignIn,
            },
        });

        render(<LoginPage />);

        // Fill the form
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

        // Check loading state
        expect(screen.getByText('Signing in...')).toBeInTheDocument();

        // Wait for the loading state to change
        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    test('calls supabase signInWithPassword with correct parameters', async () => {
        const mockSignIn = jest.fn().mockResolvedValue({ error: null });

        // Type assertion for the mock
        (mockedCreateClient as jest.Mock).mockReturnValue({
            auth: {
                signInWithPassword: mockSignIn,
            },
        });

        render(<LoginPage />);

        // Fill the form
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

        // Submit the form - Note: we're using the button instead of form because the form might not have a role
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

        // Check if supabase was called with the right parameters
        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    test('redirects to /prompts on successful login', async () => {
        const mockSignIn = jest.fn().mockResolvedValue({ error: null });

        // Type assertion for the mock
        (mockedCreateClient as jest.Mock).mockReturnValue({
            auth: {
                signInWithPassword: mockSignIn,
            },
        });

        render(<LoginPage />);

        // Fill and submit the form
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

        // Check redirection
        await waitFor(() => {
            expect(mockedRedirect).toHaveBeenCalledWith('/prompts');
        });
    });

    test('handles login error correctly', async () => {
        console.error = jest.fn(); // Mock console.error to prevent test output pollution

        const mockSignIn = jest.fn().mockResolvedValue({
            error: { message: 'Invalid login credentials' }
        });


        (mockedCreateClient as jest.Mock).mockReturnValue({
            auth: {
                signInWithPassword: mockSignIn,
            },
        });

        render(<LoginPage />);

        // Fill and submit the form
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });

        // Select the form by its name attribute
        const form = document.querySelector('form[name="Login-Form"]');

        // Submit the form directly
        if (form) {
            fireEvent.submit(form);
        } else {
            throw new Error('Form not found');
        }

        // Check that error was logged
        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Invalid login credentials');
        });
    });
})
