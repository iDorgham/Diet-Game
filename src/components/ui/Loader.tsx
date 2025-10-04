// Loader component following docs/ui-components/loaders.md
// EARS-UI-041 through EARS-UI-045 implementation

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  'aria-label'?: string;
}

const sizeVariants = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorVariants = {
  primary: 'text-blue-500',
  secondary: 'text-gray-500',
  white: 'text-white',
  gray: 'text-gray-400'
};

// Spinner Loader
const SpinnerLoader: React.FC<LoaderProps> = ({ size = 'md', color = 'primary', className, 'aria-label': ariaLabel }) => {
  const sizeClasses = sizeVariants[size];
  const colorClasses = colorVariants[color];

  return (
    <motion.div
      className={cn('inline-block', sizeClasses, colorClasses, className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      aria-label={ariaLabel || 'Loading'}
      role="status"
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

// Dots Loader
const DotsLoader: React.FC<LoaderProps> = ({ size = 'md', color = 'primary', className, 'aria-label': ariaLabel }) => {
  const sizeClasses = sizeVariants[size];
  const colorClasses = colorVariants[color];

  const dotVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5]
    }
  };

  const dotTransition = {
    duration: 1.4,
    repeat: Infinity,
    ease: 'easeInOut'
  };

  return (
    <div className={cn('flex space-x-1', className)} aria-label={ariaLabel || 'Loading'} role="status">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full bg-current', sizeClasses, colorClasses)}
          variants={dotVariants}
          animate="animate"
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );
};

// Pulse Loader
const PulseLoader: React.FC<LoaderProps> = ({ size = 'md', color = 'primary', className, 'aria-label': ariaLabel }) => {
  const sizeClasses = sizeVariants[size];
  const colorClasses = colorVariants[color];

  return (
    <motion.div
      className={cn('rounded-full bg-current', sizeClasses, colorClasses, className)}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      aria-label={ariaLabel || 'Loading'}
      role="status"
    />
  );
};

// Bars Loader
const BarsLoader: React.FC<LoaderProps> = ({ size = 'md', color = 'primary', className, 'aria-label': ariaLabel }) => {
  const sizeClasses = sizeVariants[size];
  const colorClasses = colorVariants[color];

  const barVariants = {
    animate: {
      scaleY: [1, 0.3, 1],
      opacity: [0.5, 1, 0.5]
    }
  };

  const barTransition = {
    duration: 1.2,
    repeat: Infinity,
    ease: 'easeInOut'
  };

  return (
    <div className={cn('flex items-end space-x-1', className)} aria-label={ariaLabel || 'Loading'} role="status">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={cn(
            'bg-current w-0.5',
            size === 'sm' && 'h-3',
            size === 'md' && 'h-4',
            size === 'lg' && 'h-5',
            size === 'xl' && 'h-6',
            colorClasses
          )}
          variants={barVariants}
          animate="animate"
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );
};

// Main Loader component
const Loader: React.FC<LoaderProps> = ({ variant = 'spinner', ...props }) => {
  switch (variant) {
    case 'spinner':
      return <SpinnerLoader {...props} />;
    case 'dots':
      return <DotsLoader {...props} />;
    case 'pulse':
      return <PulseLoader {...props} />;
    case 'bars':
      return <BarsLoader {...props} />;
    default:
      return <SpinnerLoader {...props} />;
  }
};

// Skeleton Loader
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse',
  className
}) => {
  const baseClasses = cn(
    'bg-gray-200',
    variant === 'circular' && 'rounded-full',
    variant === 'text' && 'rounded',
    variant === 'rectangular' && 'rounded',
    animation === 'pulse' && 'animate-pulse',
    animation === 'wave' && 'animate-pulse',
    className
  );

  const waveClasses = cn(
    'relative overflow-hidden',
    'before:absolute before:inset-0',
    'before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent',
    'before:animate-pulse'
  );

  const style = {
    '--skeleton-width': typeof width === 'number' ? `${width}px` : width,
    '--skeleton-height': typeof height === 'number' ? `${height}px` : height,
  } as React.CSSProperties;

  return (
    <div
      className={animation === 'wave' ? waveClasses : baseClasses}
      style={style}
      aria-label="Loading content"
      role="status"
    />
  );
};

// Loading Overlay
export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loader?: React.ReactNode;
  message?: string;
  className?: string;
  overlayClassName?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  loader,
  message,
  className,
  overlayClassName
}) => {
  const defaultLoader = <Loader size="lg" color="white" />;

  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <motion.div
          className={cn(
            'absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center',
            'backdrop-blur-sm z-50',
            overlayClassName
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {loader || defaultLoader}
          {message && (
            <motion.p
              className="mt-4 text-white text-sm font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Loading Button
export interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  className,
  disabled,
  onClick
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-lg',
        'bg-blue-500 text-white font-medium transition-all duration-200',
        'hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <Loader size="sm" color="white" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Loader;
