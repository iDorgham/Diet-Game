/**
 * LiveAnalyticsDashboard Component
 * Real-time analytics dashboard with live metrics
 * Phase 13-14: Real-time Features
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeService } from '../../hooks/useRealtimeService';

interface SystemMetrics {
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    loadAverage: number[];
  };
  platform: string;
  nodeVersion: string;
}

interface UserMetrics {
  activeUsers: number;
  newUsers: number;
  onlineUsers: number;
  totalUsers: number;
}

interface PerformanceMetrics {
  apiResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;
  websocketConnections: number;
  errorRate: number;
}

interface GamificationMetrics {
  totalXP: number;
  levelUps: number;
  achievements: number;
  questsCompleted: number;
  activeStreaks: number;
}

interface SocialMetrics {
  friendRequests: number;
  teamChallenges: number;
  socialPosts: number;
  mentorshipConnections: number;
  communityEngagement: number;
}

interface NutritionMetrics {
  mealsLogged: number;
  caloriesTracked: number;
  nutritionGoals: number;
  barcodeScans: number;
  aiRecommendations: number;
}

interface AnalyticsData {
  timestamp: string;
  system: SystemMetrics;
  users: UserMetrics;
  performance: PerformanceMetrics;
  gamification: GamificationMetrics;
  social: SocialMetrics;
  nutrition: NutritionMetrics;
}

interface LiveAnalyticsDashboardProps {
  analyticsType?: 'general' | 'system' | 'users' | 'performance' | 'gamification' | 'social' | 'nutrition';
  className?: string;
}

export const LiveAnalyticsDashboard: React.FC<LiveAnalyticsDashboardProps> = ({
  analyticsType = 'general',
  className = ''
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const realtimeService = useRealtimeService();

  useEffect(() => {
    if (realtimeService) {
      // Subscribe to analytics updates
      realtimeService.subscribeToAnalytics(analyticsType);
      setIsConnected(true);
      setIsLoading(false);
    }

    return () => {
      if (realtimeService) {
        realtimeService.unsubscribeFromAnalytics(analyticsType);
      }
    };
  }, [realtimeService, analyticsType]);

  useEffect(() => {
    if (!realtimeService) return;

    const handleAnalyticsUpdate = (data: AnalyticsData) => {
      setAnalyticsData(data);
      setLastUpdate(new Date());
    };

    const handleConnectionStatus = (status: boolean) => {
      setIsConnected(status);
    };

    realtimeService.subscribe('analytics:update', handleAnalyticsUpdate);
    realtimeService.subscribe('connection_status', handleConnectionStatus);

    return () => {
      realtimeService.unsubscribe('analytics:update', handleAnalyticsUpdate);
      realtimeService.unsubscribe('connection_status', handleConnectionStatus);
    };
  }, [realtimeService]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 0.8) return 'text-green-600';
    if (rate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Analytics</h2>
          <p className="text-gray-600 capitalize">{analyticsType} metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* System Metrics */}
      {(analyticsType === 'general' || analyticsType === 'system') && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Uptime</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatUptime(analyticsData.system.uptime)}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Memory Usage</div>
              <div className="text-2xl font-bold text-gray-900">
                {analyticsData.system.memory.heapUsed}MB
              </div>
              <div className="text-xs text-gray-500">
                of {analyticsData.system.memory.heapTotal}MB
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Platform</div>
              <div className="text-lg font-semibold text-gray-900">
                {analyticsData.system.platform}
              </div>
              <div className="text-xs text-gray-500">
                Node {analyticsData.system.nodeVersion}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Load Average</div>
              <div className="text-lg font-semibold text-gray-900">
                {analyticsData.system.cpu.loadAverage[0]?.toFixed(2) || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Metrics */}
      {(analyticsType === 'general' || analyticsType === 'users') && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">Active Users</div>
              <div className="text-2xl font-bold text-blue-900">
                {analyticsData.users.activeUsers.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">Online Users</div>
              <div className="text-2xl font-bold text-green-900">
                {analyticsData.users.onlineUsers.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600">New Users (24h)</div>
              <div className="text-2xl font-bold text-purple-900">
                {analyticsData.users.newUsers.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">
                {analyticsData.users.totalUsers.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {(analyticsType === 'general' || analyticsType === 'performance') && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">API Response</div>
              <div className={`text-2xl font-bold ${getPerformanceColor(analyticsData.performance.apiResponseTime, { good: 100, warning: 300 })}`}>
                {analyticsData.performance.apiResponseTime}ms
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">DB Query Time</div>
              <div className={`text-2xl font-bold ${getPerformanceColor(analyticsData.performance.databaseQueryTime, { good: 50, warning: 100 })}`}>
                {analyticsData.performance.databaseQueryTime}ms
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
              <div className={`text-2xl font-bold ${getPerformanceColor(analyticsData.performance.cacheHitRate * 100, { good: 80, warning: 60 })}`}>
                {(analyticsData.performance.cacheHitRate * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">WebSocket Connections</div>
              <div className="text-2xl font-bold text-gray-900">
                {analyticsData.performance.websocketConnections}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Error Rate</div>
              <div className={`text-2xl font-bold ${getPerformanceColor(analyticsData.performance.errorRate * 100, { good: 1, warning: 3 })}`}>
                {(analyticsData.performance.errorRate * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gamification Metrics */}
      {(analyticsType === 'general' || analyticsType === 'gamification') && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gamification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-600">Total XP</div>
              <div className="text-2xl font-bold text-yellow-900">
                {analyticsData.gamification.totalXP.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">Level Ups (24h)</div>
              <div className="text-2xl font-bold text-green-900">
                {analyticsData.gamification.levelUps}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600">Achievements</div>
              <div className="text-2xl font-bold text-purple-900">
                {analyticsData.gamification.achievements}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">Quests Completed</div>
              <div className="text-2xl font-bold text-blue-900">
                {analyticsData.gamification.questsCompleted}
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600">Active Streaks</div>
              <div className="text-2xl font-bold text-orange-900">
                {analyticsData.gamification.activeStreaks}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Metrics */}
      {(analyticsType === 'general' || analyticsType === 'social') && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">Friend Requests</div>
              <div className="text-2xl font-bold text-blue-900">
                {analyticsData.social.friendRequests}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">Team Challenges</div>
              <div className="text-2xl font-bold text-green-900">
                {analyticsData.social.teamChallenges}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600">Social Posts</div>
              <div className="text-2xl font-bold text-purple-900">
                {analyticsData.social.socialPosts}
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-600">Mentorship Connections</div>
              <div className="text-2xl font-bold text-yellow-900">
                {analyticsData.social.mentorshipConnections}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Community Engagement</div>
              <div className={`text-2xl font-bold ${getEngagementColor(analyticsData.social.communityEngagement)}`}>
                {(analyticsData.social.communityEngagement * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Metrics */}
      {(analyticsType === 'general' || analyticsType === 'nutrition') && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Tracking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">Meals Logged</div>
              <div className="text-2xl font-bold text-green-900">
                {analyticsData.nutrition.mealsLogged}
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600">Calories Tracked</div>
              <div className="text-2xl font-bold text-orange-900">
                {analyticsData.nutrition.caloriesTracked.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">Nutrition Goals</div>
              <div className="text-2xl font-bold text-blue-900">
                {analyticsData.nutrition.nutritionGoals}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600">Barcode Scans</div>
              <div className="text-2xl font-bold text-purple-900">
                {analyticsData.nutrition.barcodeScans}
              </div>
            </div>
            
            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="text-sm text-pink-600">AI Recommendations</div>
              <div className="text-2xl font-bold text-pink-900">
                {analyticsData.nutrition.aiRecommendations}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAnalyticsDashboard;
