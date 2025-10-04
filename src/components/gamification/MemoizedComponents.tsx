import React, { memo, useMemo, useCallback } from 'react';

// Memoized XP Display Component
interface XPDisplayProps {
  showLevel?: boolean;
  showProgress?: boolean;
  showStars?: boolean;
  className?: string;
  userProgress?: {
    level: number;
    xp: number;
    xpToNextLevel: number;
    stars: number;
  };
  loading?: boolean;
  error?: string | null;
}

export const MemoizedXPDisplay = memo<XPDisplayProps>(({
  showLevel = true,
  showProgress = true,
  showStars = true,
  className = '',
  userProgress,
  loading = false,
  error = null
}) => {
  // Memoized calculations
  const progressPercentage = useMemo(() => {
    if (!userProgress) return 0;
    return (userProgress.xp / userProgress.xpToNextLevel) * 100;
  }, [userProgress]);

  // Memoized stars rendering
  const renderStars = useMemo(() => {
    if (!showStars || !userProgress) return null;
    
    return (
      <div className="stars-display">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`star ${index < userProgress.stars ? 'filled' : 'empty'}`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  }, [showStars, userProgress]);

  if (loading) {
    return (
      <div className={`xp-display loading ${className}`}>
        <div className="xp-skeleton">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    );
  }

  if (error || !userProgress) {
    return (
      <div className={`xp-display error ${className}`}>
        <span>Unable to load XP data</span>
      </div>
    );
  }

  const { level, xp, xpToNextLevel } = userProgress;

  return (
    <div className={`xp-display ${className}`}>
      {showLevel && (
        <div className="level-display">
          <span className="level-label">Level</span>
          <span className="level-value">{level}</span>
        </div>
      )}
      
      <div className="xp-info">
        <div className="xp-values">
          <span className="current-xp">{xp.toLocaleString()}</span>
          <span className="xp-separator">/</span>
          <span className="next-level-xp">{xpToNextLevel.toLocaleString()}</span>
        </div>
        
        {showProgress && (
          <div className="xp-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="progress-text">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        )}
      </div>
      
      {renderStars}
    </div>
  );
});

MemoizedXPDisplay.displayName = 'MemoizedXPDisplay';

// Memoized Achievement Card Component
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  color: string;
  xpReward: number;
  coinReward: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

interface MemoizedAchievementCardProps {
  achievement: Achievement;
  onViewDetails?: (achievement: Achievement) => void;
  showProgress?: boolean;
  className?: string;
}

export const MemoizedAchievementCard = memo<MemoizedAchievementCardProps>(({
  achievement,
  onViewDetails,
  showProgress = true,
  className = ''
}) => {
  const {
    id,
    name,
    description,
    category,
    rarity,
    icon,
    color,
    xpReward,
    coinReward,
    isUnlocked,
    unlockedAt,
    progress = 0,
    target = 1
  } = achievement;

  // Memoized style calculations
  const cardStyles = useMemo(() => {
    const getRarityColor = (rarity: string): string => {
      switch (rarity) {
        case 'common': return '#6B7280';
        case 'uncommon': return '#3B82F6';
        case 'rare': return '#8B5CF6';
        case 'epic': return '#F59E0B';
        case 'legendary': return '#EF4444';
        default: return '#6B7280';
      }
    };

    const getRarityGlow = (rarity: string): string => {
      switch (rarity) {
        case 'common': return '0 0 5px rgba(107, 114, 128, 0.3)';
        case 'uncommon': return '0 0 10px rgba(59, 130, 246, 0.4)';
        case 'rare': return '0 0 15px rgba(139, 92, 246, 0.5)';
        case 'epic': return '0 0 20px rgba(245, 158, 11, 0.6)';
        case 'legendary': return '0 0 25px rgba(239, 68, 68, 0.7)';
        default: return '0 0 5px rgba(107, 114, 128, 0.3)';
      }
    };

    return {
      borderColor: getRarityColor(rarity),
      boxShadow: isUnlocked ? getRarityGlow(rarity) : 'none'
    };
  }, [rarity, isUnlocked]);

  // Memoized progress calculation
  const progressPercentage = useMemo(() => {
    return target > 0 ? (progress / target) * 100 : 0;
  }, [progress, target]);

  const isCompleted = useMemo(() => {
    return progress >= target;
  }, [progress, target]);

  // Memoized click handler
  const handleClick = useCallback(() => {
    onViewDetails?.(achievement);
  }, [onViewDetails, achievement]);

  // Memoized date formatting
  const formattedDate = useMemo(() => {
    if (!unlockedAt) return null;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(unlockedAt);
  }, [unlockedAt]);

  return (
    <div
      className={`achievement-card ${rarity} ${isUnlocked ? 'unlocked' : 'locked'} ${className}`}
      style={cardStyles}
      onClick={handleClick}
    >
      <div className="achievement-header">
        <div className="achievement-icon">
          <span 
            className="icon"
            style={{ 
              color: isUnlocked ? color : '#9CA3AF',
              filter: isUnlocked ? 'none' : 'grayscale(100%)'
            }}
          >
            {icon}
          </span>
          {isUnlocked && (
            <div className="unlock-indicator">
              <span className="checkmark">✓</span>
            </div>
          )}
        </div>
        
        <div className="achievement-info">
          <h3 className="achievement-name">{name}</h3>
          <p className="achievement-description">{description}</p>
          <div className="achievement-meta">
            <span className="achievement-category">{category}</span>
            <span className="achievement-rarity">{rarity.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {showProgress && !isUnlocked && (
        <div className="achievement-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: cardStyles.borderColor
              }}
            />
          </div>
          <span className="progress-text">
            {progress} / {target}
          </span>
        </div>
      )}

      <div className="achievement-rewards">
        <div className="reward-item">
          <span className="reward-icon">⭐</span>
          <span className="reward-value">+{xpReward} XP</span>
        </div>
        <div className="reward-item">
          <span className="reward-icon">🪙</span>
          <span className="reward-value">+{coinReward}</span>
        </div>
      </div>

      {isUnlocked && formattedDate && (
        <div className="achievement-footer">
          <span className="unlock-date">
            Unlocked {formattedDate}
          </span>
        </div>
      )}

      {isCompleted && !isUnlocked && (
        <div className="achievement-complete">
          <span className="complete-text">Ready to claim!</span>
        </div>
      )}
    </div>
  );
});

MemoizedAchievementCard.displayName = 'MemoizedAchievementCard';

// Memoized Quest Card Component
interface Quest {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';
  type: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
  coinReward: number;
  progressTarget: number;
  timeLimit: number;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  startedAt?: Date;
  expiresAt: Date;
  requirements: Record<string, any>;
}

interface MemoizedQuestCardProps {
  quest: Quest;
  onStart?: (quest: Quest) => void;
  onComplete?: (quest: Quest) => void;
  className?: string;
}

export const MemoizedQuestCard = memo<MemoizedQuestCardProps>(({
  quest,
  onStart,
  onComplete,
  className = ''
}) => {
  const {
    id,
    name,
    description,
    category,
    difficulty,
    type,
    xpReward,
    coinReward,
    progressTarget,
    timeLimit,
    isActive,
    isCompleted,
    progress,
    startedAt,
    expiresAt
  } = quest;

  // Memoized progress calculation
  const progressPercentage = useMemo(() => {
    return progressTarget > 0 ? (progress / progressTarget) * 100 : 0;
  }, [progress, progressTarget]);

  // Memoized time remaining calculation
  const timeRemaining = useMemo(() => {
    if (!isActive || !startedAt) return null;
    
    const now = new Date();
    const endTime = new Date(startedAt.getTime() + timeLimit * 60 * 60 * 1000);
    const remaining = endTime.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }, [isActive, startedAt, timeLimit]);

  // Memoized event handlers
  const handleStart = useCallback(() => {
    onStart?.(quest);
  }, [onStart, quest]);

  const handleComplete = useCallback(() => {
    onComplete?.(quest);
  }, [onComplete, quest]);

  // Memoized status class
  const statusClass = useMemo(() => {
    if (isCompleted) return 'completed';
    if (isActive) return 'active';
    if (timeRemaining === 'Expired') return 'expired';
    return 'available';
  }, [isCompleted, isActive, timeRemaining]);

  return (
    <div className={`quest-card ${difficulty} ${statusClass} ${className}`}>
      <div className="quest-header">
        <div className="quest-info">
          <div className="quest-title">
            <span className="type-icon">
              {type === 'daily' ? '📅' : type === 'weekly' ? '📆' : '🗓️'}
            </span>
            <span className="category-icon">
              {category === 'nutrition' ? '🥗' : category === 'fitness' ? '💪' : '🎯'}
            </span>
            <h3 className="quest-name">{name}</h3>
          </div>
          <p className="quest-description">{description}</p>
          <div className="quest-meta">
            <span className="quest-type">{type.toUpperCase()}</span>
            <span className="quest-difficulty">{difficulty.toUpperCase()}</span>
            <span className="quest-category">{category}</span>
          </div>
        </div>
        
        <div className="quest-status">
          <span className={`status-${statusClass}`}>
            {statusClass.toUpperCase()}
          </span>
        </div>
      </div>

      {isActive && (
        <div className="quest-progress">
          <div className="progress-header">
            <span className="progress-text">Progress</span>
            <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {isActive && timeRemaining && (
        <div className="quest-timer">
          <span className="timer-icon">⏰</span>
          <span>Time remaining: {timeRemaining}</span>
        </div>
      )}

      <div className="quest-rewards">
        <div className="reward-item">
          <span className="reward-icon">⭐</span>
          <span className="reward-value">+{xpReward} XP</span>
        </div>
        <div className="reward-item">
          <span className="reward-icon">🪙</span>
          <span className="reward-value">+{coinReward}</span>
        </div>
      </div>

      <div className="quest-actions">
        {!isActive && !isCompleted && (
          <button className="start-quest-btn" onClick={handleStart}>
            Start Quest
          </button>
        )}
        {isActive && progress >= progressTarget && (
          <button className="complete-quest-btn" onClick={handleComplete}>
            Complete Quest
          </button>
        )}
        <button className="view-details-btn">
          View Details
        </button>
      </div>
    </div>
  );
});

MemoizedQuestCard.displayName = 'MemoizedQuestCard';
