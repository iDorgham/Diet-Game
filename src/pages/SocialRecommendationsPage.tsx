/**
 * Social Recommendations Page
 * Comprehensive page for AI-powered social recommendations and insights
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageCircle,
  GraduationCap,
  BarChart3,
  RefreshCw,
  Filter,
  Search,
  Star,
  TrendingUp,
  Lightbulb,
  Settings,
  Bell,
  Heart,
  Target
} from 'lucide-react';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useFriendRecommendations } from '../../hooks/useSocialRecommendations';
import { useTeamRecommendations } from '../../hooks/useSocialRecommendations';
import { useContentRecommendations } from '../../hooks/useSocialRecommendations';
import { useMentorshipRecommendations } from '../../hooks/useSocialRecommendations';
import { useSocialInsights } from '../../hooks/useSocialRecommendations';
import { useSubmitRecommendationFeedback } from '../../hooks/useSocialRecommendations';
import { useRefreshRecommendations } from '../../hooks/useSocialRecommendations';
import RecommendationCard from '../../components/social/recommendations/RecommendationCard';
import SocialInsightsDashboard from '../../components/social/insights/SocialInsightsDashboard';
import {
  FriendRecommendation,
  TeamRecommendation,
  ContentRecommendation,
  MentorshipRecommendation,
  InsightRecommendation
} from '../../types/socialRecommendations';

const SocialRecommendationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    minConfidence: 0.5,
    maxAge: 24,
    includeTypes: ['friend', 'team', 'content', 'mentorship']
  });

  // Hooks for different recommendation types
  const { 
    recommendations: friendRecommendations, 
    loading: friendsLoading, 
    refresh: refreshFriends 
  } = useFriendRecommendations({ limit: 10 });

  const { 
    recommendations: teamRecommendations, 
    loading: teamsLoading, 
    refresh: refreshTeams 
  } = useTeamRecommendations({ limit: 10 });

  const { 
    recommendations: contentRecommendations, 
    loading: contentLoading, 
    refresh: refreshContent 
  } = useContentRecommendations({ limit: 20 });

  const { 
    recommendations: mentorshipRecommendations, 
    loading: mentorshipLoading, 
    refresh: refreshMentorship 
  } = useMentorshipRecommendations();

  const { insights, loading: insightsLoading } = useSocialInsights();

  // Mutation hooks
  const submitFeedback = useSubmitRecommendationFeedback();
  const refreshAll = useRefreshRecommendations();

  const handleRecommendationAction = async (
    recommendation: FriendRecommendation | TeamRecommendation | ContentRecommendation | MentorshipRecommendation,
    action: 'accept' | 'reject' | 'ignore',
    type: 'friend' | 'team' | 'content' | 'mentorship'
  ) => {
    try {
      await submitFeedback.mutateAsync({
        recommendationId: recommendation.id,
        type,
        action
      });

      // Refresh the specific recommendation type
      switch (type) {
        case 'friend':
          refreshFriends();
          break;
        case 'team':
          refreshTeams();
          break;
        case 'content':
          refreshContent();
          break;
        case 'mentorship':
          refreshMentorship();
          break;
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleRefreshAll = async () => {
    try {
      await refreshAll.mutateAsync({
        types: ['friend', 'team', 'content', 'mentorship']
      });
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
    }
  };

  const handleInsightRecommendationClick = (recommendation: InsightRecommendation) => {
    // Navigate to relevant section or perform action
    console.log('Insight recommendation clicked:', recommendation);
  };

  const filteredRecommendations = (recommendations: any[], type: string) => {
    return recommendations.filter(rec => {
      const matchesSearch = !searchQuery || 
        rec.user?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.team?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.post?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.mentor?.user?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesConfidence = rec.confidence >= selectedFilters.minConfidence;
      const matchesType = selectedFilters.includeTypes.includes(type);

      return matchesSearch && matchesConfidence && matchesType;
    });
  };

  const tabs = [
    {
      id: 'insights',
      label: 'Insights',
      icon: BarChart3,
      content: (
        <SocialInsightsDashboard
          onRecommendationClick={handleInsightRecommendationClick}
          showRecommendations={true}
        />
      )
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: Users,
      badge: friendRecommendations.length,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Friend Recommendations</h3>
            <Button onClick={refreshFriends} variant="outline" size="sm" disabled={friendsLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${friendsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {friendsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecommendations(friendRecommendations, 'friend').map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  type="friend"
                  onAccept={(rec) => handleRecommendationAction(rec, 'accept', 'friend')}
                  onReject={(rec) => handleRecommendationAction(rec, 'reject', 'friend')}
                  onIgnore={(rec) => handleRecommendationAction(rec, 'ignore', 'friend')}
                />
              ))}
              {filteredRecommendations(friendRecommendations, 'friend').length === 0 && (
                <Card className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Friend Recommendations</h3>
                  <p className="text-gray-600">We'll suggest new friends based on your activity and interests.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: Target,
      badge: teamRecommendations.length,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Recommendations</h3>
            <Button onClick={refreshTeams} variant="outline" size="sm" disabled={teamsLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${teamsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {teamsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecommendations(teamRecommendations, 'team').map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  type="team"
                  onAccept={(rec) => handleRecommendationAction(rec, 'accept', 'team')}
                  onReject={(rec) => handleRecommendationAction(rec, 'reject', 'team')}
                  onIgnore={(rec) => handleRecommendationAction(rec, 'ignore', 'team')}
                />
              ))}
              {filteredRecommendations(teamRecommendations, 'team').length === 0 && (
                <Card className="p-8 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Recommendations</h3>
                  <p className="text-gray-600">We'll suggest teams that match your goals and interests.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'content',
      label: 'Content',
      icon: MessageCircle,
      badge: contentRecommendations.length,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Content Recommendations</h3>
            <Button onClick={refreshContent} variant="outline" size="sm" disabled={contentLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${contentLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {contentLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecommendations(contentRecommendations, 'content').map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  type="content"
                  onAccept={(rec) => handleRecommendationAction(rec, 'accept', 'content')}
                  onReject={(rec) => handleRecommendationAction(rec, 'reject', 'content')}
                  onIgnore={(rec) => handleRecommendationAction(rec, 'ignore', 'content')}
                />
              ))}
              {filteredRecommendations(contentRecommendations, 'content').length === 0 && (
                <Card className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Recommendations</h3>
                  <p className="text-gray-600">We'll suggest posts and content based on your interests.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'mentorship',
      label: 'Mentorship',
      icon: GraduationCap,
      badge: mentorshipRecommendations.length,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mentorship Recommendations</h3>
            <Button onClick={refreshMentorship} variant="outline" size="sm" disabled={mentorshipLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${mentorshipLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {mentorshipLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecommendations(mentorshipRecommendations, 'mentorship').map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  type="mentorship"
                  onAccept={(rec) => handleRecommendationAction(rec, 'accept', 'mentorship')}
                  onReject={(rec) => handleRecommendationAction(rec, 'reject', 'mentorship')}
                  onIgnore={(rec) => handleRecommendationAction(rec, 'ignore', 'mentorship')}
                />
              ))}
              {filteredRecommendations(mentorshipRecommendations, 'mentorship').length === 0 && (
                <Card className="p-8 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mentorship Recommendations</h3>
                  <p className="text-gray-600">We'll suggest mentors based on your goals and experience level.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Social Recommendations</h1>
              <p className="text-gray-600 mt-2">
                AI-powered recommendations to enhance your social experience
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleRefreshAll} variant="outline" disabled={refreshAll.isPending}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshAll.isPending ? 'animate-spin' : ''}`} />
                Refresh All
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-blue-50 text-blue-700' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Confidence
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedFilters.minConfidence}
                    onChange={(e) => setSelectedFilters(prev => ({
                      ...prev,
                      minConfidence: parseFloat(e.target.value)
                    }))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {Math.round(selectedFilters.minConfidence * 100)}%
                  </div>
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
                    value={selectedFilters.maxAge}
                    onChange={(e) => setSelectedFilters(prev => ({
                      ...prev,
                      maxAge: parseInt(e.target.value)
                    }))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedFilters.maxAge} hours
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Types
                  </label>
                  <div className="space-y-2">
                    {['friend', 'team', 'content', 'mentorship'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includeTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFilters(prev => ({
                                ...prev,
                                includeTypes: [...prev.includeTypes, type]
                              }));
                            } else {
                              setSelectedFilters(prev => ({
                                ...prev,
                                includeTypes: prev.includeTypes.filter(t => t !== type)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="bg-white rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
};

export default SocialRecommendationsPage;
