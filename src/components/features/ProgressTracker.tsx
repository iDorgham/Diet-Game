// ProgressTracker component - Comprehensive progress tracking with calculations
// Demonstrates integration of calculation utilities for progress visualization

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  formatPercentage, 
  formatWeight, 
  formatCalories,
  formatDuration,
  getRelativeTime 
} from '../../utils/formatting';
import { 
  calculateWeightProgress,
  calculateWeeklyWeightLossRate,
  getRecommendedWeeklyWeightLossRate,
  calculateStreak,
  calculatePercentageChange,
  calculateAverage 
} from '../../utils/calculations';
import { cn } from '../../utils/helpers';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface WeightEntry {
  date: Date;
  weight: number; // in kg
  notes?: string;
}

export interface GoalData {
  startWeight: number; // in kg
  targetWeight: number; // in kg
  startDate: Date;
  targetDate?: Date;
  goalType: 'weight_loss' | 'weight_gain' | 'maintenance';
}

export interface ProgressTrackerProps {
  weightEntries: WeightEntry[];
  goal: GoalData;
  currentWeight: number; // in kg
  unit: 'kg' | 'lbs';
  showTrends?: boolean;
  showStreaks?: boolean;
  showRecommendations?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  weightEntries,
  goal,
  currentWeight,
  unit = 'kg',
  showTrends = true,
  showStreaks = true,
  showRecommendations = true,
  className,
}) => {
  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const calculations = useMemo(() => {
    // Sort entries by date
    const sortedEntries = [...weightEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate progress
    const progress = calculateWeightProgress(
      goal.startWeight,
      currentWeight,
      goal.targetWeight
    );

    // Calculate weekly rate
    const daysElapsed = Math.max(1, Math.floor((Date.now() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const weeklyRate = calculateWeeklyWeightLossRate(
      goal.startWeight,
      currentWeight,
      daysElapsed
    );

    // Get recommended rate
    const recommendedRate = getRecommendedWeeklyWeightLossRate(
      goal.startWeight,
      goal.targetWeight
    );

    // Calculate streak
    const streakDates = sortedEntries.map(entry => entry.date);
    const streak = calculateStreak(streakDates);

    // Calculate trends
    const recentEntries = sortedEntries.slice(-7); // Last 7 entries
    const olderEntries = sortedEntries.slice(-14, -7); // Previous 7 entries
    
    const recentAverage = recentEntries.length > 0 ? 
      calculateAverage(recentEntries.map(e => e.weight)) : currentWeight;
    const olderAverage = olderEntries.length > 0 ? 
      calculateAverage(olderEntries.map(e => e.weight)) : goal.startWeight;

    const trendChange = calculatePercentageChange(olderAverage, recentAverage);

    // Calculate time remaining
    const timeRemaining = goal.targetDate ? {
      days: Math.max(0, Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      weeks: Math.max(0, Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7))),
    } : null;

    // Calculate projected completion
    const weightRemaining = Math.abs(goal.targetWeight - currentWeight);
    const projectedWeeks = weeklyRate > 0 ? Math.ceil(weightRemaining / weeklyRate) : null;
    const projectedDate = projectedWeeks ? new Date(Date.now() + (projectedWeeks * 7 * 24 * 60 * 60 * 1000)) : null;

    return {
      progress,
      weeklyRate,
      recommendedRate,
      streak,
      trendChange,
      timeRemaining,
      projectedDate,
      recentAverage,
      olderAverage,
      sortedEntries,
    };
  }, [weightEntries, goal, currentWeight]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getRateStatus = (current: number, recommended: number) => {
    const ratio = Math.abs(current / recommended);
    if (ratio <= 0.5) return { status: 'Too Slow', color: 'text-yellow-600' };
    if (ratio <= 1.5) return { status: 'On Track', color: 'text-green-600' };
    return { status: 'Too Fast', color: 'text-red-600' };
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-6', className)}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-6">Progress Tracker</h3>

      {/* Main Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Overall Progress</span>
          <span className={cn('text-lg font-bold', getProgressColor(calculations.progress.totalProgress))}>
            {formatPercentage(calculations.progress.totalProgress)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(calculations.progress.totalProgress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn(
              'h-3 rounded-full',
              calculations.progress.totalProgress >= 100 ? 'bg-green-500' :
              calculations.progress.totalProgress >= 75 ? 'bg-blue-500' :
              calculations.progress.totalProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            )}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Start: {formatWeight(goal.startWeight, unit)}</span>
          <span>Current: {formatWeight(currentWeight, unit)}</span>
          <span>Target: {formatWeight(goal.targetWeight, unit)}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Weight Change */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Weight Change</div>
          <div className={cn(
            'text-lg font-bold',
            calculations.progress.weightChange > 0 ? 'text-red-600' : 'text-green-600'
          )}>
            {calculations.progress.weightChange > 0 ? '+' : ''}{formatWeight(Math.abs(calculations.progress.weightChange), unit)}
          </div>
        </div>

        {/* Remaining Weight */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Remaining</div>
          <div className="text-lg font-bold text-gray-800">
            {formatWeight(calculations.progress.remainingWeight, unit)}
          </div>
        </div>

        {/* Weekly Rate */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Weekly Rate</div>
          <div className="text-lg font-bold text-gray-800">
            {formatWeight(Math.abs(calculations.weeklyRate), unit)}/week
          </div>
        </div>

        {/* Streak */}
        {showStreaks && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Logging Streak</div>
            <div className="text-lg font-bold text-blue-600">
              {calculations.streak} days
            </div>
          </div>
        )}
      </div>

      {/* Trends */}
      {showTrends && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Recent Trends</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trend Change */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">7-Day Trend</span>
                <span className={cn('text-lg font-bold', getTrendColor(calculations.trendChange))}>
                  {getTrendIcon(calculations.trendChange)} {formatPercentage(Math.abs(calculations.trendChange))}
                </span>
              </div>
            </div>

            {/* Rate Status */}
            {showRecommendations && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rate Status</span>
                  <span className={cn('text-lg font-bold', getRateStatus(calculations.weeklyRate, calculations.recommendedRate).color)}>
                    {getRateStatus(calculations.weeklyRate, calculations.recommendedRate).status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Recommendations</h4>
          <div className="space-y-3">
            {/* Rate Recommendation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">💡</span>
                <div>
                  <div className="font-medium text-blue-800 mb-1">Weekly Rate</div>
                  <div className="text-blue-700 text-sm">
                    Recommended: {formatWeight(calculations.recommendedRate, unit)}/week
                    {Math.abs(calculations.weeklyRate) > calculations.recommendedRate * 1.5 && (
                      <span className="ml-2 text-red-600">⚠️ Consider slowing down for sustainable progress</span>
                    )}
                    {Math.abs(calculations.weeklyRate) < calculations.recommendedRate * 0.5 && (
                      <span className="ml-2 text-yellow-600">📈 You could increase your rate slightly</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Projection */}
            {calculations.projectedDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2">🎯</span>
                  <div>
                    <div className="font-medium text-green-800 mb-1">Projected Completion</div>
                    <div className="text-green-700 text-sm">
                      At current rate: {formatDate(calculations.projectedDate)}
                      {goal.targetDate && (
                        <span className="ml-2">
                          {calculations.projectedDate > goal.targetDate ? 
                            `(${Math.ceil((calculations.projectedDate.getTime() - goal.targetDate.getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks behind target)` :
                            `(${Math.ceil((goal.targetDate.getTime() - calculations.projectedDate.getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks ahead of target)`
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Time Remaining */}
            {calculations.timeRemaining && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-purple-600 mr-2">⏰</span>
                  <div>
                    <div className="font-medium text-purple-800 mb-1">Time Remaining</div>
                    <div className="text-purple-700 text-sm">
                      {calculations.timeRemaining.days} days ({calculations.timeRemaining.weeks} weeks)
                      {calculations.timeRemaining.days < 30 && (
                        <span className="ml-2 text-orange-600">⚠️ Consider adjusting timeline</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Recent Entries</h4>
        <div className="space-y-2">
          {calculations.sortedEntries.slice(-5).reverse().map((entry, index) => (
            <motion.div
              key={entry.date.toISOString()}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-800">
                  {formatWeight(entry.weight, unit)}
                </div>
                <div className="text-sm text-gray-600">
                  {getRelativeTime(entry.date)}
                </div>
              </div>
              {entry.notes && (
                <div className="text-sm text-gray-600 max-w-xs truncate">
                  {entry.notes}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressTracker;
