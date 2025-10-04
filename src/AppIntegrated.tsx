// Complete Frontend Integration - Diet Game App
// Integrates all components, routing, state management, and gamification

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { motion, AnimatePresence } from 'framer-motion';

// Import all pages
import HomePage from './pages/HomePage';
import NutritionTrackingPage from './pages/NutritionTrackingPage';
import AICoachPage from './pages/AICoachPage';
import GamificationPage from './pages/GamificationPage';
import SocialCommunityPage from './pages/SocialCommunityPage';
import ProfilePage from './pages/ProfilePage';

// Import optimized components
import OptimizedGamificationDashboard from './components/gamification/OptimizedGamificationDashboard';

// Import navigation
import MainNavigation from './components/MainNavigation';

// Import state management
import { useNutriStore, useNutriActions } from './store/nutriStore';

// Import styles
import './index.css';
import './styles/components.css';
import './styles/gamification.css';
import './styles/performance-optimizations.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.3
};

// Main App Component
const AppIntegrated: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Render page based on current route
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'nutrition':
        return <NutritionTrackingPage />;
      case 'ai-coach':
        return <AICoachPage />;
      case 'gamification':
        return (
          <div className="p-6">
            <OptimizedGamificationDashboard 
              userId="demo-user-id"
              className="optimized-dashboard"
            />
          </div>
        );
      case 'community':
        return <SocialCommunityPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-indigo-800 mb-2">Diet Planner Game</h2>
          <p className="text-indigo-600">Loading your gamified nutrition journey...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <MainNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
        
        {/* Main Content with Page Transitions */}
        <div className="lg:ml-64">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-screen"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* React Query DevTools (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default AppIntegrated;
