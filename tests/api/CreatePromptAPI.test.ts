import { createClient } from '@/utils/supabase/server';
import { v4 as uuid } from 'uuid';

// Mock the NextRequest and NextResponse
jest.mock('next/server', () => ({
    NextRequest: jest.fn().mockImplementation((input) => ({
        json: jest.fn().mockImplementation(() => Promise.resolve(input)),
    })),
    NextResponse: {
        json: jest.fn().mockImplementation((body, init) => ({
            json: () => Promise.resolve(body),
            status: init?.status || 200
        }))
    }
}));

// Mock dependencies
jest.mock('@/src/utils/supabase/server', () => ({
    createClient: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

// Import after mocking
import { POST } from '@/app/api/createPrompt/route';

// Type the mocked functions
const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockedUuid = uuid as jest.MockedFunction<typeof uuid>;

describe('POST /api/prompts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock the uuid to return a consistent value for testing
        (mockedUuid as jest.Mock).mockReturnValue('mock-uuid-value');
    });

    test('creates a prompt successfully with all fields', async () => {
        // Mock request data
        const requestData = {
            title: 'Test Prompt',
            prompt: 'This is a test prompt',
            categories: ['Test', 'Example']
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock Supabase responses
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [{ username: 'testuser' }],
                        error: null
                    })
                }),
                insert: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            })
        };

        (mockedCreateClient as jest.Mock).mockResolvedValue(mockSupabase);

        // Execute the function
        const response = await POST(req as any);
        const responseData = await response.json();

        // Assertions
        expect(response.status).toBe(201);
        expect(responseData).toEqual({
            success: true,
            data: {
                id: 'mock-uuid-value',
                title: 'Test Prompt',
                prompt: 'This is a test prompt',
                author: 'user-123',
                categories: ['test', 'example'] // Should be lowercase
            }
        });

        // Verify supabase was called correctly
        expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
        expect(mockSupabase.from('prompts').insert).toHaveBeenCalledWith([{
            id: 'mock-uuid-value',
            title: 'Test Prompt',
            prompt: 'This is a test prompt',
            author: 'testuser',
            categories: ['test', 'example']
        }]);
    });

    test('creates a prompt with minimal required fields', async () => {
        // Mock request with only required fields
        const requestData = {
            title: 'Minimal Prompt',
            prompt: null,
            categories: null
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock Supabase responses
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [{ username: 'testuser' }],
                        error: null
                    })
                }),
                insert: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            })
        };

        (mockedCreateClient as jest.Mock).mockResolvedValue(mockSupabase);

        // Execute the function
        const response = await POST(req as any);
        const responseData = await response.json();

        // Assertions
        expect(response.status).toBe(201);
        expect(responseData).toEqual({
            success: true,
            data: {
                id: 'mock-uuid-value',
                title: 'Minimal Prompt',
                prompt: null,
                author: 'user-123',
                categories: null
            }
        });
    });

    test('returns 400 when title is missing', async () => {
        // Mock request with missing title
        const requestData = {
            prompt: 'This is a test prompt',
            categories: ['Test']
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Execute the function
        const response = await POST(req as any);
        const responseData = await response.json();

        // Assertions
        expect(response.status).toBe(400);
        expect(responseData).toEqual({
            success: false,
            error: 'Title is required'
        });
    });

    test('returns 401 when user is not authenticated', async () => {
        // Mock request data
        const requestData = {
            title: 'Test Prompt',
            prompt: 'This is a test prompt',
            categories: ['Test']
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock Supabase response for unauthenticated user
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: null },
                    error: null
                })
            }
        };

        (mockedCreateClient as jest.Mock).mockResolvedValue(mockSupabase);

        // Execute the function
        const response = await POST(req as any);
        const responseData = await response.json();

        // Assertions
        expect(response.status).toBe(401);
        expect(responseData).toEqual({
            success: false,
            error: 'User is not authenticated'
        });
    });

    test('returns 500 when session error occurs', async () => {
        // Mock request data
        const requestData = {
            title: 'Test Prompt',
            prompt: 'This is a test prompt',
            categories: ['Test']
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock Supabase session error
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: {},
                    error: { message: 'Session error occurred' }
                })
            }
        };

        (mockedCreateClient as jest.Mock).mockResolvedValue(mockSupabase);

        // Execute the function
        const response = await POST(req as any);
        const responseData = await response.json();

        // Assertions
        expect(response.status).toBe(500);
        expect(responseData).toEqual({
            success: false,
            error: 'Session error occurred'
        });
    });

    test('returns 500 when profile error occurs', async () => {
        // Mock request data
        const requestData = {
            title: 'Test Prompt',
            prompt: 'This is a test prompt',
            categories: ['Test']
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock Supabase responses with profile error
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Profile error occurred' }
                    })
                })
            })
        };

        (mockedCreateClient as jest.Mock).mockResolvedValue(mockSupabase);

        // Execute the function
        const response = await POST(req as any);
        const responseData = await response.json();

        // Assertions
        expect(response.status).toBe(500);
        expect(responseData).toEqual({
            success: false,
            error: 'Profile error occurred'
        });
    });

    test('returns 500 when database insert error occurs', async () => {
        // Mock request data
        const requestData = {
            title: 'Test Prompt',
            prompt: 'This is a test prompt',
            categories: ['Test']
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock Supabase responses with insert error
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: [{ username: 'testuser' }],
                        error: null
                    })
                }),
                insert: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error occurred' }
                })
            })
        };

        (mockedCreateClient as jest.Mock).mockResolvedValue(mockSupabase);

        // Execute the function
        const response = await POST(req as any);
        const responseData = await response.json();

        // Assertions
        expect(response.status).toBe(500);
        expect(responseData).toEqual({
            success: false,
            error: 'Database error occurred'
        });
    });

    test('handles unexpected errors during processing', async () => {
        // Mock request that will throw an error
        const req = {
            json: jest.fn().mockRejectedValue(new Error('Unexpected error'))
        };

        // Mock console.error to prevent test output pollution
        console.error = jest.fn();

        // Execute the function
        const response = await POST(req as any);
        const responseData = await response.json();

        // Assertions
        expect(response.status).toBe(500);
        expect(responseData).toEqual({
            success: false,
            error: 'Failed to process request'
        });
        expect(console.error).toHaveBeenCalled();
    });
});