// Demo data service for gamification components
// Provides mock data when Firebase is not available

export interface DemoUserProgress {
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stars: number;
  totalXP: number;
  badgesUnlocked: number;
  achievementsUnlocked: number;
  questsCompleted: number;
  streaksActive: number;
  lastUpdated: Date;
}

export interface DemoAchievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  color: string;
  xpReward: number;
  coinReward: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
  isNew?: boolean;
}

export interface DemoQuest {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';
  type: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
  coinReward: number;
  progressTarget: number;
  timeLimit: number;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  startedAt?: Date;
  expiresAt: Date;
  requirements: Record<string, any>;
  isNew?: boolean;
}

export interface DemoStreak {
  id: string;
  name: string;
  description: string;
  category: string;
  currentCount: number;
  maxCount: number;
  isActive: boolean;
  isProtected: boolean;
  lastActivity: Date;
  protectionExpires?: Date;
  freezeTokensUsed: number;
  freezeTokensAvailable: number;
  milestonesReached: number[];
  totalXP: number;
  totalCoins: number;
}

export interface DemoLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  level: number;
  xp: number;
  badges: number;
  isCurrentUser?: boolean;
}

// Demo user progress data - Customize your progress here!
export const demoUserProgress: DemoUserProgress = {
  userId: 'demo-user-123',
  level: 7, // Higher level for more impressive demo
  xp: 1250, // More XP to show progress
  xpToNextLevel: 1500, // Higher XP requirement for next level
  stars: 18, // More stars earned
  totalXP: 8750, // Higher total XP
  badgesUnlocked: 12, // More badges unlocked
  achievementsUnlocked: 24, // More achievements
  questsCompleted: 35, // More quests completed
  streaksActive: 4, // More active streaks
  lastUpdated: new Date()
};

// Demo achievements data - Add your own achievements here!
export const demoAchievements: DemoAchievement[] = [
  {
    id: 'first_meal',
    name: 'First Meal Logged',
    description: 'Log your first meal in the app',
    category: 'nutrition',
    rarity: 'common',
    icon: '🍽️',
    color: '#10B981',
    xpReward: 50,
    coinReward: 10,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    progress: 1,
    target: 1,
    isNew: false
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: 'consistency',
    rarity: 'uncommon',
    icon: '🔥',
    color: '#F59E0B',
    xpReward: 200,
    coinReward: 50,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    progress: 7,
    target: 7,
    isNew: false
  },
  {
    id: 'level_7',
    name: 'Level 7 Champion',
    description: 'Reach level 7',
    category: 'progression',
    rarity: 'rare',
    icon: '⭐',
    color: '#8B5CF6',
    xpReward: 700,
    coinReward: 150,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    progress: 7,
    target: 7,
    isNew: true
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all daily goals for 7 days',
    category: 'consistency',
    rarity: 'epic',
    icon: '🏆',
    color: '#EF4444',
    xpReward: 1000,
    coinReward: 250,
    isUnlocked: false,
    progress: 5,
    target: 7,
    isNew: false
  },
  {
    id: 'nutrition_expert',
    name: 'Nutrition Expert',
    description: 'Log 100 meals with complete nutrition data',
    category: 'nutrition',
    rarity: 'legendary',
    icon: '🥗',
    color: '#F59E0B',
    xpReward: 2000,
    coinReward: 500,
    isUnlocked: false,
    progress: 67,
    target: 100,
    isNew: false
  },
  {
    id: 'hydration_master',
    name: 'Hydration Master',
    description: 'Drink 8+ glasses of water for 30 days',
    category: 'health',
    rarity: 'epic',
    icon: '💧',
    color: '#3B82F6',
    xpReward: 1500,
    coinReward: 300,
    isUnlocked: false,
    progress: 18,
    target: 30,
    isNew: false
  },
  {
    id: 'fitness_fanatic',
    name: 'Fitness Fanatic',
    description: 'Complete 50 workout sessions',
    category: 'fitness',
    rarity: 'rare',
    icon: '💪',
    color: '#EF4444',
    xpReward: 800,
    coinReward: 200,
    isUnlocked: false,
    progress: 32,
    target: 50,
    isNew: false
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log breakfast before 8 AM for 14 days',
    category: 'nutrition',
    rarity: 'uncommon',
    icon: '🌅',
    color: '#F59E0B',
    xpReward: 300,
    coinReward: 75,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    progress: 14,
    target: 14,
    isNew: false
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share 10 achievements with friends',
    category: 'social',
    rarity: 'uncommon',
    icon: '🦋',
    color: '#8B5CF6',
    xpReward: 400,
    coinReward: 100,
    isUnlocked: false,
    progress: 6,
    target: 10,
    isNew: false
  },
  {
    id: 'streak_saver',
    name: 'Streak Saver',
    description: 'Use freeze tokens to save 5 streaks',
    category: 'consistency',
    rarity: 'rare',
    icon: '❄️',
    color: '#06B6D4',
    xpReward: 600,
    coinReward: 150,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    progress: 5,
    target: 5,
    isNew: false
  }
];

// Demo quests data - Add your own quests here!
export const demoQuests: DemoQuest[] = [
  {
    id: 'daily_water',
    name: 'Hydration Champion',
    description: 'Drink 10 glasses of water today for maximum health!',
    category: 'health',
    difficulty: 'medium',
    type: 'daily',
    xpReward: 150,
    coinReward: 40,
    progressTarget: 10,
    timeLimit: 24,
    isActive: true,
    isCompleted: false,
    progress: 6,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
    requirements: { waterGlasses: 10 },
    isNew: false
  },
  {
    id: 'weekly_exercise',
    name: 'Fitness Challenge',
    description: 'Complete 5 workout sessions this week',
    category: 'fitness',
    difficulty: 'medium',
    type: 'weekly',
    xpReward: 500,
    coinReward: 100,
    progressTarget: 5,
    timeLimit: 168,
    isActive: true,
    isCompleted: false,
    progress: 3,
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    requirements: { workoutSessions: 5 },
    isNew: false
  },
  {
    id: 'meal_prep',
    name: 'Meal Prep Master',
    description: 'Prepare 3 meals for the week',
    category: 'nutrition',
    difficulty: 'hard',
    type: 'weekly',
    xpReward: 750,
    coinReward: 150,
    progressTarget: 3,
    timeLimit: 168,
    isActive: false,
    isCompleted: false,
    progress: 0,
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    requirements: { preparedMeals: 3 },
    isNew: true
  },
  {
    id: 'morning_routine',
    name: 'Morning Warrior',
    description: 'Complete your morning routine: breakfast, water, and exercise',
    category: 'lifestyle',
    difficulty: 'easy',
    type: 'daily',
    xpReward: 150,
    coinReward: 30,
    progressTarget: 3,
    timeLimit: 24,
    isActive: true,
    isCompleted: false,
    progress: 2,
    startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000),
    requirements: { breakfast: 1, water: 1, exercise: 1 },
    isNew: false
  },
  {
    id: 'social_challenge',
    name: 'Social Butterfly',
    description: 'Share your progress with 3 friends this week',
    category: 'social',
    difficulty: 'medium',
    type: 'weekly',
    xpReward: 400,
    coinReward: 80,
    progressTarget: 3,
    timeLimit: 168,
    isActive: false,
    isCompleted: false,
    progress: 0,
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    requirements: { shares: 3 },
    isNew: true
  },
  {
    id: 'sleep_optimization',
    name: 'Sleep Optimizer',
    description: 'Get 7+ hours of sleep for 5 consecutive nights',
    category: 'health',
    difficulty: 'hard',
    type: 'weekly',
    xpReward: 600,
    coinReward: 120,
    progressTarget: 5,
    timeLimit: 168,
    isActive: true,
    isCompleted: false,
    progress: 3,
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    requirements: { sleepHours: 7, consecutiveNights: 5 },
    isNew: false
  },
  {
    id: 'macro_master',
    name: 'Macro Legend',
    description: 'Hit your macro targets for 5 days straight - the ultimate nutrition challenge!',
    category: 'nutrition',
    difficulty: 'legendary',
    type: 'weekly',
    xpReward: 2000,
    coinReward: 500,
    progressTarget: 5,
    timeLimit: 168,
    isActive: false,
    isCompleted: false,
    progress: 0,
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    requirements: { protein: 'target', carbs: 'target', fats: 'target', days: 5 },
    isNew: true
  }
];

// Demo streaks data - Customize your streaks here!
export const demoStreaks: DemoStreak[] = [
  {
    id: 'daily_login',
    name: 'Daily Login',
    description: 'Consecutive days of app usage',
    category: 'engagement',
    currentCount: 18,
    maxCount: 25,
    isActive: true,
    isProtected: false,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    freezeTokensUsed: 2,
    freezeTokensAvailable: 3,
    milestonesReached: [7, 10, 14],
    totalXP: 1800,
    totalCoins: 450
  },
  {
    id: 'meal_logging',
    name: 'Meal Logging',
    description: 'Consecutive days of logging all meals',
    category: 'nutrition',
    currentCount: 12,
    maxCount: 18,
    isActive: true,
    isProtected: true,
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
    protectionExpires: new Date(Date.now() + 6 * 60 * 60 * 1000),
    freezeTokensUsed: 1,
    freezeTokensAvailable: 2,
    milestonesReached: [3, 7, 10],
    totalXP: 1200,
    totalCoins: 300
  },
  {
    id: 'exercise',
    name: 'Exercise',
    description: 'Consecutive days of exercise logging',
    category: 'fitness',
    currentCount: 0,
    maxCount: 8,
    isActive: false,
    isProtected: false,
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    freezeTokensUsed: 0,
    freezeTokensAvailable: 2,
    milestonesReached: [3, 5],
    totalXP: 400,
    totalCoins: 100
  },
  {
    id: 'water_intake',
    name: 'Water Intake',
    description: 'Consecutive days of meeting water goals',
    category: 'health',
    currentCount: 9,
    maxCount: 12,
    isActive: true,
    isProtected: false,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000),
    freezeTokensUsed: 0,
    freezeTokensAvailable: 2,
    milestonesReached: [3, 7],
    totalXP: 900,
    totalCoins: 225
  },
  {
    id: 'sleep_tracking',
    name: 'Sleep Tracking',
    description: 'Consecutive days of logging sleep data',
    category: 'health',
    currentCount: 6,
    maxCount: 10,
    isActive: true,
    isProtected: false,
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
    freezeTokensUsed: 0,
    freezeTokensAvailable: 1,
    milestonesReached: [3],
    totalXP: 600,
    totalCoins: 150
  },
  {
    id: 'morning_routine',
    name: 'Morning Routine',
    description: 'Consecutive days of completing morning routine',
    category: 'lifestyle',
    currentCount: 4,
    maxCount: 7,
    isActive: true,
    isProtected: false,
    lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
    freezeTokensUsed: 0,
    freezeTokensAvailable: 1,
    milestonesReached: [3],
    totalXP: 400,
    totalCoins: 100
  }
];

// Demo leaderboard data - Customize your leaderboard here!
export const demoLeaderboardEntries: DemoLeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user-001',
    username: 'FitnessGuru',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    score: 25420,
    level: 15,
    xp: 5420,
    badges: 35,
    isCurrentUser: false
  },
  {
    rank: 2,
    userId: 'user-002',
    username: 'HealthyEater',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    score: 22850,
    level: 13,
    xp: 4850,
    badges: 32,
    isCurrentUser: false
  },
  {
    rank: 3,
    userId: 'user-003',
    username: 'WellnessWarrior',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    score: 20200,
    level: 12,
    xp: 4200,
    badges: 28,
    isCurrentUser: false
  },
  {
    rank: 4,
    userId: 'demo-user-123',
    username: 'You',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    score: 18750,
    level: 7,
    xp: 1250,
    badges: 12,
    isCurrentUser: true
  },
  {
    rank: 5,
    userId: 'user-005',
    username: 'NutritionNinja',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    score: 17200,
    level: 8,
    xp: 2200,
    badges: 25,
    isCurrentUser: false
  },
  {
    rank: 6,
    userId: 'user-006',
    username: 'ActiveLifestyle',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    score: 15800,
    level: 7,
    xp: 1800,
    badges: 22,
    isCurrentUser: false
  },
  {
    rank: 7,
    userId: 'user-007',
    username: 'HealthHacker',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    score: 14200,
    level: 6,
    xp: 1200,
    badges: 18,
    isCurrentUser: false
  },
  {
    rank: 8,
    userId: 'user-008',
    username: 'WellnessSeeker',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    score: 12800,
    level: 6,
    xp: 800,
    badges: 15,
    isCurrentUser: false
  },
  {
    rank: 9,
    userId: 'user-009',
    username: 'FitAndHealthy',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    score: 11200,
    level: 5,
    xp: 200,
    badges: 12,
    isCurrentUser: false
  },
  {
    rank: 10,
    userId: 'user-010',
    username: 'NutritionNewbie',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    score: 9800,
    level: 5,
    xp: 800,
    badges: 10,
    isCurrentUser: false
  },
  {
    rank: 11,
    userId: 'user-011',
    username: 'HydrationHero',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    score: 9200,
    level: 4,
    xp: 200,
    badges: 8,
    isCurrentUser: false
  },
  {
    rank: 12,
    userId: 'user-012',
    username: 'MealPrepMaster',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    score: 8800,
    level: 4,
    xp: 800,
    badges: 9,
    isCurrentUser: false
  }
];

// Demo data service functions
export const getDemoUserProgress = (): DemoUserProgress => demoUserProgress;

export const getDemoAchievements = (): DemoAchievement[] => demoAchievements;

export const getDemoQuests = (): DemoQuest[] => demoQuests;

export const getDemoStreaks = (): DemoStreak[] => demoStreaks;

export const getDemoLeaderboardEntries = (): DemoLeaderboardEntry[] => demoLeaderboardEntries;

// Helper functions for demo data
export const getNewAchievements = (): DemoAchievement[] => 
  demoAchievements.filter(achievement => achievement.isNew);

export const getActiveQuests = (): DemoQuest[] => 
  demoQuests.filter(quest => quest.isActive && !quest.isCompleted);

export const getAvailableQuests = (): DemoQuest[] => 
  demoQuests.filter(quest => !quest.isActive && !quest.isCompleted);

export const getActiveStreaks = (): DemoStreak[] => 
  demoStreaks.filter(streak => streak.isActive);

export const getAtRiskStreaks = (): DemoStreak[] => {
  const now = Date.now();
  return demoStreaks.filter(streak => {
    if (!streak.isActive) return false;
    
    const timeSinceLastActivity = now - streak.lastActivity.getTime();
    const hoursSinceLastActivity = timeSinceLastActivity / (1000 * 60 * 60);
    
    return hoursSinceLastActivity > 12; // At risk if no activity for 12+ hours
  });
};

// 🎨 CUSTOMIZATION FUNCTIONS - Use these to easily modify demo data!

/**
 * Update user progress for demo
 */
export const updateDemoUserProgress = (updates: Partial<DemoUserProgress>) => {
  Object.assign(demoUserProgress, updates);
  demoUserProgress.lastUpdated = new Date();
};

/**
 * Add a new achievement to demo data
 */
export const addDemoAchievement = (achievement: Omit<DemoAchievement, 'id'>) => {
  const newAchievement: DemoAchievement = {
    ...achievement,
    id: `achievement_${Date.now()}`,
  };
  demoAchievements.push(newAchievement);
  return newAchievement;
};

/**
 * Add a new quest to demo data
 */
export const addDemoQuest = (quest: Omit<DemoQuest, 'id'>) => {
  const newQuest: DemoQuest = {
    ...quest,
    id: `quest_${Date.now()}`,
  };
  demoQuests.push(newQuest);
  return newQuest;
};

/**
 * Add a new streak to demo data
 */
export const addDemoStreak = (streak: Omit<DemoStreak, 'id'>) => {
  const newStreak: DemoStreak = {
    ...streak,
    id: `streak_${Date.now()}`,
  };
  demoStreaks.push(newStreak);
  return newStreak;
};

/**
 * Mark an achievement as unlocked
 */
export const unlockDemoAchievement = (achievementId: string) => {
  const achievement = demoAchievements.find(a => a.id === achievementId);
  if (achievement) {
    achievement.isUnlocked = true;
    achievement.unlockedAt = new Date();
    achievement.isNew = true;
  }
};

/**
 * Complete a quest
 */
export const completeDemoQuest = (questId: string) => {
  const quest = demoQuests.find(q => q.id === questId);
  if (quest) {
    quest.isCompleted = true;
    quest.progress = quest.progressTarget;
  }
};

/**
 * Start a quest
 */
export const startDemoQuest = (questId: string) => {
  const quest = demoQuests.find(q => q.id === questId);
  if (quest) {
    quest.isActive = true;
    quest.startedAt = new Date();
    quest.expiresAt = new Date(Date.now() + quest.timeLimit * 60 * 60 * 1000);
  }
};

/**
 * Update streak count
 */
export const updateDemoStreak = (streakId: string, newCount: number) => {
  const streak = demoStreaks.find(s => s.id === streakId);
  if (streak) {
    streak.currentCount = newCount;
    streak.maxCount = Math.max(streak.maxCount, newCount);
    streak.lastActivity = new Date();
    streak.isActive = true;
  }
};

/**
 * 🎯 QUEST MODIFICATION FUNCTIONS
 * Use these functions to customize your quests!
 */

/**
 * Modify quest rewards (XP and coins)
 */
export const modifyQuestRewards = (questId: string, xpReward: number, coinReward: number) => {
  const quest = demoQuests.find(q => q.id === questId);
  if (quest) {
    quest.xpReward = xpReward;
    quest.coinReward = coinReward;
    console.log(`✅ Modified rewards for "${quest.name}": ${xpReward} XP, ${coinReward} coins`);
    return quest;
  }
  console.warn(`❌ Quest with ID "${questId}" not found`);
  return null;
};

/**
 * Modify quest difficulty
 */
export const modifyQuestDifficulty = (questId: string, difficulty: 'easy' | 'medium' | 'hard' | 'epic' | 'legendary') => {
  const quest = demoQuests.find(q => q.id === questId);
  if (quest) {
    quest.difficulty = difficulty;
    console.log(`✅ Modified difficulty for "${quest.name}": ${difficulty}`);
    return quest;
  }
  console.warn(`❌ Quest with ID "${questId}" not fou