# Utils Directory

## 🛠️ Overview

This directory contains utility functions and helper modules that provide common functionality used throughout the Diet Game application. These utilities promote code reuse, maintainability, and consistency across the codebase.

## 📁 Contents

### Utility Modules
- **`xp-system.ts`** - Experience points calculation and gamification utilities

## 🎯 Utility Architecture

### Utility Function Pattern
```typescript
// Standard utility function structure
/**
 * Brief description of what the function does
 * @param param1 - Description of parameter 1
 * @param param2 - Description of parameter 2
 * @returns Description of return value
 * @example
 * const result = utilityFunction('example', 123);
 * console.log(result); // Expected output
 */
export const utilityFunction = (param1: string, param2: number): ReturnType => {
  // Input validation
  if (!param1 || param2 < 0) {
    throw new Error('Invalid parameters');
  }

  // Function logic
  const result = performCalculation(param1, param2);
  
  // Return processed result
  return result;
};

// Helper function (private to module)
const performCalculation = (input: string, multiplier: number): number => {
  return input.length * multiplier;
};
```

### Utility Categories
- **Data Processing** - Data transformation and manipulation
- **Validation** - Input validation and sanitization
- **Formatting** - Data formatting and display utilities
- **Calculations** - Mathematical and business logic calculations
- **Date/Time** - Date and time manipulation utilities
- **String Operations** - String manipulation and processing

## 🔧 Core Utility Modules

### Experience Points System (`xp-system.ts`)
```typescript
// XP calculation and gamification utilities
export interface XPConfig {
  baseXP: number;
  multiplier: number;
  levelThresholds: number[];
  maxLevel: number;
}

export interface XPAction {
  type: 'food_log' | 'goal_complete' | 'streak' | 'social' | 'achievement';
  value: number;
  bonus?: number;
}

export const XPUtils = {
  // Calculate XP for an action
  calculateXP: (action: XPAction, userLevel: number): number => {
    const baseXP = getBaseXPForAction(action.type);
    const levelMultiplier = getLevelMultiplier(userLevel);
    const bonusXP = action.bonus || 0;
    
    return Math.floor((baseXP + bonusXP) * levelMultiplier);
  },

  // Calculate level from total XP
  calculateLevel: (totalXP: number): number => {
    let level = 1;
    let xpNeeded = 0;
    
    for (let i = 0; i < config.levelThresholds.length; i++) {
      xpNeeded += config.levelThresholds[i];
      if (totalXP >= xpNeeded) {
        level = i + 2;
      } else {
        break;
      }
    }
    
    return Math.min(level, config.maxLevel);
  },

  // Calculate XP needed for next level
  getXPToNextLevel: (currentXP: number, currentLevel: number): number => {
    const nextLevelThreshold = getXPThresholdForLevel(currentLevel + 1);
    return Math.max(0, nextLevelThreshold - currentXP);
  },

  // Calculate progress percentage to next level
  getLevelProgress: (currentXP: number, currentLevel: number): number => {
    const currentThreshold = getXPThresholdForLevel(currentLevel);
    const nextThreshold = getXPThresholdForLevel(currentLevel + 1);
    const progressXP = currentXP - currentThreshold;
    const totalXPNeeded = nextThreshold - currentThreshold;
    
    return Math.min(100, (progressXP / totalXPNeeded) * 100);
  }
};
```

### Data Processing Utilities
```typescript
// Data transformation utilities
export const DataUtils = {
  // Deep clone an object
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => DataUtils.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const clonedObj = {} as any;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = DataUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  // Merge objects deeply
  deepMerge: <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = DataUtils.deepMerge(result[key] || {}, source[key] as any);
        } else {
          result[key] = source[key] as any;
        }
      }
    }
    
    return result;
  },

  // Group array by key
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Remove duplicates from array
  unique: <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }
};
```

### Validation Utilities
```typescript
// Input validation utilities
export const ValidationUtils = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password strength validation
  isStrongPassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Phone number validation
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  // URL validation
  isValidURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};
```

### Formatting Utilities
```typescript
// Data formatting utilities
export const FormatUtils = {
  // Format currency
  formatCurrency: (amount: number, currency = 'USD', locale = 'en-US'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  },

  // Format date
  formatDate: (date: Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (format === 'relative') {
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    }

    const options: Intl.DateTimeFormatOptions = {
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    }[format];

    return new Intl.DateTimeFormat('en-US', options).format(date);
  },

  // Format number with units
  formatNumber: (num: number, decimals = 0, unit = ''): string => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
    
    return unit ? `${formatted} ${unit}` : formatted;
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
};
```

### Date/Time Utilities
```typescript
// Date and time utilities
export const DateTimeUtils = {
  // Get start of day
  startOfDay: (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Get end of day
  endOfDay: (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Add days to date
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Get days between dates
  daysBetween: (date1: Date, date2: Date): number => {
    const diffInMs = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  },

  // Check if date is today
  isToday: (date: Date): boolean => {
    const today = new Date();
    return DateTimeUtils.startOfDay(date).getTime() === DateTimeUtils.startOfDay(today).getTime();
  },

  // Check if date is in current week
  isThisWeek: (date: Date): boolean => {
    const today = new Date();
    const startOfWeek = DateTimeUtils.startOfWeek(today);
    const endOfWeek = DateTimeUtils.endOfWeek(today);
    return date >= startOfWeek && date <= endOfWeek;
  }
};
```

## 🧪 Testing Utilities

### Test Helpers
```typescript
// Testing utility functions
export const TestUtils = {
  // Create mock data
  createMockUser: (overrides: Partial<User> = {}): User => ({
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Mock API response
  mockApiResponse: <T>(data: T, delay = 0): Promise<T> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(data), delay);
    });
  },

  // Generate random data
  generateRandomString: (length = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};
```

## 📊 Performance Utilities

### Optimization Helpers
```typescript
// Performance optimization utilities
export const PerformanceUtils = {
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Measure function execution time
  measureTime: async <T>(func: () => Promise<T>): Promise<{ result: T; time: number }> => {
    const start = performance.now();
    const result = await func();
    const time = performance.now() - start;
    return { result, time };
  }
};
```

## 🔗 Related Documentation

- **[`../types/`](../types/)** - TypeScript type definitions
- **[`../services/`](../services/)** - Service layer integration
- **[`../store/`](../store/)** - State management utilities
- **[`../../docs/DEVELOPER_GUIDE.md`](../../docs/DEVELOPER_GUIDE.md)** - Development guidelines

---

*Last updated: $(date)*
