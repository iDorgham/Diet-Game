import React from 'react';

interface Streak {
  id: string;
  name: string;
  description: string;
  category: string;
  currentCount: number;
  maxCount: number;
  isActive: boolean;
  isProtected: boolean;
  lastActivity: Date;
  protectionExpires?: Date;
  freezeTokensUsed: number;
  freezeTokensAvailable: number;
  milestonesReached: number[];
  totalXP: number;
  totalCoins: number;
}

interface StreakDisplayProps {
  streak: Streak;
  onProtect?: (streakId: string) => void;
  onRecover?: (streakId: string) => void;
  onViewDetails?: (streakId: string) => void;
  className?: string;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  streak,
  onProtect,
  onRecover,
  onViewDetails,
  className = ''
}) => {
  const {
    id,
    name,
    description,
    category,
    currentCount,
    maxCount,
    isActive,
    isProtected,
    lastActivity,
    protectionExpires,
    freezeTokensAvailable
  } = streak;

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'engagement': return '#3B82F6';
      case 'nutrition': return '#10B981';
      case 'fitness': return '#EF4444';
      case 'health': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'engagement': return '📱';
      case 'nutrition': return '🥗';
      case 'fitness': return '💪';
      case 'health': return '💧';
      default: return '🔥';
    }
  };

  const timeSinceLastActivity = Date.now() - lastActivity.getTime();
  const hoursSinceLastActivity = timeSinceLastActivity / (1000 * 60 * 60);
  const daysSinceLastActivity = Math.floor(hoursSinceLastActivity / 24);

  const getRiskLevel = (): 'low' | 'medium' | 'high' => {
    if (hoursSinceLastActivity > 20) return 'high';
    if (hoursSinceLastActivity > 16) return 'medium';
    if (hoursSinceLastActivity > 12) return 'low';
    return 'low';
  };

  const riskLevel = getRiskLevel();
  const isAtRisk = isActive && riskLevel !== 'low';

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'low': return '#F59E0B';
      case 'medium': return '#EF4444';
      case 'high': return '#DC2626';
      default: return '#10B981';
    }
  };

  const progressPercentage = maxCount > 0 ? (currentCount / maxCount) * 100 : 0;

  return (
    <div
      className={`streak-display ${category} ${isActive ? 'active' : 'broken'} ${isProtected ? 'protected' : ''} ${className}`}
      style={{
        borderColor: getCategoryColor(category),
        boxShadow: isActive ? `0 0 15px ${getCategoryColor(category)}30` : 'none'
      }}
    >
      <div className="streak-header">
        <div className="streak-info">
          <div className="streak-title">
            <span className="category-icon">{getCategoryIcon(category)}</span>
            <h3 className="streak-name">{name}</h3>
          </div>
          <p className="streak-description">{description}</p>
          <div className="streak-meta">
            <span className="streak-category">{category}</span>
            <span className="streak-status">
              {isActive ? 'Active' : 'Broken'}
            </span>
            {isProtected && (
              <span className="protection-status">🛡️ Protected</span>
            )}
          </div>
        </div>
        
        <div className="streak-count">
          <span className="current-count">{currentCount}</span>
          <span className="max-count">/ {maxCount}</span>
        </div>
      </div>

      <div className="streak-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: getCategoryColor(category)
            }}
          />
        </div>
        <span className="progress-text">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>

      {isActive && (
        <div className="streak-activity">
          <div className="activity-info">
            <span className="activity-label">Last Activity:</span>
            <span className="activity-time">
              {daysSinceLastActivity > 0 
                ? `${daysSinceLastActivity} day${daysSinceLastActivity !== 1 ? 's' : ''} ago`
                : `${Math.floor(hoursSinceLastActivity)} hour${Math.floor(hoursSinceLastActivity) !== 1 ? 's' : ''} ago`
              }
            </span>
          </div>
          
          {isAtRisk && (
            <div 
              className="risk-warning"
              style={{ color: getRiskColor(riskLevel) }}
            >
              ⚠️ Streak at risk! {riskLevel.toUpperCase()} risk level
            </div>
          )}
        </div>
      )}

      {isProtected && protectionExpires && (
        <div className="protection-info">
          <span className="protection-label">Protection expires:</span>
          <span className="protection-time">
            {formatTimeRemaining(protectionExpires)}
          </span>
        </div>
      )}

      <div className="streak-stats">
        <div className="stat-item">
          <span className="stat-label">Freeze Tokens</span>
          <span className="stat-value">{freezeTokensAvailable}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total XP</span>
          <span className="stat-value">{streak.totalXP}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Coins</span>
          <span className="stat-value">{streak.totalCoins}</span>
        </div>
      </div>

      <div className="streak-actions">
        {isActive && isAtRisk && !isProtected && freezeTokensAvailable > 0 && (
          <button
            className="protect-btn"
            onClick={() => onProtect?.(id)}
          >
            🛡️ Protect Streak
          </button>
        )}
        
        {!isActive && (
          <button
            className="recover-btn"
            onClick={() => onRecover?.(id)}
          >
            🔄 Recover Streak
          </button>
        )}
        
        <button
          className="view-details-btn"
          onClick={() => onViewDetails?.(id)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const formatTimeRemaining = (expiresAt: Date): string => {
  const timeRemaining = expiresAt.getTime() - Date.now();
  const hoursRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60)));
  
  if (hoursRemaining > 24) {
    const daysRemaining = Math.ceil(hoursRemaining / 24);
    return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
  } else if (hoursRemaining > 0) {
    return `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`;
  } else {
    return 'Expired';
  }
};

export default StreakDisplay;
