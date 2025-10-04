# Styles Directory

## 🎨 Overview

This directory contains all styling-related files for the Diet Game application. The styling system is built on Tailwind CSS with custom animations and component-specific styles to create a cohesive and engaging user experience.

## 📁 Contents

### Style Files
- **`animations.css`** - Custom CSS animations and transitions

## 🎯 Styling Architecture

### CSS Organization
```css
/* Standard CSS file structure */
/* ============================================
   Custom Animations
   ============================================ */

/* Animation keyframes */
@keyframes animationName {
  /* Keyframe definitions */
}

/* Animation classes */
.animation-class {
  /* Animation properties */
}

/* ============================================
   Component-specific styles
   ============================================ */

/* Component styles that can't be achieved with Tailwind */
.component-specific {
  /* Custom styles */
}
```

### Styling Approach
- **Tailwind CSS** - Primary styling framework with utility classes
- **Custom CSS** - For complex animations and Tailwind limitations
- **CSS Modules** - Component-scoped styles when needed
- **CSS Variables** - For theme customization and dynamic values

## 🎬 Animation System

### Custom Animations (`animations.css`)
```css
/* Progress bar animations */
@keyframes progressFill {
  from {
    width: 0%;
  }
  to {
    width: var(--progress-width);
  }
}

@keyframes progressPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Achievement unlock animations */
@keyframes achievementPop {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

@keyframes achievementGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
  }
}

/* Loading animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

/* Fade animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* Slide animations */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Animation Classes
```css
/* Animation utility classes */
.animate-progress-fill {
  animation: progressFill 1s ease-out forwards;
}

.animate-progress-pulse {
  animation: progressPulse 2s ease-in-out infinite;
}

.animate-achievement-pop {
  animation: achievementPop 0.6s ease-out forwards;
}

.animate-achievement-glow {
  animation: achievementGlow 1s ease-in-out infinite;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-fade-out {
  animation: fadeOut 0.3s ease-out forwards;
}

.animate-slide-in-left {
  animation: slideInLeft 0.4s ease-out forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out forwards;
}

/* Animation delays */
.animate-delay-100 {
  animation-delay: 100ms;
}

.animate-delay-200 {
  animation-delay: 200ms;
}

.animate-delay-300 {
  animation-delay: 300ms;
}

.animate-delay-500 {
  animation-delay: 500ms;
}
```

## 🎨 Design System Integration

### Tailwind CSS Configuration
```javascript
// tailwind.config.js integration
module.exports = {
  theme: {
    extend: {
      // Custom colors
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d',
        }
      },
      
      // Custom animations
      animation: {
        'progress-fill': 'progressFill 1s ease-out forwards',
        'achievement-pop': 'achievementPop 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
      },
      
      // Custom keyframes
      keyframes: {
        progressFill: {
          'from': { width: '0%' },
          'to': { width: 'var(--progress-width)' }
        },
        achievementPop: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' }
        }
      }
    }
  }
}
```

### CSS Variables for Theming
```css
/* CSS custom properties for theming */
:root {
  /* Color variables */
  --color-primary: 59 130 246;
  --color-success: 34 197 94;
  --color-warning: 245 158 11;
  --color-danger: 239 68 68;
  
  /* Spacing variables */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Animation variables */
  --animation-duration-fast: 150ms;
  --animation-duration-normal: 300ms;
  --animation-duration-slow: 500ms;
  
  /* Border radius variables */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}

/* Dark theme variables */
[data-theme="dark"] {
  --color-primary: 96 165 250;
  --color-success: 74 222 128;
  --color-warning: 251 191 36;
  --color-danger: 248 113 113;
}
```

## 🎯 Component-Specific Styles

### Progress Components
```css
/* Progress bar styles */
.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2.5;
}

.progress-fill {
  @apply bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out;
  animation: progressFill 1s ease-out forwards;
}

.progress-pulse {
  @apply animate-pulse;
}

/* Circular progress */
.circular-progress {
  @apply relative w-16 h-16;
}

.circular-progress svg {
  @apply w-full h-full transform -rotate-90;
}

.circular-progress .progress-circle {
  @apply stroke-current text-blue-600;
  stroke-dasharray: 251.2;
  stroke-dashoffset: 251.2;
  transition: stroke-dashoffset 0.5s ease-in-out;
}
```

### Gamification Components
```css
/* Achievement badge styles */
.achievement-badge {
  @apply relative inline-flex items-center justify-center w-12 h-12 rounded-full;
  @apply bg-gradient-to-br from-yellow-400 to-orange-500;
  @apply shadow-lg border-2 border-white;
  animation: achievementPop 0.6s ease-out forwards;
}

.achievement-badge.unlocked {
  @apply animate-achievement-glow;
}

.achievement-badge.locked {
  @apply bg-gray-300 text-gray-500;
}

/* XP display styles */
.xp-display {
  @apply flex items-center space-x-2;
}

.xp-bar {
  @apply flex-1 bg-gray-200 rounded-full h-2;
}

.xp-fill {
  @apply bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full;
  @apply transition-all duration-500 ease-out;
}
```

### Form Components
```css
/* Input field styles */
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  @apply transition-all duration-200 ease-in-out;
}

.input-field.error {
  @apply border-red-500 focus:ring-red-500;
}

.input-field.success {
  @apply border-green-500 focus:ring-green-500;
}

/* Button styles */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md;
  @apply hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
  @apply transition-all duration-200 ease-in-out;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-md;
  @apply hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500;
  @apply transition-all duration-200 ease-in-out;
}
```

## 📱 Responsive Design

### Mobile-First Approach
```css
/* Mobile-first responsive styles */
.container {
  @apply w-full px-4 mx-auto;
}

/* Tablet styles */
@media (min-width: 768px) {
  .container {
    @apply max-w-2xl;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .container {
    @apply max-w-4xl;
  }
}

/* Large desktop styles */
@media (min-width: 1280px) {
  .container {
    @apply max-w-6xl;
  }
}
```

### Touch-Friendly Interactions
```css
/* Touch-friendly button sizes */
.btn-touch {
  @apply min-h-[44px] min-w-[44px];
}

/* Touch-friendly spacing */
.touch-spacing {
  @apply space-y-4;
}

@media (min-width: 768px) {
  .touch-spacing {
    @apply space-y-2;
  }
}
```

## 🎨 Theme System

### Light/Dark Theme Support
```css
/* Light theme (default) */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

/* Dark theme */
[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-color: #374151;
}

/* Theme-aware components */
.themed-bg {
  background-color: var(--bg-primary);
}

.themed-text {
  color: var(--text-primary);
}

.themed-border {
  border-color: var(--border-color);
}
```

## 🧪 Testing Styles

### Test-Specific Styles
```css
/* Test-specific styles for visual testing */
.test-highlight {
  @apply border-2 border-red-500 bg-red-100;
}

.test-focus {
  @apply ring-4 ring-blue-500 ring-opacity-50;
}

/* Accessibility testing helpers */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden;
  @apply whitespace-nowrap border-0;
  clip: rect(0, 0, 0, 0);
}
```

## 🔗 Related Documentation

- **[`../components/`](../components/)** - Component implementations
- **[`../../docs/ui-components/`](../../docs/ui-components/)** - UI component documentation
- **[`../../tailwind.config.js`](../../tailwind.config.js)** - Tailwind configuration
- **[`../../docs/DEVELOPER_GUIDE.md`](../../docs/DEVELOPER_GUIDE.md)** - Development guidelines

---

*Last updated: $(date)*
