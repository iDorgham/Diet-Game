// Advanced form component following Level 303 requirements
// React Hook Form with Zod validation and real-time updates

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpdateUserProfile } from '../../hooks/useNutriQueries';
import { UserProfile } from '../../types';

// Zod validation schema
const userProfileSchema = z.object({
  userName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  dietType: z.enum([
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
  }),
  
  bodyType: z.enum([
    'Ectomorph',
    'Mesomorph',
    'Endomorph'
  ], {
    errorMap: () => ({ message: 'Please select a valid body type' })
  }),
  
  weight: z.string()
    .regex(/^\d+(\.\d+)?\s*(lbs?|kg)$/i, 'Weight must be in format "175 lbs" or "80 kg"')
    .refine((val) => {
      const num = parseFloat(val);
      const unit = val.toLowerCase().includes('kg') ? 'kg' : 'lbs';
      if (unit === 'kg') {
        return num >= 30 && num <= 300; // 30-300 kg
      } else {
        return num >= 66 && num <= 660; // 66-660 lbs
      }
    }, 'Weight must be within reasonable range'),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  initialData: UserProfile;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const dietTypes = [
  'Keto Diet',
  'Mediterranean Diet',
  'Paleo Diet',
  'Vegetarian',
  'Vegan',
  'Low Carb',
  'Intermittent Fasting',
  'Balanced Diet'
];

const bodyTypes = [
  'Ectomorph',
  'Mesomorph',
  'Endomorph'
];

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialData,
  userId,
  onSuccess,
  onCancel
}) => {
  const updateProfileMutation = useUpdateUserProfile(userId);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid, isSubmitting },
    watch,
    reset
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      userName: initialData.userName,
      dietType: initialData.dietType as any,
      bodyType: initialData.bodyType as any,
      weight: initialData.weight,
    },
    mode: 'onChange',
  });
  
  const watchedValues = watch();
  
  const onSubmit = async (data: UserProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  const handleCancel = () => {
    reset();
    onCancel?.();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-indigo-800 mb-6">Update Profile</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User Name */}
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                id="userName"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.userName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
            )}
          />
          <AnimatePresence>
            {errors.userName && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.userName.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Diet Type */}
        <div>
          <label htmlFor="dietType" className="block text-sm font-medium text-gray-700 mb-2">
            Diet Type
          </label>
          <Controller
            name="dietType"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                id="dietType"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.dietType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a diet type</option>
                {dietTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          />
          <AnimatePresence>
            {errors.dietType && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.dietType.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Body Type */}
        <div>
          <label htmlFor="bodyType" className="block text-sm font-medium text-gray-700 mb-2">
            Body Type
          </label>
          <Controller
            name="bodyType"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                id="bodyType"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.bodyType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select your body type</option>
                {bodyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          />
          <AnimatePresence>
            {errors.bodyType && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.bodyType.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Weight */}
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
            Weight
          </label>
          <Controller
            name="weight"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                id="weight"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.weight ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 175 lbs or 80 kg"
              />
            )}
          />
          <AnimatePresence>
            {errors.weight && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm mt-1"
              >
                {errors.weight.message}
              </motion.p>
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
            disabled={!isValid || isSubmitting || updateProfileMutation.isPending}
            whileHover={{ scale: isValid ? 1.02 : 1 }}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isValid && !isSubmitting && !updateProfileMutation.isPending
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting || updateProfileMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </div>
        
        {/* Error Display */}
        <AnimatePresence>
          {updateProfileMutation.isError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-red-800 text-sm">
                Failed to update profile. Please try again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Success Display */}
        <AnimatePresence>
          {updateProfileMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <p className="text-green-800 text-sm">
                ✅ Profile updated successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default UserProfileForm;
