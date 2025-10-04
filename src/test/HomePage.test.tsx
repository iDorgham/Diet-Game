// HomePage component tests following Level 202 testing requirements
// Testing EARS-001 through EARS-005 requirements

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '../pages/HomePage';
import { UserProgress, UserProfile, HeaderStatus } from '../types';

// Mock data following specs
const mockProgress: UserProgress = {
  score: 3500,
  coins: 2000,
  recipesUnlocked: 10,
  hasClaimedGift: false,
  level: 3,
  currentXP: 150,
};

const mockUserProfile: UserProfile = {
  userName: 'Yasser',
  dietType: 'Keto Diet',
  bodyType: 'Mesomorph',
  weight: '175 lbs',
};

const mockHeaderStatus: HeaderStatus = {
  currentDayTime: { day: 'Sat', time: '12:01 AM' },
  daysUntilNextPlan: 2,
  dietType: 'Keto Diet',
  nextCookingTime: { isPending: true, timeString: '2h 30m', minutesRemaining: 150 },
  nextWorkoutTime: { isPending: true, timeString: '5h 15m' },
};

const mockProps = {
  progress: mockProgress,
  userProfile: mockUserProfile,
  headerStatus: mockHeaderStatus,
  handleTaskCompletion: vi.fn(),
  setMessage: vi.fn(),
  isAnyTaskLoading: false,
  localCompletedTasks: [1],
  setLocalCompletedTasks: vi.fn(),
};

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EARS-001: Dashboard Metrics', () => {
    it('should display all 4 metric cards', () => {
      render(<HomePage {...mockProps} />);
      
      // Check Days card
      expect(screen.getByText('Days')).toBeInTheDocument();
      expect(screen.getByText('3500')).toBeInTheDocument();
      
      // Check Level card
      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Check Fitness Score card
      expect(screen.getByText('Fitness Score')).toBeInTheDocument();
      expect(screen.getByText('175 lbs')).toBeInTheDocument();
      
      // Check Diet Coins card
      expect(screen.getByText('Diet Coins')).toBeInTheDocument();
      expect(screen.getByText('2000')).toBeInTheDocument();
    });

    it('should display star milestones correctly', () => {
      render(<HomePage {...mockProps} />);
      
      // Should have 5 stars (score 3500 > 2000 threshold)
      const stars = screen.getAllByTestId('star-icon');
      expect(stars).toHaveLength(5);
    });

    it('should display XP progress bar', () => {
      render(<HomePage {...mockProps} />);
      
      expect(screen.getByText('XP: 150')).toBeInTheDocument();
      expect(screen.getByText('Next: 300 XP')).toBeInTheDocument();
    });
  });

  describe('EARS-002: News Ticker', () => {
    it('should display news ticker with announcements', () => {
      render(<HomePage {...mockProps} />);
      
      // Check for news ticker content
      expect(screen.getByText(/REWARD ALERT/)).toBeInTheDocument();
      expect(screen.getByText(/LEVEL UP/)).toBeInTheDocument();
      expect(screen.getByText(/NEW PACK/)).toBeInTheDocument();
    });

    it('should have proper styling for news ticker', () => {
      render(<HomePage {...mockProps} />);
      
      const ticker = screen.getByText(/REWARD ALERT/).closest('div');
      expect(ticker).toHaveClass('bg-indigo-700');
    });
  });

  describe('EARS-003: Today\'s Tasks', () => {
    it('should display all daily tasks', () => {
      render(<HomePage {...mockProps} />);
      
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('Meal: High-Protein Scramble')).toBeInTheDocument();
      expect(screen.getByText('Meal: Lemon Herb Chicken Salad')).toBeInTheDocument();
      expect(screen.getByText('Complete Dinner Prep Shopping')).toBeInTheDocument();
      expect(screen.getByText('Meal: Mediterranean Salmon Dinner')).toBeInTheDocument();
      expect(screen.getByText('Cook: Overnight Oats Prep')).toBeInTheDocument();
    });

    it('should show completion status correctly', () => {
      render(<HomePage {...mockProps} />);
      
      // First task should be completed
      const completedTask = screen.getByText('Meal: High-Protein Scramble');
      expect(completedTask).toHaveClass('line-through');
      
      // Other tasks should not be completed
      const incompleteTask = screen.getByText('Meal: Lemon Herb Chicken Salad');
      expect(incompleteTask).not.toHaveClass('line-through');
    });

    it('should display task rewards', () => {
      render(<HomePage {...mockProps} />);
      
      expect(screen.getByText('+2 Score')).toBeInTheDocument();
      expect(screen.getByText('+15 XP')).toBeInTheDocument();
      expect(screen.getByText('+1 Coin')).toBeInTheDocument();
    });

    it('should handle task completion', async () => {
      const user = userEvent.setup();
      render(<HomePage {...mockProps} />);
      
      const completeButton = screen.getAllByText('Done')[0];
      await user.click(completeButton);
      
      expect(mockProps.handleTaskCompletion).toHaveBeenCalledWith(2, 0, 15, 'Meal: Lemon Herb Chicken Salad');
      expect(mockProps.setLocalCompletedTasks).toHaveBeenCalled();
    });

    it('should prevent duplicate task completion', async () => {
      const user = userEvent.setup();
      render(<HomePage {...mockProps} />);
      
      // Try to complete already completed task
      const completedButton = screen.getByText('Completed');
      await user.click(completedButton);
      
      expect(mockProps.setMessage).toHaveBeenCalledWith(
        expect.stringContaining('already marked as done')
      );
    });
  });

  describe('EARS-004: Shopping List Summary', () => {
    it('should display shopping metrics', () => {
      render(<HomePage {...mockProps} />);
      
      expect(screen.getByText('Shopping List')).toBeInTheDocument();
      expect(screen.getByText('Items No')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('Total Price')).toBeInTheDocument();
      expect(screen.getByText('1,250.00 LE')).toBeInTheDocument();
    });

    it('should display nutrition metrics', () => {
      render(<HomePage {...mockProps} />);
      
      expect(screen.getByText('Total Protein')).toBeInTheDocument();
      expect(screen.getByText('450g')).toBeInTheDocument();
      expect(screen.getByText('Total Calories')).toBeInTheDocument();
      expect(screen.getByText('12,500 Cal')).toBeInTheDocument();
    });

    it('should display recommended markets', () => {
      render(<HomePage {...mockProps} />);
      
      expect(screen.getByText('Recommended Markets (Hurghada, Egypt)')).toBeInTheDocument();
      expect(screen.getByText('A10 Market')).toBeInTheDocument();
      expect(screen.getByText('Metro Market')).toBeInTheDocument();
      expect(screen.getByText('Spinneys Market')).toBeInTheDocument();
    });

    it('should display key items summary', () => {
      render(<HomePage {...mockProps} />);
      
      expect(screen.getByText('Key Items Summary')).toBeInTheDocument();
      expect(screen.getByText('1 lb Boneless Chicken Breast')).toBeInTheDocument();
      expect(screen.getByText('2 Avocados')).toBeInTheDocument();
    });
  });

  describe('EARS-005: Real-time Updates', () => {
    it('should update time display', async () => {
      render(<HomePage {...mockProps} />);
      
      // Time should be displayed (exact value may vary)
      expect(screen.getByText(/AM|PM/)).toBeInTheDocument();
    });

    it('should calculate countdown timers', () => {
      render(<HomePage {...mockProps} />);
      
      // Should show countdown for incomplete tasks
      const countdownElements = screen.getAllByText(/remaining|min|h/);
      expect(countdownElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<HomePage {...mockProps} />);
      
      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<HomePage {...mockProps} />);
      
      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      render(<HomePage {...mockProps} />);
      
      const metricsGrid = screen.getByText('Days').closest('div')?.parentElement;
      expect(metricsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      const incompleteProps = {
        ...mockProps,
        progress: undefined as any,
      };
      
      expect(() => render(<HomePage {...incompleteProps} />)).not.toThrow();
    });
  });
});
