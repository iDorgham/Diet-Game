# API Testing Guide

## Overview

This guide provides comprehensive testing strategies, tools, and examples for the Diet Game API. It covers unit testing, integration testing, performance testing, and security testing approaches.

## Testing Strategy

### Testing Pyramid
```
    /\
   /  \     E2E Tests (10%)
  /____\    
 /      \   Integration Tests (20%)
/________\  
/          \ Unit Tests (70%)
/____________\
```

### Test Categories
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API endpoint and service integration testing
- **End-to-End Tests**: Complete user workflow testing
- **Performance Tests**: Load, stress, and scalability testing
- **Security Tests**: Authentication, authorization, and vulnerability testing

## Unit Testing

### JavaScript/TypeScript Testing

#### Setup with Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### API Client Testing
```javascript
// tests/api-client.test.js
import { APIClient } from '../src/api-client';
import { mockFetch } from './mocks/fetch';

describe('APIClient', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new APIClient({
      baseUrl: 'https://api.dietgame.com/v1',
      apiKey: 'test-api-key'
    });
    global.fetch = mockFetch;
  });

  describe('authentication', () => {
    test('should login successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: 'user_123', email: 'test@example.com' },
          tokens: { accessToken: 'mock-token' }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await apiClient.auth.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.dietgame.com/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    test('should handle login errors', async () => {
      const mockError = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(mockError)
      });

      await expect(apiClient.auth.login({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow('Invalid email or password');
    });
  });

  describe('nutrition tracking', () => {
    test('should log meal successfully', async () => {
      const mockMeal = {
        id: 'meal_123',
        date: '2024-01-15',
        mealType: 'lunch',
        totalCalories: 450
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockMeal })
      });

      const result = await apiClient.nutrition.logMeal({
        date: '2024-01-15',
        mealType: 'lunch',
        foods: [{ foodId: 'food_123', quantity: 150, unit: 'g' }]
      });

      expect(result).toEqual(mockMeal);
    });
  });
});
```

#### Mock Setup
```javascript
// tests/mocks/fetch.js
export const mockFetch = jest.fn();

export const createMockResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data))
});

// tests/setup.js
import { mockFetch } from './mocks/fetch';

// Mock fetch globally
global.fetch = mockFetch;

// Reset mocks before each test
beforeEach(() => {
  mockFetch.mockClear();
});
```

### Python Testing

#### Setup with pytest
```python
# conftest.py
import pytest
import requests_mock
from dietgame import DietGameAPI

@pytest.fixture
def api_client():
    return DietGameAPI(
        base_url='https://api.dietgame.com/v1',
        api_key='test-api-key'
    )

@pytest.fixture
def mock_requests():
    with requests_mock.Mocker() as m:
        yield m
```

#### API Client Testing
```python
# test_api_client.py
import pytest
from dietgame import DietGameAPI

class TestAPIClient:
    def test_login_success(self, api_client, mock_requests):
        # Mock successful login response
        mock_requests.post(
            'https://api.dietgame.com/v1/auth/login',
            json={
                'success': True,
                'data': {
                    'user': {'id': 'user_123', 'email': 'test@example.com'},
                    'tokens': {'accessToken': 'mock-token'}
                }
            }
        )

        result = api_client.auth.login(
            email='test@example.com',
            password='password123'
        )

        assert result['user']['id'] == 'user_123'
        assert result['tokens']['accessToken'] == 'mock-token'

    def test_login_invalid_credentials(self, api_client, mock_requests):
        # Mock error response
        mock_requests.post(
            'https://api.dietgame.com/v1/auth/login',
            status_code=401,
            json={
                'success': False,
                'error': {
                    'code': 'INVALID_CREDENTIALS',
                    'message': 'Invalid email or password'
                }
            }
        )

        with pytest.raises(Exception) as exc_info:
            api_client.auth.login(
                email='wrong@example.com',
                password='wrongpassword'
            )

        assert 'Invalid email or password' in str(exc_info.value)
```

## Integration Testing

### API Endpoint Testing

#### Complete Workflow Test
```javascript
// tests/integration/user-workflow.test.js
describe('User Workflow Integration', () => {
  let apiClient;
  let userToken;

  beforeAll(async () => {
    apiClient = new APIClient({
      baseUrl: process.env.API_BASE_URL || 'https://staging-api.dietgame.com/v1'
    });
  });

  test('complete user onboarding workflow', async () => {
    // 1. Register new user
    const registrationData = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      username: `testuser${Date.now()}`,
      displayName: 'Test User',
      dateOfBirth: '1990-01-01',
      gender: 'other',
      height: 170,
      weight: 70,
      activityLevel: 'moderate',
      dietaryRestrictions: ['vegetarian'],
      healthGoals: ['weight_loss']
    };

    const registration = await apiClient.auth.register(registrationData);
    expect(registration.user.email).toBe(registrationData.email);
    userToken = registration.tokens.accessToken;

    // 2. Update user profile
    apiClient.setAuthToken(userToken);
    const profileUpdate = await apiClient.users.updateProfile({
      bio: 'Test bio for integration testing',
      timezone: 'UTC'
    });
    expect(profileUpdate.bio).toBe('Test bio for integration testing');

    // 3. Set nutrition goals
    const goals = await apiClient.nutrition.setGoals({
      goalType: 'weight_loss',
      targetCalories: 1800,
      targetProtein: 120,
      targetCarbohydrates: 180,
      targetFat: 60
    });
    expect(goals.targetCalories).toBe(1800);

    // 4. Log a meal
    const meal = await apiClient.nutrition.logMeal({
      date: new Date().toISOString().split('T')[0],
      mealType: 'lunch',
      foods: [
        {
          foodId: 'food_123',
          quantity: 150,
          unit: 'g'
        }
      ],
      notes: 'Integration test meal'
    });
    expect(meal.mealType).toBe('lunch');

    // 5. Get daily summary
    const summary = await apiClient.nutrition.getDailySummary(
      new Date().toISOString().split('T')[0]
    );
    expect(summary.totals.calories).toBeGreaterThan(0);

    // 6. Get AI recommendations
    const recommendations = await apiClient.aiCoach.getRecommendations({
      type: 'meal_suggestions',
      context: {
        timeOfDay: 'dinner',
        dietaryRestrictions: ['vegetarian']
      }
    });
    expect(recommendations.recommendations.length).toBeGreaterThan(0);
  });
});
```

### Database Integration Testing
```javascript
// tests/integration/database.test.js
describe('Database Integration', () => {
  let db;

  beforeAll(async () => {
    db = await connectToTestDatabase();
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.clearTestData();
  });

  test('user profile CRUD operations', async () => {
    // Create user
    const user = await db.users.create({
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: 'hashedpassword'
    });

    // Read user
    const retrievedUser = await db.users.findById(user.id);
    expect(retrievedUser.email).toBe('test@example.com');

    // Update user
    await db.users.update(user.id, { username: 'updateduser' });
    const updatedUser = await db.users.findById(user.id);
    expect(updatedUser.username).toBe('updateduser');

    // Delete user
    await db.users.delete(user.id);
    const deletedUser = await db.users.findById(user.id);
    expect(deletedUser).toBeNull();
  });
});
```

## Performance Testing

### Load Testing with Artillery

#### Artillery Configuration
```yaml
# artillery-config.yml
config:
  target: 'https://api.dietgame.com/v1'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Authorization: 'Bearer {{ $processEnvironment.API_TOKEN }}'

scenarios:
  - name: "User Authentication Flow"
    weight: 30
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "{{ $processEnvironment.TEST_EMAIL }}"
            password: "{{ $processEnvironment.TEST_PASSWORD }}"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "accessToken"
      - get:
          url: "/users/profile"
          headers:
            Authorization: "Bearer {{ accessToken }}"

  - name: "Nutrition Tracking Flow"
    weight: 40
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "{{ $processEnvironment.TEST_EMAIL }}"
            password: "{{ $processEnvironment.TEST_PASSWORD }}"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "accessToken"
      - get:
          url: "/nutrition/foods/search"
          qs:
            query: "chicken"
            limit: 10
          headers:
            Authorization: "Bearer {{ accessToken }}"
      - post:
          url: "/nutrition/meals"
          json:
            date: "2024-01-15"
            mealType: "lunch"
            foods:
              - foodId: "food_123"
                quantity: 150
                unit: "g"
          headers:
            Authorization: "Bearer {{ accessToken }}"

  - name: "AI Coach Flow"
    weight: 30
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "{{ $processEnvironment.TEST_EMAIL }}"
            password: "{{ $processEnvironment.TEST_PASSWORD }}"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "accessToken"
      - post:
          url: "/ai-coach/recommendations"
          json:
            type: "meal_suggestions"
            context:
              timeOfDay: "lunch"
              dietaryRestrictions: ["vegetarian"]
          headers:
            Authorization: "Bearer {{ accessToken }}"
```

#### Running Load Tests
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run artillery-config.yml

# Run with custom environment variables
API_TOKEN=your-token TEST_EMAIL=test@example.com TEST_PASSWORD=password artillery run artillery-config.yml
```

### Stress Testing
```yaml
# stress-test.yml
config:
  target: 'https://api.dietgame.com/v1'
  phases:
    - duration: 300
      arrivalRate: 200
  defaults:
    headers:
      Authorization: 'Bearer {{ $processEnvironment.API_TOKEN }}'

scenarios:
  - name: "High Load Test"
    flow:
      - loop:
          - get:
              url: "/users/profile"
          - get:
              url: "/nutrition/daily-summary"
              qs:
                date: "2024-01-15"
          - post:
              url: "/ai-coach/recommendations"
              json:
                type: "meal_suggestions"
        count: 10
```

## Security Testing

### Authentication Testing
```javascript
// tests/security/authentication.test.js
describe('Authentication Security', () => {
  test('should reject requests without authentication', async () => {
    const response = await fetch('/api/v1/users/profile');
    expect(response.status).toBe(401);
  });

  test('should reject invalid JWT tokens', async () => {
    const response = await fetch('/api/v1/users/profile', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    expect(response.status).toBe(401);
  });

  test('should reject expired tokens', async () => {
    const expiredToken = generateExpiredJWT();
    const response = await fetch('/api/v1/users/profile', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    expect(response.status).toBe(401);
  });

  test('should handle token refresh correctly', async () => {
    const { accessToken, refreshToken } = await login();
    
    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTokens = await refreshAccessToken(refreshToken);
    expect(newTokens.accessToken).toBeDefined();
    expect(newTokens.accessToken).not.toBe(accessToken);
  });
});
```

### Input Validation Testing
```javascript
// tests/security/validation.test.js
describe('Input Validation Security', () => {
  test('should reject SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await fetch('/api/v1/nutrition/foods/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validToken}`
      },
      body: JSON.stringify({
        query: maliciousInput
      })
    });
    
    expect(response.status).toBe(400);
  });

  test('should reject XSS attempts', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await fetch('/api/v1/social/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validToken}`
      },
      body: JSON.stringify({
        content: xssPayload
      })
    });
    
    expect(response.status).toBe(400);
  });

  test('should validate file upload types', async () => {
    const maliciousFile = new Blob(['malicious content'], { type: 'application/x-executable' });
    
    const formData = new FormData();
    formData.append('image', maliciousFile);
    
    const response = await fetch('/api/v1/nutrition/foods/recognize-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${validToken}`
      },
      body: formData
    });
    
    expect(response.status).toBe(400);
  });
});
```

## End-to-End Testing

### Playwright E2E Tests
```javascript
// tests/e2e/user-journey.spec.js
import { test, expect } from '@playwright/test';

test.describe('User Journey E2E', () => {
  test('complete user onboarding and meal logging', async ({ page }) => {
    // Navigate to app
    await page.goto('https://app.dietgame.com');

    // Register new user
    await page.click('[data-testid="register-button"]');
    await page.fill('[data-testid="email-input"]', `test-${Date.now()}@example.com`);
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.fill('[data-testid="username-input"]', `testuser${Date.now()}`);
    await page.click('[data-testid="register-submit"]');

    // Wait for dashboard
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

    // Set nutrition goals
    await page.click('[data-testid="goals-button"]');
    await page.fill('[data-testid="calories-input"]', '1800');
    await page.fill('[data-testid="protein-input"]', '120');
    await page.click('[data-testid="save-goals"]');

    // Log a meal
    await page.click('[data-testid="log-meal-button"]');
    await page.fill('[data-testid="food-search"]', 'chicken breast');
    await page.click('[data-testid="search-result-0"]');
    await page.fill('[data-testid="quantity-input"]', '150');
    await page.selectOption('[data-testid="unit-select"]', 'g');
    await page.click('[data-testid="add-food"]');
    await page.click('[data-testid="save-meal"]');

    // Verify meal was logged
    await expect(page.locator('[data-testid="meal-logged"]')).toBeVisible();

    // Check daily summary
    await page.click('[data-testid="daily-summary"]');
    await expect(page.locator('[data-testid="calories-consumed"]')).toContainText('248');
  });
});
```

## Test Data Management

### Test Data Factory
```javascript
// tests/factories/user-factory.js
export class UserFactory {
  static create(overrides = {}) {
    return {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      username: `testuser${Date.now()}`,
      displayName: 'Test User',
      dateOfBirth: '1990-01-01',
      gender: 'other',
      height: 170,
      weight: 70,
      activityLevel: 'moderate',
      dietaryRestrictions: ['vegetarian'],
      healthGoals: ['weight_loss'],
      ...overrides
    };
  }

  static createWithMeals(mealCount = 3) {
    const user = this.create();
    const meals = Array.from({ length: mealCount }, (_, i) => ({
      id: `meal_${i}`,
      date: new Date().toISOString().split('T')[0],
      mealType: ['breakfast', 'lunch', 'dinner'][i],
      foods: [
        {
          foodId: `food_${i}`,
          name: `Test Food ${i}`,
          quantity: 100,
          unit: 'g',
          calories: 200
        }
      ]
    }));

    return { user, meals };
  }
}
```

### Database Seeding
```javascript
// tests/seeders/database-seeder.js
export class DatabaseSeeder {
  static async seedTestData() {
    const users = await this.createTestUsers(10);
    const foods = await this.createTestFoods(100);
    const meals = await this.createTestMeals(users, foods, 50);
    
    return { users, foods, meals };
  }

  static async createTestUsers(count) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await db.users.create(UserFactory.create({
        username: `testuser${i}`,
        email: `test${i}@example.com`
      }));
      users.push(user);
    }
    return users;
  }

  static async createTestFoods(count) {
    const foods = [];
    for (let i = 0; i < count; i++) {
      const food = await db.foods.create({
        name: `Test Food ${i}`,
        calories: 100 + (i * 10),
        protein: 10 + i,
        carbohydrates: 20 + i,
        fat: 5 + i
      });
      foods.push(food);
    }
    return foods;
  }
}
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/api-tests.yml
name: API Tests

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
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration
      - run: npm run test:e2e

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g artillery
      - run: artillery run tests/performance/load-test.yml
        env:
          API_TOKEN: ${{ secrets.TEST_API_TOKEN }}
          TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm audit
      - run: npm run test:security
```

## Test Reporting

### Coverage Reports
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Test Results Dashboard
```javascript
// tests/reporters/custom-reporter.js
class CustomReporter {
  onRunComplete(contexts, results) {
    const summary = {
      totalTests: results.numTotalTests,
      passedTests: results.numPassedTests,
      failedTests: results.numFailedTests,
      coverage: results.coverageMap
    };

    // Send to test dashboard
    this.sendToDashboard(summary);
  }

  sendToDashboard(summary) {
    // Implementation to send results to dashboard
  }
}

module.exports = CustomReporter;
```

## Best Practices

### Test Organization
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and service interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test under load and stress conditions
- **Security Tests**: Test authentication, authorization, and input validation

### Test Data Management
- **Isolation**: Each test should be independent
- **Cleanup**: Clean up test data after each test
- **Factories**: Use factories for consistent test data creation
- **Fixtures**: Use fixtures for complex test data setup

### Test Maintenance
- **Regular Updates**: Keep tests updated with API changes
- **Refactoring**: Refactor tests when code changes
- **Documentation**: Document test scenarios and expected behavior
- **Monitoring**: Monitor test execution time and flakiness

---

*This testing guide is regularly updated. For the latest testing practices and tools, visit [api.dietgame.com/testing](https://api.dietgame.com/testing).*
