/**
 * Social Insights Dashboard Component
 * Displays comprehensive social analytics and insights
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  MessageCircle, 
  Share,
  BarChart3,
  Target,
  Award,
  Clock,
  RefreshCw,
  Eye,
  ThumbsUp,
  Calendar,
  MapPin,
  Star
} from 'lucide-react';
import { SocialInsights } from '../../../types/socialRecommendations';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Progress } from '../../ui/Progress';

interface SocialInsightsDashboardProps {
  insights: SocialInsights;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  showRecommendations?: boolean;
  onRecommendationClick?: (recommendation: any) => void;
}

export function SocialInsightsDashboard({
  insights,
  loading = false,
  error,
  onRefresh,
  showRecommendations = true,
  onRecommendationClick
}: SocialInsightsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'growth' | 'content' | 'network'>('overview');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'engagement', label: 'Engagement', icon: Heart },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'content', label: 'Content', icon: MessageCircle },
    { id: 'network', label: 'Network', icon: Users }
  ];

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500 mb-4">
          <BarChart3 className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Insights</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Insights</h2>
          <p className="text-gray-600">
            Last updated: {new Date(insights.generatedAt).toLocaleString()}
          </p>
        </div>
        
        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Friends</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.socialGrowth.totalFriends}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getTrendIcon(insights.socialGrowth.trend)}
                <span className={`text-sm ml-2 ${getTrendColor(insights.socialGrowth.trend)}`}>
                  {insights.socialGrowth.growthRate > 0 ? '+' : ''}{insights.socialGrowth.growthRate.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.contentPerformance.totalPosts}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Avg. {insights.contentPerformance.averageLikes} likes per post
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Trend</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.engagementTrends.recentAverage}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getTrendIcon(insights.engagementTrends.trend)}
                <span className={`text-sm ml-2 ${getTrendColor(insights.engagementTrends.trend)}`}>
                  {insights.engagementTrends.change > 0 ? '+' : ''}{insights.engagementTrends.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last week</span>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Network Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.networkAnalysis.networkSize}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  {Math.round(insights.networkAnalysis.networkDensity * 100)}% density
                </p>
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          {showRecommendations && insights.recommendations.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {insights.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => onRecommendationClick?.(recommendation)}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(recommendation.priority)}
                      >
                        {recommendation.priority}
                      </Badge>
                      <div>
                        <p className="font-medium text-gray-900">{recommendation.message}</p>
                        <p className="text-sm text-gray-600">{recommendation.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getDifficultyColor(recommendation.difficulty)}
                      >
                        {recommendation.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {recommendation.expectedImpact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Current Trend</p>
                  <p className="text-sm text-gray-600">{insights.engagementTrends.message}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(insights.engagementTrends.trend)}
                  <span className={`font-semibold ${getTrendColor(insights.engagementTrends.trend)}`}>
                    {insights.engagementTrends.change > 0 ? '+' : ''}{insights.engagementTrends.change}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Recent Average</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.engagementTrends.recentAverage}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.engagementTrends.period}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Growth Tab */}
      {activeTab === 'growth' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Growth</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Growth Status</p>
                  <p className="text-sm text-gray-600">{insights.socialGrowth.message}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(insights.socialGrowth.trend)}
                  <span className={`font-semibold ${getTrendColor(insights.socialGrowth.trend)}`}>
                    {insights.socialGrowth.growthRate > 0 ? '+' : ''}{insights.socialGrowth.growthRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.socialGrowth.totalFriends}
                  </p>
                  <p className="text-sm text-gray-600">Total Friends</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {insights.socialGrowth.newFriends30d}
                  </p>
                  <p className="text-sm text-gray-600">New This Month</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {insights.socialGrowth.newFriends7d}
                  </p>
                  <p className="text-sm text-gray-600">New This Week</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Performance Status</p>
                  <p className="text-sm text-gray-600">{insights.contentPerformance.message}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-gray-900">
                    {Math.round(insights.contentPerformance.engagementScore * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.contentPerformance.totalPosts}
                  </p>
                  <p className="text-sm text-gray-600">Total Posts</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {insights.contentPerformance.averageLikes}
                  </p>
                  <p className="text-sm text-gray-600">Avg. Likes</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {insights.contentPerformance.averageComments}
                  </p>
                  <p className="text-sm text-gray-600">Avg. Comments</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {insights.contentPerformance.bestPostLikes}
                  </p>
                  <p className="text-sm text-gray-600">Best Post</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Network Status</p>
                  <p className="text-sm text-gray-600">{insights.networkAnalysis.message}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-gray-900">
                    {Math.round(insights.networkAnalysis.networkDensity * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.networkAnalysis.networkSize}
                  </p>
                  <p className="text-sm text-gray-600">Network Size</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {insights.networkAnalysis.averageFriendsPerConnection}
                  </p>
                  <p className="text-sm text-gray-600">Avg. Friends/Connection</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {insights.networkAnalysis.averagePostsPerConnection}
                  </p>
                  <p className="text-sm text-gray-600">Avg. Posts/Connection</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {insights.networkAnalysis.averageLikesPerConnection}
                  </p>
                  <p className="text-sm text-gray-600">Avg. Likes/Connection</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}