// Test setup file for Diet Planner Game
// Following Level 202 testing requirements

import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'

// Mock Firebase for testing
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(),
  signInWithCustomToken: vi.fn(),
  onAuthStateChanged: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Heart: () => React.createElement('div', { 'data-testid': 'heart-icon' }),
  Star: () => React.createElement('div', { 'data-testid': 'star-icon' }),
  Clock: () => React.createElement('div', { 'data-testid': 'clock-icon' }),
  TrendingUp: () => React.createElement('div', { 'data-testid': 'trending-up-icon' }),
  ListChecks: () => React.createElement('div', { 'data-testid': 'list-checks-icon' }),
  ShoppingCart: () => React.createElement('div', { 'data-testid': 'shopping-cart-icon' }),
  ClipboardList: () => React.createElement('div', { 'data-testid': 'clipboard-list-icon' }),
  MapPin: () => React.createElement('div', { 'data-testid': 'map-pin-icon' }),
  Phone: () => React.createElement('div', { 'data-testid': 'phone-icon' }),
  Link: () => React.createElement('div', { 'data-testid': 'link-icon' }),
  CheckCircle: () => React.createElement('div', { 'data-testid': 'check-circle-icon' }),
  Eye: () => React.createElement('div', { 'data-testid': 'eye-icon' }),
  Activity: () => React.createElement('div', { 'data-testid': 'activity-icon' }),
  Coffee: () => React.createElement('div', { 'data-testid': 'coffee-icon' }),
  Sun: () => React.createElement('div', { 'data-testid': 'sun-icon' }),
  Utensils: () => React.createElement('div', { 'data-testid': 'utensils-icon' }),
  BookOpen: () => React.createElement('div', { 'data-testid': 'book-open-icon' }),
  Dumbbell: () => React.createElement('div', { 'data-testid': 'dumbbell-icon' }),
  Droplet: () => React.createElement('div', { 'data-testid': 'droplet-icon' }),
  Scale: () => React.createElement('div', { 'data-testid': 'scale-icon' }),
  BatteryCharging: () => React.createElement('div', { 'data-testid': 'battery-charging-icon' }),
  Archive: () => React.createElement('div', { 'data-testid': 'archive-icon' }),
  ChevronRight: () => React.createElement('div', { 'data-testid': 'chevron-right-icon' }),
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
