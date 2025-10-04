# 🎯 Quest Modification Guide

## Overview
This guide shows you how to modify existing quests in your Diet Game to customize rewards, difficulty, requirements, and more!

## 🎮 Available Quest Modification Functions

### Individual Quest Modifications

#### 1. **Modify Quest Rewards**
```javascript
import { modifyQuestRewards } from './src/services/demoData';

// Increase rewards for Hydration Hero
modifyQuestRewards('daily_water', 200, 50); // 200 XP, 50 coins
```

#### 2. **Modify Quest Difficulty**
```javascript
import { modifyQuestDifficulty } from './src/services/demoData';

// Make Fitness Challenge harder
modifyQuestDifficulty('weekly_exercise', 'hard');
```

#### 3. **Modify Quest Requirements**
```javascript
import { modifyQuestRequirements } from './src/services/demoData';

// Change Hydration Hero to require 10 glasses instead of 8
modifyQuestRequirements('daily_water', 10, { waterGlasses: 10 });
```

#### 4. **Modify Quest Time Limit**
```javascript
import { modifyQuestTimeLimit } from './src/services/demoData';

// Give more time for Meal Prep Master
modifyQuestTimeLimit('meal_prep', 240); // 10 days instead of 7
```

#### 5. **Modify Quest Progress**
```javascript
import { modifyQuestProgress } from './src/services/demoData';

// Set progress for Hydration Hero to 6/8 glasses
modifyQuestProgress('daily_water', 6);
```

#### 6. **Modify Quest Description**
```javascript
import { modifyQuestDescription } from './src/services/demoData';

// Update quest name and description
modifyQuestDescription('daily_water', 'Hydration Champion', 'Drink 10 glasses of water today for maximum health!');
```

#### 7. **Modify Quest Category**
```javascript
import { modifyQuestCategory } from './src/services/demoData';

// Change category
modifyQuestCategory('morning_routine', 'wellness');
```

#### 8. **Modify Quest Type**
```javascript
import { modifyQuestType } from './src/services/demoData';

// Change from daily to weekly
modifyQuestType('morning_routine', 'weekly');
```

### Bulk Quest Modifications

#### 1. **Increase All Quest Rewards**
```javascript
import { increaseAllQuestRewards } from './src/services/demoData';

// Double all XP and coin rewards
increaseAllQuestRewards(2.0, 2.0);

// Increase XP by 50%, coins by 25%
increaseAllQuestRewards(1.5, 1.25);
```

#### 2. **Make All Quests Easier**
```javascript
import { makeAllQuestsEasier } from './src/services/demoData';

// Reduce difficulty of all quests by one level
makeAllQuestsEasier();
```

#### 3. **Make All Quests Harder**
```javascript
import { makeAllQuestsHarder } from './src/services/demoData';

// Increase difficulty of all quests by one level
makeAllQuestsHarder();
```

### Utility Functions

#### 1. **Get Quest by ID**
```javascript
import { getQuestById } from './src/services/demoData';

const quest = getQuestById('daily_water');
console.log(quest);
```

#### 2. **List All Quests**
```javascript
import { listAllQuests } from './src/services/demoData';

// Print all quests to console
listAllQuests();
```

## 🎯 Current Quest IDs

| Quest Name | Quest ID | Current Difficulty | Current Type |
|------------|----------|-------------------|--------------|
| Hydration Hero | `daily_water` | Easy | Daily |
| Fitness Challenge | `weekly_exercise` | Medium | Weekly |
| Meal Prep Master | `meal_prep` | Hard | Weekly |
| Morning Warrior | `morning_routine` | Easy | Daily |
| Social Butterfly | `social_challenge` | Medium | Weekly |
| Sleep Optimizer | `sleep_optimization` | Hard | Weekly |
| Macro Master | `macro_master` | Epic | Weekly |

## 🎮 Example Modifications

### Example 1: Make Hydration Hero More Rewarding
```javascript
// Increase rewards and make it slightly harder
modifyQuestRewards('daily_water', 150, 40);
modifyQuestDifficulty('daily_water', 'medium');
modifyQuestRequirements('daily_water', 10, { waterGlasses: 10 });
```

### Example 2: Create a Super Challenge
```javascript
// Make Macro Master legendary with huge rewards
modifyQuestDifficulty('macro_master', 'legendary');
modifyQuestRewards('macro_master', 2000, 500);
modifyQuestRequirements('macro_master', 7, { 
  protein: 'target', 
  carbs: 'target', 
  fats: 'target', 
  days: 7 
});
```

### Example 3: Balance All Quests
```javascript
// Make all quests easier and increase rewards
makeAllQuestsEasier();
increaseAllQuestRewards(1.5, 1.5);
```

### Example 4: Create Daily Challenges
```javascript
// Convert some weekly quests to daily for more frequent engagement
modifyQuestType('social_challenge', 'daily');
modifyQuestTimeLimit('social_challenge', 24);
modifyQuestRequirements('social_challenge', 1, { shares: 1 });
```

## 🎯 Quest Categories Available

- `nutrition` - Food and diet related
- `fitness` - Exercise and physical activity
- `health` - General health and wellness
- `social` - Community and sharing features
- `lifestyle` - Daily habits and routines
- `wellness` - Mental and physical well-being
- `consistency` - Regular habits and streaks

## 🎯 Quest Difficulties Available

- `easy` - Green color, low rewards
- `medium` - Orange color, moderate rewards
- `hard` - Red color, high rewards
- `epic` - Purple color, very high rewards
- `legendary` - Gold color, maximum rewards

## 🎯 Quest Types Available

- `daily` - 24-hour time limit
- `weekly` - 168-hour (7-day) time limit
- `monthly` - 720-hour (30-day) time limit

## 🚀 Quick Start Examples

### Make the game more rewarding:
```javascript
increaseAllQuestRewards(2.0, 2.0); // Double all rewards
```

### Make the game easier:
```javascript
makeAllQuestsEasier();
```

### Create a hydration challenge:
```javascript
modifyQuestDescription('daily_water', 'Hydration Master', 'Drink 12 glasses of water today!');
modifyQuestRequirements('daily_water', 12, { waterGlasses: 12 });
modifyQuestRewards('daily_water', 200, 50);
modifyQuestDifficulty('daily_water', 'medium');
```

### Create a fitness marathon:
```javascript
modifyQuestDescription('weekly_exercise', 'Fitness Marathon', 'Complete 10 intense workout sessions this week!');
modifyQuestRequirements('weekly_exercise', 10, { workoutSessions: 10 });
modifyQuestRewards('weekly_exercise', 1000, 250);
modifyQuestDifficulty('weekly_exercise', 'epic');
```

## 💡 Tips for Quest Design

1. **Balance Rewards with Difficulty**: Harder quests should give better rewards
2. **Consider Time Limits**: Daily quests should be achievable in a day
3. **Progressive Difficulty**: Start easy, get harder as players level up
4. **Variety**: Mix different categories and types for engagement
5. **Clear Requirements**: Make quest objectives clear and measurable

## 🔧 Integration with Your App

These functions are already integrated into your demo data system. You can:

1. **Call them in your React components** to modify quests dynamically
2. **Use them in console** for testing and experimentation
3. **Create admin panels** that use these functions
4. **Build quest editors** for game masters

## 🎮 Next Steps

1. **Try the examples above** in your browser console
2. **Create your own quest modifications** using the functions
3. **Test different difficulty curves** to find what works best
4. **Build quest management UI** using these functions as a foundation

Happy quest designing! 🎯✨
