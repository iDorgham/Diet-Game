/**
 * Recommendations List Component
 * Displays a list of recommendations with filtering and actions
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  RefreshCw, 
  Search, 
  SlidersHorizontal,
  X,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  BaseRecommendation, 
  RecommendationFilters,
  RecommendationType 
} from '../../../types/socialRecommendations';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { RecommendationCard } from './RecommendationCard';
import { FriendRecommendationCard } from './FriendRecommendationCard';
import { TeamRecommendationCard } from './TeamRecommendationCard';
import { ContentRecommendationCard } from './ContentRecommendationCard';
import { MentorshipRecommendationCard } from './MentorshipRecommendationCard';

interface RecommendationsListProps<T extends BaseRecommendation> {
  recommendations: T[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyMessage?: string;
  showFilters?: boolean;
  onFilterChange?: (filters: RecommendationFilters) => void;
  type: RecommendationType;
  onAccept?: (recommendation: T) => void;
  onReject?: (recommendation: T) => void;
  onIgnore?: (recommendation: T) => void;
  onFeedback?: (recommendation: T, feedback: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function RecommendationsList<T extends BaseRecommendation>({
  recommendations,
  loading = false,
  error,
  onRefresh,
  onLoadMore,
  hasMore = false,
  emptyMessage = "No recommendations available",
  showFilters = true,
  onFilterChange,
  type,
  onAccept,
  onReject,
  onIgnore,
  onFeedback,
  showActions = true,
  compact = false
}: RecommendationsListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<RecommendationFilters>({
    minConfidence: 0.5,
    maxAge: 24, // 24 hours
    includeTypes: [type],
    excludeTypes: []
  });

  // Filter recommendations based on search and filters
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(rec => {
        const searchLower = searchQuery.toLowerCase();
        return (
          rec.reasoning.toLowerCase().includes(searchLower) ||
          (rec as any).user?.displayName?.toLowerCase().includes(searchLower) ||
          (rec as any).user?.username?.toLowerCase().includes(searchLower) ||
          (rec as any).team?.name?.toLowerCase().includes(searchLower) ||
          (rec as any).post?.content?.toLowerCase().includes(searchLower) ||
          (rec as any).mentor?.displayName?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply confidence filter
    if (filters.minConfidence) {
      filtered = filtered.filter(rec => rec.confidence >= filters.minConfidence!);
    }

    // Apply age filter
    if (filters.maxAge) {
      const maxAgeMs = filters.maxAge * 60 * 60 * 1000; // Convert hours to milliseconds
      const cutoffTime = new Date(Date.now() - maxAgeMs);
      filtered = filtered.filter(rec => new Date(rec.createdAt) > cutoffTime);
    }

    return filtered;
  }, [recommendations, searchQuery, filters]);

  const handleFilterChange = (newFilters: Partial<RecommendationFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const clearFilters = () => {
    const defaultFilters: RecommendationFilters = {
      minConfidence: 0.5,
      maxAge: 24,
      includeTypes: [type],
      excludeTypes: []
    };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  const getRecommendationCard = (recommendation: T) => {
    const commonProps = {
      recommendation,
      onAccept,
      onReject,
      onIgnore,
      onFeedback,
      showActions,
      compact
    };

    switch (type) {
      case 'friend':
        return <FriendRecommendationCard {...commonProps} />;
      case 'team':
        return <TeamRecommendationCard {...commonProps} />;
      case 'content':
        return <ContentRecommendationCard {...commonProps} />;
      case 'mentorship':
        return <MentorshipRecommendationCard {...commonProps} />;
      default:
        return <RecommendationCard {...commonProps} type={type} />;
    }
  };

  const getStats = () => {
    const total = recommendations.length;
    const filtered = filteredRecommendations.length;
    const highConfidence = recommendations.filter(r => r.confidence >= 0.8).length;
    const recent = recommendations.filter(r => {
      const age = Date.now() - new Date(r.createdAt).getTime();
      return age < 24 * 60 * 60 * 1000; // 24 hours
    }).length;

    return { total, filtered, highConfidence, recent };
  };

  const stats = getStats();

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Recommendations</h3>
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {type} Recommendations
          </h2>
          <p className="text-sm text-gray-600">
            {stats.filtered} of {stats.total} recommendations
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          
          {showFilters && (
            <Button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.filtered}</div>
          <div className="text-sm text-gray-600">Filtered</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.highConfidence}</div>
          <div className="text-sm text-gray-600">High Confidence</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.recent}</div>
          <div className="text-sm text-gray-600">Recent</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${type} recommendations...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Filters</h3>
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Confidence
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={filters.minConfidence || 0.5}
                    onChange={(e) => handleFilterChange({ minConfidence: parseFloat(e.target.value) })}
                    className="w-full"
                    aria-label="Minimum confidence threshold"
                    title="Adjust minimum confidence threshold"
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    {Math.round((filters.minConfidence || 0.5) * 100)}%
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Age (hours)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="168"
                    step="1"
                    value={filters.maxAge || 24}
                    onChange={(e) => handleFilterChange({ maxAge: parseInt(e.target.value) })}
                    className="w-full"
                    aria-label="Maximum age in hours"
                    title="Adjust maximum age of recommendations"
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    {filters.maxAge || 24} hours
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button
                    onClick={() => setShowFilterPanel(false)}
                    size="sm"
                    className="w-full"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recommendations List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-gray-400 mb-4">
            {searchQuery ? (
              <Search className="h-12 w-12 mx-auto" />
            ) : (
              <CheckCircle className="h-12 w-12 mx-auto" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No matching recommendations' : 'No recommendations available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search or filters' : emptyMessage}
          </p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRecommendations.map((recommendation) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {getRecommendationCard(recommendation)}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load More */}
          {hasMore && onLoadMore && (
            <div className="text-center pt-4">
              <Button
                onClick={onLoadMore}
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
