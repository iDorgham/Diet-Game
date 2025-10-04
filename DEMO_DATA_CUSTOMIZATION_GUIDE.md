# 🎨 Demo Data Customization Guide

## 🚀 **Enhanced Demo Data**

Your demo data has been significantly enhanced with more engaging content! Here's what's been improved:

### ✅ **What's New:**

#### **🎯 User Progress (Enhanced)**
- **Level 7** (up from 5) - More impressive progression
- **1,250 XP** (up from 750) - Better progress visualization
- **18 Stars** (up from 12) - More achievements earned
- **12 Badges** (up from 8) - More variety in rewards
- **24 Achievements** (up from 15) - More content to explore

#### **🏆 Achievements (10 Total - 5 New!)**
- **Level 7 Champion** - New level achievement
- **Hydration Master** - 30-day water challenge
- **Fitness Fanatic** - 50 workout sessions
- **Early Bird** - Morning routine achievement
- **Social Butterfly** - Social sharing challenge
- **Streak Saver** - Freeze token usage

#### **🎯 Quests (7 Total - 4 New!)**
- **Morning Warrior** - Daily routine quest
- **Social Butterfly** - Weekly sharing challenge
- **Sleep Optimizer** - Sleep tracking quest
- **Macro Master** - Epic nutrition challenge

#### **🔥 Streaks (6 Total - 2 New!)**
- **Sleep Tracking** - Sleep data logging
- **Morning Routine** - Daily routine streak
- Enhanced progression and milestones

#### **🏅 Leaderboard (12 Players - 2 New!)**
- **HydrationHero** - Water-focused player
- **MealPrepMaster** - Meal prep specialist
- Higher scores and more competitive rankings

## 🛠️ **How to Customize**

### **1. Quick Customizations**

#### **Change Your User Progress:**
```typescript
// In src/services/demoData.ts, find demoUserProgress and modify:
export const demoUserProgress: DemoUserProgress = {
  userId: 'demo-user-123',
  level: 10,        // ← Change your level
  xp: 2000,         // ← Change your XP
  xpToNextLevel: 2500, // ← Change XP needed for next level
  stars: 25,        // ← Change your stars
  // ... other properties
};
```

#### **Add Your Own Achievement:**
```typescript
// Use the helper function:
import { addDemoAchievement } from './src/services/demoData';

addDemoAchievement({
  name: 'My Custom Achievement',
  description: 'Complete a custom challenge',
  category: 'custom',
  rarity: 'rare',
  icon: '🎯',
  color: '#FF6B6B',
  xpReward: 500,
  coinReward: 100,
  isUnlocked: false,
  progress: 0,
  target: 10,
  isNew: false
});
```

#### **Add Your Own Quest:**
```typescript
// Use the helper function:
import { addDemoQuest } from './src/services/demoData';

addDemoQuest({
  name: 'My Custom Quest',
  description: 'Complete a custom challenge',
  category: 'custom',
  difficulty: 'medium',
  type: 'weekly',
  xpReward: 300,
  coinReward: 75,
  progressTarget: 5,
  timeLimit: 168,
  isActive: false,
  isCompleted: false,
  progress: 0,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  requirements: { customGoal: 5 },
  isNew: true
});
```

### **2. Advanced Customizations**

#### **Modify Existing Data:**
```typescript
// Directly edit the arrays in demoData.ts:

// Change achievement rewards
demoAchievements[0].xpReward = 100; // First meal achievement
demoAchievements[0].coinReward = 20;

// Change quest difficulty
demoQuests[0].difficulty = 'hard';
demoQuests[0].xpReward = 200;

// Change streak counts
demoStreaks[0].currentCount = 30; // Daily login streak
demoStreaks[0].maxCount = 35;
```

#### **Use Helper Functions:**
```typescript
import { 
  updateDemoUserProgress,
  unlockDemoAchievement,
  completeDemoQuest,
  startDemoQuest,
  updateDemoStreak,
  resetDemoData
} from './src/services/demoData';

// Update user progress
updateDemoUserProgress({ level: 10, xp: 2000 });

// Unlock an achievement
unlockDemoAchievement('level_7');

// Complete a quest
completeDemoQuest('daily_water');

// Start a quest
startDemoQuest('meal_prep');

// Update a streak
updateDemoStreak('daily_login', 25);

// Reset everything (for testing)
resetDemoData();
```

### **3. Content Ideas**

#### **Achievement Categories:**
- **nutrition** - Food and meal logging
- **fitness** - Exercise and workouts
- **health** - Sleep, water, wellness
- **consistency** - Streaks and habits
- **social** - Sharing and community
- **progression** - Levels and milestones
- **lifestyle** - Daily routines and habits

#### **Quest Types:**
- **daily** - 24-hour challenges
- **weekly** - 7-day challenges
- **monthly** - 30-day challenges

#### **Quest Difficulties:**
- **easy** - Simple, quick tasks
- **medium** - Moderate effort required
- **hard** - Challenging but achievable
- **epic** - Very challenging
- **legendary** - Extremely difficult

#### **Streak Categories:**
- **engagement** - App usage
- **nutrition** - Food logging
- **fitness** - Exercise
- **health** - Wellness tracking
- **lifestyle** - Daily routines

### **4. Emoji and Icons**

#### **Popular Achievement Icons:**
- 🏆 Trophy
- ⭐ Star
- 🔥 Fire
- 💪 Muscle
- 🥗 Salad
- 💧 Water
- 🌅 Sunrise
- 🦋 Butterfly
- ❄️ Snowflake
- 🎯 Target

#### **Quest Icons:**
- 📋 Clipboard
- 🎯 Target
- ⏰ Clock
- 🏃 Runner
- 🍎 Apple
- 💤 Sleep
- 🏋️ Weight
- 🧘 Meditation

#### **Streak Icons:**
- 🔥 Fire
- 📅 Calendar
- ⚡ Lightning
- 🎖️ Medal
- 🏅 Ribbon
- 💎 Diamond

## 🎮 **Testing Your Changes**

1. **Save the file** after making changes
2. **Refresh your browser** to see updates
3. **Navigate to Gamification** tab
4. **Explore all sections** to see your changes

## 🔄 **Quick Reset**

If you want to start fresh:
```typescript
import { resetDemoData } from './src/services/demoData';
resetDemoData(); // Resets everything to default state
```

## 🎉 **Have Fun!**

The demo data is now much more engaging and provides a great foundation for testing your gamification system. Customize it to match your vision and create the perfect demo experience for your users!

**Happy customizing! 🚀**
