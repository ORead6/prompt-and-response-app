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
import { POST } from '@/app/api/getPrompts/route';

// Type the mocked functions
const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('POST /api/getPrompts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('retrieves prompts successfully without categories', async () => {
        // Mock request data
        const requestData = {
            page: 0,
            page_size: 10,
            categories: null
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock prompts data
        const mockPrompts = [
            { id: 'prompt1', title: 'Prompt 1', prompt: 'Content 1', author: 'user1', created_at: '2023-01-01T00:00:00Z' },
            { id: 'prompt2', title: 'Prompt 2', prompt: 'Content 2', author: 'user2', created_at: '2023-01-02T00:00:00Z' }
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
                    order: jest.fn().mockReturnValue({
                        range: jest.fn().mockResolvedValue({
                            data: mockPrompts,
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
            prompts: mockPrompts
        });

        // Verify supabase was called correctly
        expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
        expect(mockSupabase.from('prompts').select).toHaveBeenCalledWith('*');
        expect(mockSupabase.from('prompts').select('*').order).toHaveBeenCalledWith('created_at', { ascending: false });
        expect(mockSupabase.from('prompts').select('*').order().range).toHaveBeenCalledWith(0, 9); // page 0, page_size 10 means range 0-9
    });

    test('retrieves prompts with category filtering', async () => {
        // Mock request data with categories
        const requestData = {
            page: 0,
            page_size: 10,
            categories: ['javascript', 'react']
        };

        // Mock the request
        const req = {
            json: jest.fn().mockResolvedValue(requestData)
        };

        // Mock filtered prompts data
        const mockPrompts = [
            { id: 'prompt1', title: 'JS Prompt', prompt: 'JavaScript content', author: 'user1', categories: ['javascript', 'programming'] },
            { id: 'prompt2', title: 'React Prompt', prompt: 'React content', author: 'user2', categories: ['react', 'javascript'] }
        ];

        // Mock Supabase responses for category filtering
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null
                })
            },
            from: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    contains: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            range: jest.fn().mockResolvedValue({
                                data: mockPrompts,
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
        expect(response.status).toBe(201);
        expect(responseData).toEqual({
            success: true,
            prompts: mockPrompts
        });

        // Verify the contains filter was used for categories
        expect(mockSupabase.from).toHaveBeenCalledWith('prompts');
        expect(mockSupabase.from('prompts').select).toHaveBeenCalledWith('*');
        expect(mockSupabase.from('prompts').select('*').contains).toHaveBeenCalledWith('categories', ['javascript', 'react']);
        expect(mockSupabase.from('prompts').select('*').contains().order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    test('retrieves prompts for different page', async () => {
        // Mock request data for page 1
        const requestData = {
            page: 1,
            page_size: 5,
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
                    order: jest.fn().mockReturnValue({
                        range: jest.fn().mockResolvedValue({
                            data: [],
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
        
        // Verify the correct range calculation
        expect(mockSupabase.from('prompts').select('*').order().range).toHaveBeenCalledWith(5, 9); // page 1, page_size 5 means range 5-9
    });

    test('returns 400 when page and page_size are undefined', async () => {
        // Mock request with missing page and page_size
        const requestData = {
            categories: ['javascript']
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
            error: 'Page and Page Size is required'
        });
    });

    test('returns 401 when user is not authenticated', async () => {
        // Mock request data
        const requestData = {
            page: 0,
            page_size: 10,
            categories: null
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
            page: 0,
            page_size: 10,
            categories: null
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
            page: 0,
            page_size: 10,
            categories: null
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
                    order: jest.fn().mockReturnValue({
                        range: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Database query error' }
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