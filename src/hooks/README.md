# Hooks Directory

## 🪝 Overview

This directory contains custom React hooks that encapsulate reusable logic and state management patterns throughout the Diet Game application. Hooks provide a clean way to share stateful logic between components.

## 📁 Contents

### Custom Hooks
- **`useNutriQueries.ts`** - React Query hooks for nutrition data management

## 🎯 Hook Architecture

### Custom Hook Pattern
```typescript
// Standard custom hook structure
import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store';

interface UseHookNameOptions {
  // Hook configuration options
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseHookNameReturn {
  // Hook return values
  data: DataType | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  update: (data: Partial<DataType>) => void;
}

export const useHookName = (options: UseHookNameOptions = {}): UseHookNameReturn => {
  // Hook state
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook logic
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.fetchData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback((newData: Partial<DataType>) => {
    setData(prev => prev ? { ...prev, ...newData } : null);
  }, []);

  // Effects
  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    update
  };
};
```

## 🔧 Hook Categories

### Data Fetching Hooks
```typescript
// React Query integration hooks
export const useNutriQueries = {
  // Nutrition data queries
  useDailyIntake: (date: Date) => {
    return useQuery({
      queryKey: ['dailyIntake', date.toISOString()],
      queryFn: () => nutritionApi.getDailyIntake(date),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000 // 10 minutes
    });
  },

  useFoodLog: (date: Date) => {
    return useQuery({
      queryKey: ['foodLog', date.toISOString()],
      queryFn: () => nutritionApi.getFoodLog(date),
      staleTime: 2 * 60 * 1000 // 2 minutes
    });
  },

  useNutritionGoals: () => {
    return useQuery({
      queryKey: ['nutritionGoals'],
      queryFn: () => nutritionApi.getGoals(),
      staleTime: 30 * 60 * 1000 // 30 minutes
    });
  }
};
```

### State Management Hooks
```typescript
// Store integration hooks
export const useNutritionStore = () => {
  const store = useStore();
  
  return {
    // State
    dailyIntake: store.dailyIntake,
    foodLog: store.foodLog,
    nutritionGoals: store.nutritionGoals,
    loading: store.isLoading,
    error: store.error,
    
    // Actions
    logFood: store.logFood,
    updateFoodEntry: store.updateFoodEntry,
    deleteFoodEntry: store.deleteFoodEntry,
    setNutritionGoals: store.setNutritionGoals,
    syncWithServer: store.syncWithServer
  };
};
```

### UI Interaction Hooks
```typescript
// UI-specific hooks
export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};
```

## 🎯 Hook Responsibilities

### Data Management
- **API Integration** - Encapsulate API calls and data fetching
- **Caching Logic** - Implement intelligent caching strategies
- **Error Handling** - Consistent error handling across components
- **Loading States** - Manage loading and error states

### State Synchronization
- **Store Integration** - Connect components to global state
- **Local State** - Manage component-specific state
- **State Persistence** - Handle localStorage and sessionStorage
- **State Validation** - Validate state changes and data integrity

### User Interactions
- **Form Handling** - Manage form state and validation
- **Event Handling** - Encapsulate complex event logic
- **User Preferences** - Manage user settings and preferences
- **Navigation** - Handle routing and navigation logic

## 🔧 Hook Patterns

### Data Fetching Pattern
```typescript
// Comprehensive data fetching hook
export const useDataFetching = <T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
```

### Form Handling Pattern
```typescript
// Form management hook
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: ValidationSchema<T>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback(() => {
    if (!validationSchema) return true;
    
    const newErrors = validationSchema.validate(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};
```

## 🧪 Testing Strategy

### Hook Testing
```typescript
// Custom hook testing example
import { renderHook, act } from '@testing-library/react';
import { useDataFetching } from '../useDataFetching';

describe('useDataFetching', () => {
  it('should fetch data successfully', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useDataFetching(mockFetch));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({ data: 'test' });
    expect(result.current.error).toBe(null);
  });

  it('should handle errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));
    const { result } = renderHook(() => useDataFetching(mockFetch));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Fetch failed');
  });
});
```

### Testing Tools
- **React Testing Library** - Hook testing utilities
- **Jest** - Unit testing framework
- **MSW** - API mocking for data fetching hooks
- **Custom Test Utils** - Reusable testing helpers

## 📊 Performance Considerations

### Hook Optimization
- **useCallback** - Memoize callback functions
- **useMemo** - Memoize expensive calculations
- **Dependency Arrays** - Optimize effect dependencies
- **Conditional Hooks** - Avoid unnecessary hook calls

### Memory Management
- **Cleanup Functions** - Proper cleanup in useEffect
- **Event Listeners** - Remove event listeners on unmount
- **Subscriptions** - Unsubscribe from observables
- **Timers** - Clear timers and intervals

## 🔒 Security Considerations

### Data Validation
- **Input Sanitization** - Sanitize user inputs
- **Type Validation** - Validate data types and structures
- **Schema Validation** - Use validation schemas for data
- **Error Boundaries** - Handle hook errors gracefully

### Sensitive Data
- **Token Management** - Secure handling of authentication tokens
- **Data Encryption** - Encrypt sensitive data in hooks
- **Access Control** - Implement proper access controls
- **Audit Logging** - Log important hook operations

## 🔗 Related Documentation

- **[`../store/`](../store/)** - State management integration
- **[`../services/`](../services/)** - API service integration
- **[`../types/`](../types/)** - TypeScript type definitions
- **[`../../docs/DEVELOPER_GUIDE.md`](../../docs/DEVELOPER_GUIDE.md)** - Development guidelines

---

*Last updated: $(date)*
