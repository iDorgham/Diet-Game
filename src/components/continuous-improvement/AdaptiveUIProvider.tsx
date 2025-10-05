/**
 * Level 5: Adaptive UI Provider
 * Context provider that adapts UI based on user behavior patterns and continuous learning
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';

interface AdaptiveUIConfig {
  layout: 'compact' | 'spacious' | 'default';
  features: 'basic' | 'advanced' | 'standard';
  interactions: 'guided' | 'free' | 'standard';
  theme: 'light' | 'dark' | 'auto';
  density: 'comfortable' | 'compact' | 'standard';
  animations: 'reduced' | 'full' | 'standard';
}

interface UserBehaviorPattern {
  clickPatterns: Record<string, number>;
  timeSpent: Record<string, number>;
  featureUsage: Record<string, number>;
  errorRates: Record<string, number>;
  preferences: Record<string, any>;
}

interface AdaptiveUIContextType {
  config: AdaptiveUIConfig;
  behaviorPattern: UserBehaviorPattern;
  updateBehavior: (action: string, data: any) => void;
  adaptUI: (newConfig: Partial<AdaptiveUIConfig>) => void;
  resetToDefaults: () => void;
}

const AdaptiveUIContext = createContext<AdaptiveUIContextType | undefined>(undefined);

interface AdaptiveUIProviderProps {
  children: ReactNode;
}

export const AdaptiveUIProvider: React.FC<AdaptiveUIProviderProps> = ({ children }) => {
  const { user } = useUser();
  const [config, setConfig] = useState<AdaptiveUIConfig>({
    layout: 'default',
    features: 'standard',
    interactions: 'standard',
    theme: 'auto',
    density: 'standard',
    animations: 'standard'
  });
  
  const [behaviorPattern, setBehaviorPattern] = useState<UserBehaviorPattern>({
    clickPatterns: {},
    timeSpent: {},
    featureUsage: {},
    errorRates: {},
    preferences: {}
  });

  // Load user's adaptive UI configuration
  useEffect(() => {
    if (user?.id) {
      loadAdaptiveUIConfig();
      loadBehaviorPattern();
    }
  }, [user?.id]);

  // Track user behavior
  useEffect(() => {
    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime;
      updateBehavior('page_time', { timeSpent, page: window.location.pathname });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const loadAdaptiveUIConfig = async () => {
    try {
      const response = await fetch(`/api/continuous-improvement/adaptive-ui/user/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.adaptations) {
          setConfig(prev => ({
            ...prev,
            ...result.data.adaptations
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load adaptive UI config:', error);
    }
  };

  const loadBehaviorPattern = async () => {
    try {
      // Load from localStorage for now (in production, would be from API)
      const stored = localStorage.getItem(`adaptive_ui_behavior_${user?.id}`);
      if (stored) {
        setBehaviorPattern(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load behavior pattern:', error);
    }
  };

  const saveBehaviorPattern = (newPattern: UserBehaviorPattern) => {
    if (user?.id) {
      localStorage.setItem(`adaptive_ui_behavior_${user?.id}`, JSON.stringify(newPattern));
    }
  };

  const updateBehavior = (action: string, data: any) => {
    setBehaviorPattern(prev => {
      const newPattern = { ...prev };
      
      switch (action) {
        case 'click':
          newPattern.clickPatterns[data.element] = (newPattern.clickPatterns[data.element] || 0) + 1;
          break;
        case 'time_spent':
          newPattern.timeSpent[data.page] = (newPattern.timeSpent[data.page] || 0) + data.duration;
          break;
        case 'feature_usage':
          newPattern.featureUsage[data.feature] = (newPattern.featureUsage[data.feature] || 0) + 1;
          break;
        case 'error':
          newPattern.errorRates[data.component] = (newPattern.errorRates[data.component] || 0) + 1;
          break;
        case 'preference':
          newPattern.preferences[data.key] = data.value;
          break;
        case 'page_time':
          newPattern.timeSpent[data.page] = (newPattern.timeSpent[data.page] || 0) + data.timeSpent;
          break;
      }
      
      saveBehaviorPattern(newPattern);
      return newPattern;
    });

    // Analyze behavior and adapt UI if needed
    analyzeAndAdapt();
  };

  const analyzeAndAdapt = () => {
    const adaptations = calculateAdaptations(behaviorPattern);
    if (Object.keys(adaptations).length > 0) {
      adaptUI(adaptations);
    }
  };

  const calculateAdaptations = (pattern: UserBehaviorPattern): Partial<AdaptiveUIConfig> => {
    const adaptations: Partial<AdaptiveUIConfig> = {};

    // Analyze click patterns for layout preferences
    const totalClicks = Object.values(pattern.clickPatterns).reduce((sum, count) => sum + count, 0);
    const compactElements = ['compact-view', 'dense-layout', 'minimal-ui'];
    const compactClicks = compactElements.reduce((sum, element) => sum + (pattern.clickPatterns[element] || 0), 0);
    
    if (totalClicks > 50 && compactClicks / totalClicks > 0.3) {
      adaptations.layout = 'compact';
      adaptations.density = 'compact';
    }

    // Analyze feature usage for feature level
    const advancedFeatures = ['advanced-settings', 'developer-tools', 'analytics'];
    const advancedUsage = advancedFeatures.reduce((sum, feature) => sum + (pattern.featureUsage[feature] || 0), 0);
    const totalFeatureUsage = Object.values(pattern.featureUsage).reduce((sum, count) => sum + count, 0);
    
    if (totalFeatureUsage > 20 && advancedUsage / totalFeatureUsage > 0.4) {
      adaptations.features = 'advanced';
    } else if (totalFeatureUsage < 10) {
      adaptations.features = 'basic';
    }

    // Analyze error rates for interaction style
    const totalErrors = Object.values(pattern.errorRates).reduce((sum, count) => sum + count, 0);
    if (totalErrors > 5) {
      adaptations.interactions = 'guided';
    }

    // Analyze time spent for animations
    const avgTimePerPage = Object.values(pattern.timeSpent).reduce((sum, time) => sum + time, 0) / Object.keys(pattern.timeSpent).length;
    if (avgTimePerPage < 30000) { // Less than 30 seconds per page
      adaptations.animations = 'reduced';
    }

    return adaptations;
  };

  const adaptUI = (newConfig: Partial<AdaptiveUIConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      
      // Apply CSS custom properties for real-time adaptation
      applyCSSAdaptations(updated);
      
      // Save to server
      saveAdaptiveUIConfig(updated);
      
      return updated;
    });
  };

  const applyCSSAdaptations = (config: AdaptiveUIConfig) => {
    const root = document.documentElement;
    
    // Layout adaptations
    if (config.layout === 'compact') {
      root.style.setProperty('--spacing-unit', '0.5rem');
      root.style.setProperty('--border-radius', '0.25rem');
    } else if (config.layout === 'spacious') {
      root.style.setProperty('--spacing-unit', '1.5rem');
      root.style.setProperty('--border-radius', '0.75rem');
    }
    
    // Density adaptations
    if (config.density === 'compact') {
      root.style.setProperty('--component-height', '2rem');
      root.style.setProperty('--font-size-base', '0.875rem');
    } else if (config.density === 'comfortable') {
      root.style.setProperty('--component-height', '3rem');
      root.style.setProperty('--font-size-base', '1.125rem');
    }
    
    // Animation adaptations
    if (config.animations === 'reduced') {
      root.style.setProperty('--animation-duration', '0ms');
      root.style.setProperty('--transition-duration', '0ms');
    } else if (config.animations === 'full') {
      root.style.setProperty('--animation-duration', '300ms');
      root.style.setProperty('--transition-duration', '200ms');
    }
  };

  const saveAdaptiveUIConfig = async (config: AdaptiveUIConfig) => {
    try {
      await fetch('/api/continuous-improvement/adaptive-ui/adapt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          adaptations: config
        })
      });
    } catch (error) {
      console.error('Failed to save adaptive UI config:', error);
    }
  };

  const resetToDefaults = () => {
    const defaultConfig: AdaptiveUIConfig = {
      layout: 'default',
      features: 'standard',
      interactions: 'standard',
      theme: 'auto',
      density: 'standard',
      animations: 'standard'
    };
    
    setConfig(defaultConfig);
    applyCSSAdaptations(defaultConfig);
    saveAdaptiveUIConfig(defaultConfig);
  };

  const value: AdaptiveUIContextType = {
    config,
    behaviorPattern,
    updateBehavior,
    adaptUI,
    resetToDefaults
  };

  return (
    <AdaptiveUIContext.Provider value={value}>
      <div className={`adaptive-ui adaptive-ui--${config.layout} adaptive-ui--${config.density} adaptive-ui--${config.animations}`}>
        {children}
      </div>
    </AdaptiveUIContext.Provider>
  );
};

export const useAdaptiveUI = (): AdaptiveUIContextType => {
  const context = useContext(AdaptiveUIContext);
  if (context === undefined) {
    throw new Error('useAdaptiveUI must be used within an AdaptiveUIProvider');
  }
  return context;
};

// Behavior tracking hooks
export const useBehaviorTracking = () => {
  const { updateBehavior } = useAdaptiveUI();

  const trackClick = (element: string, data?: any) => {
    updateBehavior('click', { element, ...data });
  };

  const trackTimeSpent = (page: string, duration: number) => {
    updateBehavior('time_spent', { page, duration });
  };

  const trackFeatureUsage = (feature: string, data?: any) => {
    updateBehavior('feature_usage', { feature, ...data });
  };

  const trackError = (component: string, error: any) => {
    updateBehavior('error', { component, error: error.message });
  };

  const trackPreference = (key: string, value: any) => {
    updateBehavior('preference', { key, value });
  };

  return {
    trackClick,
    trackTimeSpent,
    trackFeatureUsage,
    trackError,
    trackPreference
  };
};

export default AdaptiveUIProvider;
