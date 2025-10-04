// NutritionChart component - Displays nutrition data with proper calculations and formatting
// Demonstrates integration of calculation and formatting utilities

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  formatCalories, 
  formatMacronutrient, 
  formatPercentage,
  formatNutrition 
} from '../../utils/formatting';
import { 
  calculateDailyNutrition, 
  calculateNutritionProgress,
  calculateRemainingNutrition 
} from '../../utils/calculations';
import { MACRO_CALORIES, DAILY_VALUES } from '../../utils/constants';
import { cn } from '../../utils/helpers';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface NutritionChartProps {
  data: NutritionData;
  targets?: NutritionData;
  showProgress?: boolean;
  showRemaining?: boolean;
  showCalories?: boolean;
  showMacros?: boolean;
  showMicronutrients?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const NutritionChart: React.FC<NutritionChartProps> = ({
  data,
  targets = {
    calories: DAILY_VALUES.calories,
    protein: DAILY_VALUES.protein,
    carbs: DAILY_VALUES.carbs,
    fat: DAILY_VALUES.fat,
    fiber: DAILY_VALUES.fiber,
    sugar: DAILY_VALUES.sugar,
    sodium: DAILY_VALUES.sodium,
  },
  showProgress = true,
  showRemaining = true,
  showCalories = true,
  showMacros = true,
  showMicronutrients = true,
  size = 'md',
  className,
}) => {
  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const calculations = useMemo(() => {
    const progress = {
      calories: calculateNutritionProgress(data.calories, targets.calories),
      protein: calculateNutritionProgress(data.protein, targets.protein),
      carbs: calculateNutritionProgress(data.carbs, targets.carbs),
      fat: calculateNutritionProgress(data.fat, targets.fat),
      fiber: targets.fiber ? calculateNutritionProgress(data.fiber || 0, targets.fiber) : 0,
      sugar: targets.sugar ? calculateNutritionProgress(data.sugar || 0, targets.sugar) : 0,
      sodium: targets.sodium ? calculateNutritionProgress(data.sodium || 0, targets.sodium) : 0,
    };

    const remaining = {
      calories: calculateRemainingNutrition(data.calories, targets.calories),
      protein: calculateRemainingNutrition(data.protein, targets.protein),
      carbs: calculateRemainingNutrition(data.carbs, targets.carbs),
      fat: calculateRemainingNutrition(data.fat, targets.fat),
      fiber: targets.fiber ? calculateRemainingNutrition(data.fiber || 0, targets.fiber) : 0,
      sugar: targets.sugar ? calculateRemainingNutrition(data.sugar || 0, targets.sugar) : 0,
      sodium: targets.sodium ? calculateRemainingNutrition(data.sodium || 0, targets.sodium) : 0,
    };

    // Calculate macro distribution
    const totalMacroCalories = (data.protein * MACRO_CALORIES.protein) + 
                              (data.carbs * MACRO_CALORIES.carbs) + 
                              (data.fat * MACRO_CALORIES.fat);
    
    const macroDistribution = {
      protein: totalMacroCalories > 0 ? (data.protein * MACRO_CALORIES.protein / totalMacroCalories) * 100 : 0,
      carbs: totalMacroCalories > 0 ? (data.carbs * MACRO_CALORIES.carbs / totalMacroCalories) * 100 : 0,
      fat: totalMacroCalories > 0 ? (data.fat * MACRO_CALORIES.fat / totalMacroCalories) * 100 : 0,
    };

    return { progress, remaining, macroDistribution };
  }, [data, targets]);

  // ============================================================================
  // STYLING
  // ============================================================================

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // ============================================================================
  // PROGRESS BAR COMPONENT
  // ============================================================================

  const ProgressBar: React.FC<{
    label: string;
    value: number;
    target: number;
    unit: string;
    progress: number;
    color: string;
  }> = ({ label, value, target, unit, progress, color }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className={cn('font-medium', textSizeClasses[size])}>{label}</span>
        <span className={cn('text-gray-600', textSizeClasses[size])}>
          {formatNumber(value)} / {formatNumber(target)} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-2 rounded-full', color)}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className={cn('text-gray-500', textSizeClasses[size])}>
          {formatPercentage(progress)}
        </span>
        {showRemaining && (
          <span className={cn('text-gray-500', textSizeClasses[size])}>
            {formatNumber(calculations.remaining[label.toLowerCase() as keyof typeof calculations.remaining])} remaining
          </span>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // MACRO DISTRIBUTION CHART
  // ============================================================================

  const MacroDistributionChart = () => (
    <div className="mb-4">
      <h4 className={cn('font-semibold mb-3', titleSizeClasses[size])}>
        Macro Distribution
      </h4>
      <div className="flex h-4 rounded-lg overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${calculations.macroDistribution.protein}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-blue-500"
          title={`Protein: ${formatPercentage(calculations.macroDistribution.protein)}`}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${calculations.macroDistribution.carbs}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="bg-green-500"
          title={`Carbs: ${formatPercentage(calculations.macroDistribution.carbs)}`}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${calculations.macroDistribution.fat}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="bg-yellow-500"
          title={`Fat: ${formatPercentage(calculations.macroDistribution.fat)}`}
        />
      </div>
      <div className="flex justify-between mt-2">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span className={cn('text-gray-600', textSizeClasses[size])}>
            Protein {formatPercentage(calculations.macroDistribution.protein)}
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className={cn('text-gray-600', textSizeClasses[size])}>
            Carbs {formatPercentage(calculations.macroDistribution.carbs)}
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
          <span className={cn('text-gray-600', textSizeClasses[size])}>
            Fat {formatPercentage(calculations.macroDistribution.fat)}
          </span>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      <h3 className={cn('font-bold mb-4', titleSizeClasses[size])}>
        Daily Nutrition
      </h3>

      {/* Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className={cn('font-bold text-gray-800', titleSizeClasses[size])}>
            {formatCalories(data.calories)}
          </div>
          <div className={cn('text-gray-600', textSizeClasses[size])}>
            of {formatCalories(targets.calories)} target
          </div>
        </div>
      </div>

      {/* Macro Distribution */}
      {showMacros && <MacroDistributionChart />}

      {/* Macronutrients */}
      {showMacros && (
        <div className="mb-4">
          <h4 className={cn('font-semibold mb-3', titleSizeClasses[size])}>
            Macronutrients
          </h4>
          {showProgress ? (
            <>
              <ProgressBar
                label="Protein"
                value={data.protein}
                target={targets.protein}
                unit="g"
                progress={calculations.progress.protein}
                color="bg-blue-500"
              />
              <ProgressBar
                label="Carbs"
                value={data.carbs}
                target={targets.carbs}
                unit="g"
                progress={calculations.progress.carbs}
                color="bg-green-500"
              />
              <ProgressBar
                label="Fat"
                value={data.fat}
                target={targets.fat}
                unit="g"
                progress={calculations.progress.fat}
                color="bg-yellow-500"
              />
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Protein</span>
                <span>{formatMacronutrient(data.protein)}</span>
              </div>
              <div className="flex justify-between">
                <span>Carbs</span>
                <span>{formatMacronutrient(data.carbs)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fat</span>
                <span>{formatMacronutrient(data.fat)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Micronutrients */}
      {showMicronutrients && (data.fiber || data.sugar || data.sodium) && (
        <div>
          <h4 className={cn('font-semibold mb-3', titleSizeClasses[size])}>
            Micronutrients
          </h4>
          <div className="space-y-2">
            {data.fiber !== undefined && (
              <div className="flex justify-between">
                <span>Fiber</span>
                <span>{formatMacronutrient(data.fiber)}</span>
              </div>
            )}
            {data.sugar !== undefined && (
              <div className="flex justify-between">
                <span>Sugar</span>
                <span>{formatMacronutrient(data.sugar)}</span>
              </div>
            )}
            {data.sodium !== undefined && (
              <div className="flex justify-between">
                <span>Sodium</span>
                <span>{formatNumber(data.sodium)} mg</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Summary */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className={cn('text-gray-600 text-center', textSizeClasses[size])}>
          {formatNutrition(data)}
        </div>
      </div>
    </motion.div>
  );
};

export default NutritionChart;