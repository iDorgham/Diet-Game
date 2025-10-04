import React, { useState } from 'react';

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

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  category: 'overall' | 'nutrition' | 'fitness' | 'consistency' | 'social';
  timeRange: 'daily' | 'weekly' | 'monthly' | 'all_time';
  onTimeRangeChange?: (timeRange: string) => void;
  onCategoryChange?: (category: string) => void;
  loading?: boolean;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  category,
  timeRange,
  onTimeRangeChange,
  onCategoryChange,
  loading = false,
  className = ''
}) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className={`leaderboard loading ${className}`}>
        <div className="leaderboard-skeleton">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="skeleton-entry">
              <div className="skeleton-rank"></div>
              <div className="skeleton-avatar"></div>
              <div className="skeleton-info">
                <div className="skeleton-name"></div>
                <div className="skeleton-score"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`leaderboard ${className}`}>
      <div className="leaderboard-header">
        <div className="leaderboard-title">
          <span className="category-icon">{getCategoryIcon(category)}</span>
          <h2>Leaderboard</h2>
        </div>
        
        <div className="leaderboard-controls">
          <select
            value={category}
            onChange={(e) => onCategoryChange?.(e.target.value)}
            className="category-selector"
          >
            <option value="overall">Overall</option>
            <option value="nutrition">Nutrition</option>
            <option value="fitness">Fitness</option>
            <option value="consistency">Consistency</option>
            <option value="social">Social</option>
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange?.(e.target.value)}
            className="time-range-selector"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
      </div>

      <div className="leaderboard-content">
        {entries.length === 0 ? (
          <div className="empty-leaderboard">
            <span className="empty-icon">📊</span>
            <p>No data available for this category and time range.</p>
          </div>
        ) : (
          <div className="leaderboard-entries">
            {entries.map((entry, index) => (
              <div
                key={entry.userId}
                className={`leaderboard-entry ${entry.isCurrentUser ? 'current-user' : ''} ${expandedUser === entry.userId ? 'expanded' : ''}`}
                onClick={() => setExpandedUser(expandedUser === entry.userId ? null : entry.userId)}
              >
                <div className="entry-rank">
                  <span 
                    className="rank-icon"
                    style={{ color: getRankColor(entry.rank) }}
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
                      className="score-value"
                      style={{ color: getCategoryColor(category) }}
                    >
                      {formatScore(entry.score)}
                    </span>
                  </div>
                </div>
                
                {expandedUser === entry.userId && (
                  <div className="entry-details">
                    <div className="detail-item">
                      <span className="detail-label">Total XP:</span>
                      <span className="detail-value">{entry.xp.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Badges:</span>
                      <span className="detail-value">{entry.badges}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Level:</span>
                      <span className="detail-value">{entry.level}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="leaderboard-footer">
        <div className="leaderboard-stats">
          <span className="stat-item">
            <span className="stat-label">Total Players:</span>
            <span className="stat-value">{entries.length}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Your Rank:</span>
            <span className="stat-value">
              {entries.find(e => e.isCurrentUser)?.rank || 'N/A'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
