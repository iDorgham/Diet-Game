// Form component following docs/ui-components/forms.md
// EARS-UI-016 through EARS-UI-020 implementation

import React, { forwardRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  Calendar,
  Clock,
  FileText,
  Image,
  File
} from 'lucide-react';
import { cn } from '../../utils/helpers';

// Form Component
export interface FormProps {
  onSubmit: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  initialValues?: Record<string, any>;
  validationSchema?: any; // Zod schema
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      onSubmit,
      onCancel,
      initialValues = {},
      validationSchema,
      isLoading = false,
      submitLabel = 'Submit',
      cancelLabel = 'Cancel',
      showCancel = true,
      className,
      children
    },
    ref
  ) => {
    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validate form
      if (validationSchema) {
        try {
          await validationSchema.parse(formData);
          setErrors({});
        } catch (error: any) {
          const newErrors: Record<string, string> = {};
          error.errors?.forEach((err: any) => {
            newErrors[err.path[0]] = err.message;
          });
          setErrors(newErrors);
          return;
        }
      }

      try {
        await onSubmit(formData);
      } catch (error: any) {
        console.error('Form submission error:', error);
      }
    };

    const handleCancel = () => {
      if (onCancel) {
        onCancel();
      }
    };

    return (
      <motion.form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn('space-y-6', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {showCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && (
              <motion.div
                className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            )}
            {submitLabel}
          </button>
        </div>
      </motion.form>
    );
  }
);

Form.displayName = 'Form';

// Input Field Component
export interface InputFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autoComplete?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
  icon?: React.ComponentType<{ className?: string }>;
  helperText?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      name,
      label,
      type = 'text',
      placeholder,
      required = false,
      disabled = false,
      readonly = false,
      autoComplete,
      validation,
      icon: Icon,
      helperText,
      className,
      value,
      onChange,
      error
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const hasValue = value && value.length > 0;
    const hasError = !!error;

    const inputVariants = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      disabled: 'border-gray-200 bg-gray-50 text-gray-500'
    };

    const getInputVariant = () => {
      if (disabled) return inputVariants.disabled;
      if (hasError) return inputVariants.error;
      return inputVariants.default;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className={cn('space-y-1', className)}>
        {/* Label */}
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium transition-colors',
            hasError ? 'text-red-700' : 'text-gray-700'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className={cn(
                'h-5 w-5',
                hasError ? 'text-red-400' : 'text-gray-400'
              )} />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={name}
            name={name}
            type={type === 'password' && showPassword ? 'text' : type}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            autoComplete={autoComplete}
            value={value || ''}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors focus:outline-none focus:ring-1',
              Icon ? 'pl-10' : 'pl-3',
              type === 'password' ? 'pr-20' : 'pr-3',
              getInputVariant(),
              disabled && 'cursor-not-allowed'
            )}
          />

          {/* Right Icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Helper Text / Error Message */}
        {hasError ? (
          <div className="flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        ) : helperText ? (
          <p className="text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

// Select Field Component
export interface SelectFieldProps {
  name: string;
  label: string;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
    group?: string;
  }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  validation?: {
    required?: boolean;
    custom?: (value: any) => string | undefined;
  };
  className?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      name,
      label,
      options,
      placeholder = 'Select an option',
      required = false,
      disabled = false,
      multiple = false,
      searchable = false,
      clearable = false,
      validation,
      className,
      value,
      onChange,
      error
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const hasError = !!error;
    const hasValue = value && (Array.isArray(value) ? value.length > 0 : value !== '');

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedOptions = filteredOptions.reduce((groups, option) => {
      const group = option.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
      return groups;
    }, {} as Record<string, typeof options>);

    const handleSelect = (optionValue: string | number) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(String(optionValue))
          ? currentValues.filter(v => v !== String(optionValue))
          : [...currentValues, String(optionValue)];
        onChange?.(newValues);
      } else {
        onChange?.(String(optionValue));
        setIsOpen(false);
      }
    };

    const handleClear = () => {
      onChange?.(multiple ? [] : '');
    };

    return (
      <div className={cn('space-y-1', className)}>
        {/* Label */}
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium transition-colors',
            hasError ? 'text-red-700' : 'text-gray-700'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Select Container */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'relative w-full rounded-md border bg-white px-3 py-2 text-left text-sm shadow-sm focus:outline-none focus:ring-1',
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              disabled && 'cursor-not-allowed bg-gray-50 text-gray-500'
            )}
          >
            <span className={cn(
              'block truncate',
              !hasValue && 'text-gray-400'
            )}>
              {hasValue ? (
                multiple && Array.isArray(value) ? (
                  `${value.length} selected`
                ) : (
                  options.find(opt => String(opt.value) === String(value))?.label || value
                )
              ) : (
                placeholder
              )}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              {clearable && hasValue && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className="text-gray-400 hover:text-gray-600 mr-1"
                    aria-label="Clear selection"
                    title="Clear selection"
                  >
                  <X className="h-4 w-4" />
                </button>
              )}
              <svg
                className={cn(
                  'h-5 w-5 text-gray-400 transition-transform',
                  isOpen && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {searchable && (
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="py-1">
                {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <div key={group}>
                    {group !== 'default' && (
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {group}
                      </div>
                    )}
                    {groupOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                          option.disabled && 'opacity-50 cursor-not-allowed',
                          multiple && Array.isArray(value) && value.includes(String(option.value)) && 'bg-blue-50 text-blue-700'
                        )}
                      >
                        <div className="flex items-center">
                          {multiple && (
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(String(option.value))}
                    onChange={() => {}}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label={`Select ${option.label}`}
                  />
                          )}
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Error Message */}
        {hasError && (
          <div className="flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

// Date Picker Component
export interface DatePickerProps {
  name: string;
  label: string;
  value?: Date;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  required?: boolean;
  showTime?: boolean;
  timezone?: string;
  format?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      minDate,
      maxDate,
      disabled = false,
      required = false,
      showTime = false,
      timezone = 'UTC',
      format = 'YYYY-MM-DD',
      placeholder,
      className,
      error
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);

    const hasError = !!error;

    const formatDate = (date: Date) => {
      if (showTime) {
        return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
      }
      return date.toISOString().slice(0, 10); // YYYY-MM-DD
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value ? new Date(e.target.value) : null;
      setSelectedDate(newDate);
      onChange(newDate);
    };

    return (
      <div className={cn('space-y-1', className)}>
        {/* Label */}
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium transition-colors',
            hasError ? 'text-red-700' : 'text-gray-700'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Date Input Container */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className={cn(
              'h-5 w-5',
              hasError ? 'text-red-400' : 'text-gray-400'
            )} />
          </div>

          <input
            ref={ref}
            id={name}
            name={name}
            type={showTime ? 'datetime-local' : 'date'}
            value={selectedDate ? formatDate(selectedDate) : ''}
            onChange={handleDateChange}
            min={minDate ? formatDate(minDate) : undefined}
            max={maxDate ? formatDate(maxDate) : undefined}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={cn(
              'block w-full rounded-md border pl-10 pr-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors focus:outline-none focus:ring-1',
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              disabled && 'cursor-not-allowed bg-gray-50 text-gray-500'
            )}
          />
        </div>

        {/* Error Message */}
        {hasError && (
          <div className="flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

// File Upload Component
export interface FileUploadProps {
  name: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (file: File) => void;
  disabled?: boolean;
  className?: string;
  files?: File[];
  error?: string;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      name,
      label,
      accept,
      multiple = false,
      maxSize = 10 * 1024 * 1024, // 10MB
      maxFiles = 5,
      onUpload,
      onRemove,
      disabled = false,
      className,
      files = [],
      error
    },
    ref
  ) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const hasError = !!error;

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      await handleFiles(droppedFiles);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        await handleFiles(selectedFiles);
      }
    };

    const handleFiles = async (newFiles: File[]) => {
      // Validate files
      const validFiles = newFiles.filter(file => {
        if (file.size > maxSize) {
          console.warn(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Check max files limit
      const totalFiles = files.length + validFiles.length;
      if (totalFiles > maxFiles) {
        console.warn(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setUploading(true);
      try {
        await onUpload(validFiles);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    };

    const getFileIcon = (file: File) => {
      if (file.type.startsWith('image/')) {
        return <Image className="h-5 w-5" />;
      }
      if (file.type.includes('text')) {
        return <FileText className="h-5 w-5" />;
      }
      return <File className="h-5 w-5" />;
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <div className={cn('space-y-1', className)}>
        {/* Label */}
        <label
          htmlFor={name}
          className={cn(
            'block text-sm font-medium transition-colors',
            hasError ? 'text-red-700' : 'text-gray-700'
          )}
        >
          {label}
        </label>

        {/* Upload Area */}
        <div
          ref={ref}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            isDragOver && !disabled
              ? 'border-blue-400 bg-blue-50'
              : hasError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            id={name}
            name={name}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="space-y-2">
            <Upload className={cn(
              'mx-auto h-12 w-12',
              hasError ? 'text-red-400' : 'text-gray-400'
            )} />
            <div className="text-sm">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">
              {accept && `Accepted formats: ${accept}`}
              <br />
              Maximum file size: {formatFileSize(maxSize)}
              {maxFiles > 1 && <><br />Maximum {maxFiles} files</>}
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadProgress[file.name] !== undefined && (
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                  )}
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(file)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {hasError && (
          <div className="flex items-center text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

export default Form;
