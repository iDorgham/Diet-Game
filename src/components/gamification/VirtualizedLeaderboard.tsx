import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  level: number;
  xp: number;
  badges: number;
  isCurrentUser?: boolean;
}

interface VirtualizedLeaderboardProps {
  entries: LeaderboardEntry[];
  height?: number;
  itemHeight?: number;
  category: 'overall' | 'nutrition' | 'fitness' | 'consistency' | 'social';
  onUserClick?: (userId: string) => void;
  className?: string;
}

interface LeaderboardItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    entries: LeaderboardEntry[];
    category: string;
    onUserClick?: (userId: string) => void;
  };
}

// Individual leaderboard item component for virtualization
const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ index, style, data }) => {
  const { entries, category, onUserClick } = data;
  const entry = entries[index];

  if (!entry) {
    return (
      <div className="leaderboard-item-placeholder" style={style}>
        <div className="skeleton-entry">
          <div className="skeleton-rank"></div>
          <div className="skeleton-avatar"></div>
          <div className="skeleton-info">
            <div className="skeleton-name"></div>
            <div className="skeleton-score"></div>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'overall': return '🏆';
      case 'nutrition': return '🥗';
      case 'fitness': return '💪';
      case 'consistency': return '🔥';
      case 'social': return '👥';
      default: return '📊';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'overall': return '#F59E0B';
      case 'nutrition': return '#10B981';
      case 'fitness': return '#EF4444';
      case 'consistency': return '#8B5CF6';
      case 'social': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return '#F59E0B';
      case 2: return '#9CA3AF';
      case 3: return '#CD7F32';
      default: return '#6B7280';
    }
  };

  const formatScore = (score: number): string => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    } else if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toLocaleString();
  };

  return (
    <div 
      className={`leaderboard-item-wrapper ${entry.isCurrentUser ? 'current-user' : ''}`}
      style={style}
      onClick={() => onUserClick?.(entry.userId)}
    >
      <div className="leaderboard-entry">
        <div className="entry-rank">
          <span 
            className={`rank-icon rank-${entry.rank}`}
          >
            {getRankIcon(entry.rank)}
          </span>
        </div>
        
        <div className="entry-avatar">
          <img 
            src={entry.avatar} 
            alt={entry.username}
            className="avatar-image"
          />
          {entry.isCurrentUser && (
            <div className="current-user-indicator">You</div>
          )}
        </div>
        
        <div className="entry-info">
          <div className="entry-main">
            <h3 className="entry-username">{entry.username}</h3>
            <div className="entry-stats">
              <span className="stat-item">
                <span className="stat-icon">⭐</span>
                <span className="stat-value">Level {entry.level}</span>
              </span>
              <span className="stat-item">
                <span className="stat-icon">🏆</span>
                <span className="stat-value">{entry.badges} badges</span>
              </span>
            </div>
          </div>
          
          <div className="entry-score">
            <span className="score-label">Score</span>
            <span 
              className={`score-value category-${category}`}
            >
              {formatScore(entry.score)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VirtualizedLeaderboard: React.FC<VirtualizedLeaderboardProps> = ({
  entries,
  height = 600,
  itemHeight = 80,
  category,
  onUserClick,
  className = ''
}) => {
  // Memoize the item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    entries,
    category,
    onUserClick
  }), [entries, category, onUserClick]);

  // Memoize the item renderer
  const ItemRenderer = useCallback((props: any) => (
    <LeaderboardItem {...props} data={itemData} />
  ), [itemData]);

  if (entries.length === 0) {
    return (
      <div className={`virtualized-leaderboard empty ${className}`}>
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p>No leaderboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`virtualized-leaderboard ${className}`}>
      <List
        height={height}
        itemCount={entries.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={10} // Render 10 extra items for smooth scrolling
        className="leaderboard-list"
      >
        {ItemRenderer}
      </List>
    </div>
  );
};

export default VirtualizedLeaderboard;
