// Validation utilities for the Diet Game application
// Comprehensive validation functions for forms, data, and user inputs

import { z } from 'zod';

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

/**
 * Email validation schema
 */
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email must be less than 254 characters');

/**
 * Password validation schema
 */
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

/**
 * Name validation schema
 */
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

/**
 * Weight validation schema
 */
export const weightSchema = z.string()
  .regex(/^\d+(\.\d+)?\s*(lbs?|kg)$/i, 'Weight must be in format "175 lbs" or "80 kg"')
  .refine((val) => {
    const num = parseFloat(val);
    const unit = val.toLowerCase().includes('kg') ? 'kg' : 'lbs';
    if (unit === 'kg') {
      return num >= 30 && num <= 300; // 30-300 kg
    } else {
      return num >= 66 && num <= 660; // 66-660 lbs
    }
  }, 'Weight must be within reasonable range');

/**
 * Age validation schema
 */
export const ageSchema = z.number()
  .int('Age must be a whole number')
  .min(13, 'You must be at least 13 years old')
  .max(120, 'Age must be less than 120 years');

/**
 * Phone number validation schema
 */
export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be less than 20 characters');

// ============================================================================
// DIET-SPECIFIC VALIDATION SCHEMAS
// ============================================================================

/**
 * Diet type validation schema
 */
export const dietTypeSchema = z.enum([
  'Keto Diet',
  'Mediterranean Diet',
  'Paleo Diet',
  'Vegetarian',
  'Vegan',
  'Low Carb',
  'Intermittent Fasting',
  'Balanced Diet'
], {
  errorMap: () => ({ message: 'Please select a valid diet type' })
});

/**
 * Body type validation schema
 */
export const bodyTypeSchema = z.enum([
  'Ectomorph',
  'Mesomorph',
  'Endomorph'
], {
  errorMap: () => ({ message: 'Please select a valid body type' })
});

/**
 * Activity level validation schema
 */
export const activityLevelSchema = z.enum([
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
  'Extremely Active'
], {
  errorMap: () => ({ message: 'Please select a valid activity level' })
});

/**
 * Goal type validation schema
 */
export const goalTypeSchema = z.enum([
  'Weight Loss',
  'Weight Gain',
  'Muscle Building',
  'Maintenance',
  'Athletic Performance'
], {
  errorMap: () => ({ message: 'Please select a valid goal type' })
});

// ============================================================================
// NUTRITION VALIDATION SCHEMAS
// ============================================================================

/**
 * Calorie validation schema
 */
export const calorieSchema = z.number()
  .int('Calories must be a whole number')
  .min(0, 'Calories cannot be negative')
  .max(10000, 'Calories must be less than 10,000');

/**
 * Macronutrient validation schema
 */
export const macronutrientSchema = z.number()
  .min(0, 'Macronutrient value cannot be negative')
  .max(1000, 'Macronutrient value must be less than 1,000 grams');

/**
 * Meal type validation schema
 */
export const mealTypeSchema = z.enum([
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Pre-Workout',
  'Post-Workout'
], {
  errorMap: () => ({ message: 'Please select a valid meal type' })
});

/**
 * Food item validation schema
 */
export const foodItemSchema = z.object({
  name: z.string().min(1, 'Food name is required').max(100, 'Food name must be less than 100 characters'),
  quantity: z.number().min(0.1, 'Quantity must be at least 0.1').max(1000, 'Quantity must be less than 1,000'),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit must be less than 20 characters'),
  calories: calorieSchema,
  protein: macronutrientSchema,
  carbs: macronutrientSchema,
  fat: macronutrientSchema,
  fiber: z.number().min(0).max(100).optional(),
  sugar: z.number().min(0).max(100).optional(),
  sodium: z.number().min(0).max(10000).optional(),
});

// ============================================================================
// TASK VALIDATION SCHEMAS
// ============================================================================

/**
 * Task type validation schema
 */
export const taskTypeSchema = z.enum([
  'Meal',
  'Shopping',
  'Cooking',
  'Exercise',
  'Water',
  'Check-in',
  'AI Chat'
], {
  errorMap: () => ({ message: 'Please select a valid task type' })
});

/**
 * Task priority validation schema
 */
export const taskPrioritySchema = z.enum([
  'Low',
  'Medium',
  'High',
  'Critical'
], {
  errorMap: () => ({ message: 'Please select a valid priority level' })
});

/**
 * Task validation schema
 */
export const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(100, 'Task name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: taskTypeSchema,
  priority: taskPrioritySchema,
  dueDate: z.date().optional(),
  estimatedDuration: z.number().min(1, 'Duration must be at least 1 minute').max(480, 'Duration must be less than 8 hours').optional(),
  xpReward: z.number().min(0).max(1000).optional(),
  coinReward: z.number().min(0).max(1000).optional(),
});

// ============================================================================
// USER PROFILE VALIDATION SCHEMAS
// ============================================================================

/**
 * Complete user profile validation schema
 */
export const userProfileSchema = z.object({
  userName: nameSchema,
  email: emailSchema,
  dietType: dietTypeSchema,
  bodyType: bodyTypeSchema,
  weight: weightSchema,
  height: z.string().regex(/^\d+(\.\d+)?\s*(ft|in|cm|m)$/i, 'Height must be in format "5 ft 10 in" or "180 cm"'),
  age: ageSchema,
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  activityLevel: activityLevelSchema,
  goalType: goalTypeSchema,
  targetWeight: weightSchema.optional(),
  targetDate: z.date().optional(),
  phone: phoneSchema.optional(),
  timezone: z.string().optional(),
});

// ============================================================================
// VALIDATION UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates an email address
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: (error as z.ZodError).errors[0]?.message };
  }
}

/**
 * Validates a password
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  try {
    passwordSchema.parse(password);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: (error as z.ZodError).errors[0]?.message };
  }
}

/**
 * Validates a name
 */
export function validateName(name: string): { isValid: boolean; error?: string } {
  try {
    nameSchema.parse(name);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: (error as z.ZodError).errors[0]?.message };
  }
}

/**
 * Validates a weight string
 */
export function validateWeight(weight: string): { isValid: boolean; error?: string } {
  try {
    weightSchema.parse(weight);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: (error as z.ZodError).errors[0]?.message };
  }
}

/**
 * Validates a phone number
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  try {
    phoneSchema.parse(phone);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: (error as z.ZodError).errors[0]?.message };
  }
}

/**
 * Validates a complete user profile
 */
export function validateUserProfile(profile: any): { isValid: boolean; errors?: Record<string, string> } {
  try {
    userProfileSchema.parse(profile);
    return { isValid: true };
  } catch (error) {
    const zodError = error as z.ZodError;
    const errors: Record<string, string> = {};
    
    zodError.errors.forEach((err) => {
      if (err.path.length > 0) {
        errors[err.path[0] as string] = err.message;
      }
    });
    
    return { isValid: false, errors };
  }
}

/**
 * Validates a task object
 */
export function validateTask(task: any): { isValid: boolean; errors?: Record<string, string> } {
  try {
    taskSchema.parse(task);
    return { isValid: true };
  } catch (error) {
    const zodError = error as z.ZodError;
    const errors: Record<string, string> = {};
    
    zodError.errors.forEach((err) => {
      if (err.path.length > 0) {
        errors[err.path[0] as string] = err.message;
      }
    });
    
    return { isValid: false, errors };
  }
}

/**
 * Validates a food item
 */
export function validateFoodItem(foodItem: any): { isValid: boolean; errors?: Record<string, string> } {
  try {
    foodItemSchema.parse(foodItem);
    return { isValid: true };
  } catch (error) {
    const zodError = error as z.ZodError;
    const errors: Record<string, string> = {};
    
    zodError.errors.forEach((err) => {
      if (err.path.length > 0) {
        errors[err.path[0] as string] = err.message;
      }
    });
    
    return { isValid: false, errors };
  }
}

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

/**
 * Creates a validation function for React Hook Form
 */
export function createValidationFunction<T>(schema: z.ZodSchema<T>) {
  return (data: T) => {
    try {
      schema.parse(data);
      return {};
    } catch (error) {
      const zodError = error as z.ZodError;
      const errors: Record<string, string> = {};
      
      zodError.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      
      return errors;
    }
  };
}

/**
 * Sanitizes input by removing potentially harmful characters
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validates and sanitizes text input
 */
export function validateAndSanitizeText(text: string, maxLength: number = 1000): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = sanitizeInput(text);
  
  if (sanitized.length === 0) {
    return { isValid: false, sanitized, error: 'Text cannot be empty' };
  }
  
  if (sanitized.length > maxLength) {
    return { isValid: false, sanitized, error: `Text must be less than ${maxLength} characters` };
  }
  
  return { isValid: true, sanitized };
}

/**
 * Validates file upload
 */
export function validateFileUpload(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
} = {}): { isValid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxFiles = 1 } = options;
  
  if (file.size > maxSize) {
    return { isValid: false, error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true };
}

// ============================================================================
// EXPORT ALL SCHEMAS FOR EXTERNAL USE
// ============================================================================

export {
  emailSchema,
  passwordSchema,
  nameSchema,
  weightSchema,
  ageSchema,
  phoneSchema,
  dietTypeSchema,
  bodyTypeSchema,
  activityLevelSchema,
  goalTypeSchema,
  calorieSchema,
  macronutrientSchema,
  mealTypeSchema,
  foodItemSchema,
  taskTypeSchema,
  taskPrioritySchema,
  taskSchema,
  userProfileSchema,
};
