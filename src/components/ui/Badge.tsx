// Badge component following docs/ui-components/badges.md
// EARS-UI-036 through EARS-UI-040 implementation

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill' | 'square';
  dot?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantVariants = {
  default: {
    background: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  },
  primary: {
    background: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  secondary: {
    background: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  },
  success: {
    background: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  warning: {
    background: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  danger: {
    background: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  info: {
    background: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-200'
  }
};

const sizeVariants = {
  sm: {
    padding: 'px-2 py-0.5',
    fontSize: 'text-xs',
    dotSize: 'w-1.5 h-1.5'
  },
  md: {
    padding: 'px-2.5 py-1',
    fontSize: 'text-sm',
    dotSize: 'w-2 h-2'
  },
  lg: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-base',
    dotSize: 'w-2.5 h-2.5'
  }
};

const shapeVariants = {
  rounded: 'rounded-md',
  pill: 'rounded-full',
  square: 'rounded-none'
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  dot = false,
  animated = false,
  className,
  onClick
}) => {
  const variantClasses = variantVariants[variant];
  const sizeClasses = sizeVariants[size];
  const shapeClasses = shapeVariants[shape];

  const baseClasses = cn(
    // Base styles
    'inline-flex items-center font-medium border transition-all duration-200',
    
    // Variant styles
    variantClasses.background,
    variantClasses.text,
    variantClasses.border,
    
    // Size styles
    sizeClasses.padding,
    sizeClasses.fontSize,
    
    // Shape styles
    shapeClasses,
    
    // Interactive styles
    onClick && 'cursor-pointer hover:opacity-80 active:scale-95',
    
    className
  );

  const dotClasses = cn(
    'rounded-full mr-1.5',
    sizeClasses.dotSize,
    variantClasses.background.replace('bg-', 'bg-').replace('-100', '-500')
  );

  return (
    <motion.span
      className={baseClasses}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      animate={animated ? { scale: [1, 1.1, 1] } : undefined}
      transition={animated ? { duration: 2, repeat: Infinity } : undefined}
    >
      {dot && <span className={dotClasses} />}
      {children}
    </motion.span>
  );
};

// Status Badge variant
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusVariants = {
  online: {
    color: 'bg-green-500',
    label: 'Online'
  },
  offline: {
    color: 'bg-gray-400',
    label: 'Offline'
  },
  away: {
    color: 'bg-yellow-500',
    label: 'Away'
  },
  busy: {
    color: 'bg-red-500',
    label: 'Busy'
  },
  invisible: {
    color: 'bg-gray-300',
    label: 'Invisible'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showLabel = false,
  size = 'md',
  className
}) => {
  const statusConfig = statusVariants[status];
  const sizeClasses = sizeVariants[size];

  const dotClasses = cn(
    'rounded-full',
    statusConfig.color,
    sizeClasses.dotSize
  );

  return (
    <div className={cn('flex items-center', className)}>
      <span className={dotClasses} />
      {showLabel && (
        <span className={cn('ml-2 text-gray-600', sizeClasses.fontSize)}>
          {statusConfig.label}
        </span>
      )}
    </div>
  );
};

// Notification Badge variant
export interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showZero?: boolean;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  variant = 'danger',
  size = 'sm',
  showZero = false,
  className
}) => {
  const variantClasses = variantVariants[variant];
  const sizeClasses = sizeVariants[size];

  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const badgeClasses = cn(
    'inline-flex items-center justify-center font-bold text-white border-0',
    'min-w-[1.25rem] h-5',
    variantClasses.background.replace('-100', '-500'),
    sizeClasses.fontSize,
    'rounded-full',
    className
  );

  return (
    <motion.span
      className={badgeClasses}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {displayCount}
    </motion.span>
  );
};

// Achievement Badge variant
export interface AchievementBadgeProps {
  title: string;
  description?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  progress?: number; // 0-100
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const rarityVariants = {
  common: {
    background: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    glow: 'shadow-gray-200'
  },
  rare: {
    background: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    glow: 'shadow-blue-200'
  },
  epic: {
    background: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    glow: 'shadow-purple-200'
  },
  legendary: {
    background: 'bg-gradient-to-r from-yellow-100 to-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    glow: 'shadow-orange-200'
  }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  rarity,
  isUnlocked,
  progress = 0,
  icon,
  className,
  onClick
}) => {
  const rarityClasses = rarityVariants[rarity];

  const badgeClasses = cn(
    'relative p-3 rounded-lg border-2 transition-all duration-200',
    'cursor-pointer hover:scale-105 hover:shadow-lg',
    rarityClasses.background,
    rarityClasses.text,
    rarityClasses.border,
    !isUnlocked && 'opacity-50 grayscale',
    className
  );

  return (
    <motion.div
      className={badgeClasses}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isUnlocked ? { 
        boxShadow: [`0 0 0 0 ${rarityClasses.glow.replace('shadow-', '')}`, 
                   `0 0 20px 0 ${rarityClasses.glow.replace('shadow-', '')}`, 
                   `0 0 0 0 ${rarityClasses.glow.replace('shadow-', '')}`]
      } : undefined}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Progress bar for locked achievements */}
      {!isUnlocked && progress > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Icon */}
      {icon && (
        <div className="flex items-center justify-center mb-2">
          {icon}
        </div>
      )}

      {/* Title */}
      <div className="text-sm font-semibold text-center mb-1">
        {title}
      </div>

      {/* Description */}
      {description && (
        <div className="text-xs text-center opacity-75">
          {description}
        </div>
      )}

      {/* Rarity indicator */}
      <div className="absolute top-1 right-1">
        <div className={cn(
          'w-2 h-2 rounded-full',
          rarityClasses.background.replace('-100', '-500')
        )} />
      </div>
    </motion.div>
  );
};

export default Badge;
export { Badge };
