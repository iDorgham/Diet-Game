// Level 404: Ultimate Mastery App Component with Production Features
// Enterprise-grade resilience, monitoring, and governance

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { motion, AnimatePresence } from 'framer-motion';
import { useNutriStore, useNutriActions } from './store/nutriStore';
import { useRealtimeSync } from './hooks/useNutriQueries';
import AdvancedTaskManager from './components/tasks/AdvancedTaskManager';
import UserProfileForm from './components/forms/UserProfileForm';
import { XPProgressBar, ScoreProgressBar } from './components/animations/AnimatedProgressBar';
import { Heart, Star, Settings, User, Zap, TrendingUp, Shield, Wifi, WifiOff } from 'lucide-react';

// Level 404: Production monitoring and security
import { 
  initializeMonitoring, 
  SentryErrorBoundary, 
  usePerformanceMonitoring,
  initializeHealthChecks 
} from './services/monitoring';
import { 
  registerServiceWorker, 
  useOfflineStatus 
} from './services/offlineManager';
import { 
  initializeSecurity, 
  SecurityAudit 
} from './services/security';

// Import the original App component
import OriginalApp from './App';

// Create React Query client with advanced configuration
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

// Level 404: Ultimate Mastery App Component
const AppEnhanced = () => {
  // Zustand state management
  const { 
    progress, 
    userProfile, 
    headerStatus, 
    activePage, 
    isLoading, 
    error,
    isOnline 
  } = useNutriStore();
  
  const { 
    setActivePage, 
    setLoading, 
    setError, 
    setOnlineStatus 
  } = useNutriActions();
  
  // Local state
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [showSecurityAudit, setShowSecurityAudit] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [userId] = useState('demo-user-id');
  
  // Level 404: Production monitoring and security
  const { trackUserAction, trackFeatureUsage, measureOperation } = usePerformanceMonitoring();
  const { isOnline: networkOnline, offlineManager, status: offlineStatus } = useOfflineStatus();
  
  // Real-time sync
  useRealtimeSync(userId);
  
  // Level 404: Initialize production features
  useEffect(() => {
    // Initialize monitoring
    initializeMonitoring();
    
    // Initialize health checks
    initializeHealthChecks();
    
    // Initialize security
    initializeSecurity();
    
    // Register service worker
    registerServiceWorker();
    
    // Track app initialization
    trackUserAction('app_initialized', { version: '1.0.0' });
    
    // Run security audit
    SecurityAudit.auditPage().then(audit => {
      setSecurityScore(audit.score);
    });
  }, [trackUserAction]);
  
  // Online/offline detection with enhanced monitoring
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      trackUserAction('network_online');
    };
    const handleOffline = () => {
      setOnlineStatus(false);
      trackUserAction('network_offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, trackUserAction]);
  
  // Enhanced navigation with monitoring
  const navigationItems = [
    { id: 'Home', label: 'Home', icon: Heart },
    { id: 'Tasks', label: 'Tasks', icon: Star },
    { id: 'Profile', label: 'Profile', icon: User },
    { id: 'Analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];
  
  const handleNavigation = (pageId) => {
    setActivePage(pageId);
    trackUserAction('navigation', { page: pageId });
    trackFeatureUsage('navigation', { page: pageId });
  };
  
  const renderPage = () => {
    switch (activePage) {
      case 'Home':
        return <OriginalApp />;
      case 'Tasks':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-indigo-800 mb-6">Advanced Task Manager</h1>
            <AdvancedTaskManager 
              userId={userId}
              onTaskComplete={(task) => {
                console.log('Task completed:', task);
              }}
            />
          </div>
        );
      case 'Profile':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-indigo-800 mb-6">User Profile</h1>
            {showProfileForm ? (
              <UserProfileForm
                initialData={userProfile}
                userId={userId}
                onSuccess={() => setShowProfileForm(false)}
                onCancel={() => setShowProfileForm(false)}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{userProfile.userName}</h2>
                  <p className="text-gray-600">{userProfile.dietType}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Body Type:</span>
                    <span className="font-semibold">{userProfile.bodyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-semibold">{userProfile.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold">{progress.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coins:</span>
                    <span className="font-semibold">{progress.coins}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="w-full mt-6 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        );
      case 'Analytics':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-indigo-800 mb-6">Analytics Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* XP Progress */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">XP Progress</h3>
                <XPProgressBar 
                  currentXP={progress.currentXP}
                  level={progress.level}
                  animated={true}
                  delay={0.2}
                />
              </div>
              
              {/* Score Progress */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Progress</h3>
                <ScoreProgressBar 
                  score={progress.score}
                  animated={true}
                  delay={0.4}
                />
              </div>
              
              {/* Stats Cards */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Score:</span>
                    <span className="font-semibold">{progress.score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipes Unlocked:</span>
                    <span className="font-semibold">{progress.recipesUnlocked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current XP:</span>
                    <span className="font-semibold">{progress.currentXP}</span>
                  </div>
                </div>
              </div>
              
              {/* Online Status */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {isOnline ? 'All data synced' : 'Working offline - changes will sync when online'}
                </p>
              </div>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-indigo-800 mb-6">Settings</h1>
            
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h2>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={showAdvancedFeatures}
                    onChange={(e) => setShowAdvancedFeatures(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">Enable Advanced Features</span>
                </label>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Level 303 Features</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✅ Advanced State Management (Zustand)</li>
                    <li>✅ React Query Integration</li>
                    <li>✅ Real-time Sync</li>
                    <li>✅ Advanced Animations</li>
                    <li>✅ Form Validation</li>
                    <li>✅ Drag & Drop Tasks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <OriginalApp />;
    }
  };
  
  return (
    <SentryErrorBoundary fallback={({ error, resetError }) => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
          <button 
            onClick={resetError}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </div>
    )}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-indigo-700 shadow-lg sticky top-0 z-50"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-white">NutriQuest</h1>
                <div className="hidden md:flex items-center space-x-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activePage === item.id
                            ? 'bg-indigo-600 text-white'
                            : 'text-indigo-200 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Level 404: Enhanced Status Indicators */}
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm text-indigo-200">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                {/* Security Score Indicator */}
                <div className="flex items-center space-x-2 bg-indigo-600 px-3 py-1 rounded-lg">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-white font-semibold">{securityScore}%</span>
                </div>
                
                {/* Level Indicator */}
                <div className="flex items-center space-x-2 bg-indigo-600 px-3 py-1 rounded-lg">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-semibold">Lv.{progress.level}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>
        
        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </motion.main>
        
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-md"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="font-semibold">Error</span>
              </div>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
        {/* React Query DevTools (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SentryErrorBoundary>
  );
};

export default AppEnhanced;
