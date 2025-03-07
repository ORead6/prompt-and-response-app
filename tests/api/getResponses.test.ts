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
import { POST } from '@/app/api/getResponses/route';

// Type the mocked functions
const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('POST /api/getResponses', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('retrieves responses successfully', async () => {
        // Mock request data
        const requestData = {
            promptId: 'prompt-123',
            page: 0,
            page_size: 10
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock response data
        const mockResponses = [
            { id: 'response1', prompt_id: 'prompt-123', content: { text: 'Response 1' }, author: 'user1', created_at: '2023-01-01T00:00:00Z' },
            { id: 'response2', prompt_id: 'prompt-123', content: { text: 'Response 2' }, author: 'user2', created_at: '2023-01-02T00:00:00Z' }
        ];

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
                        order: jest.fn().mockReturnValue({
                            range: jest.fn().mockResolvedValue({
                                data: mockResponses,
                                error: null
                            })
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
        expect(response.status).toBe(200);
        expect(responseData).toEqual({
            success: true,
            responses: mockResponses
        });

        // Verify supabase was called correctly
        expect(mockSupabase.from).toHaveBeenCalledWith('responses');
        expect(mockSupabase.from('responses').select).toHaveBeenCalledWith('*');
        expect(mockSupabase.from('responses').select('*').eq).toHaveBeenCalledWith('prompt_id', 'prompt-123');
        expect(mockSupabase.from('responses').select('*').eq().order).toHaveBeenCalledWith('created_at', { ascending: false });
        expect(mockSupabase.from('responses').select('*').eq().order().range).toHaveBeenCalledWith(0, 9); // page 0, page_size 10 means range 0-9
    });

    test('retrieves responses for different page', async () => {
        // Mock request data for page 1
        const requestData = {
            promptId: 'prompt-123',
            page: 1,
            page_size: 5
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
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            range: jest.fn().mockResolvedValue({
                                data: [],
                                error: null
                            })
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
        expect(response.status).toBe(200);
        
        // Verify the correct range calculation
        expect(mockSupabase.from('responses').select('*').eq().order().range).toHaveBeenCalledWith(5, 9); // page 1, page_size 5 means range 5-9
    });

    test('returns 400 when promptId is missing', async () => {
        // Mock request with missing promptId
        const requestData = {
            page: 0,
            page_size: 10
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
            error: 'Prompt ID, Page and Page Size are required'
        });
    });

    test('returns 400 when page is missing', async () => {
        // Mock request with missing page
        const requestData = {
            promptId: 'prompt-123',
            page_size: 10
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
            error: 'Prompt ID, Page and Page Size are required'
        });
    });

    test('returns 400 when page_size is missing', async () => {
        // Mock request with missing page_size
        const requestData = {
            promptId: 'prompt-123',
            page: 0
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
            error: 'Prompt ID, Page and Page Size are required'
        });
    });

    test('returns 401 when user is not authenticated', async () => {
        // Mock request data
        const requestData = {
            promptId: 'prompt-123',
            page: 0,
            page_size: 10
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
            promptId: 'prompt-123',
            page: 0,
            page_size: 10
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
            promptId: 'prompt-123',
            page: 0,
            page_size: 10
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
                        order: jest.fn().mockReturnValue({
                            range: jest.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'Database query error' }
                            })
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
            error: 'Database query error'
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