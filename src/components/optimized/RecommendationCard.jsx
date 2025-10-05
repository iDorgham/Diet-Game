/**
 * Optimized Recommendation Card Component
 * Based on RECOMMENDATIONS_PERFORMANCE_OPTIMIZATION.md
 * Implements React.memo, virtual scrolling, and performance optimizations
 */

import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Chip, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { debounce } from 'lodash/debounce';

// Styled components for better performance
const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '&.loading': {
    opacity: 0.7,
    pointerEvents: 'none',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  marginRight: theme.spacing(2),
}));

const ConfidenceBar = styled('div')(({ confidence, theme }) => ({
  width: '100%',
  height: 4,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 2,
  overflow: 'hidden',
  marginTop: theme.spacing(1),
  '&::after': {
    content: '""',
    display: 'block',
    width: `${confidence * 100}%`,
    height: '100%',
    backgroundColor: confidence > 0.7 
      ? theme.palette.success.main 
      : confidence > 0.4 
        ? theme.palette.warning.main 
        : theme.palette.error.main,
    transition: 'width 0.3s ease-in-out',
  },
}));

/**
 * Optimized Recommendation Card with React.memo
 */
const RecommendationCard = memo(({ 
  recommendation, 
  onAction, 
  onViewDetails,
  isLoading = false,
  showConfidence = true,
  compact = false 
}) => {
  // Memoize expensive calculations
  const confidenceColor = useMemo(() => {
    if (recommendation.confidence > 0.7) return 'success';
    if (recommendation.confidence > 0.4) return 'warning';
    return 'error';
  }, [recommendation.confidence]);

  const confidenceLabel = useMemo(() => {
    const percentage = Math.round(recommendation.confidence * 100);
    return `${percentage}% match`;
  }, [recommendation.confidence]);

  // Debounced action handlers for better performance
  const debouncedOnAction = useCallback(
    debounce((action, data) => {
      onAction?.(action, data);
    }, 300),
    [onAction]
  );

  const debouncedOnViewDetails = useCallback(
    debounce(() => {
      onViewDetails?.(recommendation);
    }, 300),
    [onViewDetails, recommendation]
  );

  // Memoized action handlers
  const handleAccept = useCallback(() => {
    debouncedOnAction('accept', recommendation);
  }, [debouncedOnAction, recommendation]);

  const handleReject = useCallback(() => {
    debouncedOnAction('reject', recommendation);
  }, [debouncedOnAction, recommendation]);

  const handleViewDetails = useCallback(() => {
    debouncedOnViewDetails();
  }, [debouncedOnViewDetails]);

  // Memoized tags rendering
  const tags = useMemo(() => {
    if (!recommendation.tags || recommendation.tags.length === 0) return null;
    
    return recommendation.tags.slice(0, 3).map((tag, index) => (
      <Chip
        key={`${recommendation.id}-tag-${index}`}
        label={tag}
        size="small"
        variant="outlined"
        sx={{ margin: 0.5, fontSize: '0.75rem' }}
      />
    ));
  }, [recommendation.tags, recommendation.id]);

  // Memoized content to prevent unnecessary re-renders
  const cardContent = useMemo(() => (
    <CardContent sx={{ padding: compact ? 2 : 3 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
        <StyledAvatar
          src={recommendation.avatar || recommendation.image}
          alt={recommendation.name || recommendation.title}
        >
          {recommendation.name?.charAt(0) || recommendation.title?.charAt(0) || '?'}
        </StyledAvatar>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant={compact ? "subtitle1" : "h6"} 
            component="h3"
            sx={{ 
              fontWeight: 600,
              marginBottom: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {recommendation.name || recommendation.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              marginBottom: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: compact ? 2 : 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {recommendation.description || recommendation.bio}
          </Typography>

          {showConfidence && (
            <div>
              <Typography variant="caption" color="text.secondary">
                {confidenceLabel}
              </Typography>
              <ConfidenceBar confidence={recommendation.confidence} />
            </div>
          )}
        </div>
      </div>

      {tags && (
        <div style={{ marginTop: 16 }}>
          {tags}
        </div>
      )}

      {recommendation.reasoning && !compact && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            marginTop: 2,
            fontStyle: 'italic',
            fontSize: '0.875rem'
          }}
        >
          "{recommendation.reasoning}"
        </Typography>
      )}
    </CardContent>
  ), [recommendation, compact, showConfidence, confidenceLabel, tags]);

  return (
    <StyledCard 
      className={isLoading ? 'loading' : ''}
      elevation={2}
      sx={{ 
        minHeight: compact ? 120 : 200,
        opacity: isLoading ? 0.7 : 1,
        transition: 'opacity 0.2s ease-in-out'
      }}
    >
      {cardContent}
      
      <CardActions sx={{ padding: 2, paddingTop: 0 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={handleViewDetails}
          disabled={isLoading}
          sx={{ marginRight: 1 }}
        >
          View Details
        </Button>
        
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={handleAccept}
          disabled={isLoading}
          sx={{ marginRight: 1 }}
        >
          Accept
        </Button>
        
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={handleReject}
          disabled={isLoading}
        >
          Reject
        </Button>
      </CardActions>
    </StyledCard>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.recommendation.id === nextProps.recommendation.id &&
    prevProps.recommendation.confidence === nextProps.recommendation.confidence &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.compact === nextProps.compact &&
    prevProps.showConfidence === nextProps.showConfidence
  );
});

// Set display name for debugging
RecommendationCard.displayName = 'RecommendationCard';

export default RecommendationCard;
