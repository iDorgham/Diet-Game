import React from 'react';

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

interface AchievementCardProps {
  achievement: Achievement;
  onViewDetails?: (achievement: Achievement) => void;
  showProgress?: boolean;
  className?: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
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

  const progressPercentage = target > 0 ? (progress / target) * 100 : 0;
  const isCompleted = progress >= target;

  return (
    <div
      className={`achievement-card ${rarity} ${isUnlocked ? 'unlocked' : 'locked'} ${className}`}
      style={{
        borderColor: getRarityColor(rarity),
        boxShadow: isUnlocked ? getRarityGlow(rarity) : 'none'
      }}
      onClick={() => onViewDetails?.(achievement)}
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
                backgroundColor: getRarityColor(rarity)
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

      {isUnlocked && unlockedAt && (
        <div className="achievement-footer">
          <span className="unlock-date">
            Unlocked {formatDate(unlockedAt)}
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
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export default AchievementCard;
