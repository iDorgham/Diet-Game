# Components Directory

## 🧩 Overview

This directory contains all React components used throughout the Diet Game application. Components are organized by functionality and follow a consistent structure for maintainability and reusability.

## 📁 Structure

### Core Components
- **`MainNavigation.tsx`** - Primary navigation component with routing
- **`Navigation.tsx`** - Secondary navigation and menu components

### Specialized Component Groups
- **`animations/`** - Animation and transition components
  - `AnimatedProgressBar.tsx` - Progress bar with smooth animations
- **`forms/`** - Form-related components
  - `UserProfileForm.tsx` - User profile editing form
- **`tasks/`** - Task management components
  - `AdvancedTaskManager.tsx` - Comprehensive task management interface

## 🎯 Component Guidelines

### Naming Conventions
- **PascalCase** for component files (e.g., `UserProfileForm.tsx`)
- **Descriptive names** that clearly indicate component purpose
- **Consistent suffixes** for similar components (e.g., `Form`, `Manager`, `List`)

### File Organization
- **One component per file** for better maintainability
- **Co-located styles** when component-specific styling is needed
- **Index files** for clean imports from component directories

### Component Structure
```tsx
// Standard component structure
import React from 'react';
import { ComponentProps } from '../types';

interface ComponentNameProps {
  // Props interface
}

const ComponentName: React.FC<ComponentNameProps> = ({ 
  // Destructured props
}) => {
  // Component logic
  
  return (
    // JSX
  );
};

export default ComponentName;
```

## 🔧 Development Patterns

### Props Interface
- **TypeScript interfaces** for all component props
- **Optional vs required** props clearly defined
- **Default values** for optional props when appropriate

### State Management
- **Local state** for component-specific data
- **Global state** integration through context or store
- **Custom hooks** for shared logic between components

### Event Handling
- **Consistent naming** for event handlers (e.g., `handleClick`, `onSubmit`)
- **Proper event typing** with TypeScript
- **Callback props** for parent-child communication

## 🎨 Styling Approach

### Tailwind CSS
- **Utility-first** approach for consistent styling
- **Responsive design** with mobile-first breakpoints
- **Component variants** through conditional classes

### Component Variants
```tsx
// Example of component variants
const buttonVariants = {
  primary: 'bg-blue-500 text-white',
  secondary: 'bg-gray-200 text-gray-800',
  danger: 'bg-red-500 text-white'
};

const Button = ({ variant = 'primary', ...props }) => (
  <button className={buttonVariants[variant]} {...props} />
);
```

## 🧪 Testing Strategy

### Component Testing
- **Unit tests** for individual component functionality
- **Props testing** to ensure correct prop handling
- **User interaction testing** for event handlers
- **Accessibility testing** for WCAG compliance

### Testing Tools
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Storybook** for component development and documentation

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile-first** approach with progressive enhancement
- **Consistent breakpoints** across all components
- **Touch-friendly** interactions for mobile devices

### Component Responsiveness
```tsx
// Example responsive component
const ResponsiveCard = () => (
  <div className="
    w-full p-4
    md:w-1/2 md:p-6
    lg:w-1/3 lg:p-8
  ">
    {/* Card content */}
  </div>
);
```

## 🔗 Integration Points

### State Management
- **Context API** for component-level state sharing
- **Zustand store** for global application state
- **React Query** for server state management

### Routing
- **React Router** for navigation between components
- **Route parameters** for dynamic component rendering
- **Protected routes** for authenticated components

## 📚 Best Practices

### Performance
- **React.memo** for preventing unnecessary re-renders
- **useCallback** and **useMemo** for expensive operations
- **Lazy loading** for large components

### Accessibility
- **Semantic HTML** elements for proper structure
- **ARIA labels** for screen reader support
- **Keyboard navigation** for all interactive elements
- **Color contrast** meeting WCAG guidelines

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code quality enforcement
- **Prettier** for consistent code formatting
- **Component documentation** with JSDoc comments

## 🔗 Related Documentation

- **[`../types/`](../types/)** - TypeScript type definitions
- **[`../../docs/ui-components/`](../../docs/ui-components/)** - UI component documentation
- **[`../../docs/architecture/component-architecture.md`](../../docs/architecture/component-architecture.md)** - Component architecture

---

*Last updated: $(date)*
