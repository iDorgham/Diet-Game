// AchievementDisplay component for showcasing user achievements and progress
// Part of HIGH Priority Feature Components implementation

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Crown, 
  Medal, 
  Award, 
  Target, 
  Zap, 
  Flame,
  Lock,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'fitness' | 'nutrition' | 'streak' | 'social' | 'milestone' | 'special';
  isUnlocked: boolean;
  progress?: number; // 0-100
  maxProgress?: number;
  unlockedAt?: Date;
  xpReward?: number;
  coinsReward?: number;
  requirements?: string[];
  nextAchievement?: string;
}

export interface AchievementDisplayProps {
  achievements: Achievement[];
  showUnlocked?: boolean;
  showLocked?: boolean;
  showProgress?: boolean;
  layout?: 'grid' | 'list' | 'carousel';
  size?: 'sm' | 'md' | 'lg';
  maxItems?: number;
  category?: string;
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

const rarityConfig = {
  common: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    glow: 'shadow-gray-200',
    icon: Star
  },
  rare: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    glow: 'shadow-blue-200',
    icon: Medal
  },
  epic: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-200',
    glow: 'shadow-purple-200',
    icon: Award
  },
  legendary: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    glow: 'shadow-yellow-200',
    icon: Crown
  }
};

const categoryIcons = {
  fitness: Target,
  nutrition: Star,
  streak: Flame,
  social: Users,
  milestone: Trophy,
  special: Zap
};

const sizeVariants = {
  sm: {
    container: 'p-3',
    icon: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-xs',
    progress: 'h-1'
  },
  md: {
    container: 'p-4',
    icon: 'w-10 h-10',
    title: 'text-base',
    description: 'text-sm',
    progress: 'h-2'
  },
  lg: {
    container: 'p-6',
    icon: 'w-12 h-12',
    title: 'text-lg',
    description: 'text-base',
    progress: 'h-3'
  }
};

export const AchievementDisplay = forwardRef<HTMLDivElement, AchievementDisplayProps>(
  (
    {
      achievements,
      showUnlocked = true,
      showLocked = true,
      showProgress = true,
      layout = 'grid',
      size = 'md',
      maxItems,
      category,
      onAchievementClick,
      className
    },
    ref
  ) => {
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

    const sizeConfig = sizeVariants[size];

    // Filter achievements
    const filteredAchievements = achievements
      .filter(achievement => {
        if (category && achievement.category !== category) return false;
        if (!showUnlocked && achievement.isUnlocked) return false;
        if (!showLocked && !achievement.isUnlocked) return false;
        return true;
      })
      .slice(0, maxItems);

    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const totalCount = achievements.length;
    const completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    const getRarityIcon = (rarity: Achievement['rarity']) => {
      const config = rarityConfig[rarity];
      const Icon = config.icon;
      return Icon;
    };

    const getCategoryIcon = (category: Achievement['category']) => {
      const Icon = categoryIcons[category];
      return Icon;
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const renderAchievementCard = (achievement: Achievement, index: number) => {
      const rarity = rarityConfig[achievement.rarity];
      const RarityIcon = getRarityIcon(achievement.rarity);
      const CategoryIcon = getCategoryIcon(achievement.category);
      const Icon = achievement.icon || RarityIcon;

      return (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className={cn(
            'relative rounded-lg border transition-all duration-200 cursor-pointer',
            rarity.bg,
            rarity.border,
            achievement.isUnlocked
              ? 'hover:shadow-lg hover:scale-105'
              : 'opacity-60 hover:opacity-80',
            sizeConfig.container
          )}
          onClick={() => {
            setSelectedAchievement(achievement);
            onAchievementClick?.(achievement);
          }}
        >
          {/* Rarity indicator */}
          <div className="absolute top-2 right-2">
            <RarityIcon className={cn('w-4 h-4', rarity.color)} />
          </div>

          {/* Category indicator */}
          <div className="absolute top-2 left-2">
            <CategoryIcon className="w-4 h-4 text-gray-500" />
          </div>

          {/* Lock overlay for locked achievements */}
          {!achievement.isUnlocked && (
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}

          {/* Main content */}
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <div
                className={cn(
                  'rounded-full flex items-center justify-center',
                  rarity.bg,
                  rarity.border,
                  'border-2',
                  sizeConfig.icon
                )}
              >
                <Icon className={cn('w-6 h-6', rarity.color)} />
              </div>
            </div>

            {/* Title */}
            <h3 className={cn('font-semibold mb-1', sizeConfig.title, rarity.color)}>
              {achievement.title}
            </h3>

            {/* Description */}
            <p className={cn('text-gray-600 mb-3', sizeConfig.description)}>
              {achievement.description}
            </p>

            {/* Progress bar */}
            {showProgress && achievement.progress !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs font-medium text-gray-700">
                    {achievement.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full">
                  <motion.div
                    className={cn('rounded-full', rarity.bg.replace('bg-', 'bg-'), sizeConfig.progress)}
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Rewards */}
            {(achievement.xpReward || achievement.coinsReward) && (
              <div className="flex justify-center space-x-3 text-xs">
                {achievement.xpReward && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-gray-600">+{achievement.xpReward} XP</span>
                  </div>
                )}
                {achievement.coinsReward && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <span className="text-gray-600">+{achievement.coinsReward}</span>
                  </div>
                )}
              </div>
            )}

            {/* Unlocked date */}
            {achievement.isUnlocked && achievement.unlockedAt && (
              <div className="mt-2 text-xs text-gray-500">
                Unlocked {formatDate(achievement.unlockedAt)}
              </div>
            )}
          </div>
        </motion.div>
      );
    };

    const renderGridLayout = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAchievements.map((achievement, index) => 
          renderAchievementCard(achievement, index)
        )}
      </div>
    );

    const renderListLayout = () => (
      <div className="space-y-3">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={cn(
              'flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer',
              rarityConfig[achievement.rarity].bg,
              rarityConfig[achievement.rarity].border,
              achievement.isUnlocked
                ? 'hover:shadow-md'
                : 'opacity-60'
            )}
            onClick={() => {
              setSelectedAchievement(achievement);
              onAchievementClick?.(achievement);
            }}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {achievement.isUnlocked ? (
                <div className={cn(
                  'rounded-full flex items-center justify-center',
                  rarityConfig[achievement.rarity].bg,
                  rarityConfig[achievement.rarity].border,
                  'border-2',
                  sizeConfig.icon
                )}>
                  {(achievement.icon || getRarityIcon(achievement.rarity))({
                    className: cn('w-6 h-6', rarityConfig[achievement.rarity].color)
                  })}
                </div>
              ) : (
                <div className={cn(
                  'rounded-full flex items-center justify-center bg-gray-200 border-2 border-gray-300',
                  sizeConfig.icon
                )}>
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={cn('font-semibold truncate', sizeConfig.title, rarityConfig[achievement.rarity].color)}>
                  {achievement.title}
                </h3>
                <getRarityIcon(achievement.rarity) className={cn('w-4 h-4', rarityConfig[achievement.rarity].color)} />
              </div>
              <p className={cn('text-gray-600 truncate', sizeConfig.description)}>
                {achievement.description}
              </p>
              {showProgress && achievement.progress !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <motion.div
                      className={cn('rounded-full h-1', rarityConfig[achievement.rarity].bg.replace('bg-', 'bg-'))}
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex-shrink-0 text-right">
              {achievement.isUnlocked ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );

    const renderLayout = () => {
      switch (layout) {
        case 'list':
          return renderListLayout();
        case 'grid':
        default:
          return renderGridLayout();
      }
    };

    return (
      <div ref={ref} className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              <p className="text-sm text-gray-600">
                {unlockedCount} of {totalCount} unlocked
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(completionPercentage)}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{unlockedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {filteredAchievements.length > 0 ? (
            renderLayout()
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No achievements found</p>
            </div>
          )}
        </div>

        {/* Achievement Detail Modal */}
        <AnimatePresence>
          {selectedAchievement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedAchievement(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={cn(
                      'rounded-full flex items-center justify-center border-4',
                      rarityConfig[selectedAchievement.rarity].bg,
                      rarityConfig[selectedAchievement.rarity].border,
                      'w-20 h-20'
                    )}>
                      {(selectedAchievement.icon || getRarityIcon(selectedAchievement.rarity))({
                        className: cn('w-10 h-10', rarityConfig[selectedAchievement.rarity].color)
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={cn('font-bold mb-2', rarityConfig[selectedAchievement.rarity].color)}>
                    {selectedAchievement.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">
                    {selectedAchievement.description}
                  </p>

                  {/* Requirements */}
                  {selectedAchievement.requirements && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedAchievement.requirements.map((req, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Rewards */}
                  {(selectedAchievement.xpReward || selectedAchievement.coinsReward) && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Rewards:</h4>
                      <div className="flex justify-center space-x-4">
                        {selectedAchievement.xpReward && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">+{selectedAchievement.xpReward} XP</span>
                          </div>
                        )}
                        {selectedAchievement.coinsReward && (
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                            <span className="text-sm">+{selectedAchievement.coinsReward} Coins</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedAchievement(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AchievementDisplay.displayName = 'AchievementDisplay';

export default AchievementDisplay;
