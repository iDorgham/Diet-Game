// Core gamification components
export { default as XPDisplay } from './XPDisplay';
export { default as AchievementCard } from './AchievementCard';
export { default as QuestCard } from './QuestCard';
export { default as StreakDisplay } from './StreakDisplay';
export { default as Leaderboard } from './Leaderboard';

// Main dashboard component
export { default as GamificationDashboard } from './GamificationDashboard';

// Hooks
export { useUserProgress } from '../../hooks/useUserProgress';
export { useAchievements } from '../../hooks/useAchievements';
export { useQuests } from '../../hooks/useQuests';
export { useStreaks } from '../../hooks/useStreaks';
