// NutritionForm component - Advanced form with comprehensive validation
// Demonstrates the power of our validation utilities

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  validateFoodItem, 
  foodItemSchema,
  sanitizeInput,
  validateAndSanitizeText 
} from '../../utils/validation';
import { 
  formatCalories, 
  formatMacronutrient,
  formatNumber 
} from '../../utils/formatting';
import { cn } from '../../utils/helpers';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface NutritionFormProps {
  initialData?: Partial<FoodItem>;
  onSubmit: (data: FoodItem) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  submitText?: string;
  className?: string;
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const nutritionFormSchema = z.object({
  name: z.string()
    .min(1, 'Food name is required')
    .max(100, 'Food name must be less than 100 characters')
    .refine((val) => {
      const sanitized = sanitizeInput(val);
      return sanitized.length > 0;
    }, 'Invalid characters in food name'),
  
  quantity: z.number()
    .min(0.1, 'Quantity must be at least 0.1')
    .max(1000, 'Quantity must be less than 1,000'),
  
  unit: z.string()
    .min(1, 'Unit is required')
    .max(20, 'Unit must be less than 20 characters'),
  
  calories: z.number()
    .min(0, 'Calories cannot be negative')
    .max(10000, 'Calories must be less than 10,000'),
  
  protein: z.number()
    .min(0, 'Protein cannot be negative')
    .max(1000, 'Protein must be less than 1,000 grams'),
  
  carbs: z.number()
    .min(0, 'Carbs cannot be negative')
    .max(1000, 'Carbs must be less than 1,000 grams'),
  
  fat: z.number()
    .min(0, 'Fat cannot be negative')
    .max(1000, 'Fat must be less than 1,000 grams'),
  
  fiber: z.number()
    .min(0, 'Fiber cannot be negative')
    .max(100, 'Fiber must be less than 100 grams')
    .optional(),
  
  sugar: z.number()
    .min(0, 'Sugar cannot be negative')
    .max(100, 'Sugar must be less than 100 grams')
    .optional(),
  
  sodium: z.number()
    .min(0, 'Sodium cannot be negative')
    .max(10000, 'Sodium must be less than 10,000 mg')
    .optional(),
});

type NutritionFormData = z.infer<typeof nutritionFormSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

const NutritionForm: React.FC<NutritionFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  title = 'Add Food Item',
  submitText = 'Add Food',
  className,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    reset,
    setValue,
  } = useForm<NutritionFormData>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      name: initialData.name || '',
      quantity: initialData.quantity || 1,
      unit: initialData.unit || 'serving',
      calories: initialData.calories || 0,
      protein: initialData.protein || 0,
      carbs: initialData.carbs || 0,
      fat: initialData.fat || 0,
      fiber: initialData.fiber || 0,
      sugar: initialData.sugar || 0,
      sodium: initialData.sodium || 0,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const totalMacroCalories = (watchedValues.protein * 4) + (watchedValues.carbs * 4) + (watchedValues.fat * 9);
  const calorieDifference = Math.abs(watchedValues.calories - totalMacroCalories);
  const hasCalorieMismatch = calorieDifference > 5; // 5 calorie tolerance

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFormSubmit = async (data: NutritionFormData) => {
    try {
      // Additional validation
      const validation = validateFoodItem(data);
      if (!validation.isValid) {
        setValidationErrors(validation.errors || {});
        return;
      }

      // Sanitize text inputs
      const sanitizedData = {
        ...data,
        name: sanitizeInput(data.name),
        unit: sanitizeInput(data.unit),
      };

      onSubmit(sanitizedData);
      setValidationErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    reset();
    setValidationErrors({});
    onCancel?.();
  };

  const handleQuickFill = (type: 'protein' | 'carbs' | 'fat') => {
    const quickValues = {
      protein: { protein: 25, carbs: 0, fat: 0, calories: 100 },
      carbs: { protein: 0, carbs: 25, fat: 0, calories: 100 },
      fat: { protein: 0, carbs: 0, fat: 11, calories: 100 },
    };

    const values = quickValues[type];
    Object.entries(values).forEach(([key, value]) => {
      setValue(key as keyof NutritionFormData, value);
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn('bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto', className)}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Food Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Food Name *
            </label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="name"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  )}
                  placeholder="Enter food name"
                />
              )}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.name.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Quantity and Unit */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  id="quantity"
                  step="0.1"
                  min="0.1"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  )}
                />
              )}
            />
            <AnimatePresence>
              {errors.quantity && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.quantity.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
              Unit *
            </label>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="unit"
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                    errors.unit ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  <option value="serving">Serving</option>
                  <option value="cup">Cup</option>
                  <option value="tbsp">Tablespoon</option>
                  <option value="tsp">Teaspoon</option>
                  <option value="oz">Ounce</option>
                  <option value="g">Gram</option>
                  <option value="lb">Pound</option>
                  <option value="piece">Piece</option>
                  <option value="slice">Slice</option>
                </select>
              )}
            />
            <AnimatePresence>
              {errors.unit && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.unit.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Macronutrients */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Macronutrients</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleQuickFill('protein')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Protein
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('carbs')}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Carbs
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('fat')}
                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                Fat
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calories */}
            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-2">
                Calories *
              </label>
              <Controller
                name="calories"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="calories"
                    min="0"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                      errors.calories ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                )}
              />
              <AnimatePresence>
                {errors.calories && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.calories.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Protein */}
            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-2">
                Protein (g) *
              </label>
              <Controller
                name="protein"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="protein"
                    min="0"
                    step="0.1"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                      errors.protein ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                )}
              />
              <AnimatePresence>
                {errors.protein && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.protein.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Carbs */}
            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-2">
                Carbs (g) *
              </label>
              <Controller
                name="carbs"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="carbs"
                    min="0"
                    step="0.1"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                      errors.carbs ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                )}
              />
              <AnimatePresence>
                {errors.carbs && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.carbs.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Fat */}
            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-2">
                Fat (g) *
              </label>
              <Controller
                name="fat"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="fat"
                    min="0"
                    step="0.1"
                    className={cn(
                      'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                      errors.fat ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                )}
              />
              <AnimatePresence>
                {errors.fat && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.fat.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Calorie Validation Warning */}
          <AnimatePresence>
            {hasCalorieMismatch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p className="text-yellow-800 text-sm">
                  ⚠️ Calorie mismatch detected. Total from macros: {formatCalories(totalMacroCalories)}, 
                  but calories field shows: {formatCalories(watchedValues.calories)}. 
                  Difference: {formatCalories(calorieDifference)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced Options */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Fiber */}
                <div>
                  <label htmlFor="fiber" className="block text-sm font-medium text-gray-700 mb-2">
                    Fiber (g)
                  </label>
                  <Controller
                    name="fiber"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        id="fiber"
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>

                {/* Sugar */}
                <div>
                  <label htmlFor="sugar" className="block text-sm font-medium text-gray-700 mb-2">
                    Sugar (g)
                  </label>
                  <Controller
                    name="sugar"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        id="sugar"
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>

                {/* Sodium */}
                <div>
                  <label htmlFor="sodium" className="block text-sm font-medium text-gray-700 mb-2">
                    Sodium (mg)
                  </label>
                  <Controller
                    name="sodium"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        id="sodium"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form Status */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <p className="text-blue-800 text-sm">
                You have unsaved changes. Don't forget to save!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Errors */}
        <AnimatePresence>
          {Object.keys(validationErrors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <h4 className="text-red-800 font-medium mb-2">Validation Errors:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>• {field}: {error}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <motion.button
            type="button"
            onClick={handleCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </motion.button>
          
          <motion.button
            type="submit"
            disabled={!isValid || isLoading}
            whileHover={{ scale: isValid ? 1.02 : 1 }}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
              isValid && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              submitText
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default NutritionForm;
