import React from 'react';
import { useDemoUserProgress } from '../../hooks/useDemoGamification';

interface XPDisplayProps {
  showLevel?: boolean;
  showProgress?: boolean;
  showStars?: boolean;
  className?: string;
}

export const XPDisplay: React.FC<XPDisplayProps> = ({
  showLevel = true,
  showProgress = true,
  showStars = true,
  className = ''
}) => {
  const { userProgress, loading, error } = useDemoUserProgress('demo-user-123');

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

  const { level, xp, xpToNextLevel, stars } = userProgress;
  const progressPercentage = (xp / xpToNextLevel) * 100;

  const renderStars = () => {
    if (!showStars) return null;
    
    return (
      <div className="stars-display">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`star ${index < stars ? 'filled' : 'empty'}`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

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
      
      {renderStars()}
    </div>
  );
};

export default XPDisplay;
