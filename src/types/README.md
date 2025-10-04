# Types Directory

## 📝 Overview

This directory contains TypeScript type definitions and interfaces for the Diet Game application. These types provide compile-time type safety and serve as documentation for the application's data structures and API contracts.

## 📁 Contents

### Type Definitions
- **`index.ts`** - Main type definitions and exports

## 🎯 Type Architecture

### Type Organization
```typescript
// Standard type definition structure
// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Domain-specific types
export interface User extends BaseEntity {
  email: string;
  name: string;
  profile: UserProfile;
  preferences: UserPreferences;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

// Component prop types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}
```

### Type Categories
- **Entity Types** - Core business objects and data models
- **API Types** - Request/response interfaces for API communication
- **Component Types** - Props and state interfaces for React components
- **Utility Types** - Helper types and type transformations

## 🏗️ Core Type Definitions

### User & Authentication
```typescript
// User-related types
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  profile: UserProfile;
  preferences: UserPreferences;
  subscription: Subscription;
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: ActivityLevel;
  dietaryRestrictions: DietaryRestriction[];
  healthGoals: HealthGoal[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  units: 'metric' | 'imperial';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type DietaryRestriction = 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'keto' | 'paleo';
export type HealthGoal = 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance' | 'performance';
```

### Nutrition & Food
```typescript
// Nutrition-related types
export interface FoodEntry extends BaseEntity {
  userId: string;
  foodId: string;
  food: Food;
  quantity: number;
  unit: FoodUnit;
  mealType: MealType;
  timestamp: Date;
  nutrition: NutritionInfo;
}

export interface Food extends BaseEntity {
  name: string;
  brand?: string;
  barcode?: string;
  category: FoodCategory;
  nutrition: NutritionInfo;
  servingSize: number;
  servingUnit: FoodUnit;
  verified: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number; // in grams
  carbohydrates: number; // in grams
  fat: number; // in grams
  fiber: number; // in grams
  sugar: number; // in grams
  sodium: number; // in mg
  cholesterol: number; // in mg
  vitamins: VitaminInfo;
  minerals: MineralInfo;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type FoodUnit = 'g' | 'kg' | 'ml' | 'l' | 'cup' | 'tbsp' | 'tsp' | 'piece' | 'slice';
export type FoodCategory = 'fruits' | 'vegetables' | 'grains' | 'protein' | 'dairy' | 'fats' | 'beverages' | 'snacks';
```

### Gamification
```typescript
// Gamification types
export interface UserProgress extends BaseEntity {
  userId: string;
  level: number;
  experience: number;
  achievements: Achievement[];
  quests: Quest[];
  stats: UserStats;
}

export interface Achievement extends BaseEntity {
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirements: AchievementRequirement[];
  reward: Reward;
  unlockedAt?: Date;
}

export interface Quest extends BaseEntity {
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  requirements: QuestRequirement[];
  rewards: Reward[];
  deadline?: Date;
  completedAt?: Date;
  progress: QuestProgress;
}

export interface Reward {
  type: RewardType;
  value: number;
  item?: string;
  description: string;
}

export type AchievementCategory = 'nutrition' | 'fitness' | 'social' | 'streak' | 'milestone';
export type QuestType = 'daily' | 'weekly' | 'monthly' | 'special' | 'user_created';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type RewardType = 'xp' | 'badge' | 'unlock' | 'discount' | 'premium';
```

### API & Communication
```typescript
// API-related types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  total: number;
  page: number;
  limit: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalItems: number;
}

// Request types
export interface CreateFoodEntryRequest {
  foodId: string;
  quantity: number;
  unit: FoodUnit;
  mealType: MealType;
  timestamp: Date;
}

export interface UpdateUserProfileRequest {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  activityLevel?: ActivityLevel;
  dietaryRestrictions?: DietaryRestriction[];
  healthGoals?: HealthGoal[];
}
```

### Component Types
```typescript
// React component types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}
```

## 🔧 Utility Types

### Type Helpers
```typescript
// Utility type definitions
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API utility types
export type ApiEndpoint = string;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type RequestParams = Record<string, any>;
export type ResponseData<T> = T extends ApiResponse<infer U> ? U : never;

// Form utility types
export type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
  required: boolean;
};

export type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
} & {
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
};

// Store utility types
export type StoreState<T> = T;
export type StoreAction<T> = (state: T) => T | Promise<T>;
export type StoreSelector<T, R> = (state: T) => R;
```

### Validation Types
```typescript
// Validation-related types
export interface ValidationRule<T> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface ValidationSchema<T> {
  [K in keyof T]?: ValidationRule<T[K]>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Form validation
export type Validator<T> = (value: T) => string | null;
export type AsyncValidator<T> = (value: T) => Promise<string | null>;
```

## 🧪 Testing Types

### Test Utilities
```typescript
// Testing-related types
export interface MockData<T> {
  valid: T;
  invalid: Partial<T>;
  edgeCases: T[];
}

export interface TestScenario<T> {
  name: string;
  input: T;
  expected: any;
  description?: string;
}

// Component testing
export interface ComponentTestProps<T> {
  defaultProps: T;
  testCases: TestScenario<T>[];
  mockData?: MockData<T>;
}
```

## 📊 Performance Types

### Optimization Types
```typescript
// Performance-related types
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export interface CacheConfig {
  ttl: number; // time to live in milliseconds
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'ttl';
}

export interface LazyLoadConfig {
  threshold: number;
  rootMargin: string;
  triggerOnce: boolean;
}
```

## 🔒 Security Types

### Security Definitions
```typescript
// Security-related types
export interface SecurityConfig {
  encryptionKey: string;
  tokenExpiry: number;
  maxLoginAttempts: number;
  sessionTimeout: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, any>;
}

export type Permission = 'read' | 'write' | 'delete' | 'admin';
export type Role = 'user' | 'premium' | 'admin' | 'moderator';
```

## 🔗 Related Documentation

- **[`../services/`](../services/)** - API service implementations
- **[`../store/`](../store/)** - State management types
- **[`../components/`](../components/)** - Component prop types
- **[`../../docs/API_DOCUMENTATION.md`](../../docs/API_DOCUMENTATION.md)** - API documentation

---

*Last updated: $(date)*
