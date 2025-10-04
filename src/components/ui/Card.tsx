// Card component following docs/ui-components/cards.md
// EARS-UI-011 through EARS-UI-015 implementation

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const cardVariants = {
  default: 'bg-white shadow-sm border border-gray-200',
  elevated: 'bg-white shadow-lg border border-gray-200',
  outlined: 'bg-white border-2 border-gray-300',
  filled: 'bg-gray-50 border border-gray-200'
};

const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hover = false,
      clickable = false,
      loading = false,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      // Base styles
      'rounded-lg transition-all duration-200',
      
      // Variant styles
      cardVariants[variant],
      
      // Padding
      paddingVariants[padding],
      
      // Interactive styles
      hover && 'hover:shadow-md hover:scale-[1.02]',
      clickable && 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
      
      // Loading state
      loading && 'opacity-50 pointer-events-none',
      
      className
    );

    const handleClick = () => {
      if (clickable && onClick && !loading) {
        onClick();
      }
    };

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        onClick={handleClick}
        whileHover={hover || clickable ? { y: -2 } : undefined}
        whileTap={clickable ? { y: 0 } : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          children
        )}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </Component>
  )
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-gray-700', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;
