// MetricCard component - Displays key metrics with proper formatting
// Demonstrates the power of our formatting utilities

import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber, formatPercentage, formatCalories, formatMacronutrient } from '../../utils/formatting';
import { calculatePercentage } from '../../utils/helpers';
import { cn } from '../../utils/helpers';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface MetricCardProps {
  title: string;
  value: number;
  target?: number;
  unit: 'number' | 'percentage' | 'calories' | 'grams' | 'pounds' | 'kg' | 'custom';
  customUnit?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showTrend?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  className?: string;
  onClick?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  target,
  unit,
  customUnit,
  icon,
  color = 'blue',
  size = 'md',
  showProgress = false,
  showTrend = false,
  trend = 'neutral',
  trendValue,
  className,
  onClick,
}) => {
  // ============================================================================
  // FORMATTING LOGIC
  // ============================================================================

  const formatValue = (val: number): string => {
    switch (unit) {
      case 'number':
        return formatNumber(val);
      case 'percentage':
        return formatPercentage(val);
      case 'calories':
        return formatCalories(val);
      case 'grams':
        return formatMacronutrient(val, 'g');
      case 'pounds':
        return `${val.toFixed(1)} lbs`;
      case 'kg':
        return `${val.toFixed(1)} kg`;
      case 'custom':
        return `${formatNumber(val)} ${customUnit || ''}`;
      default:
        return formatNumber(val);
    }
  };

  const progressPercentage = target ? calculatePercentage(value, target) : 0;
  const isOverTarget = target && value > target;
  const isUnderTarget = target && value < target * 0.8; // 80% threshold

  // ============================================================================
  // STYLING
  // ============================================================================

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const valueSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  // ============================================================================
  // TREND INDICATOR
  // ============================================================================

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '➡️';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // ============================================================================
  // PROGRESS BAR
  // ============================================================================

  const getProgressColor = () => {
    if (isOverTarget) return 'bg-red-500';
    if (isUnderTarget) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'bg-white rounded-xl border-2 shadow-sm transition-all duration-200',
        colorClasses[color],
        sizeClasses[size],
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn('font-medium', textSizeClasses[size])}>
          {title}
        </h3>
        {icon && (
          <div className={cn('opacity-70', iconSizeClasses[size])}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-3">
        <div className={cn('font-bold', valueSizeClasses[size])}>
          {formatValue(value)}
        </div>
        {target && (
          <div className="text-sm opacity-70">
            of {formatValue(target)} target
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && target && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{formatPercentage(progressPercentage)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn('h-2 rounded-full', getProgressColor())}
            />
          </div>
        </div>
      )}

      {/* Trend Indicator */}
      {showTrend && trendValue !== undefined && (
        <div className="flex items-center text-sm">
          <span className={cn('mr-1', getTrendColor())}>
            {getTrendIcon()}
          </span>
          <span className={cn('font-medium', getTrendColor())}>
            {formatNumber(Math.abs(trendValue))}
          </span>
          <span className="text-gray-600 ml-1">
            vs last period
          </span>
        </div>
      )}

      {/* Status Indicator */}
      {target && (
        <div className="mt-2 text-xs">
          {isOverTarget && (
            <span className="text-red-600 font-medium">⚠️ Over target</span>
          )}
          {isUnderTarget && (
            <span className="text-yellow-600 font-medium">📉 Below target</span>
          )}
          {!isOverTarget && !isUnderTarget && (
            <span className="text-green-600 font-medium">✅ On track</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;