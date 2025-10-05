// Input component following docs/ui-components/inputs.md
// EARS-UI-046 through EARS-UI-050 implementation

import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, X, Search } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const inputStates = {
  default: {
    border: 'border-gray-300',
    focus: 'focus:border-blue-500 focus:ring-blue-500',
    background: 'bg-white'
  },
  error: {
    border: 'border-red-500',
    focus: 'focus:border-red-500 focus:ring-red-500',
    background: 'bg-white'
  },
  success: {
    border: 'border-green-500',
    focus: 'focus:border-green-500 focus:ring-green-500',
    background: 'bg-white'
  },
  disabled: {
    border: 'border-gray-200',
    focus: 'focus:border-gray-200 focus:ring-0',
    background: 'bg-gray-50'
  }
};

const inputSizes = {
  sm: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    height: 'h-8'
  },
  md: {
    padding: 'px-3 py-2',
    fontSize: 'text-base',
    height: 'h-10'
  },
  lg: {
    padding: 'px-4 py-3',
    fontSize: 'text-lg',
    height: 'h-12'
  }
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name,
      label,
      placeholder,
      value,
      onChange,
      type = 'text',
      required = false,
      disabled = false,
      readonly = false,
      error,
      helperText,
      icon: Icon,
      iconPosition = 'left',
      clearable = false,
      maxLength,
      autoComplete,
      autoFocus,
      className,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Determine input state
    const getInputState = () => {
      if (disabled) return 'disabled';
      if (error) return 'error';
      if (value && !error) return 'success';
      return 'default';
    };

    const inputState = getInputState();
    const stateClasses = inputStates[inputState];
    const sizeClasses = inputSizes.md; // Default to medium size

    // Determine actual input type
    const actualType = type === 'password' && showPassword ? 'text' : type;

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (maxLength && newValue.length > maxLength) return;
      onChange(newValue);
    };

    // Handle clear
    const handleClear = () => {
      onChange('');
    };

    // Handle password toggle
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputClasses = cn(
      // Base styles
      'w-full rounded-lg border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'placeholder:text-gray-400',
      'disabled:cursor-not-allowed disabled:opacity-50',
      
      // State styles
      stateClasses.border,
      stateClasses.focus,
      stateClasses.background,
      
      // Size styles
      sizeClasses.padding,
      sizeClasses.fontSize,
      sizeClasses.height,
      
      // Icon spacing
      Icon && iconPosition === 'left' && 'pl-10',
      (clearable || type === 'password') && 'pr-10',
      
      className
    );

    const containerClasses = cn(
      'relative',
      error && 'animate-pulse'
    );

    const labelClasses = cn(
      'block text-sm font-medium mb-1',
      error ? 'text-red-600' : 'text-gray-700',
      disabled && 'text-gray-400'
    );

    const helperTextClasses = cn(
      'text-xs mt-1',
      error ? 'text-red-600' : 'text-gray-500'
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label htmlFor={name} className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className={containerClasses}>
          {/* Left icon */}
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Icon className="w-5 h-5 text-gray-400" />
            </div>
          )}

          {/* Search icon for search type */}
          {type === 'search' && !Icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          )}

          {/* Input field */}
          <motion.input
            ref={ref}
            id={name}
            name={name}
            type={actualType}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            maxLength={maxLength}
            className={inputClasses}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={!!error}
            aria-required={required}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            {...props}
          />

          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Password toggle */}
            {type === 'password' && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Clear button */}
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Right icon */}
            {Icon && iconPosition === 'right' && (
              <Icon className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Helper text or error message */}
        {(helperText || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={helperTextClasses}
            role={error ? 'alert' : undefined}
            aria-live={error ? 'polite' : undefined}
          >
            {error || helperText}
          </motion.div>
        )}

        {/* Character count */}
        {maxLength && (
          <div className="text-xs text-gray-400 mt-1 text-right">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
export { Input };
