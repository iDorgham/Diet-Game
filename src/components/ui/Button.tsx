// Button component following docs/ui-components/buttons.md
// EARS-UI-031 through EARS-UI-035 implementation

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const buttonVariants = {
  primary: {
    base: 'bg-blue-600 text-white border border-blue-600',
    hover: 'hover:bg-blue-700 hover:border-blue-700',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    active: 'active:bg-blue-800',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300'
  },
  secondary: {
    base: 'bg-gray-200 text-gray-900 border border-gray-300',
    hover: 'hover:bg-gray-300 hover:border-gray-400',
    focus: 'focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    active: 'active:bg-gray-400',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200'
  },
  outline: {
    base: 'bg-transparent text-blue-600 border border-blue-600',
    hover: 'hover:bg-blue-50 hover:border-blue-700',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    active: 'active:bg-blue-100',
    disabled: 'disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-300'
  },
  ghost: {
    base: 'bg-transparent text-gray-700 border border-transparent',
    hover: 'hover:bg-gray-100 hover:text-gray-900',
    focus: 'focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    active: 'active:bg-gray-200',
    disabled: 'disabled:bg-transparent disabled:text-gray-400'
  },
  danger: {
    base: 'bg-red-600 text-white border border-red-600',
    hover: 'hover:bg-red-700 hover:border-red-700',
    focus: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    active: 'active:bg-red-800',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300'
  }
};

const sizeVariants = {
  sm: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    iconSize: 'w-4 h-4',
    minHeight: 'h-8'
  },
  md: {
    padding: 'px-4 py-2',
    fontSize: 'text-base',
    iconSize: 'w-5 h-5',
    minHeight: 'h-10'
  },
  lg: {
    padding: 'px-6 py-3',
    fontSize: 'text-lg',
    iconSize: 'w-6 h-6',
    minHeight: 'h-12'
  },
  xl: {
    padding: 'px-8 py-4',
    fontSize: 'text-xl',
    iconSize: 'w-7 h-7',
    minHeight: 'h-14'
  }
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      onClick,
      type = 'button',
      className,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const variantClasses = buttonVariants[variant];
    const sizeClasses = sizeVariants[size];

    const baseClasses = cn(
      // Base styles
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'relative overflow-hidden',
      
      // Variant styles
      variantClasses.base,
      !disabled && !loading && variantClasses.hover,
      !disabled && !loading && variantClasses.focus,
      !disabled && !loading && variantClasses.active,
      disabled && variantClasses.disabled,
      
      // Size styles
      sizeClasses.padding,
      sizeClasses.fontSize,
      sizeClasses.minHeight,
      
      // Layout
      fullWidth && 'w-full',
      
      className
    );

    const iconClasses = cn(
      sizeClasses.iconSize,
      iconPosition === 'left' && children && 'mr-2',
      iconPosition === 'right' && children && 'ml-2'
    );

    const handleClick = () => {
      if (!disabled && !loading && onClick) {
        onClick();
      }
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        className={baseClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.div
            className={cn(iconClasses, 'mr-2')}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 />
          </motion.div>
        )}

        {/* Left icon */}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon className={iconClasses} />
        )}

        {/* Button content */}
        {children && (
          <span className={loading ? 'opacity-0' : 'opacity-100'}>
            {children}
          </span>
        )}

        {/* Right icon */}
        {!loading && Icon && iconPosition === 'right' && (
          <Icon className={iconClasses} />
        )}

        {/* Ripple effect overlay */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export { Button };
