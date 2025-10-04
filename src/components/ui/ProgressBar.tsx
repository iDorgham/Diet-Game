// ProgressBar component following docs/ui-components/loaders.md
// EARS-UI-041 through EARS-UI-045 implementation

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  animated?: boolean;
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  className?: string;
  'aria-label'?: string;
}

const sizeVariants = {
  sm: {
    height: 'h-1',
    text: 'text-xs',
    padding: 'py-1'
  },
  md: {
    height: 'h-2',
    text: 'text-sm',
    padding: 'py-2'
  },
  lg: {
    height: 'h-3',
    text: 'text-base',
    padding: 'py-3'
  }
};

const variantVariants = {
  default: {
    track: 'bg-gray-200',
    fill: 'bg-blue-500'
  },
  success: {
    track: 'bg-gray-200',
    fill: 'bg-green-500'
  },
  warning: {
    track: 'bg-gray-200',
    fill: 'bg-yellow-500'
  },
  danger: {
    track: 'bg-gray-200',
    fill: 'bg-red-500'
  },
  info: {
    track: 'bg-gray-200',
    fill: 'bg-cyan-500'
  }
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  animated = true,
  showLabel = false,
  showPercentage = false,
  label,
  className,
  'aria-label': ariaLabel
}) => {
  const sizeClasses = sizeVariants[size];
  const variantClasses = variantVariants[variant];
  
  // Ensure value is within bounds
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = (clampedValue / max) * 100;

  const containerClasses = cn(
    'w-full',
    sizeClasses.padding,
    className
  );

  const trackClasses = cn(
    'w-full rounded-full overflow-hidden',
    sizeClasses.height,
    variantClasses.track
  );

  const fillClasses = cn(
    'h-full rounded-full transition-all duration-300 ease-out',
    variantClasses.fill
  );

  const labelClasses = cn(
    'block font-medium text-gray-700 mb-1',
    sizeClasses.text
  );

  const percentageClasses = cn(
    'text-gray-600 font-medium',
    sizeClasses.text
  );

  return (
    <div className={containerClasses}>
      {/* Label and percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {showLabel && (
            <span className={labelClasses}>
              {label || 'Progress'}
            </span>
          )}
          {showPercentage && (
            <span className={percentageClasses}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={trackClasses}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || label || 'Progress'}
      >
        <motion.div
          className={fillClasses}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={
            animated
              ? { duration: 0.8, ease: 'easeOut' }
              : { duration: 0 }
          }
        />
      </div>
    </div>
  );
};

// Circular Progress Bar variant
export interface CircularProgressBarProps {
  value: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  animated?: boolean;
  showPercentage?: boolean;
  label?: string;
  className?: string;
  'aria-label'?: string;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  animated = true,
  showPercentage = false,
  label,
  className,
  'aria-label': ariaLabel
}) => {
  const variantClasses = variantVariants[variant];
  
  // Ensure value is within bounds
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const percentage = clampedValue;
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const containerClasses = cn(
    'relative inline-flex items-center justify-center',
    className
  );

  const circleClasses = cn(
    'transition-all duration-300 ease-out',
    variantClasses.fill
  );

  return (
    <div className={containerClasses}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || label || 'Progress'}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={variantClasses.track}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          className={circleClasses}
          style={{
            strokeDasharray,
            strokeDashoffset: animated ? circumference : strokeDashoffset
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={
            animated
              ? { duration: 0.8, ease: 'easeOut' }
              : { duration: 0 }
          }
        />
      </svg>

      {/* Center content */}
      {(showPercentage || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <span className="text-lg font-semibold text-gray-700">
              {Math.round(percentage)}%
            </span>
          )}
          {label && (
            <span className="text-xs text-gray-500 mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Step Progress Bar variant
export interface StepProgressBarProps {
  steps: string[];
  currentStep: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps,
  currentStep,
  variant = 'default',
  className
}) => {
  const variantClasses = variantVariants[variant];

  const containerClasses = cn(
    'flex items-center justify-between w-full',
    className
  );

  const stepClasses = (index: number) => cn(
    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300',
    index < currentStep
      ? `${variantClasses.fill} text-white`
      : index === currentStep
      ? `${variantClasses.fill} text-white ring-2 ring-offset-2 ring-blue-500`
      : 'bg-gray-200 text-gray-600'
  );

  const lineClasses = (index: number) => cn(
    'flex-1 h-0.5 mx-2 transition-all duration-300',
    index < currentStep ? variantClasses.fill : 'bg-gray-200'
  );

  return (
    <div className={containerClasses}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div className={stepClasses(index)}>
              {index + 1}
            </div>
            <span className="text-xs text-gray-600 mt-1 text-center">
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={lineClasses(index)} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressBar;
