# Store Directory

## 🗄️ Overview

This directory contains state management modules for the Diet Game application. The store provides centralized state management using Zustand, offering a lightweight and flexible approach to managing application state.

## 📁 Contents

### State Management
- **`nutriStore.ts`** - Main nutrition and user data store

## 🎯 Store Architecture

### Zustand Store Pattern
```typescript
// Standard Zustand store structure
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface StoreState {
  // State properties
  data: DataType[];
  loading: boolean;
  error: string | null;
}

interface StoreActions {
  // Action methods
  fetchData: () => Promise<void>;
  updateData: (data: DataType) => void;
  deleteData: (id: string) => void;
  resetStore: () => void;
}

type Store = StoreState & StoreActions;

export const useStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        data: [],
        loading: false,
        error: null,

        // Actions
        fetchData: async () => {
          set({ loading: true, error: null });
          try {
            const data = await api.fetchData();
            set({ data, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },

        updateData: (newData) => {
          set((state) => ({
            data: state.data.map(item => 
              item.id === newData.id ? newData : item
            )
          }));
        },

        deleteData: (id) => {
          set((state) => ({
            data: state.data.filter(item => item.id !== id)
          }));
        },

        resetStore: () => {
          set({ data: [], loading: false, error: null });
        }
      }),
      {
        name: 'store-name', // localStorage key
        partialize: (state) => ({ data: state.data }) // Persist only specific fields
      }
    ),
    { name: 'StoreName' } // DevTools name
  )
);
```

## 🏪 Store Modules

### Nutrition Store (`nutriStore.ts`)
```typescript
// Nutrition data management
interface NutritionState {
  // User nutrition data
  dailyIntake: DailyIntake;
  foodLog: FoodEntry[];
  nutritionGoals: NutritionGoals;
  
  // UI state
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
}

interface NutritionActions {
  // Data operations
  logFood: (food: FoodEntry) => void;
  updateFoodEntry: (id: string, updates: Partial<FoodEntry>) => void;
  deleteFoodEntry: (id: string) => void;
  
  // Goal management
  setNutritionGoals: (goals: NutritionGoals) => void;
  updateGoal: (goalType: string, value: number) => void;
  
  // Date navigation
  setSelectedDate: (date: Date) => void;
  navigateDate: (direction: 'prev' | 'next') => void;
  
  // Data synchronization
  syncWithServer: () => Promise<void>;
  loadOfflineData: () => void;
}
```

### Store Features
- **Persistent Storage** - Data persists across browser sessions
- **DevTools Integration** - Redux DevTools support for debugging
- **TypeScript Support** - Full type safety for state and actions
- **Middleware Support** - DevTools and persistence middleware

## 🔄 State Management Patterns

### Data Flow
```typescript
// Component usage pattern
const MyComponent = () => {
  const { 
    data, 
    loading, 
    error, 
    fetchData, 
    updateData 
  } = useStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = (newData) => {
    updateData(newData);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <DataDisplay data={data} onUpdate={handleUpdate} />;
};
```

### State Updates
- **Immutable Updates** - State is never mutated directly
- **Optimistic Updates** - UI updates immediately, syncs with server
- **Error Handling** - Graceful error handling with rollback
- **Loading States** - Proper loading state management

## 🎯 Store Responsibilities

### Data Management
- **Centralized State** - Single source of truth for application data
- **State Normalization** - Efficient data structure for complex relationships
- **Cache Management** - Intelligent caching and invalidation
- **Data Synchronization** - Sync with server and handle conflicts

### User Experience
- **Optimistic Updates** - Immediate UI feedback
- **Offline Support** - Work offline with sync on reconnect
- **Error Recovery** - Graceful error handling and recovery
- **Performance** - Efficient re-renders and state updates

## 🔧 Store Configuration

### Middleware Setup
```typescript
// Store configuration with middleware
export const useStore = create<Store>()(
  devtools(
    persist(
      storeImplementation,
      {
        name: 'diet-game-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist essential data
          user: state.user,
          preferences: state.preferences,
          nutritionGoals: state.nutritionGoals
        }),
        version: 1,
        migrate: (persistedState, version) => {
          // Handle state migrations
          if (version === 0) {
            return migrateFromV0(persistedState);
          }
          return persistedState;
        }
      }
    ),
    {
      name: 'DietGameStore',
      trace: true // Enable action tracing
    }
  )
);
```

### Store Modules
- **User Store** - User authentication and profile data
- **Nutrition Store** - Food logging and nutrition tracking
- **Gamification Store** - XP, achievements, and progress
- **UI Store** - Application UI state and preferences

## 🧪 Testing Strategy

### Store Testing
```typescript
// Store testing example
import { renderHook, act } from '@testing-library/react';
import { useStore } from '../nutriStore';

describe('Nutrition Store', () => {
  beforeEach(() => {
    // Reset store state
    useStore.getState().resetStore();
  });

  it('should log food entry', () => {
    const { result } = renderHook(() => useStore());
    
    act(() => {
      result.current.logFood({
        id: '1',
        name: 'Apple',
        calories: 95,
        timestamp: new Date()
      });
    });

    expect(result.current.foodLog).toHaveLength(1);
    expect(result.current.foodLog[0].name).toBe('Apple');
  });

  it('should handle loading states', async () => {
    const { result } = renderHook(() => useStore());
    
    act(() => {
      result.current.syncWithServer();
    });

    expect(result.current.isLoading).toBe(true);
    
    // Wait for async operation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.isLoading).toBe(false);
  });
});
```

### Testing Approaches
- **Unit Tests** - Individual store actions and state changes
- **Integration Tests** - Store interactions with components
- **Mock Services** - Test store with mocked API responses
- **State Persistence** - Test localStorage integration

## 📊 Performance Optimization

### Store Optimization
- **Selective Subscriptions** - Components only re-render when needed
- **State Slicing** - Access only required state properties
- **Memoization** - Prevent unnecessary computations
- **Batch Updates** - Group multiple state updates

### Memory Management
- **State Cleanup** - Remove unused data from store
- **Garbage Collection** - Proper cleanup of event listeners
- **Memory Monitoring** - Track store memory usage
- **State Size Limits** - Prevent excessive state growth

## 🔒 Security Considerations

### Data Protection
- **Sensitive Data** - Don't persist sensitive information
- **Data Encryption** - Encrypt sensitive data in localStorage
- **Input Validation** - Validate all data before storing
- **XSS Prevention** - Sanitize user input

### Access Control
- **State Isolation** - Separate user data by authentication
- **Permission Checks** - Verify user permissions for actions
- **Audit Logging** - Log important state changes
- **Session Management** - Clear state on logout

## 🔗 Related Documentation

- **[`../hooks/`](../hooks/)** - Custom hooks for store integration
- **[`../types/`](../types/)** - TypeScript type definitions
- **[`../services/`](../services/)** - API services for data fetching
- **[`../../docs/architecture/data-flow.md`](../../docs/architecture/data-flow.md)** - Data flow architecture

---

*Last updated: $(date)*
