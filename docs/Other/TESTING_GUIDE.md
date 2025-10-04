# Diet Game - Testing Guide

## Overview

This guide provides comprehensive testing strategies and implementation for the Diet Game application, covering unit tests, integration tests, end-to-end tests, and performance testing.

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Setup](#test-setup)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [Component Testing](#component-testing)
6. [End-to-End Testing](#end-to-end-testing)
7. [Performance Testing](#performance-testing)
8. [Test Data Management](#test-data-management)
9. [CI/CD Testing](#cicd-testing)
10. [Best Practices](#best-practices)

## Testing Strategy

### Testing Pyramid
```
    /\
   /  \     E2E Tests (5%)
  /____\    
 /      \   Integration Tests (15%)
/________\  
            Unit Tests (80%)
```

### Test Categories

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: Component interactions and API calls
3. **Component Tests**: React component behavior
4. **E2E Tests**: Complete user workflows
5. **Performance Tests**: Load and stress testing

## Test Setup

### 1. Dependencies
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^14.3.1",
    "@testing-library/user-event": "^14.6.1",
    "@testing-library/react-hooks": "^8.0.1",
    "vitest": "^1.6.1",
    "jsdom": "^23.2.0",
    "msw": "^2.0.0",
    "cypress": "^13.0.0",
    "@cypress/react": "^7.0.0"
  }
}
```

### 2. Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### 3. Test Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => new Date())
}));
```

## Unit Testing

### 1. XP System Tests
```typescript
// src/test/xp-system.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateXPReward, calculateLevelInfo, checkLevelUp } from '@/utils/xp-system';

describe('XP System', () => {
  describe('calculateXPReward', () => {
    it('should calculate base XP correctly', () => {
      const task = { xpReward: 100, difficulty: 'medium' };
      const userLevel = 1;
      const streak = 0;
      
      const reward = calculateXPReward(task, userLevel, streak);
      
      expect(reward.baseXP).toBe(100);
      expect(reward.totalXP).toBe(100);
    });

    it('should apply level multiplier', () => {
      const task = { xpReward: 100, difficulty: 'medium' };
      const userLevel = 5;
      const streak = 0;
      
      const reward = calculateXPReward(task, userLevel, streak);
      
      expect(reward.multiplier).toBe(1.5);
      expect(reward.totalXP).toBe(150);
    });

    it('should apply streak bonus', () => {
      const task = { xpReward: 100, difficulty: 'medium' };
      const userLevel = 1;
      const streak = 10;
      
      const reward = calculateXPReward(task, userLevel, streak);
      
      expect(reward.bonusXP).toBe(20);
      expect(reward.totalXP).toBe(120);
    });
  });

  describe('calculateLevelInfo', () => {
    it('should calculate level 1 correctly', () => {
      const levelInfo = calculateLevelInfo(500);
      
      expect(levelInfo.currentLevel).toBe(1);
      expect(levelInfo.currentXP).toBe(500);
      expect(levelInfo.xpToNextLevel).toBe(500);
      expect(levelInfo.progressPercentage).toBe(50);
    });

    it('should calculate level 2 correctly', () => {
      const levelInfo = calculateLevelInfo(1500);
      
      expect(levelInfo.currentLevel).toBe(2);
      expect(levelInfo.currentXP).toBe(500);
      expect(levelInfo.xpToNextLevel).toBe(500);
      expect(levelInfo.progressPercentage).toBe(50);
    });
  });

  describe('checkLevelUp', () => {
    it('should detect level up', () => {
      const oldLevel = 1;
      const newXP = 1200;
      
      const result = checkLevelUp(oldLevel, newXP);
      
      expect(result.hasLeveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
    });

    it('should not detect level up when staying same level', () => {
      const oldLevel = 1;
      const newXP = 800;
      
      const result = checkLevelUp(oldLevel, newXP);
      
      expect(result.hasLeveledUp).toBe(false);
      expect(result.newLevel).toBe(1);
    });
  });
});
```

### 2. Utility Function Tests
```typescript
// src/test/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, calculateStreak, validateEmail } from '@/utils/helpers';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      
      expect(formatted).toBe('Jan 15, 2024');
    });
  });

  describe('calculateStreak', () => {
    it('should calculate streak correctly', () => {
      const dates = [
        new Date('2024-01-15'),
        new Date('2024-01-14'),
        new Date('2024-01-13')
      ];
      
      const streak = calculateStreak(dates);
      
      expect(streak).toBe(3);
    });

    it('should handle broken streak', () => {
      const dates = [
        new Date('2024-01-15'),
        new Date('2024-01-13'), // Missing 14th
        new Date('2024-01-12')
      ];
      
      const streak = calculateStreak(dates);
      
      expect(streak).toBe(1);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
});
```

## Integration Testing

### 1. API Integration Tests
```typescript
// src/test/api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { server } from './mocks/server';
import { rest } from 'msw';
import { generateMealPlan, analyzeNutrition } from '@/services/api';

describe('API Integration', () => {
  describe('generateMealPlan', () => {
    it('should generate meal plan successfully', async () => {
      const request = {
        userProfile: {
          dietType: 'vegetarian',
          preferences: ['healthy'],
          goals: ['weight_loss']
        },
        dietaryRestrictions: [],
        budget: 'medium',
        timeAvailable: 30
      };

      const response = await generateMealPlan(request);

      expect(response.meals).toHaveLength(3);
      expect(response.shoppingList).toBeDefined();
      expect(response.nutritionalSummary).toBeDefined();
    });

    it('should handle API errors', async () => {
      server.use(
        rest.post('/api/ai/meal-plan', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }));
        })
      );

      const request = {
        userProfile: { dietType: 'vegetarian' },
        dietaryRestrictions: [],
        budget: 'medium',
        timeAvailable: 30
      };

      await expect(generateMealPlan(request)).rejects.toThrow('Server error');
    });
  });

  describe('analyzeNutrition', () => {
    it('should analyze nutrition correctly', async () => {
      const request = {
        foodItems: [
          { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 }
        ],
        userProfile: { dietType: 'balanced' },
        targetMacros: { protein: 150, carbs: 200, fat: 65 }
      };

      const response = await analyzeNutrition(request);

      expect(response.analysis).toBeDefined();
      expect(response.recommendations).toBeInstanceOf(Array);
      expect(response.score).toBeGreaterThanOrEqual(0);
      expect(response.score).toBeLessThanOrEqual(100);
    });
  });
});
```

### 2. Firebase Integration Tests
```typescript
// src/test/firebase.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  createUserProfile, 
  getUserProgress, 
  completeTask,
  updateUserProgress 
} from '@/services/firebase';

// Mock Firebase functions
const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockUpdateDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: mockSetDoc,
  getDoc: mockGetDoc,
  updateDoc: mockUpdateDoc,
  serverTimestamp: vi.fn(() => new Date())
}));

describe('Firebase Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserProfile', () => {
    it('should create user profile successfully', async () => {
      const profile = {
        userName: 'Test User',
        dietType: 'vegetarian',
        bodyType: 'mesomorph',
        weight: '70kg',
        goals: ['weight_loss']
      };

      mockSetDoc.mockResolvedValue(undefined);

      await createUserProfile(profile);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userName: 'Test User',
          dietType: 'vegetarian'
        })
      );
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress', async () => {
      const mockProgress = {
        score: 1000,
        coins: 50,
        level: 2,
        currentXP: 500
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockProgress
      });

      const progress = await getUserProgress();

      expect(progress).toEqual(mockProgress);
    });

    it('should initialize progress for new user', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false
      });

      mockSetDoc.mockResolvedValue(undefined);

      const progress = await getUserProgress();

      expect(progress).toEqual({
        score: 0,
        coins: 100,
        level: 1,
        currentXP: 0,
        recipesUnlocked: 0,
        hasClaimedGift: false
      });
    });
  });

  describe('completeTask', () => {
    it('should complete task and update progress', async () => {
      const taskId = 'task-1';
      const mockTask = {
        id: taskId,
        name: 'Eat Breakfast',
        xpReward: 100,
        coinReward: 10
      };

      mockGetDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockTask
        })
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({
            score: 0,
            coins: 100,
            level: 1,
            currentXP: 0
          })
        });

      mockUpdateDoc.mockResolvedValue(undefined);

      const reward = await completeTask(taskId);

      expect(reward.totalXP).toBe(100);
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });
});
```

## Component Testing

### 1. HomePage Component Test
```typescript
// src/test/HomePage.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '@/pages/HomePage';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

describe('HomePage', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    user = userEvent.setup();
  });

  it('should render homepage with all sections', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Daily Tasks')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('should display user progress correctly', async () => {
    // Mock user progress data
    vi.mocked(getUserProgress).mockResolvedValue({
      score: 1500,
      coins: 75,
      level: 2,
      currentXP: 500
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('500 XP')).toBeInTheDocument();
      expect(screen.getByText('75 Coins')).toBeInTheDocument();
    });
  });

  it('should complete task when clicked', async () => {
    const mockCompleteTask = vi.fn().mockResolvedValue({
      totalXP: 100,
      baseXP: 100,
      multiplier: 1,
      bonusXP: 0
    });

    vi.mocked(completeTask).mockImplementation(mockCompleteTask);

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    );

    const taskButton = screen.getByText('Eat Breakfast');
    await user.click(taskButton);

    await waitFor(() => {
      expect(mockCompleteTask).toHaveBeenCalledWith('task-1');
    });
  });

  it('should show level up notification', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({
      score: 2000,
      coins: 100,
      level: 3,
      currentXP: 0
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Level Up!')).toBeInTheDocument();
      expect(screen.getByText('Congratulations! You reached Level 3!')).toBeInTheDocument();
    });
  });
});
```

### 2. TaskManager Component Test
```typescript
// src/test/TaskManager.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskManager from '@/components/tasks/TaskManager';

describe('TaskManager', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('should render task list', async () => {
    const mockTasks = [
      {
        id: '1',
        name: 'Eat Breakfast',
        type: 'meal',
        completed: false,
        xpReward: 100
      },
      {
        id: '2',
        name: 'Drink Water',
        type: 'meal',
        completed: true,
        xpReward: 50
      }
    ];

    vi.mocked(getAvailableTasks).mockResolvedValue(mockTasks);

    render(<TaskManager />);

    await waitFor(() => {
      expect(screen.getByText('Eat Breakfast')).toBeInTheDocument();
      expect(screen.getByText('Drink Water')).toBeInTheDocument();
    });
  });

  it('should filter tasks by type', async () => {
    const mockTasks = [
      { id: '1', name: 'Eat Breakfast', type: 'meal', completed: false, xpReward: 100 },
      { id: '2', name: 'Go Shopping', type: 'shopping', completed: false, xpReward: 150 }
    ];

    vi.mocked(getAvailableTasks).mockResolvedValue(mockTasks);

    render(<TaskManager />);

    const filterButton = screen.getByText('Meal');
    await user.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText('Eat Breakfast')).toBeInTheDocument();
      expect(screen.queryByText('Go Shopping')).not.toBeInTheDocument();
    });
  });

  it('should show task completion animation', async () => {
    const mockTasks = [
      { id: '1', name: 'Eat Breakfast', type: 'meal', completed: false, xpReward: 100 }
    ];

    vi.mocked(getAvailableTasks).mockResolvedValue(mockTasks);
    vi.mocked(completeTask).mockResolvedValue({
      totalXP: 100,
      baseXP: 100,
      multiplier: 1,
      bonusXP: 0
    });

    render(<TaskManager />);

    const taskButton = screen.getByText('Eat Breakfast');
    await user.click(taskButton);

    await waitFor(() => {
      expect(screen.getByText('+100 XP')).toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

### 1. Cypress Configuration
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000
  }
});
```

### 2. E2E Test Examples
```typescript
// cypress/e2e/user-journey.cy.ts
describe('User Journey', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete full user onboarding', () => {
    // Start onboarding
    cy.get('[data-testid="start-onboarding"]').click();
    
    // Fill profile form
    cy.get('[data-testid="user-name"]').type('Test User');
    cy.get('[data-testid="diet-type"]').select('vegetarian');
    cy.get('[data-testid="body-type"]').select('mesomorph');
    cy.get('[data-testid="weight"]').type('70');
    cy.get('[data-testid="submit-profile"]').click();
    
    // Complete first task
    cy.get('[data-testid="task-eat-breakfast"]').click();
    cy.get('[data-testid="xp-notification"]').should('be.visible');
    
    // Check progress update
    cy.get('[data-testid="current-level"]').should('contain', 'Level 1');
    cy.get('[data-testid="current-xp"]').should('contain', '100 XP');
  });

  it('should navigate between pages', () => {
    // Navigate to tasks page
    cy.get('[data-testid="nav-tasks"]').click();
    cy.url().should('include', '/tasks');
    
    // Navigate to rewards page
    cy.get('[data-testid="nav-rewards"]').click();
    cy.url().should('include', '/rewards');
    
    // Navigate back to home
    cy.get('[data-testid="nav-home"]').click();
    cy.url().should('include', '/');
  });

  it('should complete multiple tasks and level up', () => {
    // Complete first task
    cy.get('[data-testid="task-eat-breakfast"]').click();
    cy.get('[data-testid="xp-notification"]').should('be.visible');
    
    // Complete second task
    cy.get('[data-testid="task-drink-water"]').click();
    cy.get('[data-testid="xp-notification"]').should('be.visible');
    
    // Check for level up notification
    cy.get('[data-testid="level-up-notification"]').should('be.visible');
    cy.get('[data-testid="current-level"]').should('contain', 'Level 2');
  });
});
```

### 3. AI Coach E2E Test
```typescript
// cypress/e2e/ai-coach.cy.ts
describe('AI Coach', () => {
  beforeEach(() => {
    cy.visit('/coach');
  });

  it('should send message to AI coach', () => {
    const message = 'What should I eat for breakfast?';
    
    cy.get('[data-testid="chat-input"]').type(message);
    cy.get('[data-testid="send-button"]').click();
    
    // Check message appears in chat
    cy.get('[data-testid="chat-messages"]').should('contain', message);
    
    // Wait for AI response
    cy.get('[data-testid="ai-response"]', { timeout: 10000 }).should('be.visible');
    
    // Check XP reward
    cy.get('[data-testid="xp-notification"]').should('contain', '+10 XP');
  });

  it('should handle AI coach errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', '/api/ai/chat', { statusCode: 500 }).as('aiError');
    
    cy.get('[data-testid="chat-input"]').type('Test message');
    cy.get('[data-testid="send-button"]').click();
    
    cy.wait('@aiError');
    cy.get('[data-testid="error-message"]').should('be.visible');
  });
});
```

## Performance Testing

### 1. Load Testing
```typescript
// src/test/performance.test.ts
import { describe, it, expect } from 'vitest';
import { measurePerformance } from '@/utils/performance';

describe('Performance Tests', () => {
  it('should load homepage within 2 seconds', async () => {
    const startTime = performance.now();
    
    // Simulate homepage load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(2000);
  });

  it('should handle large task lists efficiently', async () => {
    const largeTaskList = Array.from({ length: 1000 }, (_, i) => ({
      id: `task-${i}`,
      name: `Task ${i}`,
      completed: false,
      xpReward: 100
    }));

    const startTime = performance.now();
    
    // Process large task list
    const processedTasks = largeTaskList.map(task => ({
      ...task,
      processed: true
    }));
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    expect(processingTime).toBeLessThan(100);
    expect(processedTasks).toHaveLength(1000);
  });
});
```

### 2. Memory Leak Testing
```typescript
// src/test/memory.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Memory Leak Tests', () => {
  let initialMemory: number;

  beforeEach(() => {
    initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  });

  afterEach(() => {
    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc();
    }
  });

  it('should not leak memory when creating and destroying components', () => {
    const components = [];
    
    // Create many components
    for (let i = 0; i < 100; i++) {
      components.push({ id: i, data: new Array(1000).fill('data') });
    }
    
    // Clear components
    components.length = 0;
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be minimal
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
  });
});
```

## Test Data Management

### 1. Mock Data Factory
```typescript
// src/test/factories.ts
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-123',
  userName: 'Test User',
  dietType: 'vegetarian',
  bodyType: 'mesomorph',
  weight: '70kg',
  goals: ['weight_loss'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockTask = (overrides = {}) => ({
  id: 'task-1',
  name: 'Eat Breakfast',
  description: 'Start your day with a healthy breakfast',
  type: 'meal',
  difficulty: 'easy',
  xpReward: 100,
  coinReward: 10,
  requirements: [],
  isActive: true,
  createdAt: new Date(),
  ...overrides
});

export const createMockProgress = (overrides = {}) => ({
  score: 1000,
  coins: 50,
  level: 2,
  currentXP: 500,
  recipesUnlocked: 0,
  hasClaimedGift: false,
  ...overrides
});
```

### 2. Test Database Setup
```typescript
// src/test/database.ts
import { initializeTestApp, clearFirestoreData } from '@firebase/rules-unit-testing';

export const setupTestDatabase = async () => {
  const testApp = initializeTestApp({
    projectId: 'test-project',
    auth: { uid: 'test-user' }
  });

  return testApp;
};

export const cleanupTestDatabase = async () => {
  await clearFirestoreData({ projectId: 'test-project' });
};
```

## CI/CD Testing

### 1. GitHub Actions Test Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run preview &
      - run: npx cypress run
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

### 2. Test Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### 2. Mocking Strategy
- Mock external dependencies
- Use MSW for API mocking
- Mock Firebase services
- Avoid mocking implementation details

### 3. Test Data
- Use factories for consistent test data
- Clean up test data after each test
- Use realistic test scenarios
- Test edge cases and error conditions

### 4. Performance Considerations
- Run tests in parallel when possible
- Use efficient selectors
- Avoid unnecessary waits
- Monitor test execution time

### 5. Maintenance
- Update tests when features change
- Remove obsolete tests
- Keep test coverage above 80%
- Review and refactor tests regularly

---

*This testing guide is part of the Diet Game SDD documentation and should be updated as the testing strategy evolves.*
