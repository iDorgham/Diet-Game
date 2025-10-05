/**
 * Virtualized Recommendations List Component
 * Based on RECOMMENDATIONS_PERFORMANCE_OPTIMIZATION.md
 * Implements virtual scrolling for large recommendation lists
 */

import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import RecommendationCard from './RecommendationCard';

// Styled components
const ListContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'relative',
  '& .react-window-list': {
    outline: 'none',
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  zIndex: 1000,
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(4),
  textAlign: 'center',
}));

/**
 * Virtualized Recommendations List with performance optimizations
 */
const VirtualizedRecommendationsList = memo(({
  recommendations = [],
  onRecommendationAction,
  onViewDetails,
  isLoading = false,
  error = null,
  height = 600,
  itemHeight = 200,
  overscanCount = 5,
  showConfidence = true,
  compact = false,
  enableVirtualization = true,
  onLoadMore = null,
  hasMore = false,
  loadingMore = false,
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const listRef = useRef(null);
  const itemHeights = useRef(new Map());

  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    recommendations,
    onRecommendationAction,
    onViewDetails,
    showConfidence,
    compact,
    itemHeights: itemHeights.current,
  }), [recommendations, onRecommendationAction, onViewDetails, showConfidence, compact]);

  // Memoized item renderer
  const ItemRenderer = useCallback(({ index, style, data }) => {
    const { 
      recommendations, 
      onRecommendationAction, 
      onViewDetails, 
      showConfidence, 
      compact,
      itemHeights 
    } = data;

    const recommendation = recommendations[index];
    
    if (!recommendation) {
      return (
        <div style={style}>
          <Box sx={{ padding: 2, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        </div>
      );
    }

    // Calculate dynamic height for variable size list
    const getItemHeight = () => {
      if (itemHeights.has(index)) {
        return itemHeights.get(index);
      }
      
      // Estimate height based on content
      let estimatedHeight = compact ? 120 : 200;
      
      if (recommendation.description) {
        const descriptionLines = Math.ceil(recommendation.description.length / 50);
        estimatedHeight += descriptionLines * 20;
      }
      
      if (recommendation.tags && recommendation.tags.length > 0) {
        estimatedHeight += 40;
      }
      
      if (recommendation.reasoning && !compact) {
        estimatedHeight += 60;
      }
      
      itemHeights.set(index, estimatedHeight);
      return estimatedHeight;
    };

    return (
      <div style={style}>
        <Box sx={{ padding: 1 }}>
          <RecommendationCard
            recommendation={recommendation}
            onAction={onRecommendationAction}
            onViewDetails={onViewDetails}
            showConfidence={showConfidence}
            compact={compact}
            isLoading={isLoading}
          />
        </Box>
      </div>
    );
  }, []);

  // Handle scroll events for infinite loading
  const handleScroll = useCallback(({ scrollTop, scrollHeight, clientHeight }) => {
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when 80% scrolled
    if (scrollPercentage > 0.8 && hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  // Handle visible range changes
  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }) => {
    setVisibleRange({ start: visibleStartIndex, end: visibleStopIndex });
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index) => {
    if (listRef.current) {
      listRef.current.scrollToItem(index, 'start');
    }
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, []);

  // Get item size for variable size list
  const getItemSize = useCallback((index) => {
    return itemHeights.current.get(index) || itemHeight;
  }, [itemHeight]);

  // Memoized list props
  const listProps = useMemo(() => ({
    height,
    itemCount: recommendations.length,
    itemData,
    onItemsRendered: handleItemsRendered,
    onScroll: handleScroll,
    overscanCount,
    ref: listRef,
  }), [height, recommendations.length, itemData, handleItemsRendered, handleScroll, overscanCount]);

  // Error state
  if (error) {
    return (
      <ListContainer sx={{ height }}>
        <EmptyState>
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error.message || 'Failed to load recommendations'}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Please try refreshing the page or contact support if the problem persists.
          </Typography>
        </EmptyState>
      </ListContainer>
    );
  }

  // Empty state
  if (!isLoading && recommendations.length === 0) {
    return (
      <ListContainer sx={{ height }}>
        <EmptyState>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No recommendations found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your preferences or check back later for new recommendations.
          </Typography>
        </EmptyState>
      </ListContainer>
    );
  }

  // Loading state
  if (isLoading && recommendations.length === 0) {
    return (
      <ListContainer sx={{ height }}>
        <LoadingOverlay>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} />
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              Loading recommendations...
            </Typography>
          </Box>
        </LoadingOverlay>
      </ListContainer>
    );
  }

  // Render virtualized list
  return (
    <ListContainer sx={{ height }}>
      {enableVirtualization ? (
        <VariableSizeList
          {...listProps}
          itemSize={getItemSize}
          className="react-window-list"
        >
          {ItemRenderer}
        </VariableSizeList>
      ) : (
        <List
          {...listProps}
          itemSize={itemHeight}
          className="react-window-list"
        >
          {ItemRenderer}
        </List>
      )}
      
      {/* Loading more indicator */}
      {loadingMore && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: 2, 
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            Loading more recommendations...
          </Typography>
        </Box>
      )}
      
      {/* Performance info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          padding: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.7)', 
          color: 'white', 
          borderRadius: 1,
          fontSize: '0.75rem'
        }}>
          Items: {recommendations.length} | 
          Visible: {visibleRange.start}-{visibleRange.end} | 
          Virtualized: {enableVirtualization ? 'Yes' : 'No'}
        </Box>
      )}
    </ListContainer>
  );
});

// Set display name for debugging
VirtualizedRecommendationsList.displayName = 'VirtualizedRecommendationsList';

// Export additional utilities
export const useVirtualization = (items, options = {}) => {
  const {
    itemHeight = 200,
    containerHeight = 600,
    overscanCount = 5,
    enableVirtualization = true
  } = options;

  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [isScrolling, setIsScrolling] = useState(false);

  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }) => {
    setVisibleRange({ start: visibleStartIndex, end: visibleStopIndex });
  }, []);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    const timeout = setTimeout(() => setIsScrolling(false), 150);
    return () => clearTimeout(timeout);
  }, []);

  return {
    visibleRange,
    isScrolling,
    handleItemsRendered,
    handleScroll,
    itemHeight,
    containerHeight,
    overscanCount,
    enableVirtualization
  };
};

export default VirtualizedRecommendationsList;
