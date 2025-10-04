// XPProgressBar component for displaying experience point progress
// Part of HIGH Priority Feature Components implementation

import React, { forwardRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Star, Zap, Trophy, Crown } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface XPProgressBarProps {
  currentXP: number;
  level: number;
  nextLevelXP: number;
  previousLevelXP?: number;
  showLevel?: boolean;
  showXP?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'circular' | 'minimal';
  color?: 'blue' | 'purple' | 'gold' | 'rainbow';
  className?: string;
  onLevelUp?: (newLevel: number) => void;
}

const sizeVariants = {
  sm: {
    height: 'h-2',
    text: 'text-xs',
    icon: 'w-4 h-4',
    padding: 'px-2 py-1'
  },
  md: {
    height: 'h-3',
    text: 'text-sm',
    icon: 'w-5 h-5',
    padding: 'px-3 py-2'
  },
  lg: {
    height: 'h-4',
    text: 'text-base',
    icon: 'w-6 h-6',
    padding: 'px-4 py-3'
  }
};

const colorVariants = {
  blue: {
    bg: 'bg-blue-100',
    fill: 'bg-blue-500',
    text: 'text-blue-600',
    icon: 'text-blue-500'
  },
  purple: {
    bg: 'bg-purple-100',
    fill: 'bg-purple-500',
    text: 'text-purple-600',
    icon: 'text-purple-500'
  },
  gold: {
    bg: 'bg-yellow-100',
    fill: 'bg-yellow-500',
    text: 'text-yellow-600',
    icon: 'text-yellow-500'
  },
  rainbow: {
    bg: 'bg-gray-100',
    fill: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
    text: 'text-gray-700',
    icon: 'text-purple-500'
  }
};

const levelIcons = {
  1: Star,
  5: Zap,
  10: Trophy,
  20: Crown
};

export const XPProgressBar = forwardRef<HTMLDivElement, XPProgressBarProps>(
  (
    {
      currentXP,
      level,
      nextLevelXP,
      previousLevelXP = 0,
      showLevel = true,
      showXP = true,
      showPercentage = false,
      animated = true,
      size = 'md',
      variant = 'default',
      color = 'purple',
      className,
      onLevelUp
    },
    ref
  ) => {
    const [displayXP, setDisplayXP] = useState(currentXP);
    const [displayLevel, setDisplayLevel] = useState(level);
    const controls = useAnimation();

    const sizeConfig = sizeVariants[size];
    const colorConfig = colorVariants[color];
    const progressPercentage = ((currentXP - previousLevelXP) / (nextLevelXP - previousLevelXP)) * 100;
    const xpToNext = nextLevelXP - currentXP;

    // Get appropriate icon for level
    const getLevelIcon = (level: number) => {
      if (level >= 20) return Crown;
      if (level >= 10) return Trophy;
      if (level >= 5) return Zap;
      return Star;
    };

    const LevelIcon = getLevelIcon(level);

    // Animate XP changes
    useEffect(() => {
      if (animated) {
        const startXP = displayXP;
        const endXP = currentXP;
        const duration = Math.min(Math.abs(endXP - startXP) / 100, 2); // Max 2 seconds

        controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.3 }
        });

        // Animate XP number
        const startTime = Date.now();
        const animateXP = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / (duration * 1000), 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
          const currentDisplayXP = Math.round(startXP + (endXP - startXP) * easedProgress);
          
          setDisplayXP(currentDisplayXP);
          
          if (progress < 1) {
            requestAnimationFrame(animateXP);
          }
        };

        if (startXP !== endXP) {
          requestAnimationFrame(animateXP);
        }
      } else {
        setDisplayXP(currentXP);
      }
    }, [currentXP, animated, controls]);

    // Check for level up
    useEffect(() => {
      if (level > displayLevel) {
        setDisplayLevel(level);
        onLevelUp?.(level);
      }
    }, [level, displayLevel, onLevelUp]);

    if (variant === 'circular') {
      const radius = size === 'sm' ? 20 : size === 'md' ? 30 : 40;
      const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 6;
      const circumference = 2 * Math.PI * radius;
      const strokeDasharray = circumference;
      const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

      return (
        <div ref={ref} className={cn('relative inline-flex items-center justify-center', className)}>
          <svg
            width={radius * 2 + strokeWidth * 2}
            height={radius * 2 + strokeWidth * 2}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke={colorConfig.bg.replace('bg-', '#')}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <motion.circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke={colorConfig.fill.replace('bg-', '#')}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
              initial={{ strokeDasharray, strokeDashoffset: circumference }}
              animate={{ strokeDasharray, strokeDashoffset }}
              transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {showLevel && (
              <div className="flex items-center">
                <LevelIcon className={cn(sizeConfig.icon, colorConfig.icon)} />
                <span className={cn('font-bold ml-1', sizeConfig.text, colorConfig.text)}>
                  {displayLevel}
                </span>
              </div>
            )}
            {showXP && (
              <span className={cn('font-medium', sizeConfig.text, colorConfig.text)}>
                {displayXP.toLocaleString()}
              </span>
            )}
            {showPercentage && (
              <span className={cn('text-xs', colorConfig.text)}>
                {Math.round(progressPercentage)}%
              </span>
            )}
          </div>
        </div>
      );
    }

    if (variant === 'minimal') {
      return (
        <div ref={ref} className={cn('flex items-center space-x-2', className)}>
          {showLevel && (
            <div className="flex items-center">
              <LevelIcon className={cn(sizeConfig.icon, colorConfig.icon)} />
              <span className={cn('font-bold ml-1', sizeConfig.text, colorConfig.text)}>
                {displayLevel}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className={cn('w-full rounded-full', sizeConfig.height, colorConfig.bg)}>
              <motion.div
                className={cn('rounded-full', sizeConfig.height, colorConfig.fill)}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: animated ? 0.8 : 0, ease: 'easeOut' }}
              />
            </div>
          </div>
          {showXP && (
            <span className={cn('font-medium', sizeConfig.text, colorConfig.text)}>
              {displayXP.toLocaleString()}
            </span>
          )}
        </div>
      );
    }

    // Default variant
    return (
      <motion.div
        ref={ref}
        className={cn('space-y-2', className)}
        animate={controls}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showLevel && (
              <div className="flex items-center">
                <LevelIcon className={cn(sizeConfig.icon, colorConfig.icon)} />
                <span className={cn('font-bold ml-1', sizeConfig.text, colorConfig.text)}>
                  Level {displayLevel}
                </span>
              </div>
            )}
          </div>
          
          {showXP && (
            <div className="text-right">
              <div className={cn('font-bold', sizeConfig.text, colorConfig.text)}>
                {displayXP.toLocaleString()} XP
              </div>
              {xpToNext > 0 && (
                <div className={cn('text-xs text-gray-500')}>
                  {xpToNext.toLocaleString()} to next level
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className={cn('w-full rounded-full', sizeConfig.height, colorConfig.bg)}>
            <motion.div
              className={cn('rounded-full', sizeConfig.height, colorConfig.fill)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: animated ? 0.8 : 0, ease: 'easeOut' }}
            />
          </div>
          
          {/* Progress percentage overlay */}
          {showPercentage && progressPercentage > 20 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('font-bold text-white text-shadow', sizeConfig.text)}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
          )}
        </div>

        {/* Level up indicator */}
        {level > displayLevel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="flex items-center justify-center space-x-2 p-2 bg-yellow-100 border border-yellow-200 rounded-lg"
          >
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-bold text-yellow-800">
              Level Up! 🎉
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

XPProgressBar.displayName = 'XPProgressBar';

// Specialized XP Progress Components
export interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const LevelBadge = forwardRef<HTMLDivElement, LevelBadgeProps>(
  ({ level, size = 'md', showIcon = true, className }, ref) => {
    const sizeConfig = sizeVariants[size];
    const LevelIcon = getLevelIcon(level);
    
    function getLevelIcon(level: number) {
      if (level >= 20) return Crown;
      if (level >= 10) return Trophy;
      if (level >= 5) return Zap;
      return Star;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-100 border border-purple-200',
          sizeConfig.text,
          className
        )}
      >
        {showIcon && <LevelIcon className={cn(sizeConfig.icon, 'text-purple-600')} />}
        <span className="font-bold text-purple-800">Level {level}</span>
      </div>
    );
  }
);

LevelBadge.displayName = 'LevelBadge';

export interface XPGainAnimationProps {
  xpGained: number;
  onComplete?: () => void;
  className?: string;
}

export const XPGainAnimation = forwardRef<HTMLDivElement, XPGainAnimationProps>(
  ({ xpGained, onComplete, className }, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }, [onComplete]);

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -50 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-full shadow-lg',
              className
            )}
          >
            <Star className="w-4 h-4" />
            <span className="font-bold">+{xpGained} XP</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

XPGainAnimation.displayName = 'XPGainAnimation';

export default XPProgressBar;
