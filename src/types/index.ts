// TypeScript interfaces for Diet Planner Game
// Following SDD specifications from docs/

export interface UserProgress {
  score: number;           // Total score points
  coins: number;          // Currency for unlocks
  level: number;          // Current level
  currentXP: number;      // XP towards next level
  recipesUnlocked: number; // Premium recipes owned
  hasClaimedGift: boolean; // Onboarding gift status
}

export interface UserProfile {
  userName: string;
  dietType: string;
  bodyType: string;
  weight: string;
}

export interface Task {
  id: number;
  name: string;
  icon: any; // Lucide React icon type
  time: string;
  completed: boolean;
  type: 'Meal' | 'Shopping' | 'Cooking';
  scoreReward: number;
  coinReward: number;
  xpReward: number;
}

export interface LevelUpResult {
  level: number;
  currentXP: number;
  bonusCoins: number;
  leveledUp: boolean;
}

export interface HeaderStatus {
  currentDayTime: {
    day: string;
    time: string;
  };
  daysUntilNextPlan: number;
  dietType: string;
  nextCookingTime: {
    isPending: boolean;
    timeString: string;
    minutesRemaining: number;
    isPast?: boolean;
  };
  nextWorkoutTime: {
    isPending: boolean;
    timeString: string;
  };
}

export interface MetricCardProps {
  icon: any; // Lucide React icon type
  label: string;
  value: string;
  unitColor?: string;
  bgColor?: string;
}

export interface DashboardCardProps {
  icon: any; // Lucide React icon type
  label: string;
  value: string | number;
}

export interface NewsItem {
  text: string;
  icon: any; // Lucide React icon type
  color: string;
}

export interface ShoppingMetrics {
  itemsNo: number;
  totalWeight: string;
  totalPrice: string;
  protein: string;
  fats: string;
  calories: string;
  carbs: string;
}

export interface RecommendedMarket {
  name: string;
  location: string;
  call: string;
  website: string;
  reason: string;
}
