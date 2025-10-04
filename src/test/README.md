# Test Directory

## 🧪 Overview

This directory contains all test files and testing utilities for the Diet Game application. The testing strategy covers unit tests, integration tests, and end-to-end tests to ensure code quality, reliability, and maintainability.

## 📁 Contents

### Test Files
- **`firebase.test.ts`** - Firebase service integration tests
- **`HomePage.test.tsx`** - HomePage component tests
- **`setup.test.ts`** - Test setup and configuration
- **`setup.ts`** - Test utilities and helpers
- **`xp-system.test.ts`** - Experience points system tests

## 🎯 Testing Architecture

### Test Organization
```
src/test/
├── setup.ts              # Test configuration and utilities
├── setup.test.ts         # Test setup validation
├── *.test.ts             # Unit tests for utilities
├── *.test.tsx            # Component tests
└── __mocks__/            # Mock implementations
    ├── firebase.ts       # Firebase mocks
    └── api.ts            # API mocks
```

### Testing Stack
- **Jest** - Testing framework and test runner
- **React Testing Library** - Component testing utilities
- **Vitest** - Fast unit testing (alternative to Jest)
- **MSW (Mock Service Worker)** - API mocking
- **Testing Library User Events** - User interaction simulation

## 🔧 Test Configuration

### Test Setup (`setup.ts`)
```typescript
// Test configuration and utilities
import { configure } from '@testing-library/react';
import { vi } from 'vitest';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Global test utilities
export const testUtils = {
  // Mock user data
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // Mock nutrition data
  createMockFoodEntry: (overrides = {}) => ({
    id: 'test-food-id',
    userId: 'test-user-id',
    foodId: 'food-123',
    quantity: 100,
    unit: 'g',
    mealType: 'breakfast',
    timestamp: new Date(),
    nutrition: {
      calories: 250,
      protein: 10,
      carbohydrates: 30,
      fat: 8,
    },
    ...overrides,
  }),

  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock API responses
  mockApiResponse: <T>(data: T, delay = 0) => 
    new Promise<T>(resolve => setTimeout(() => resolve(data), delay)),
};

// Global mocks
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### Test Setup Validation (`setup.test.ts`)
```typescript
// Validate test setup
import { describe, it, expect } from 'vitest';
import { testUtils } from './setup';

describe('Test Setup', () => {
  it('should create mock user data', () => {
    const user = testUtils.createMockUser();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('name');
  });

  it('should create mock food entry', () => {
    const foodEntry = testUtils.createMockFoodEntry();
    expect(foodEntry).toHaveProperty('id');
    expect(foodEntry).toHaveProperty('nutrition');
    expect(foodEntry.nutrition).toHaveProperty('calories');
  });

  it('should wait for specified time', async () => {
    const start = Date.now();
    await testUtils.waitFor(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(100);
  });
});
```

## 🧩 Component Testing

### Component Test Pattern
```typescript
// Standard component test structure
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentName } from '../components/ComponentName';

// Mock dependencies
vi.mock('../services/api', () => ({
  fetchData: vi.fn(),
}));

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByTestId('component-name')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    
    render(<ComponentName onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should handle async operations', async () => {
    const mockData = { id: '1', name: 'Test' };
    vi.mocked(api.fetchData).mockResolvedValue(mockData);
    
    render(<ComponentName />);
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(api.fetchData).mockRejectedValue(new Error('API Error'));
    
    render(<ComponentName />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    });
  });
});
```

### HomePage Component Test (`HomePage.test.tsx`)
```typescript
// HomePage component tests
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';

// Mock the store
vi.mock('../store/nutriStore', () => ({
  useStore: () => ({
    user: { id: '1', name: 'Test User' },
    dailyIntake: { calories: 2000, protein: 150 },
    isLoading: false,
    error: null,
  }),
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render welcome message', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Welcome, Test User/i)).toBeInTheDocument();
  });

  it('should display daily intake information', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/2000 calories/i)).toBeInTheDocument();
    expect(screen.getByText(/150g protein/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(useStore).mockReturnValue({
      ...useStore(),
      isLoading: true,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should handle navigation to profile', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    const profileButton = screen.getByRole('button', { name: /profile/i });
    await user.click(profileButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});
```

## 🔧 Utility Testing

### XP System Tests (`xp-system.test.ts`)
```typescript
// Experience points system tests
import { describe, it, expect } from 'vitest';
import { XPUtils } from '../utils/xp-system';

describe('XP System', () => {
  describe('calculateXP', () => {
    it('should calculate XP for food logging', () => {
      const action = { type: 'food_log', value: 1 };
      const xp = XPUtils.calculateXP(action, 1);
      expect(xp).toBeGreaterThan(0);
    });

    it('should apply level multiplier', () => {
      const action = { type: 'food_log', value: 1 };
      const lowLevelXP = XPUtils.calculateXP(action, 1);
      const highLevelXP = XPUtils.calculateXP(action, 10);
      
      expect(highLevelXP).toBeGreaterThan(lowLevelXP);
    });

    it('should include bonus XP', () => {
      const action = { type: 'food_log', value: 1, bonus: 50 };
      const xp = XPUtils.calculateXP(action, 1);
      expect(xp).toBeGreaterThan(50);
    });
  });

  describe('calculateLevel', () => {
    it('should calculate correct level from XP', () => {
      expect(XPUtils.calculateLevel(0)).toBe(1);
      expect(XPUtils.calculateLevel(100)).toBe(2);
      expect(XPUtils.calculateLevel(500)).toBe(3);
    });

    it('should cap at maximum level', () => {
      const maxLevelXP = 10000;
      const level = XPUtils.calculateLevel(maxLevelXP);
      expect(level).toBeLessThanOrEqual(XPUtils.config.maxLevel);
    });
  });

  describe('getXPToNextLevel', () => {
    it('should calculate XP needed for next level', () => {
      const xpToNext = XPUtils.getXPToNextLevel(50, 1);
      expect(xpToNext).toBeGreaterThan(0);
    });

    it('should return 0 for max level', () => {
      const xpToNext = XPUtils.getXPToNextLevel(10000, XPUtils.config.maxLevel);
      expect(xpToNext).toBe(0);
    });
  });

  describe('getLevelProgress', () => {
    it('should calculate progress percentage', () => {
      const progress = XPUtils.getLevelProgress(150, 2);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should return 100% for max level', () => {
      const progress = XPUtils.getLevelProgress(10000, XPUtils.config.maxLevel);
      expect(progress).toBe(100);
    });
  });
});
```

## 🔥 Firebase Testing

### Firebase Service Tests (`firebase.test.ts`)
```typescript
// Firebase service tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseService } from '../services/firebase';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

describe('Firebase Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should sign in user with email and password', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser,
      } as any);

      const result = await FirebaseService.signIn('test@example.com', 'password');
      
      expect(result).toEqual(mockUser);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object),
        'test@example.com',
        'password'
      );
    });

    it('should handle sign in errors', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(
        FirebaseService.signIn('invalid@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Firestore Operations', () => {
    it('should save user data', async () => {
      const userData = { name: 'Test User', email: 'test@example.com' };
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await FirebaseService.saveUserData('test-uid', userData);
      
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        'test-uid',
        userData
      );
    });

    it('should fetch user data', async () => {
      const mockData = { name: 'Test User', email: 'test@example.com' };
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockData,
      } as any);

      const result = await FirebaseService.getUserData('test-uid');
      
      expect(result).toEqual(mockData);
    });
  });
});
```

## 🧪 Testing Utilities

### Custom Test Helpers
```typescript
// Custom testing utilities
export const renderWithProviders = (
  ui: React.ReactElement,
  options = {}
) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <QueryClient client={queryClient}>
          {children}
        </QueryClient>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

export const createMockStore = (initialState = {}) => {
  return {
    ...initialState,
    dispatch: vi.fn(),
    getState: vi.fn(() => initialState),
    subscribe: vi.fn(),
  };
};

export const waitForLoadingToFinish = () => {
  return waitFor(() => {
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
};
```

## 📊 Test Coverage

### Coverage Configuration
```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.js',
        '**/index.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### Coverage Goals
- **Statements**: 80% minimum coverage
- **Branches**: 80% minimum coverage
- **Functions**: 80% minimum coverage
- **Lines**: 80% minimum coverage

## 🔗 Related Documentation

- **[`../components/`](../components/)** - Component implementations
- **[`../services/`](../services/)** - Service implementations
- **[`../utils/`](../utils/)** - Utility functions
- **[`../../docs/TESTING_GUIDE.md`](../../docs/TESTING_GUIDE.md)** - Testing guidelines
- **[`../../vitest.config.js`](../../vitest.config.js)** - Test configuration

---

*Last updated: $(date)*
