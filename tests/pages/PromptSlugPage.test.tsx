import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PromptViewer from '@/app/(auth)/prompts/[id]/page';
import '@testing-library/jest-dom';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/src/utils/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock fetch
global.fetch = jest.fn();

// Mock ResponseCreator and ResponseViewer components
jest.mock('@/src/components/responseCreator', () => ({
  __esModule: true,
  default: ({ promptID }: { promptID: string }) => (
    <div data-testid="response-creator" data-prompt-id={promptID}>
      Response Creator
    </div>
  ),
}));

jest.mock('@/src/components/responseViewer', () => ({
  __esModule: true,
  default: ({ responseContent }: { responseContent: any }) => (
    <div data-testid="response-viewer" data-content={JSON.stringify(responseContent)}>
      Response Viewer
    </div>
  ),
}));

jest.mock('@/src/components/CategoryDisplayBar', () => ({
  __esModule: true,
  default: ({ categories }: { categories: string[] }) => (
    <div data-testid="category-display-bar" data-categories={JSON.stringify(categories)}>
      Category Display Bar
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  MessageSquare: () => <div data-testid="message-square-icon">MessageSquare</div>,
  User: () => <div data-testid="user-icon">User</div>,
}));

// Type the mocked functions
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
const mockedFormatDistanceToNow = formatDistanceToNow as jest.MockedFunction<typeof formatDistanceToNow>;

describe('PromptViewer', () => {
  // Sample data for tests
  const mockPromptId = 'prompt-123';
  const mockPromptData = {
    title: 'Test Prompt Title',
    prompt: 'This is a test prompt content',
    created_at: '2023-03-01T00:00:00Z',
    author: 'testuser',
    categories: ['fiction', 'short-story'],
  };
  
  const mockResponses = [
    {
      id: 'response-1',
      prompt_id: mockPromptId,
      content: { text: 'Response 1 content' },
      author: 'user1',
      created_at: '2023-03-02T00:00:00Z',
    },
    {
      id: 'response-2',
      prompt_id: mockPromptId,
      content: { text: 'Response 2 content' },
      author: 'user2',
      created_at: '2023-03-03T00:00:00Z',
    },
  ];

  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock router
    const pushMock = jest.fn();
    (mockedUseRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
    
    // Mock params
    (mockedUseParams as jest.Mock).mockReturnValue({
      id: mockPromptId,
    });
    
    // Mock formatDistanceToNow
    (mockedFormatDistanceToNow as jest.Mock).mockReturnValue('2 days ago');
    
    // Mock fetch for prompt data
    (mockedFetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/getSpecificPrompt') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ promptData: mockPromptData }),
          text: () => Promise.resolve(''),
        });
      } else if (url === '/api/getResponses') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ responses: mockResponses }),
          text: () => Promise.resolve(''),
        });
      }
      return Promise.reject(new Error('Not found'));
    });
    
    // Mock Supabase client and channel
    const unsubscribeMock = jest.fn();
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(function(callback) {
        callback('SUBSCRIBED');
        return this;
      }),
      unsubscribe: unsubscribeMock,
    };
    
    (mockedCreateClient as jest.Mock).mockReturnValue({
      channel: jest.fn().mockReturnValue(mockChannel),
    });
  });

  test('renders prompt data after loading', async () => {
    render(<PromptViewer />);
    
    // Wait for prompt data to load
    await waitFor(() => {
      expect(screen.getByText(mockPromptData.title)).toBeInTheDocument();
    });
    
    // Check prompt content is displayed
    expect(screen.getByText(mockPromptData.prompt)).toBeInTheDocument();
    
    // Check for the author element directly - more specific
    const authorElement = screen.getByText(mockPromptData.author);
    expect(authorElement).toBeInTheDocument();
    
    // Check that author element's parent contains "Posted by" text
    const parentElement = authorElement.parentElement;
    expect(parentElement?.textContent).toContain('Posted by');
    
    // Check that CategoryDisplayBar received the categories
    const categoryBar = screen.getByTestId('category-display-bar');
    expect(categoryBar).toHaveAttribute('data-categories', JSON.stringify(mockPromptData.categories));
  });

  test('renders response section with responses', async () => {
    render(<PromptViewer />);
    
    // Wait for responses to load
    await waitFor(() => {
      expect(screen.getByText('Community Responses')).toBeInTheDocument();
    });
    
    // Check that responses are rendered
    await waitFor(() => {
      const responseViewers = screen.getAllByTestId('response-viewer');
      expect(responseViewers.length).toBe(mockResponses.length);
    });
    
    // Check author information
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  test('shows empty state when no responses', async () => {
    // Mock empty responses
    (mockedFetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/getSpecificPrompt') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ promptData: mockPromptData }),
          text: () => Promise.resolve(''),
        });
      } else if (url === '/api/getResponses') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ responses: [] }),
          text: () => Promise.resolve(''),
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<PromptViewer />);
    
    // Wait for the no responses message
    await waitFor(() => {
      expect(screen.getByText('No responses yet')).toBeInTheDocument();
      expect(screen.getByText('Be the first to share your thoughts on this prompt!')).toBeInTheDocument();
    });
    
    // Check for the message square icon
    expect(screen.getByTestId('message-square-icon')).toBeInTheDocument();
  });

  test('navigates back when back button is clicked', async () => {
    const pushMock = jest.fn();
    (mockedUseRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    render(<PromptViewer />);
    
    // Find and click the back button
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    
    // Check that router.push was called with the correct path
    expect(pushMock).toHaveBeenCalledWith('/prompts');
  });

  test('includes response creator with correct promptID', async () => {
    render(<PromptViewer />);
    
    // Check that response creator component is rendered with the correct promptID
    await waitFor(() => {
      const responseCreator = screen.getByTestId('response-creator');
      expect(responseCreator).toHaveAttribute('data-prompt-id', mockPromptId);
    });
  });

  test('handles API error when fetching prompt', async () => {
    // Mock console.error to prevent output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock fetch to return an error
    (mockedFetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/getSpecificPrompt') {
        return Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Server error'),
        });
      }
      // Keep the responses endpoint working
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ responses: mockResponses }),
        text: () => Promise.resolve(''),
      });
    });

    render(<PromptViewer />);
    
    // Wait for fetch to complete
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles real-time insertion of new responses', async () => {
    // Setup channel mock with subscription callback
    let onChangeCallback: any;
    const mockChannel = {
      on: jest.fn().mockImplementation((event, filter, callback) => {
        onChangeCallback = callback;
        return mockChannel;
      }),
      subscribe: jest.fn(function(callback) {
        callback('SUBSCRIBED');
        return this;
      }),
      unsubscribe: jest.fn(),
    };
    
    (mockedCreateClient as jest.Mock).mockReturnValue({
      channel: jest.fn().mockReturnValue(mockChannel),
    });

    render(<PromptViewer />);
    
    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByText(mockPromptData.title)).toBeInTheDocument();
    });
    
    // Simulate a real-time response insertion
    const newResponse = {
      id: 'response-3',
      prompt_id: mockPromptId,
      content: { text: 'New real-time response' },
      author: 'user3',
      created_at: '2023-03-04T00:00:00Z',
    };
    
    // Call the handleRealTimeInsert callback with a simulated payload
    if (onChangeCallback) {
      act(() => {
        onChangeCallback({
          eventType: 'INSERT',
          new: newResponse
        });
      });
      
      // Check that the new response is added to the UI
      await waitFor(() => {
        expect(screen.getByText('user3')).toBeInTheDocument();
      });
    }
  });

  test('fetches more responses when scrolling to the bottom', async () => {
    // Reset mock to ensure clean call count
    (mockedFetch as jest.Mock).mockClear();
    
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(function(callback) {
        callback('SUBSCRIBED');
        return this;
      }),
      unsubscribe: jest.fn(),
    };
    
    (mockedCreateClient as jest.Mock).mockReturnValue({
      channel: jest.fn().mockReturnValue(mockChannel),
    });
    
    render(<PromptViewer />);
    
    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByText(mockPromptData.title)).toBeInTheDocument();
    });
    
    // Get initial fetch count (including prompt and initial responses)
    const initialFetchCount = (mockedFetch as jest.Mock).mock.calls.length;
    
    // Mock the IntersectionObserver callback directly
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];
    
    // Trigger the callback with isIntersecting true
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    
    // Wait for the fetch to be called with the correct path
    await waitFor(() => {
      const fetchCalls = (mockedFetch as jest.Mock).mock.calls;
      let foundResponsesFetch = false;
      
      for (let i = initialFetchCount; i < fetchCalls.length; i++) {
        if (fetchCalls[i][0] === '/api/getResponses') {
          foundResponsesFetch = true;
          break;
        }
      }
      
      expect(foundResponsesFetch).toBe(true);
    });
  });
});