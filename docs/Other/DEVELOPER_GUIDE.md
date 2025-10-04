# Diet Game - Developer Guide

## Overview

This guide provides comprehensive information for developers working on the Diet Game application, including architecture, coding standards, development workflow, and best practices. This guide consolidates information from the project's file structure, usage instructions, and development patterns.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Environment](#development-environment)
4. [Coding Standards](#coding-standards)
5. [Component Development](#component-development)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Testing Guidelines](#testing-guidelines)
9. [Performance Optimization](#performance-optimization)
10. [File Organization](#file-organization)
11. [Debugging](#debugging)
12. [Contributing](#contributing)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Firebase account
- Cursor IDE (recommended)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd diet-game

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase configuration

# Start development server
npm run dev
```

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── animations/     # Animation components
│   ├── forms/         # Form components
│   └── tasks/         # Task-related components
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # External service integrations
├── store/             # State management
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── test/              # Test files
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with oceanic theme
- **State Management**: Zustand + React Query
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI Services**: Grok AI API
- **Testing**: Vitest, Testing Library, Cypress
- **Deployment**: Vercel/Netlify

### Design Patterns
- **Component Composition**: Build complex UIs from simple components
- **Custom Hooks**: Encapsulate logic and state
- **Service Layer**: Abstract external API calls
- **Error Boundaries**: Graceful error handling
- **Lazy Loading**: Code splitting for performance

### Data Flow
```
User Action → Component → Hook → Service → Firebase/API → State Update → UI Update
```

## Development Environment

### Cursor IDE Setup
1. Install Cursor IDE
2. Open project folder
3. Install recommended extensions:
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - TypeScript Importer
   - Firebase Snippets

### Environment Variables
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# AI Services
VITE_GROK_API_KEY=your-grok-api-key

# Development
VITE_APP_ENV=development
VITE_DEBUG=true
```

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## Coding Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface UserProfile {
  uid: string;
  userName: string;
  dietType: DietType;
  bodyType: BodyType;
  weight: string;
  goals: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Use enums for constants
enum DietType {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  KETO = 'keto',
  PALEO = 'paleo',
  MEDITERRANEAN = 'mediterranean',
  BALANCED = 'balanced'
}

// Use type aliases for unions
type TaskType = 'meal' | 'shopping' | 'cooking' | 'exercise' | 'education';
```

#### Function Signatures
```typescript
// Use explicit return types for public functions
export const calculateXPReward = (
  task: Task,
  userLevel: number,
  streak: number
): XPReward => {
  // Implementation
};

// Use async/await for promises
export const getUserProgress = async (): Promise<UserProgress> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  const progressDoc = await getDoc(doc(db, 'progress', user.uid));
  return progressDoc.data() as UserProgress;
};
```

### React Guidelines

#### Component Structure
```typescript
// Use functional components with TypeScript
interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  isCompleted: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  isCompleted
}) => {
  // Hooks at the top
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Event handlers
  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render
  return (
    <div className="task-card">
      {/* Component JSX */}
    </div>
  );
};
```

#### Custom Hooks
```typescript
// Encapsulate logic in custom hooks
export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        const userProgress = await getUserProgress();
        setProgress(userProgress);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProgress();
  }, []);
  
  return { progress, isLoading, error };
};
```

### Styling Guidelines

#### Tailwind CSS Usage
```typescript
// Use semantic class names
const buttonClasses = cn(
  'px-4 py-2 rounded-lg font-medium transition-colors',
  'bg-primary-500 text-white hover:bg-primary-600',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  isLoading && 'animate-pulse'
);

// Use CSS variables for theme colors
const theme = {
  primary: '#085492',
  secondary: '#71E6DE',
  accent: '#998B73',
  background: '#EDF0F2',
  text: '#374151'
};
```

#### Component Styling
```typescript
// Use consistent spacing and sizing
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem'    // 48px
};

// Use consistent border radius
const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem'       // 16px
};
```

## Component Development

### Component Architecture

#### Atomic Design Principles
```
Atoms → Molecules → Organisms → Templates → Pages
```

#### Example Component Hierarchy
```typescript
// Atom: Button
export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <button className={buttonClasses} {...props}>{children}</button>;
};

// Molecule: TaskCard
export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  return (
    <div className="task-card">
      <TaskIcon icon={task.icon} />
      <TaskInfo task={task} />
      <Button onClick={() => onComplete(task.id)}>Complete</Button>
    </div>
  );
};

// Organism: TaskList
export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskComplete }) => {
  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onComplete={onTaskComplete} />
      ))}
    </div>
  );
};
```

### Component Patterns

#### Compound Components
```typescript
// TaskCard with compound components
export const TaskCard = {
  Root: ({ children, ...props }) => (
    <div className="task-card" {...props}>{children}</div>
  ),
  Header: ({ children }) => (
    <div className="task-card-header">{children}</div>
  ),
  Title: ({ children }) => (
    <h3 className="task-card-title">{children}</h3>
  ),
  Description: ({ children }) => (
    <p className="task-card-description">{children}</p>
  ),
  Actions: ({ children }) => (
    <div className="task-card-actions">{children}</div>
  )
};

// Usage
<TaskCard.Root>
  <TaskCard.Header>
    <TaskCard.Title>Eat Breakfast</TaskCard.Title>
  </TaskCard.Header>
  <TaskCard.Description>Start your day with a healthy meal</TaskCard.Description>
  <TaskCard.Actions>
    <Button>Complete</Button>
  </TaskCard.Actions>
</TaskCard.Root>
```

#### Render Props Pattern
```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode;
}

export const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);
  
  return <>{children(data, loading, error)}</>;
};

// Usage
<DataFetcher<UserProfile> url="/api/user/profile">
  {(profile, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message={error} />;
    return <UserProfileCard profile={profile} />;
  }}
</DataFetcher>
```

## State Management

### Zustand Store Structure
```typescript
// store/nutriStore.ts
interface NutriStore {
  // State
  user: User | null;
  progress: UserProgress | null;
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setProgress: (progress: UserProgress) => void;
  addTask: (task: Task) => void;
  completeTask: (taskId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useNutriStore = create<NutriStore>((set, get) => ({
  // Initial state
  user: null,
  progress: null,
  tasks: [],
  isLoading: false,
  error: null,
  
  // Actions
  setUser: (user) => set({ user }),
  setProgress: (progress) => set({ progress }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  completeTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const reward = await completeTask(taskId);
      const currentProgress = get().progress;
      if (currentProgress) {
        set({
          progress: {
            ...currentProgress,
            currentXP: currentProgress.currentXP + reward.totalXP,
            coins: currentProgress.coins + reward.coinReward
          }
        });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
```

### React Query Integration
```typescript
// hooks/useNutriQueries.ts
export const useUserProgress = () => {
  return useQuery({
    queryKey: ['userProgress'],
    queryFn: getUserProgress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });
};

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: getAvailableTasks,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      // Invalidate and refetch user progress
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
    onError: (error) => {
      console.error('Failed to complete task:', error);
    }
  });
};
```

## API Integration

### Service Layer Pattern
```typescript
// services/api.ts
class APIService {
  private baseURL: string;
  private apiKey: string;
  
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
    this.apiKey = import.meta.env.VITE_GROK_API_KEY;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async generateMealPlan(request: MealPlanRequest): Promise<MealPlanResponse> {
    return this.request<MealPlanResponse>('/ai/meal-plan', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
  
  async analyzeNutrition(request: NutritionAnalysisRequest): Promise<NutritionAnalysisResponse> {
    return this.request<NutritionAnalysisResponse>('/ai/nutrition-analysis', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }
}

export const apiService = new APIService();
```

### Error Handling
```typescript
// utils/errorHandler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new APIError(error.message, 500, 'UNKNOWN_ERROR');
  }
  
  return new APIError('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
};

// Usage in components
const MyComponent = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleAction = async () => {
    try {
      await apiService.generateMealPlan(request);
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    }
  };
  
  return (
    <div>
      {error && <ErrorMessage message={error} />}
      <button onClick={handleAction}>Generate Meal Plan</button>
    </div>
  );
};
```

## Testing Guidelines

### Unit Testing
```typescript
// Test structure: Arrange, Act, Assert
describe('calculateXPReward', () => {
  it('should calculate XP correctly for level 1 user', () => {
    // Arrange
    const task = { xpReward: 100, difficulty: 'medium' };
    const userLevel = 1;
    const streak = 0;
    
    // Act
    const reward = calculateXPReward(task, userLevel, streak);
    
    // Assert
    expect(reward.totalXP).toBe(100);
    expect(reward.baseXP).toBe(100);
    expect(reward.multiplier).toBe(1);
    expect(reward.bonusXP).toBe(0);
  });
});
```

### Component Testing
```typescript
// Test user interactions
describe('TaskCard', () => {
  it('should call onComplete when button is clicked', async () => {
    const mockOnComplete = vi.fn();
    const task = createMockTask();
    
    render(<TaskCard task={task} onComplete={mockOnComplete} />);
    
    const button = screen.getByRole('button', { name: /complete/i });
    await user.click(button);
    
    expect(mockOnComplete).toHaveBeenCalledWith(task.id);
  });
});
```

### Integration Testing
```typescript
// Test component interactions
describe('TaskManager Integration', () => {
  it('should update progress when task is completed', async () => {
    const { result } = renderHook(() => useNutriStore());
    
    render(<TaskManager />);
    
    const taskButton = screen.getByText('Eat Breakfast');
    await user.click(taskButton);
    
    await waitFor(() => {
      expect(result.current.progress?.currentXP).toBeGreaterThan(0);
    });
  });
});
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const RewardsPage = lazy(() => import('@/pages/RewardsPage'));

// Lazy load components
const TaskManager = lazy(() => import('@/components/TaskManager'));
const AICoach = lazy(() => import('@/components/AICoach'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/tasks" element={<TasksPage />} />
    <Route path="/rewards" element={<RewardsPage />} />
  </Routes>
</Suspense>
```

### Memoization
```typescript
// Memoize expensive calculations
const ExpensiveComponent = ({ data }: { data: ComplexData[] }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }));
  }, [data]);
  
  return <div>{/* Render processed data */}</div>;
};

// Memoize components
const TaskCard = memo(({ task, onComplete }: TaskCardProps) => {
  return (
    <div className="task-card">
      {/* Component content */}
    </div>
  );
});
```

### Virtual Scrolling
```typescript
// For large lists
import { FixedSizeList as List } from 'react-window';

const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TaskCard task={tasks[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={tasks.length}
      itemSize={120}
    >
      {Row}
    </List>
  );
};
```

## Debugging

### Development Tools
```typescript
// React Developer Tools
// - Component tree inspection
// - Props and state debugging
// - Performance profiling

// Redux DevTools (for Zustand)
import { devtools } from 'zustand/middleware';

export const useNutriStore = create<NutriStore>()(
  devtools(
    (set, get) => ({
      // Store implementation
    }),
    { name: 'nutri-store' }
  )
);

// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClient>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClient>
  );
}
```

### Logging
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (import.meta.env.VITE_DEBUG) {
      console.log(`[INFO] ${message}`, data);
    }
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};

// Usage
logger.info('User completed task', { taskId, xpEarned });
logger.error('Failed to save progress', error);
```

### Performance Monitoring
```typescript
// utils/performance.ts
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  logger.info(`Performance: ${name} took ${end - start}ms`);
  
  // Send to analytics
  if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
    gtag('event', 'performance', {
      metric_name: name,
      value: end - start
    });
  }
};

// Usage
measurePerformance('Task completion', () => {
  completeTask(taskId);
});
```

## File Organization

### Project Structure Overview
```
diet-game/
├── 📁 src/                    # Source code
│   ├── 📁 components/         # Reusable UI components
│   │   ├── 📁 animations/     # Animation components
│   │   ├── 📁 forms/          # Form components
│   │   └── 📁 tasks/          # Task management components
│   ├── 📁 pages/             # Page components
│   ├── 📁 services/          # API and external services
│   ├── 📁 store/             # State management (Zustand)
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 utils/             # Utility functions
│   ├── 📁 types/             # TypeScript definitions
│   ├── 📁 test/              # Test files
│   └── 📁 styles/            # Additional styles
├── 📁 docs/                  # Comprehensive documentation
│   ├── 📁 specs/             # Feature specifications
│   ├── 📁 architecture/      # System architecture
│   ├── 📁 ui-components/     # Component documentation
│   └── 📁 gamification/      # Gamification features
├── 📁 public/                # Static assets
├── 📁 scripts/               # Build and utility scripts
└── 📄 Configuration files    # Package.json, Vite, Tailwind, etc.
```

### File Naming Conventions

#### Components
- **PascalCase** for component files: `UserProfile.tsx`
- **kebab-case** for component directories: `user-profile/`
- **Descriptive names**: `AnimatedProgressBar.tsx` not `Progress.tsx`

#### Pages
- **PascalCase** with "Page" suffix: `HomePage.tsx`, `NutritionTrackingPage.tsx`
- **Consistent naming**: Match route names where possible

#### Utilities and Services
- **camelCase** for utility files: `xp-system.ts`, `api.ts`
- **Descriptive names**: `firebase.ts`, `monitoring.ts`

### Import Organization

#### 1. Import Order
```typescript
// 1. React and React-related imports
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. Third-party libraries
import { zustand } from 'zustand';
import { CheckCircle } from 'lucide-react';

// 3. Internal imports (absolute paths)
import { useNutriStore } from '@/store/nutriStore';
import { UserProfile } from '@/types';

// 4. Relative imports
import './UserProfileForm.css';
import { validateForm } from '../utils/validation';
```

#### 2. Use Absolute Imports
```typescript
// ✅ Good: Absolute imports
import { useNutriStore } from '@/store/nutriStore';
import { UserProfile } from '@/types';

// ❌ Bad: Relative imports
import { useNutriStore } from '../../../store/nutriStore';
import { UserProfile } from '../../types';
```

## Contributing

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Commit Message Format
```
type(scope): description

feat(auth): add user authentication
fix(ui): resolve button alignment issue
docs(readme): update installation instructions
test(api): add integration tests for meal planning
refactor(store): simplify state management
```

### Code Review Checklist
- [ ] Code follows TypeScript guidelines
- [ ] Components are properly typed
- [ ] Tests are included and passing
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] Documentation updated
- [ ] No console.log statements in production code

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

---

*This developer guide is part of the Diet Game SDD documentation and should be updated as the development practices evolve.*
