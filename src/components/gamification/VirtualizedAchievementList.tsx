import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { AchievementCard } from './AchievementCard';

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
  isNew?: boolean;
}

interface VirtualizedAchievementListProps {
  achievements: Achievement[];
  height?: number;
  itemHeight?: number;
  onViewDetails?: (achievement: Achievement) => void;
  className?: string;
}

interface AchievementItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    achievements: Achievement[];
    onViewDetails?: (achievement: Achievement) => void;
  };
}

// Individual achievement item component for virtualization
const AchievementItem: React.FC<AchievementItemProps> = ({ index, style, data }) => {
  const { achievements, onViewDetails } = data;
  const achievement = achievements[index];

  if (!achievement) {
  return (
    <div className="achievement-item-placeholder" style={style}>
      <div className="skeleton-achievement">
        <div className="skeleton-icon"></div>
        <div className="skeleton-content">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    </div>
  );
  }

  return (
    <div className="achievement-item-wrapper" style={style}>
      <AchievementCard
        achievement={achievement}
        onViewDetails={onViewDetails}
        showProgress={true}
        className="virtualized-achievement"
      />
    </div>
  );
};

export const VirtualizedAchievementList: React.FC<VirtualizedAchievementListProps> = ({
  achievements,
  height = 600,
  itemHeight = 200,
  onViewDetails,
  className = ''
}) => {
  // Memoize the item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    achievements,
    onViewDetails
  }), [achievements, onViewDetails]);

  // Memoize the item renderer
  const ItemRenderer = useCallback((props: any) => (
    <AchievementItem {...props} data={itemData} />
  ), [itemData]);

  if (achievements.length === 0) {
    return (
      <div className={`virtualized-achievement-list empty ${className}`}>
        <div className="empty-state">
          <span className="empty-icon">🏆</span>
          <p>No achievements available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`virtualized-achievement-list ${className}`}>
      <List
        height={height}
        itemCount={achievements.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5} // Render 5 extra items for smooth scrolling
        className="achievement-list"
      >
        {ItemRenderer}
      </List>
    </div>
  );
};

export default VirtualizedAchievementList;
