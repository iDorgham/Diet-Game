import React, { useState } from 'react';
import XPDisplay from './XPDisplay';
import AchievementCard from './AchievementCard';
import QuestCard from './QuestCard';
import StreakDisplay from './StreakDisplay';
import Leaderboard from './Leaderboard';
import { useDemoUserProgress } from '../../hooks/useDemoGamification';
import { useDemoAchievements } from '../../hooks/useDemoGamification';
import { useDemoQuests } from '../../hooks/useDemoGamification';
import { useDemoStreaks } from '../../hooks/useDemoGamification';
import { useDemoLeaderboard } from '../../hooks/useDemoGamification';

interface GamificationDashboardProps {
  userId: string;
  className?: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  userId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'quests' | 'streaks' | 'leaderboard'>('overview');
  
  const { userProgress, loading: progressLoading } = useDemoUserProgress(userId);
  const { achievements, loading: achievementsLoading, getNewAchievements } = useDemoAchievements(userId);
  const { quests, loading: questsLoading, getActiveQuests, getAvailableQuests } = useDemoQuests(userId);
  const { streaks, loading: streaksLoading, getActiveStreaks, getAtRiskStreaks } = useDemoStreaks(userId);

  const newAchievements = getNewAchievements();
  const activeQuests = getActiveQuests();
  const availableQuests = getAvailableQuests();
  const activeStreaks = getActiveStreaks();
  const atRiskStreaks = getAtRiskStreaks();

  const handleQuestStart = (quest: any) => {
    console.log('Starting quest:', quest);
    // Implement quest start logic
  };

  const handleQuestComplete = (quest: any) => {
    console.log('Completing quest:', quest);
    // Implement quest completion logic
  };

  const handleStreakProtect = (streakId: string) => {
    console.log('Protecting streak:', streakId);
    // Implement streak protection logic
  };

  const handleStreakRecover = (streakId: string) => {
    console.log('Recovering streak:', streakId);
    // Implement streak recovery logic
  };

  const renderOverview = () => (
    <div className="overview-tab">
      <div className="overview-header">
        <XPDisplay 
          showLevel={true}
          showProgress={true}
          showStars={true}
          className="overview-xp"
        />
      </div>

      <div className="overview-grid">
        <div className="overview-section">
          <h3>Recent Achievements</h3>
          <div className="achievements-preview">
            {newAchievements.slice(0, 3).map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                showProgress={false}
                className="preview-card"
              />
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
              <QuestCard
                key={quest.id}
                quest={quest}
                onStart={handleQuestStart}
                onComplete={handleQuestComplete}
                className="preview-card"
              />
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
              <StreakDisplay
                key={streak.id}
                streak={streak}
                onProtect={handleStreakProtect}
                onRecover={handleStreakRecover}
                className="preview-card"
              />
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
  );

  const renderAchievements = () => (
    <div className="achievements-tab">
      <div className="achievements-header">
        <h2>Achievements</h2>
        <div className="achievements-stats">
          <span>Total: {achievements.length}</span>
          <span>Unlocked: {achievements.filter(a => a.isUnlocked).length}</span>
          <span>New: {newAchievements.length}</span>
        </div>
      </div>
      
      <div className="achievements-grid">
        {achievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            showProgress={true}
          />
        ))}
      </div>
    </div>
  );

  const renderQuests = () => (
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
              <QuestCard
                key={quest.id}
                quest={quest}
                onStart={handleQuestStart}
                onComplete={handleQuestComplete}
              />
            ))}
          </div>
        </div>
        
        <div className="quests-section">
          <h3>Available Quests</h3>
          <div className="quests-grid">
            {availableQuests.map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onStart={handleQuestStart}
                onComplete={handleQuestComplete}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStreaks = () => (
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
          <StreakDisplay
            key={streak.id}
            streak={streak}
            onProtect={handleStreakProtect}
            onRecover={handleStreakRecover}
          />
        ))}
      </div>
    </div>
  );

  const renderLeaderboard = () => {
    const [leaderboardCategory, setLeaderboardCategory] = useState('overall');
    const [leaderboardTimeRange, setLeaderboardTimeRange] = useState('weekly');
    const { entries: leaderboardEntries, loading: leaderboardLoading } = useDemoLeaderboard(leaderboardCategory, leaderboardTimeRange);

    return (
      <div className="leaderboard-tab">
        <Leaderboard
          entries={leaderboardEntries}
          category={leaderboardCategory as any}
          timeRange={leaderboardTimeRange as any}
          onCategoryChange={setLeaderboardCategory}
          onTimeRangeChange={setLeaderboardTimeRange}
          loading={leaderboardLoading}
        />
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'achievements':
        return renderAchievements();
      case 'quests':
        return renderQuests();
      case 'streaks':
        return renderStreaks();
      case 'leaderboard':
        return renderLeaderboard();
      default:
        return renderOverview();
    }
  };

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
    <div className={`gamification-dashboard ${className}`}>
      <div className="dashboard-header">
        <h1>Gamification Dashboard</h1>
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Achievements
            {newAchievements.length > 0 && (
              <span className="notification-badge">{newAchievements.length}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'quests' ? 'active' : ''}`}
            onClick={() => setActiveTab('quests')}
          >
            🎯 Quests
            {activeQuests.length > 0 && (
              <span className="notification-badge">{activeQuests.length}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'streaks' ? 'active' : ''}`}
            onClick={() => setActiveTab('streaks')}
          >
            🔥 Streaks
            {atRiskStreaks.length > 0 && (
              <span className="notification-badge warning">{atRiskStreaks.length}</span>
            )}
          </button>
          <button
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            🏅 Leaderboard
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default GamificationDashboard;
