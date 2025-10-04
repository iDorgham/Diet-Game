// Feature Components Index
// Exports all HIGH Priority Feature Components

export { default as MetricCard, XPProgressCard, GoalProgressCard, StreakCard } from './MetricCard';
export { default as XPProgressBar, LevelBadge, XPGainAnimation } from './XPProgressBar';
export { default as NewsTicker, BreakingNewsTicker, CompactNewsTicker } from './NewsTicker';
export { default as ShoppingListSummary } from './ShoppingListSummary';
export { default as AIChat } from './AIChat';
export { default as NutritionChart } from './NutritionChart';
export { default as AchievementDisplay } from './AchievementDisplay';

// Type exports
export type { MetricCardProps, XPProgressCardProps, GoalProgressCardProps, StreakCardProps } from './MetricCard';
export type { XPProgressBarProps, LevelBadgeProps, XPGainAnimationProps } from './XPProgressBar';
export type { NewsItem, NewsTickerProps } from './NewsTicker';
export type { ShoppingItem, Market, ShoppingListSummaryProps } from './ShoppingListSummary';
export type { ChatMessage, AIChatProps } from './AIChat';
export type { NutritionData, NutritionChartProps } from './NutritionChart';
export type { Achievement, AchievementDisplayProps } from './AchievementDisplay';
