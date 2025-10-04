// XP System utilities following docs/gamification/xp-system.md
// EARS-GAM-001 through EARS-GAM-005 implementation

export const XP_REWARDS = {
  MEAL: 15,           // Basic meal completion
  SHOPPING: 20,       // Shopping task completion
  COOKING: 30,        // Cooking/prep tasks
  EXERCISE: 40,       // Workout logging
  WATER: 15,          // Hydration goals
  DAILY_CHECKIN: 20,  // Daily check-in
  AI_CHAT: 10,        // AI coach interaction
} as const;

export const STAR_THRESHOLDS = [50, 250, 750, 2000, 5000];

export const STREAK_MULTIPLIERS = {
  3: 1.2,    // 20% bonus for 3-day streak
  7: 1.5,    // 50% bonus for 7-day streak
  14: 2.0,   // 100% bonus for 14-day streak
  30: 3.0,   // 200% bonus for 30-day streak
} as const;

/**
 * Calculate XP required for next level
 * EARS-GAM-002: XP required = level × 100
 */
export const calculateXPForNextLevel = (level: number): number => {
  return level * 100;
};

/**
 * Check and apply level up logic
 * EARS-GAM-003: Award bonus coins (+50) for each level up
 * EARS-GAM-004: Display level up notifications
 */
export const checkAndApplyLevelUp = (
  currentProgress: { level: number; currentXP: number; coins: number },
  xpGained: number,
  setMessage: (msg: string) => void
): { level: number; currentXP: number; bonusCoins: number; leveledUp: boolean } => {
  let { level, currentXP, coins } = currentProgress;
  let newXP = currentXP + xpGained;
  let leveledUp = false;
  let bonusCoins = 0;

  while (newXP >= calculateXPForNextLevel(level)) {
    const xpRequired = calculateXPForNextLevel(level);
    newXP -= xpRequired;
    level += 1;
    leveledUp = true;
    bonusCoins += 50;
    setMessage(`✨ Congratulations! You reached Level ${level}! (+${bonusCoins} Bonus Coins!)`);
  }

  return {
    level,
    currentXP: newXP,
    bonusCoins,
    leveledUp
  };
};

/**
 * Calculate number of stars based on score
 * Following star milestone system from docs/gamification/xp-system.md
 */
export const calculateStars = (score: number): number => {
  return STAR_THRESHOLDS.filter(threshold => score >= threshold).length;
};

/**
 * Get next star threshold
 */
export const getNextStarThreshold = (score: number): number | null => {
  const currentStars = calculateStars(score);
  if (currentStars >= STAR_THRESHOLDS.length) return null;
  return STAR_THRESHOLDS[currentStars];
};

/**
 * Calculate score remaining until next star
 */
export const getScoreRemainingForNextStar = (score: number): number => {
  const nextThreshold = getNextStarThreshold(score);
  return nextThreshold ? nextThreshold - score : 0;
};

/**
 * Award XP for task completion
 * EARS-GAM-001: Award XP based on task type and difficulty
 */
export const awardXPForTask = (taskType: string, streakDays: number = 0): number => {
  let baseXP = XP_REWARDS[taskType as keyof typeof XP_REWARDS] || 10;
  
  // Apply streak multiplier
  if (streakDays >= 30) baseXP *= STREAK_MULTIPLIERS[30];
  else if (streakDays >= 14) baseXP *= STREAK_MULTIPLIERS[14];
  else if (streakDays >= 7) baseXP *= STREAK_MULTIPLIERS[7];
  else if (streakDays >= 3) baseXP *= STREAK_MULTIPLIERS[3];
  
  return Math.round(baseXP);
};

/**
 * Calculate XP progress percentage
 * EARS-GAM-005: Display XP progress with visual progress bars
 */
export const calculateXPProgress = (currentXP: number, level: number): number => {
  const nextLevelXP = calculateXPForNextLevel(level);
  return (currentXP / nextLevelXP) * 100;
};
