/**
 * Recommendations System Test Suite
 * Comprehensive testing for social recommendations and insights
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RecommendationsPage } from '../pages/RecommendationsPage';
import { RecommendationsList } from '../components/social/recommendations/RecommendationsList';
import { SocialInsightsDashboard } from '../components/social/insights/SocialInsightsDashboard';
import { RealtimeIndicator } from '../components/social/recommendations/RealtimeIndicator';
import { PerformanceMonitor } from '../components/social/recommendations/PerformanceMonitor';

// Mock data
const mockFriendRecommendations = [
  {
    id: '1',
    confidence: 0.85,
    aiScore: 0.82,
    reasoning: 'You have 3 mutual friends and share similar interests',
    createdAt: new Date().toISOString(),
    user: {
      id: 'user1',
      username: 'john_doe',
      displayName: 'John Doe',
      avatarUrl: '/avatar1.jpg',
      bio: 'Fitness enthusiast',
      location: 'New York',
      activityLevel: 3,
      goals: ['weight_loss', 'muscle_gain'],
      interests: ['fitness', 'nutrition']
    },
    mutualFriends: 3,
    commonInterests: ['fitness', 'nutrition'],
    locationSimilarity: 0.9,
    activitySimilarity: 0.8,
    goalsSimilarity: 0.7,
    whyRecommended: ['mutual_friends', 'common_interests'],
    matchReasons: ['3 mutual friends', 'Shared fitness interests']
  }
];

const mockTeamRecommendations = [
  {
    id: '2',
    confidence: 0.78,
    aiScore: 0.75,
    reasoning: 'This team matches your fitness goals and activity level',
    createdAt: new Date().toISOString(),
    team: {
      id: 'team1',
      name: 'Fitness Warriors',
      description: 'A team focused on weight loss and muscle building',
      challengeType: 'weight_loss',
      goals: ['weight_loss', 'muscle_gain'],
      activityLevel: 3,
      maxMembers: 10,
      privacy: 'public',
      createdAt: new Date().toISOString()
    },
    memberCount: 7,
    challengeCount: 2,
    goalAlignment: 0.9,
    activityMatch: 0.8,
    locationMatch: 0.6,
    availabilityScore: 0.3,
    matchReason: 'Perfect goal alignment and similar activity level',
    compatibilityScore: 0.75
  }
];

const mockSocialInsights = {
  engagementTrends: {
    trend: 'increasing',
    change: 15,
    recentAverage: 25,
    message: 'Your engagement is growing nicely!',
    period: '7d'
  },
  socialGrowth: {
    totalFriends: 45,
    newFriends30d: 8,
    newFriends7d: 2,
    growthRate: 17.8,
    message: 'You\'ve added 2 new friends this week!',
    trend: 'growing'
  },
  contentPerformance: {
    totalPosts: 12,
    averageLikes: 8,
    averageComments: 3,
    bestPostLikes: 25,
    bestPostComments: 12,
    engagementScore: 0.7,
    message: 'Your content is getting good engagement!'
  },
  networkAnalysis: {
    networkSize: 45,
    averageFriendsPerConnection: 12,
    averagePostsPerConnection: 5,
    averageLikesPerConnection: 8,
    networkDensity: 0.6,
    message: 'You have a strong network! Keep nurturing these connections.',
    influentialConnections: []
  },
  recommendations: [
    {
      type: 'content',
      priority: 'high',
      message: 'Try posting more content to increase engagement',
      action: 'Create your first post',
      expectedImpact: 'Increase engagement by 20%',
      difficulty: 'easy'
    }
  ],
  generatedAt: new Date().toISOString(),
  nextUpdateAt: new Date(Date.now() + 3600000).toISOString()
};

// Mock API responses
const mockApiResponses = {
  friendRecommendations: {
    success: true,
    data: mockFriendRecommendations,
    message: 'Friend recommendations retrieved successfully'
  },
  teamRecommendations: {
    success: true,
    data: mockTeamRecommendations,
    message: 'Team recommendations retrieved successfully'
  },
  socialInsights: {
    success: true,
    data: mockSocialInsights,
    message: 'Social insights retrieved successfully'
  }
};

// Mock hooks
vi.mock('../hooks/useSocialRecommendations', () => ({
  useFriendRecommendations: () => ({
    recommendations: mockFriendRecommendations,
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn()
  }),
  useTeamRecommendations: () => ({
    recommendations: mockTeamRecommendations,
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn()
  }),
  useContentRecommendations: () => ({
    recommendations: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn()
  }),
  useMentorshipRecommendations: () => ({
    recommendations: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn()
  }),
  useSocialInsights: () => ({
    insights: mockSocialInsights,
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn()
  }),
  useSubmitRecommendationFeedback: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ success: true })
  }),
  useRefreshRecommendations: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ success: true }),
    isPending: false
  })
}));

vi.mock('../hooks/useRealtimeRecommendations', () => ({
  useRealtimeFriendRecommendations: () => ({
    recommendations: mockFriendRecommendations,
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn(),
    isRealtimeConnected: true,
    recentUpdates: []
  }),
  useRealtimeTeamRecommendations: () => ({
    recommendations: mockTeamRecommendations,
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn(),
    isRealtimeConnected: true,
    recentUpdates: []
  }),
  useRealtimeContentRecommendations: () => ({
    recommendations: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn(),
    isRealtimeConnected: true,
    recentUpdates: []
  }),
  useRealtimeMentorshipRecommendations: () => ({
    recommendations: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn(),
    isRealtimeConnected: true,
    recentUpdates: []
  }),
  useRealtimeSocialInsights: () => ({
    insights: mockSocialInsights,
    loading: false,
    error: null,
    refetch: vi.fn(),
    refresh: vi.fn(),
    isRealtimeConnected: true,
    recentUpdates: []
  }),
  useRealtimeConnection: () => ({
    isConnected: true,
    connectionStatus: { isConnected: true, reconnectAttempts: 0, userId: 'user1' },
    connect: vi.fn(),
    disconnect: vi.fn(),
    joinRecommendationRoom: vi.fn(),
    leaveRecommendationRoom: vi.fn()
  }),
  useRealtimeNotifications: () => ({
    unreadCount: 0
  })
}));

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Recommendations System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('RecommendationsPage', () => {
    it('renders the main recommendations page', () => {
      render(
        <TestWrapper>
          <RecommendationsPage />
        </TestWrapper>
      );

      expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Discover personalized recommendations powered by AI')).toBeInTheDocument();
    });

    it('displays all recommendation tabs', () => {
      render(
        <TestWrapper>
          <RecommendationsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Friends')).toBeInTheDocument();
      expect(screen.getByText('Teams')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Mentorship')).toBeInTheDocument();
      expect(screen.getByText('Insights')).toBeInTheDocument();
    });

    it('shows real-time indicator', () => {
      render(
        <TestWrapper>
          <RecommendationsPage />
        </TestWrapper>
      );

      // Real-time indicator should be present
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });

    it('toggles settings panel', async () => {
      render(
        <TestWrapper>
          <RecommendationsPage />
        </TestWrapper>
      );

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Recommendation Settings')).toBeInTheDocument();
      });
    });

    it('switches between tabs', async () => {
      render(
        <TestWrapper>
          <RecommendationsPage />
        </TestWrapper>
      );

      const teamsTab = screen.getByText('Teams');
      fireEvent.click(teamsTab);

      await waitFor(() => {
        expect(teamsTab.closest('button')).toHaveClass('border-blue-500');
      });
    });
  });

  describe('RecommendationsList', () => {
    it('renders friend recommendations', () => {
      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={mockFriendRecommendations}
            type="friend"
            onAccept={vi.fn()}
            onReject={vi.fn()}
            onIgnore={vi.fn()}
            onFeedback={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Friend Recommendations')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('You have 3 mutual friends and share similar interests')).toBeInTheDocument();
    });

    it('renders team recommendations', () => {
      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={mockTeamRecommendations}
            type="team"
            onAccept={vi.fn()}
            onReject={vi.fn()}
            onIgnore={vi.fn()}
            onFeedback={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Team Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Fitness Warriors')).toBeInTheDocument();
      expect(screen.getByText('This team matches your fitness goals and activity level')).toBeInTheDocument();
    });

    it('handles recommendation actions', async () => {
      const onAccept = vi.fn();
      const onReject = vi.fn();
      const onIgnore = vi.fn();

      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={mockFriendRecommendations}
            type="friend"
            onAccept={onAccept}
            onReject={onReject}
            onIgnore={onIgnore}
            onFeedback={vi.fn()}
          />
        </TestWrapper>
      );

      const acceptButton = screen.getByRole('button', { name: /accept/i });
      fireEvent.click(acceptButton);

      expect(onAccept).toHaveBeenCalledWith(mockFriendRecommendations[0]);
    });

    it('shows loading state', () => {
      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={[]}
            loading={true}
            type="friend"
            onAccept={vi.fn()}
            onReject={vi.fn()}
            onIgnore={vi.fn()}
            onFeedback={vi.fn()}
          />
        </TestWrapper>
      );

      // Should show loading skeleton
      expect(screen.getByText('Friend Recommendations')).toBeInTheDocument();
    });

    it('shows error state', () => {
      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={[]}
            error="Failed to load recommendations"
            type="friend"
            onAccept={vi.fn()}
            onReject={vi.fn()}
            onIgnore={vi.fn()}
            onFeedback={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Error Loading Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Failed to load recommendations')).toBeInTheDocument();
    });

    it('filters recommendations', async () => {
      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={mockFriendRecommendations}
            type="friend"
            showFilters={true}
            onAccept={vi.fn()}
            onReject={vi.fn()}
            onIgnore={vi.fn()}
            onFeedback={vi.fn()}
          />
        </TestWrapper>
      );

      const filterButton = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Min Confidence')).toBeInTheDocument();
      });
    });
  });

  describe('SocialInsightsDashboard', () => {
    it('renders social insights dashboard', () => {
      render(
        <TestWrapper>
          <SocialInsightsDashboard insights={mockSocialInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('Social Insights')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument(); // Total friends
      expect(screen.getByText('12')).toBeInTheDocument(); // Total posts
    });

    it('switches between insight tabs', async () => {
      render(
        <TestWrapper>
          <SocialInsightsDashboard insights={mockSocialInsights} />
        </TestWrapper>
      );

      const engagementTab = screen.getByText('Engagement');
      fireEvent.click(engagementTab);

      await waitFor(() => {
        expect(screen.getByText('Engagement Trends')).toBeInTheDocument();
      });
    });

    it('displays engagement trends', () => {
      render(
        <TestWrapper>
          <SocialInsightsDashboard insights={mockSocialInsights} />
        </TestWrapper>
      );

      expect(screen.getByText('Your engagement is growing nicely!')).toBeInTheDocument();
      expect(screen.getByText('+15%')).toBeInTheDocument();
    });

    it('shows AI recommendations', () => {
      render(
        <TestWrapper>
          <SocialInsightsDashboard insights={mockSocialInsights} showRecommendations={true} />
        </TestWrapper>
      );

      expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Try posting more content to increase engagement')).toBeInTheDocument();
    });
  });

  describe('RealtimeIndicator', () => {
    it('renders real-time indicator', () => {
      render(
        <TestWrapper>
          <RealtimeIndicator />
        </TestWrapper>
      );

      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('shows connection status', () => {
      render(
        <TestWrapper>
          <RealtimeIndicator showConnectionStatus={true} />
        </TestWrapper>
      );

      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('shows notifications count', () => {
      render(
        <TestWrapper>
          <RealtimeIndicator showNotifications={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });

    it('renders in compact mode', () => {
      render(
        <TestWrapper>
          <RealtimeIndicator compact={true} />
        </TestWrapper>
      );

      // Should render without full text labels
      expect(screen.queryByText('Live')).not.toBeInTheDocument();
    });
  });

  describe('PerformanceMonitor', () => {
    it('renders performance monitor', () => {
      render(
        <TestWrapper>
          <PerformanceMonitor />
        </TestWrapper>
      );

      expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      expect(screen.getByText('API Response')).toBeInTheDocument();
      expect(screen.getByText('Cache Hit Rate')).toBeInTheDocument();
    });

    it('starts and stops monitoring', async () => {
      render(
        <TestWrapper>
          <PerformanceMonitor />
        </TestWrapper>
      );

      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Monitoring')).toBeInTheDocument();
      });

      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText('Stopped')).toBeInTheDocument();
      });
    });

    it('shows performance metrics', () => {
      render(
        <TestWrapper>
          <PerformanceMonitor showDetails={true} />
        </TestWrapper>
      );

      expect(screen.getByText('Performance Trends')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('handles recommendation feedback flow', async () => {
      const onFeedback = vi.fn();

      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={mockFriendRecommendations}
            type="friend"
            onAccept={vi.fn()}
            onReject={vi.fn()}
            onIgnore={vi.fn()}
            onFeedback={onFeedback}
          />
        </TestWrapper>
      );

      const feedbackButton = screen.getByRole('button', { name: /feedback/i });
      fireEvent.click(feedbackButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/share your feedback/i)).toBeInTheDocument();
      });

      const feedbackInput = screen.getByPlaceholderText(/share your feedback/i);
      fireEvent.change(feedbackInput, { target: { value: 'Great recommendation!' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      expect(onFeedback).toHaveBeenCalledWith(mockFriendRecommendations[0], 'Great recommendation!');
    });

    it('handles real-time updates', async () => {
      render(
        <TestWrapper>
          <RecommendationsPage />
        </TestWrapper>
      );

      // Should show real-time connection status
      expect(screen.getByText('Live')).toBeInTheDocument();
    });

    it('handles error states gracefully', () => {
      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={[]}
            error="Network error"
            type="friend"
            onAccept={vi.fn()}
            onReject={vi.fn()}
            onIgnore={vi.fn()}
            onFeedback={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Error Loading Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={mockFriendRecommendations}
            type="friend"
            showFilters={true}
            onAccept={vi.fn()}
            onReject={vi.fn()}
            onIgnore={vi.fn()}
            onFeedback={vi.fn()}
          />
        </TestWrapper>
      );

      const filterButton = screen.getByRole('button', { name: /filters/i });
      fireEvent.click(filterButton);

      // Check for proper ARIA labels on form elements
      expect(screen.getByLabelText(/minimum confidence threshold/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/maximum age in hours/i)).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <TestWrapper>
          <RecommendationsPage />
        </TestWrapper>
      );

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      settingsButton.focus();
      expect(settingsButton).toHaveFocus();

      fireEvent.keyDown(settingsButton, { key: 'Enter' });
      // Should open settings panel
    });

    it('has proper color contrast', () => {
      render(
        <TestWrapper>
          <RecommendationsList
            recommendations={mockFriendRecommendations}
            type="friend"
            onAccept={vi.fn()}
            onReject={vi.fn()}
            onIgnore={vi.fn()}
            onFeedback={vi.fn()}
          />
        </TestWrapper>
      );

      // Check that confidence scores are visible
      expect(screen.getByText('85% match')).toBeInTheDocument();
    });
  });
});
