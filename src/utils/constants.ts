// Application constants for the Diet Game
// Centralized constants for consistent usage across the application

// ============================================================================
// APPLICATION CONSTANTS
// ============================================================================

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'Diet Game',
  version: '1.0.0',
  description: 'Gamified diet and nutrition tracking application',
  author: 'Diet Game Team',
  website: 'https://dietgame.app',
  supportEmail: 'support@dietgame.app',
} as const;

/**
 * Application URLs and endpoints
 */
export const API_ENDPOINTS = {
  base: process.env.VITE_API_BASE_URL || 'https://api.dietgame.app',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  user: {
    profile: '/user/profile',
    progress: '/user/progress',
    preferences: '/user/preferences',
  },
  nutrition: {
    foods: '/nutrition/foods',
    meals: '/nutrition/meals',
    search: '/nutrition/search',
    barcode: '/nutrition/barcode',
  },
  tasks: {
    list: '/tasks',
    create: '/tasks',
    update: '/tasks/:id',
    delete: '/tasks/:id',
    complete: '/tasks/:id/complete',
  },
  gamification: {
    xp: '/gamification/xp',
    achievements: '/gamification/achievements',
    leaderboard: '/gamification/leaderboard',
    rewards: '/gamification/rewards',
  },
  ai: {
    chat: '/ai/chat',
    recommendations: '/ai/recommendations',
    mealPlan: '/ai/meal-plan',
  },
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  auth: {
    token: 'diet_game_auth_token',
    refreshToken: 'diet_game_refresh_token',
    user: 'diet_game_user',
  },
  app: {
    theme: 'diet_game_theme',
    language: 'diet_game_language',
    preferences: 'diet_game_preferences',
    onboarding: 'diet_game_onboarding_complete',
  },
  data: {
    offlineData: 'diet_game_offline_data',
    cache: 'diet_game_cache',
    lastSync: 'diet_game_last_sync',
  },
} as const;

// ============================================================================
// NUTRITION CONSTANTS
// ============================================================================

/**
 * Macronutrient calories per gram
 */
export const MACRO_CALORIES = {
  protein: 4,
  carbs: 4,
  fat: 9,
  alcohol: 7,
  fiber: 0, // Fiber is not absorbed
} as const;

/**
 * Recommended daily values (based on 2000 calorie diet)
 */
export const DAILY_VALUES = {
  calories: 2000,
  protein: 50, // grams
  carbs: 300, // grams
  fat: 65, // grams
  fiber: 25, // grams
  sugar: 50, // grams
  sodium: 2300, // mg
  cholesterol: 300, // mg
  saturatedFat: 20, // grams
  transFat: 0, // grams
  potassium: 3500, // mg
  vitaminA: 900, // mcg
  vitaminC: 90, // mg
  calcium: 1000, // mg
  iron: 18, // mg
} as const;

/**
 * Meal types
 */
export const MEAL_TYPES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Pre-Workout',
  'Post-Workout',
] as const;

/**
 * Diet types
 */
export const DIET_TYPES = [
  'Keto Diet',
  'Mediterranean Diet',
  'Paleo Diet',
  'Vegetarian',
  'Vegan',
  'Low Carb',
  'Intermittent Fasting',
  'Balanced Diet',
] as const;

/**
 * Body types
 */
export const BODY_TYPES = [
  'Ectomorph',
  'Mesomorph',
  'Endomorph',
] as const;

/**
 * Activity levels
 */
export const ACTIVITY_LEVELS = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
  'Extremely Active',
] as const;

/**
 * Goal types
 */
export const GOAL_TYPES = [
  'Weight Loss',
  'Weight Gain',
  'Muscle Building',
  'Maintenance',
  'Athletic Performance',
] as const;

// ============================================================================
// GAMIFICATION CONSTANTS
// ============================================================================

/**
 * XP rewards for different activities
 */
export const XP_REWARDS = {
  MEAL: 15,
  SHOPPING: 20,
  COOKING: 30,
  EXERCISE: 40,
  WATER: 15,
  DAILY_CHECKIN: 20,
  AI_CHAT: 10,
  ACHIEVEMENT: 100,
  LEVEL_UP: 50,
  STREAK_BONUS: 25,
} as const;

/**
 * Star thresholds for achievements
 */
export const STAR_THRESHOLDS = [50, 250, 750, 2000, 5000] as const;

/**
 * Streak multipliers
 */
export const STREAK_MULTIPLIERS = {
  3: 1.2,    // 20% bonus for 3-day streak
  7: 1.5,    // 50% bonus for 7-day streak
  14: 2.0,   // 100% bonus for 14-day streak
  30: 3.0,   // 200% bonus for 30-day streak
} as const;

/**
 * Achievement categories
 */
export const ACHIEVEMENT_CATEGORIES = [
  'Nutrition',
  'Exercise',
  'Consistency',
  'Social',
  'Learning',
  'Special',
] as const;

/**
 * Task priorities
 */
export const TASK_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const;

/**
 * Task types
 */
export const TASK_TYPES = [
  'Meal',
  'Shopping',
  'Cooking',
  'Exercise',
  'Water',
  'Check-in',
  'AI Chat',
] as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Color palette
 */
export const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Animation durations
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
} as const;

/**
 * Z-index values
 */
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Input validation limits
 */
export const VALIDATION_LIMITS = {
  name: {
    min: 2,
    max: 50,
  },
  email: {
    max: 254,
  },
  password: {
    min: 8,
    max: 128,
  },
  phone: {
    min: 10,
    max: 20,
  },
  weight: {
    min: 30, // kg
    max: 300, // kg
  },
  height: {
    min: 100, // cm
    max: 250, // cm
  },
  age: {
    min: 13,
    max: 120,
  },
  text: {
    short: 100,
    medium: 500,
    long: 1000,
  },
} as const;

/**
 * File upload limits
 */
export const FILE_LIMITS = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  document: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'text/plain', 'application/msword'],
  },
} as const;

// ============================================================================
// TIME CONSTANTS
// ============================================================================

/**
 * Time intervals in milliseconds
 */
export const TIME_INTERVALS = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Cache expiration times
 */
export const CACHE_EXPIRATION = {
  short: 5 * TIME_INTERVALS.minute,
  medium: 30 * TIME_INTERVALS.minute,
  long: 24 * TIME_INTERVALS.hour,
  veryLong: 7 * TIME_INTERVALS.day,
} as const;

/**
 * Debounce and throttle delays
 */
export const DELAYS = {
  debounce: {
    search: 300,
    input: 500,
    resize: 250,
  },
  throttle: {
    scroll: 100,
    mousemove: 16,
    resize: 100,
  },
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection and try again.',
  server: 'Server error. Please try again later.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  timeout: 'Request timed out. Please try again.',
  unknown: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  saved: 'Changes saved successfully!',
  created: 'Created successfully!',
  updated: 'Updated successfully!',
  deleted: 'Deleted successfully!',
  completed: 'Task completed!',
  levelUp: 'Congratulations! You leveled up!',
  achievement: 'Achievement unlocked!',
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Feature flags for enabling/disabling features
 */
export const FEATURE_FLAGS = {
  aiCoach: true,
  arRecipes: true,
  socialFeatures: true,
  offlineMode: true,
  pushNotifications: true,
  analytics: true,
  betaFeatures: false,
} as const;

// ============================================================================
// ENVIRONMENT CONSTANTS
// ============================================================================

/**
 * Environment-specific constants
 */
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  apiUrl: process.env.VITE_API_BASE_URL,
  firebaseConfig: {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  },
} as const;
