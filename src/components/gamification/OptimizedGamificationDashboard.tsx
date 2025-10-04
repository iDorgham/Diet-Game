import React, { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useOptimizedUserProgress, useOptimizedAchievements, useOptimizedQuests, useOptimizedStreaks, useOptimizedLeaderboard } from '../../hooks/useOptimizedGamification';

// Lazy load components for better performance
const XPDisplay = lazy(() => import('./XPDisplay'));
const AchievementCard = lazy(() => import('./AchievementCard'));
const QuestCard = lazy(() => import('./QuestCard'));
const StreakDisplay = lazy(() => import('./StreakDisplay'));
const Leaderboard = lazy(() => import('./Leaderboard'));

// Loading component
const ComponentLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`component-loader ${className}`}>
    <div className="loader-skeleton">
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
    </div>
  </div>
);

interface OptimizedGamificationDashboardProps {
  userId: string;
  className?: string;
}

export const OptimizedGamificationDashboard: React.FC<OptimizedGamificationDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'quests' | 'streaks' | 'leaderboard'>('overview');
  
  // Use optimized hooks
  const { userProgress, loading: progressLoading, progressStats } = useOptimizedUserProgress(userId);
  const { 
    achievements, 
    loading: achievementsLoading, 
    getNewAchievements, 
    getAchievementStats,
    loadMore: loadMoreAchievements,
    hasMore: hasMoreAchievements
  } = useOptimizedAchievements(userId, 12); // Load 12 achievements per page
  const { 
    quests, 
    loading: questsLoading, 
    getActiveQuests, 
    getAvailableQuests 
  } = useOptimizedQuests(userId);
  const { 
    streaks, 
    loading: streaksLoading, 
    getActiveStreaks, 
    getAtRiskStreaks 
  } = useOptimizedStreaks(userId);

  // Memoized computed values
  const newAchievements = useMemo(() => getNewAchievements(), [getNewAchievements]);
  const activeQuests = useMemo(() => getActiveQuests(), [getActiveQuests]);
  const availableQuests = useMemo(() => getAvailableQuests(), [getAvailableQuests]);
  const activeStreaks = useMemo(() => getActiveStreaks(), [getActiveStreaks]);
  const atRiskStreaks = useMemo(() => getAtRiskStreaks(), [getAtRiskStreaks]);
  const achievementStats = useMemo(() => getAchievementStats(), [getAchievementStats]);

  // Memoized event handlers
  const handleQuestStart = useCallback((quest: any) => {
    console.log('Starting quest:', quest);
    // Implement quest start logic
  }, []);

  const handleQuestComplete = useCallback((quest: any) => {
    console.log('Completing quest:', quest);
    // Implement quest completion logic
  }, []);

  const handleStreakProtect = useCallback((streakId: string) => {
    console.log('Protecting streak:', streakId);
    // Implement streak protection logic
  }, []);

  const handleStreakRecover = useCallback((streakId: string) => {
    console.log('Recovering streak:', streakId);
    // Implement streak recovery logic
  }, []);

  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
  }, []);

  // Memoized overview component
  const renderOverview = useMemo(() => (
    <div className="overview-tab">
      <div className="overview-header">
        <Suspense fallback={<ComponentLoader className="overview-xp" />}>
          <XPDisplay 
            showLevel={true}
            showProgress={true}
            showStars={true}
            className="overview-xp"
          />
        </Suspense>
      </div>

      <div className="overview-grid">
        <div className="overview-section">
          <h3>Recent Achievements</h3>
          <div className="achievements-preview">
            {newAchievements.slice(0, 3).map(achievement => (
              <Suspense key={achievement.id} fallback={<ComponentLoader className="preview-card" />}>
                <AchievementCard
                  achievement={achievement}
                  showProgress={false}
                  className="preview-card"
                />
              </Suspense>
            ))}
            {newAchievements.length === 0 && (
              <p className="empty-state">No new achievements</p>
            )}
          </div>
        </div>

        <div className="overview-section">
          <h3>Active Quests</h3>
          <div className="quests-preview">
            {activeQuests.slice(0, 2).map(quest => (
              <Suspense key={quest.id} fallback={<ComponentLoader className="preview-card" />}>
                <QuestCard
                  quest={quest}
                  onStart={handleQuestStart}
                  onComplete={handleQuestComplete}
                  className="preview-card"
                />
              </Suspense>
            ))}
            {activeQuests.length === 0 && (
              <p className="empty-state">No active quests</p>
            )}
          </div>
        </div>

        <div className="overview-section">
          <h3>Active Streaks</h3>
          <div className="streaks-preview">
            {activeStreaks.slice(0, 2).map(streak => (
              <Suspense key={streak.id} fallback={<ComponentLoader className="preview-card" />}>
                <StreakDisplay
                  streak={streak}
                  onProtect={handleStreakProtect}
                  onRecover={handleStreakRecover}
                  className="preview-card"
                />
              </Suspense>
            ))}
            {activeStreaks.length === 0 && (
              <p className="empty-state">No active streaks</p>
            )}
          </div>
        </div>

        {atRiskStreaks.length > 0 && (
          <div className="overview-section risk-alert">
            <h3>⚠️ Streaks at Risk</h3>
            <div className="risk-streaks">
              {atRiskStreaks.map(streak => (
                <div key={streak.id} className="risk-streak">
                  <span className="streak-name">{streak.name}</span>
                  <button 
                    className="protect-btn-small"
                    onClick={() => handleStreakProtect(streak.id)}
                  >
                    Protect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  ), [newAchievements, activeQuests, activeStreaks, atRiskStreaks, handleQuestStart, handleQuestComplete, handleStreakProtect, handleStreakRecover]);

  // Memoized achievements component
  const renderAchievements = useMemo(() => (
    <div className="achievements-tab">
      <div className="achievements-header">
        <h2>Achievements</h2>
        <div className="achievements-stats">
          <span>Total: {achievementStats.total}</span>
          <span>Unlocked: {achievementStats.unlocked}</span>
          <span>New: {achievementStats.newAchievements}</span>
        </div>
      </div>
      
      <div className="achievements-grid">
        {achievements.map(achievement => (
          <Suspense key={achievement.id} fallback={<ComponentLoader />}>
            <AchievementCard
              achievement={achievement}
              showProgress={true}
            />
          </Suspense>
        ))}
      </div>
      
      {hasMoreAchievements && (
        <div className="load-more-section">
          <button 
            className="load-more-btn"
            onClick={loadMoreAchievements}
          >
            Load More Achievements
          </button>
        </div>
      )}
    </div>
  ), [achievements, achievementStats, hasMoreAchievements, loadMoreAchievements]);

  // Memoized quests component
  const renderQuests = useMemo(() => (
    <div className="quests-tab">
      <div className="quests-header">
        <h2>Quests</h2>
        <div className="quests-stats">
          <span>Active: {activeQuests.length}</span>
          <span>Available: {availableQuests.length}</span>
        </div>
      </div>
      
      <div className="quests-sections">
        <div className="quests-section">
          <h3>Active Quests</h3>
          <div className="quests-grid">
            {activeQuests.map(quest => (
              <Suspense key={quest.id} fallback={<ComponentLoader />}>
                <QuestCard
                  quest={quest}
                  onStart={handleQuestStart}
                  onComplete={handleQuestComplete}
                />
              </Suspense>
            ))}
          </div>
        </div>
        
        <div className="quests-section">
          <h3>Available Quests</h3>
          <div className="quests-grid">
            {availableQuests.map(quest => (
              <Suspense key={quest.id} fallback={<ComponentLoader />}>
                <QuestCard
                  quest={quest}
                  onStart={handleQuestStart}
                  onComplete={handleQuestComplete}
                />
              </Suspense>
            ))}
          </div>
        </div>
      </div>
    </div>
  ), [activeQuests, availableQuests, handleQuestStart, handleQuestComplete]);

  // Memoized streaks component
  const renderStreaks = useMemo(() => (
    <div className="streaks-tab">
      <div className="streaks-header">
        <h2>Streaks</h2>
        <div className="streaks-stats">
          <span>Active: {activeStreaks.length}</span>
          <span>At Risk: {atRiskStreaks.length}</span>
        </div>
      </div>
      
      <div className="streaks-grid">
        {streaks.map(streak => (
          <Suspense key={streak.id} fallback={<ComponentLoader />}>
            <StreakDisplay
              streak={streak}
              onProtect={handleStreakProtect}
              onRecover={handleStreakRecover}
            />
          </Suspense>
        ))}
      </div>
    </div>
  ), [streaks, activeStreaks.length, atRiskStreaks.length, handleStreakProtect, handleStreakRecover]);

  // Memoized leaderboard component
  const renderLeaderboard = useMemo(() => {
    const [leaderboardCategory, setLeaderboardCategory] = useState('overall');
    const [leaderboardTimeRange, setLeaderboardTimeRange] = useState('weekly');
    const { entries: leaderboardEntries, loading: leaderboardLoading, loadMore, hasMore } = useOptimizedLeaderboard(leaderboardCategory, leaderboardTimeRange, 25);

    return (
      <div className="leaderboard-tab">
        <Suspense fallback={<ComponentLoader />}>
          <Leaderboard
            entries={leaderboardEntries}
            category={leaderboardCategory as any}
            timeRange={leaderboardTimeRange as any}
            onCategoryChange={setLeaderboardCategory}
            onTimeRangeChange={setLeaderboardTimeRange}
            loading={leaderboardLoading}
          />
        </Suspense>
        
        {hasMore && (
          <div className="load-more-section">
            <button 
              className="load-more-btn"
              onClick={loadMore}
            >
              Load More Entries
            </button>
          </div>
        )}
      </div>
    );
  }, []);

  // Memoized tab content
  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return renderOverview;
      case 'achievements':
        return renderAchievements;
      case 'quests':
        return renderQuests;
      case 'streaks':
        return renderStreaks;
      case 'leaderboard':
        return renderLeaderboard;
      default:
        return renderOverview;
    }
  }, [activeTab, renderOverview, renderAchievements, renderQuests, renderStreaks, renderLeaderboard]);

  const isLoading = progressLoading || achievementsLoading || questsLoading || streaksLoading;

  if (isLoading) {
    return (
      <div className={`gamification-dashboard loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading gamification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`gamification-dashboard optimized ${className}`}>
      <div className="dashboard-header">
        <h1>Gamification Dashboard</h1>
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => handleTabChange('achievements')}
          >
            🏆 Achievements
            {newAchievements.length > 0 && (
              <span className="notification-badge">{newAchievements.length}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'quests' ? 'active' : ''}`}
            onClick={() => handleTabChange('quests')}
          >
            🎯 Quests
            {activeQuests.length > 0 && (
              <span className="notification-badge">{activeQuests.length}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'streaks' ? 'active' : ''}`}
            onClick={() => handleTabChange('streaks')}
          >
            🔥 Streaks
            {atRiskStreaks.length > 0 && (
              <span className="notification-badge warning">{atRiskStreaks.length}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('leaderboard')}
          >
            🏅 Leaderboard
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {renderTabContent}
      </div>
    </div>
  );
};

export default OptimizedGamificationDashboard;
