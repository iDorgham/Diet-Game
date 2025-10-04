// Calculation utilities for the Diet Game application
// Comprehensive calculation functions for nutrition, fitness, and progress tracking

// ============================================================================
// NUTRITION CALCULATIONS
// ============================================================================

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @param age - Age in years
 * @param gender - 'male' or 'female'
 * @returns BMR in calories per day
 */
export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity level multiplier
 * @returns TDEE in calories per day
 */
export function calculateTDEE(bmr: number, activityLevel: number): number {
  return Math.round(bmr * activityLevel);
}

/**
 * Activity level multipliers
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,        // Little to no exercise
  lightlyActive: 1.375,  // Light exercise 1-3 days/week
  moderatelyActive: 1.55, // Moderate exercise 3-5 days/week
  veryActive: 1.725,     // Heavy exercise 6-7 days/week
  extremelyActive: 1.9   // Very heavy exercise, physical job
} as const;

/**
 * Calculates macronutrient distribution based on diet type
 * @param totalCalories - Total daily calories
 * @param dietType - Type of diet
 * @returns Object with protein, carbs, and fat calories and grams
 */
export function calculateMacronutrients(totalCalories: number, dietType: string): {
  protein: { calories: number; grams: number };
  carbs: { calories: number; grams: number };
  fat: { calories: number; grams: number };
} {
  const proteinCaloriesPerGram = 4;
  const carbCaloriesPerGram = 4;
  const fatCaloriesPerGram = 9;

  let proteinPercent: number;
  let carbPercent: number;
  let fatPercent: number;

  switch (dietType.toLowerCase()) {
    case 'keto diet':
      proteinPercent = 0.20;
      carbPercent = 0.05;
      fatPercent = 0.75;
      break;
    case 'low carb':
      proteinPercent = 0.30;
      carbPercent = 0.20;
      fatPercent = 0.50;
      break;
    case 'paleo diet':
      proteinPercent = 0.30;
      carbPercent = 0.30;
      fatPercent = 0.40;
      break;
    case 'mediterranean diet':
      proteinPercent = 0.20;
      carbPercent = 0.50;
      fatPercent = 0.30;
      break;
    case 'vegetarian':
    case 'vegan':
      proteinPercent = 0.25;
      carbPercent = 0.50;
      fatPercent = 0.25;
      break;
    case 'intermittent fasting':
      proteinPercent = 0.25;
      carbPercent = 0.45;
      fatPercent = 0.30;
      break;
    default: // Balanced Diet
      proteinPercent = 0.25;
      carbPercent = 0.45;
      fatPercent = 0.30;
  }

  const proteinCalories = Math.round(totalCalories * proteinPercent);
  const carbCalories = Math.round(totalCalories * carbPercent);
  const fatCalories = Math.round(totalCalories * fatPercent);

  return {
    protein: {
      calories: proteinCalories,
      grams: Math.round(proteinCalories / proteinCaloriesPerGram)
    },
    carbs: {
      calories: carbCalories,
      grams: Math.round(carbCalories / carbCaloriesPerGram)
    },
    fat: {
      calories: fatCalories,
      grams: Math.round(fatCalories / fatCaloriesPerGram)
    }
  };
}

/**
 * Calculates Body Mass Index (BMI)
 * @param weight - Weight in kg
 * @param height - Height in meters
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
  return Math.round((weight / (height * height)) * 10) / 10;
}

/**
 * Gets BMI category
 * @param bmi - BMI value
 * @returns BMI category string
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculates ideal weight range based on height and BMI range
 * @param height - Height in meters
 * @param minBMI - Minimum BMI (default 18.5)
 * @param maxBMI - Maximum BMI (default 24.9)
 * @returns Object with min and max ideal weights in kg
 */
export function calculateIdealWeightRange(height: number, minBMI: number = 18.5, maxBMI: number = 24.9): {
  min: number;
  max: number;
} {
  return {
    min: Math.round(minBMI * height * height * 10) / 10,
    max: Math.round(maxBMI * height * height * 10) / 10
  };
}

// ============================================================================
// WEIGHT CONVERSION UTILITIES
// ============================================================================

/**
 * Converts weight from pounds to kilograms
 * @param pounds - Weight in pounds
 * @returns Weight in kilograms
 */
export function poundsToKg(pounds: number): number {
  return Math.round(pounds * 0.453592 * 10) / 10;
}

/**
 * Converts weight from kilograms to pounds
 * @param kg - Weight in kilograms
 * @returns Weight in pounds
 */
export function kgToPounds(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/**
 * Converts height from feet and inches to centimeters
 * @param feet - Height in feet
 * @param inches - Additional inches
 * @returns Height in centimeters
 */
export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

/**
 * Converts height from centimeters to feet and inches
 * @param cm - Height in centimeters
 * @returns Object with feet and inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / 2.54);
  return {
    feet: Math.floor(totalInches / 12),
    inches: totalInches % 12
  };
}

// ============================================================================
// PROGRESS CALCULATIONS
// ============================================================================

/**
 * Calculates weight loss progress
 * @param startWeight - Starting weight in kg
 * @param currentWeight - Current weight in kg
 * @param targetWeight - Target weight in kg
 * @returns Progress object with percentage and remaining weight
 */
export function calculateWeightProgress(startWeight: number, currentWeight: number, targetWeight: number): {
  totalProgress: number; // Percentage of total journey completed
  remainingWeight: number; // Weight remaining to lose/gain
  weightChange: number; // Total weight changed
  isOnTrack: boolean; // Whether progress is on track
} {
  const weightChange = currentWeight - startWeight;
  const totalJourney = Math.abs(targetWeight - startWeight);
  const remainingWeight = Math.abs(targetWeight - currentWeight);
  
  const totalProgress = totalJourney > 0 ? Math.min(100, Math.max(0, (Math.abs(weightChange) / totalJourney) * 100)) : 0;
  
  // Consider on track if within 10% of expected progress
  const expectedProgress = totalJourney > 0 ? (Math.abs(weightChange) / totalJourney) * 100 : 0;
  const isOnTrack = Math.abs(totalProgress - expectedProgress) <= 10;
  
  return {
    totalProgress: Math.round(totalProgress * 10) / 10,
    remainingWeight: Math.round(remainingWeight * 10) / 10,
    weightChange: Math.round(weightChange * 10) / 10,
    isOnTrack
  };
}

/**
 * Calculates weekly weight loss rate
 * @param startWeight - Starting weight in kg
 * @param currentWeight - Current weight in kg
 * @param daysElapsed - Number of days since start
 * @returns Weekly weight loss rate in kg/week
 */
export function calculateWeeklyWeightLossRate(startWeight: number, currentWeight: number, daysElapsed: number): number {
  if (daysElapsed <= 0) return 0;
  
  const weightChange = startWeight - currentWeight; // Positive for weight loss
  const weeklyRate = (weightChange / daysElapsed) * 7;
  
  return Math.round(weeklyRate * 100) / 100;
}

/**
 * Calculates recommended weekly weight loss rate
 * @param currentWeight - Current weight in kg
 * @param targetWeight - Target weight in kg
 * @returns Recommended weekly rate in kg/week
 */
export function getRecommendedWeeklyWeightLossRate(currentWeight: number, targetWeight: number): number {
  const weightToLose = currentWeight - targetWeight;
  
  if (weightToLose <= 0) return 0;
  
  // Recommended rate: 0.5-1 kg per week (1-2 lbs per week)
  const recommendedRate = Math.min(1.0, Math.max(0.5, weightToLose * 0.02));
  
  return Math.round(recommendedRate * 100) / 100;
}

// ============================================================================
// CALORIE DEFICIT CALCULATIONS
// ============================================================================

/**
 * Calculates daily calorie deficit needed for target weight loss
 * @param targetWeeklyLoss - Target weekly weight loss in kg
 * @returns Daily calorie deficit needed
 */
export function calculateCalorieDeficit(targetWeeklyLoss: number): number {
  // 1 kg of fat = approximately 7700 calories
  const caloriesPerKg = 7700;
  const dailyDeficit = (targetWeeklyLoss * caloriesPerKg) / 7;
  
  return Math.round(dailyDeficit);
}

/**
 * Calculates calories needed for maintenance
 * @param weight - Current weight in kg
 * @param height - Height in cm
 * @param age - Age in years
 * @param gender - 'male' or 'female'
 * @param activityLevel - Activity level multiplier
 * @returns Daily calories for maintenance
 */
export function calculateMaintenanceCalories(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: number
): number {
  const bmr = calculateBMR(weight, height, age, gender);
  return calculateTDEE(bmr, activityLevel);
}

/**
 * Calculates target calories for weight loss
 * @param maintenanceCalories - Daily maintenance calories
 * @param targetWeeklyLoss - Target weekly weight loss in kg
 * @returns Target daily calories for weight loss
 */
export function calculateWeightLossCalories(maintenanceCalories: number, targetWeeklyLoss: number): number {
  const deficit = calculateCalorieDeficit(targetWeeklyLoss);
  return Math.max(1200, maintenanceCalories - deficit); // Minimum 1200 calories
}

// ============================================================================
// NUTRITION TRACKING CALCULATIONS
// ============================================================================

/**
 * Calculates daily nutrition totals
 * @param meals - Array of meal objects with nutrition data
 * @returns Total nutrition for the day
 */
export function calculateDailyNutrition(meals: Array<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}>): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
} {
  return meals.reduce((totals, meal) => ({
    calories: totals.calories + meal.calories,
    protein: totals.protein + meal.protein,
    carbs: totals.carbs + meal.carbs,
    fat: totals.fat + meal.fat,
    fiber: totals.fiber + (meal.fiber || 0),
    sugar: totals.sugar + (meal.sugar || 0),
    sodium: totals.sodium + (meal.sodium || 0)
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  });
}

/**
 * Calculates nutrition progress percentage
 * @param consumed - Amount consumed
 * @param target - Target amount
 * @returns Progress percentage (0-100)
 */
export function calculateNutritionProgress(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((consumed / target) * 100)));
}

/**
 * Calculates remaining nutrition needed
 * @param consumed - Amount consumed
 * @param target - Target amount
 * @returns Remaining amount needed
 */
export function calculateRemainingNutrition(consumed: number, target: number): number {
  return Math.max(0, target - consumed);
}

// ============================================================================
// WATER INTAKE CALCULATIONS
// ============================================================================

/**
 * Calculates recommended daily water intake
 * @param weight - Weight in kg
 * @param activityLevel - Activity level (1-5)
 * @param climate - Climate factor (1.0 for normal, 1.2 for hot/humid)
 * @returns Recommended water intake in liters
 */
export function calculateWaterIntake(weight: number, activityLevel: number = 1, climate: number = 1.0): number {
  // Base calculation: 35ml per kg of body weight
  let baseIntake = (weight * 35) / 1000; // Convert to liters
  
  // Adjust for activity level
  const activityMultiplier = 1 + ((activityLevel - 1) * 0.1);
  baseIntake *= activityMultiplier;
  
  // Adjust for climate
  baseIntake *= climate;
  
  return Math.round(baseIntake * 10) / 10;
}

/**
 * Calculates water intake progress
 * @param consumed - Water consumed in liters
 * @param target - Target water intake in liters
 * @returns Progress percentage
 */
export function calculateWaterProgress(consumed: number, target: number): number {
  return calculateNutritionProgress(consumed, target);
}

// ============================================================================
// EXERCISE CALCULATIONS
// ============================================================================

/**
 * Calculates calories burned during exercise
 * @param weight - Weight in kg
 * @param duration - Duration in minutes
 * @param metValue - MET (Metabolic Equivalent) value for the activity
 * @returns Calories burned
 */
export function calculateCaloriesBurned(weight: number, duration: number, metValue: number): number {
  // Formula: Calories = MET × weight(kg) × time(hours)
  const timeInHours = duration / 60;
  return Math.round(metValue * weight * timeInHours);
}

/**
 * Common MET values for different activities
 */
export const MET_VALUES = {
  walking: 3.5,
  running: 8.0,
  cycling: 6.0,
  swimming: 7.0,
  weightlifting: 5.0,
  yoga: 2.5,
  dancing: 4.5,
  hiking: 6.0,
  basketball: 6.5,
  tennis: 7.0,
  soccer: 7.0,
  volleyball: 3.0,
  golf: 4.0,
  skiing: 7.0,
  rockClimbing: 8.0
} as const;

/**
 * Calculates exercise intensity level
 * @param heartRate - Current heart rate
 * @param age - Age in years
 * @returns Intensity level (1-5)
 */
export function calculateExerciseIntensity(heartRate: number, age: number): number {
  const maxHeartRate = 220 - age;
  const intensityPercentage = (heartRate / maxHeartRate) * 100;
  
  if (intensityPercentage < 50) return 1; // Very light
  if (intensityPercentage < 60) return 2; // Light
  if (intensityPercentage < 70) return 3; // Moderate
  if (intensityPercentage < 85) return 4; // Vigorous
  return 5; // Maximum
}

// ============================================================================
// TIME AND DATE CALCULATIONS
// ============================================================================

/**
 * Calculates days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days
 */
export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * Calculates time until target date
 * @param targetDate - Target date
 * @returns Object with days, hours, minutes remaining
 */
export function calculateTimeUntil(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  total: number; // Total minutes
} {
  const now = new Date();
  const timeDiff = targetDate.getTime() - now.getTime();
  
  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, total: 0 };
  }
  
  const totalMinutes = Math.floor(timeDiff / (1000 * 60));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  
  return { days, hours, minutes, total: totalMinutes };
}

/**
 * Calculates streak length
 * @param dates - Array of dates when activity was completed
 * @returns Current streak length in days
 */
export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const date of sortedDates) {
    const activityDate = new Date(date);
    activityDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate = activityDate;
    } else if (daysDiff === streak + 1) {
      // Allow for one day gap
      streak++;
      currentDate = activityDate;
    } else {
      break;
    }
  }
  
  return streak;
}

// ============================================================================
// PERCENTAGE AND RATIO CALCULATIONS
// ============================================================================

/**
 * Calculates percentage change
 * @param oldValue - Original value
 * @param newValue - New value
 * @returns Percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100 * 10) / 10;
}

/**
 * Calculates ratio between two values
 * @param value1 - First value
 * @param value2 - Second value
 * @returns Ratio (value1:value2)
 */
export function calculateRatio(value1: number, value2: number): { ratio: number; simplified: string } {
  if (value2 === 0) return { ratio: 0, simplified: '0:0' };
  
  const ratio = value1 / value2;
  
  // Find greatest common divisor for simplified ratio
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(Math.round(value1), Math.round(value2));
  
  const simplified = `${Math.round(value1 / divisor)}:${Math.round(value2 / divisor)}`;
  
  return { ratio: Math.round(ratio * 100) / 100, simplified };
}

/**
 * Calculates average of an array of numbers
 * @param numbers - Array of numbers
 * @returns Average value
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return Math.round((sum / numbers.length) * 100) / 100;
}

/**
 * Calculates median of an array of numbers
 * @param numbers - Array of numbers
 * @returns Median value
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
}

/**
 * Calculates standard deviation
 * @param numbers - Array of numbers
 * @returns Standard deviation
 */
export function calculateStandardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const mean = calculateAverage(numbers);
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  const avgSquaredDiff = calculateAverage(squaredDiffs);
  
  return Math.round(Math.sqrt(avgSquaredDiff) * 100) / 100;
}
