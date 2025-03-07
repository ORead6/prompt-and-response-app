import { createClient } from '@/utils/supabase/server';

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

// Import after mocking
import { POST } from '@/app/api/getSpecificPrompt/route';

// Type the mocked functions
const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('POST /api/getPromptById', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('retrieves a prompt successfully by ID', async () => {
        // Mock request data
        const requestData = {
            id: 'prompt-123'
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock prompt data
        const mockPrompt = {
            id: 'prompt-123',
            title: 'Test Prompt',
            prompt: 'This is a test prompt',
            author: 'testuser',
            categories: ['test', 'example'],
            created_at: '2023-01-01T00:00:00Z'
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
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockPrompt,
                            error: null
                        })
                    })
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
            promptData: mockPrompt
        });

        // Verify supabase was called correctly
        expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
        expect(mockSupabase.from('prompts').select).toHaveBeenCalledWith('*');
        expect(mockSupabase.from('prompts').select('*').eq).toHaveBeenCalledWith('id', 'prompt-123');
        expect(mockSupabase.from('prompts').select('*').eq().single).toHaveBeenCalled();
    });

    test('returns 400 when prompt ID is missing', async () => {
        // Mock request with missing ID
        const requestData = {};

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
            error: 'Prompt ID is Required'
        });
    });

    test('returns 401 when user is not authenticated', async () => {
        // Mock request data
        const requestData = {
            id: 'prompt-123'
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
            id: 'prompt-123'
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

    test('returns 500 when database query error occurs', async () => {
        // Mock request data
        const requestData = {
            id: 'prompt-123'
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock Supabase responses with query error
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Record not found' }
                        })
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
            error: 'Record not found'
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