/**
 * Recommendations Page
 * Main page for displaying AI-powered social recommendations and insights
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Heart, 
  Star, 
  BarChart3,
  RefreshCw,
  Settings,
  Filter
} from 'lucide-react';
import { 
  useFriendRecommendations,
  useTeamRecommendations,
  useContentRecommendations,
  useMentorshipRecommendations,
  useSocialInsights,
  useSubmitRecommendationFeedback,
  useRefreshRecommendations
} from '../hooks/useSocialRecommendations';
import {
  useRealtimeFriendRecommendations,
  useRealtimeTeamRecommendations,
  useRealtimeContentRecommendations,
  useRealtimeMentorshipRecommendations,
  useRealtimeSocialInsights,
  useRealtimeConnection,
  useRealtimeNotifications
} from '../hooks/useRealtimeRecommendations';
import { RecommendationsList } from '../components/social/recommendations/RecommendationsList';
import { SocialInsightsDashboard } from '../components/social/insights/SocialInsightsDashboard';
import { RealtimeIndicator } from '../components/social/recommendations/RealtimeIndicator';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';

const RecommendationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'teams' | 'content' | 'mentorship' | 'insights'>('friends');
  const [showSettings, setShowSettings] = useState(false);
  const [enableRealtime, setEnableRealtime] = useState(true);

  // Real-time connection management
  const { isConnected, connect, disconnect } = useRealtimeConnection();
  const { unreadCount } = useRealtimeNotifications();

  // Hooks for different recommendation types with real-time updates
  const {
    recommendations: friendRecommendations,
    loading: friendsLoading,
    error: friendsError,
    refresh: refreshFriends,
    isRealtimeConnected: friendsRealtime,
    recentUpdates: friendsUpdates
  } = enableRealtime 
    ? useRealtimeFriendRecommendations({ limit: 10 })
    : useFriendRecommendations({ limit: 10 });

  const {
    recommendations: teamRecommendations,
    loading: teamsLoading,
    error: teamsError,
    refresh: refreshTeams,
    isRealtimeConnected: teamsRealtime,
    recentUpdates: teamsUpdates
  } = enableRealtime 
    ? useRealtimeTeamRecommendations({ limit: 10 })
    : useTeamRecommendations({ limit: 10 });

  const {
    recommendations: contentRecommendations,
    loading: contentLoading,
    error: contentError,
    refresh: refreshContent,
    isRealtimeConnected: contentRealtime,
    recentUpdates: contentUpdates
  } = enableRealtime 
    ? useRealtimeContentRecommendations({ limit: 20 })
    : useContentRecommendations({ limit: 20 });

  const {
    recommendations: mentorshipRecommendations,
    loading: mentorshipLoading,
    error: mentorshipError,
    refresh: refreshMentorship,
    isRealtimeConnected: mentorshipRealtime,
    recentUpdates: mentorshipUpdates
  } = enableRealtime 
    ? useRealtimeMentorshipRecommendations()
    : useMentorshipRecommendations();

  const {
    insights,
    loading: insightsLoading,
    error: insightsError,
    refresh: refreshInsights,
    isRealtimeConnected: insightsRealtime,
    recentUpdates: insightsUpdates
  } = enableRealtime 
    ? useRealtimeSocialInsights()
    : useSocialInsights();

  const submitFeedbackMutation = useSubmitRecommendationFeedback();
  const refreshRecommendationsMutation = useRefreshRecommendations();

  const handleAcceptRecommendation = async (recommendation: any) => {
    try {
      // Handle the acceptance logic based on recommendation type
      console.log('Accepting recommendation:', recommendation);
      
      // Submit feedback
      await submitFeedbackMutation.mutateAsync({
        recommendationId: recommendation.id,
        type: activeTab as any,
        action: 'accepted',
        rating: 5
      });
    } catch (error) {
      console.error('Failed to accept recommendation:', error);
    }
  };

  const handleRejectRecommendation = async (recommendation: any) => {
    try {
      console.log('Rejecting recommendation:', recommendation);
      
      await submitFeedbackMutation.mutateAsync({
        recommendationId: recommendation.id,
        type: activeTab as any,
        action: 'rejected',
        rating: 1
      });
    } catch (error) {
      console.error('Failed to reject recommendation:', error);
    }
  };

  const handleIgnoreRecommendation = async (recommendation: any) => {
    try {
      console.log('Ignoring recommendation:', recommendation);
      
      await submitFeedbackMutation.mutateAsync({
        recommendationId: recommendation.id,
        type: activeTab as any,
        action: 'ignored'
      });
    } catch (error) {
      console.error('Failed to ignore recommendation:', error);
    }
  };

  const handleFeedback = async (recommendation: any, feedback: string) => {
    try {
      await submitFeedbackMutation.mutateAsync({
        recommendationId: recommendation.id,
        type: activeTab as any,
        action: 'ignored',
        feedback
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleRefreshAll = async () => {
    try {
      await refreshRecommendationsMutation.mutateAsync({
        types: ['friend', 'team', 'content', 'mentorship']
      });
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    }
  };

  const handleRecommendationClick = (recommendation: any) => {
    console.log('Recommendation clicked:', recommendation);
    // Handle navigation or action based on recommendation type
  };

  const tabs = [
    {
      id: 'friends',
      label: 'Friends',
      icon: Users,
      count: friendRecommendations.length,
      color: 'blue',
      isRealtime: friendsRealtime,
      recentUpdates: friendsUpdates?.length || 0
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: Target,
      count: teamRecommendations.length,
      color: 'green',
      isRealtime: teamsRealtime,
      recentUpdates: teamsUpdates?.length || 0
    },
    {
      id: 'content',
      label: 'Content',
      icon: Heart,
      count: contentRecommendations.length,
      color: 'purple',
      isRealtime: contentRealtime,
      recentUpdates: contentUpdates?.length || 0
    },
    {
      id: 'mentorship',
      label: 'Mentorship',
      icon: Star,
      count: mentorshipRecommendations.length,
      color: 'orange',
      isRealtime: mentorshipRealtime,
      recentUpdates: mentorshipUpdates?.length || 0
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: BarChart3,
      count: null,
      color: 'gray',
      isRealtime: insightsRealtime,
      recentUpdates: insightsUpdates?.length || 0
    }
  ];

  const getTabColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      case 'orange':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCurrentRecommendations = () => {
    switch (activeTab) {
      case 'friends':
        return {
          recommendations: friendRecommendations,
          loading: friendsLoading,
          error: friendsError,
          onRefresh: refreshFriends
        };
      case 'teams':
        return {
          recommendations: teamRecommendations,
          loading: teamsLoading,
          error: teamsError,
          onRefresh: refreshTeams
        };
      case 'content':
        return {
          recommendations: contentRecommendations,
          loading: contentLoading,
          error: contentError,
          onRefresh: refreshContent
        };
      case 'mentorship':
        return {
          recommendations: mentorshipRecommendations,
          loading: mentorshipLoading,
          error: mentorshipError,
          onRefresh: refreshMentorship
        };
      default:
        return {
          recommendations: [],
          loading: false,
          error: null,
          onRefresh: () => {}
        };
    }
  };

  const currentRecommendations = getCurrentRecommendations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
              <p className="text-gray-600 mt-2">
                Discover personalized recommendations powered by AI to enhance your social experience
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Real-time Indicator */}
              <RealtimeIndicator 
                compact={true}
                showNotifications={true}
                showConnectionStatus={true}
                onNotificationClick={() => {
                  // Handle notification click
                  console.log('Notifications clicked');
                }}
              />
              
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button
                onClick={handleRefreshAll}
                variant="outline"
                size="sm"
                disabled={refreshRecommendationsMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshRecommendationsMutation.isPending ? 'animate-spin' : ''}`} />
                Refresh All
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Real-time Updates
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enableRealtime}
                      onChange={(e) => setEnableRealtime(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">
                      {enableRealtime ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {enableRealtime && (
                    <div className="mt-2">
                      <RealtimeIndicator compact={true} showConnectionStatus={true} />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Confidence Score
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.5"
                    className="w-full"
                    aria-label="Minimum confidence score"
                    title="Adjust minimum confidence score for recommendations"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Age (hours)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="168"
                    step="1"
                    defaultValue="24"
                    className="w-full"
                    aria-label="Maximum age in hours"
                    title="Adjust maximum age of recommendations in hours"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-refresh Interval
                  </label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    aria-label="Auto-refresh interval"
                    title="Select auto-refresh interval for recommendations"
                    disabled={enableRealtime}
                  >
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                  {enableRealtime && (
                    <p className="text-xs text-gray-500 mt-1">
                      Disabled when real-time is enabled
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getTabColor(tab.color)}`}
                      >
                        {tab.count}
                      </Badge>
                    )}
                    {tab.isRealtime && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {tab.recentUpdates > 0 && (
                          <Badge variant="destructive" className="text-xs h-4 w-4 p-0 flex items-center justify-center">
                            {tab.recentUpdates}
                          </Badge>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'insights' ? (
            <SocialInsightsDashboard
              insights={insights!}
              loading={insightsLoading}
              error={insightsError}
              onRefresh={refreshInsights}
              showRecommendations={true}
              onRecommendationClick={handleRecommendationClick}
            />
          ) : (
            <RecommendationsList
              recommendations={currentRecommendations.recommendations}
              loading={currentRecommendations.loading}
              error={currentRecommendations.error}
              onRefresh={currentRecommendations.onRefresh}
              type={activeTab as any}
              onAccept={handleAcceptRecommendation}
              onReject={handleRejectRecommendation}
              onIgnore={handleIgnoreRecommendation}
              onFeedback={handleFeedback}
              showActions={true}
              showFilters={true}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
