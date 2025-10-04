import React from 'react';

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
  timeLimit: number; // hours
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  startedAt?: Date;
  expiresAt: Date;
  requirements: Record<string, any>;
}

interface QuestCardProps {
  quest: Quest;
  onStart?: (quest: Quest) => void;
  onComplete?: (quest: Quest) => void;
  onViewDetails?: (quest: Quest) => void;
  className?: string;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onStart,
  onComplete,
  onViewDetails,
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
    expiresAt
  } = quest;

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      default: return '📋';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'nutrition': return '🥗';
      case 'fitness': return '💪';
      case 'health': return '🏥';
      case 'social': return '👥';
      case 'lifestyle': return '🌟';
      default: return '🎯';
    }
  };

  const timeRemaining = expiresAt.getTime() - Date.now();
  const hoursRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60)));
  const daysRemaining = Math.max(0, Math.ceil(hoursRemaining / 24));

  const progressPercentage = (progress / progressTarget) * 100;
  const isExpired = timeRemaining <= 0;
  const canComplete = isActive && progress >= progressTarget && !isCompleted;

  const formatTimeRemaining = (): string => {
    if (daysRemaining > 0) {
      return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
    } else if (hoursRemaining > 0) {
      return `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} left`;
    } else {
      return 'Expired';
    }
  };

  return (
    <div
      className={`quest-card ${difficulty} ${type} ${isActive ? 'active' : 'inactive'} ${isCompleted ? 'completed' : ''} ${isExpired ? 'expired' : ''} ${className}`}
      style={{
        borderColor: getDifficultyColor(difficulty),
        boxShadow: isActive ? `0 0 15px ${getDifficultyColor(difficulty)}30` : 'none'
      }}
    >
      <div className="quest-header">
        <div className="quest-info">
          <div className="quest-title">
            <span className="type-icon">{getTypeIcon(type)}</span>
            <span className="category-icon">{getCategoryIcon(category)}</span>
            <h3 className="quest-name">{name}</h3>
          </div>
          <p className="quest-description">{description}</p>
          <div className="quest-meta">
            <span className="quest-type">{type}</span>
            <span className="quest-difficulty">{difficulty.toUpperCase()}</span>
            <span className="quest-category">{category}</span>
          </div>
        </div>
        
        <div className="quest-status">
          {isCompleted ? (
            <span className="status-completed">✓ Completed</span>
          ) : isExpired ? (
            <span className="status-expired">⏰ Expired</span>
          ) : isActive ? (
            <span className="status-active">🔄 Active</span>
          ) : (
            <span className="status-available">📋 Available</span>
          )}
        </div>
      </div>

      {isActive && (
        <div className="quest-progress">
          <div className="progress-header">
            <span className="progress-text">
              {progress} / {progressTarget}
            </span>
            <span className="progress-percentage">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: getDifficultyColor(difficulty)
              }}
            />
          </div>
        </div>
      )}

      <div className="quest-timer">
        <span className="timer-icon">⏰</span>
        <span className="timer-text">{formatTimeRemaining()}</span>
      </div>

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
        {!isActive && !isCompleted && !isExpired && (
          <button
            className="start-quest-btn"
            onClick={() => onStart?.(quest)}
          >
            Start Quest
          </button>
        )}
        
        {canComplete && (
          <button
            className="complete-quest-btn"
            onClick={() => onComplete?.(quest)}
          >
            Complete Quest
          </button>
        )}
        
        <button
          className="view-details-btn"
          onClick={() => onViewDetails?.(quest)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default QuestCard;
