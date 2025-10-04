# 🎮 Console Testing Guide - Quest Modification Functions

## 🚀 Getting Started

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to your app (usually `http://localhost:5173`)

3. **Open Developer Tools**:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I`
   - **Firefox**: Press `F12` or `Ctrl+Shift+I`
   - **Safari**: Press `Cmd+Option+I`

4. **Go to the Console tab**

## 🎯 Available Functions to Test

### Import the Functions
First, you need to import the functions. In the console, type:

```javascript
// Import all quest modification functions
import('./src/services/demoData.js').then(module => {
  window.questMods = module;
  console.log('✅ Quest modification functions loaded!');
  console.log('Available functions:', Object.keys(module).filter(key => key.startsWith('modify') || key.startsWith('increase') || key.startsWith('make') || key.startsWith('get') || key.startsWith('list')));
});
```

### 🎯 Individual Quest Modifications

#### 1. **List All Current Quests**
```javascript
// See all quests and their current settings
window.questMods.listAllQuests();
```

#### 2. **Modify Quest Rewards**
```javascript
// Make Hydration Champion more rewarding
window.questMods.modifyQuestRewards('daily_water', 300, 75);

// Make Fitness Challenge give epic rewards
window.questMods.modifyQuestRewards('weekly_exercise', 1000, 250);
```

#### 3. **Modify Quest Difficulty**
```javascript
// Make Hydration Champion harder
window.questMods.modifyQuestDifficulty('daily_water', 'hard');

// Make Macro Legend even more legendary
window.questMods.modifyQuestDifficulty('macro_master', 'legendary');
```

#### 4. **Modify Quest Requirements**
```javascript
// Change Hydration Champion to require 12 glasses
window.questMods.modifyQuestRequirements('daily_water', 12, { waterGlasses: 12 });

// Make Fitness Challenge require 10 workouts
window.questMods.modifyQuestRequirements('weekly_exercise', 10, { workoutSessions: 10 });
```

#### 5. **Modify Quest Progress**
```javascript
// Set Hydration Champion progress to 8/10
window.questMods.modifyQuestProgress('daily_water', 8);

// Set Fitness Challenge progress to 7/5 (completed!)
window.questMods.modifyQuestProgress('weekly_exercise', 7);
```

#### 6. **Modify Quest Descriptions**
```javascript
// Update Hydration Champion name and description
window.questMods.modifyQuestDescription('daily_water', 'Water Warrior', 'Drink 12 glasses of water and become a hydration legend!');

// Update Fitness Challenge
window.questMods.modifyQuestDescription('weekly_exercise', 'Fitness Beast', 'Complete 10 intense workout sessions and dominate the gym!');
```

#### 7. **Modify Quest Categories**
```javascript
// Change Morning Warrior to wellness category
window.questMods.modifyQuestCategory('morning_routine', 'wellness');

// Change Social Butterfly to community category
window.questMods.modifyQuestCategory('social_challenge', 'community');
```

#### 8. **Modify Quest Types**
```javascript
// Make Social Challenge a daily quest
window.questMods.modifyQuestType('social_challenge', 'daily');

// Make Morning Warrior a weekly quest
window.questMods.modifyQuestType('morning_routine', 'weekly');
```

### 🎮 Bulk Modifications

#### 1. **Increase All Quest Rewards**
```javascript
// Double all XP and coin rewards
window.questMods.increaseAllQuestRewards(2.0, 2.0);

// Increase XP by 50%, coins by 25%
window.questMods.increaseAllQuestRewards(1.5, 1.25);
```

#### 2. **Make All Quests Easier**
```javascript
// Reduce difficulty of all quests by one level
window.questMods.makeAllQuestsEasier();
```

#### 3. **Make All Quests Harder**
```javascript
// Increase difficulty of all quests by one level
window.questMods.makeAllQuestsHarder();
```

### 🛠️ Utility Functions

#### 1. **Get Specific Quest**
```javascript
// Get Hydration Champion details
const quest = window.questMods.getQuestById('daily_water');
console.log(quest);
```

#### 2. **Check Quest Status**
```javascript
// Check if a quest is active
const quest = window.questMods.getQuestById('daily_water');
console.log(`Quest: ${quest.name}`);
console.log(`Active: ${quest.isActive}`);
console.log(`Completed: ${quest.isCompleted}`);
console.log(`Progress: ${quest.progress}/${quest.progressTarget}`);
```

## 🎯 Fun Testing Scenarios

### Scenario 1: "The Hydration Challenge"
```javascript
// Create an epic hydration challenge
window.questMods.modifyQuestDescription('daily_water', 'Hydration Master', 'Drink 15 glasses of water and become the ultimate hydration champion!');
window.questMods.modifyQuestRequirements('daily_water', 15, { waterGlasses: 15 });
window.questMods.modifyQuestDifficulty('daily_water', 'epic');
window.questMods.modifyQuestRewards('daily_water', 500, 125);
window.questMods.modifyQuestProgress('daily_water', 12);
```

### Scenario 2: "Fitness Marathon"
```javascript
// Create a legendary fitness challenge
window.questMods.modifyQuestDescription('weekly_exercise', 'Fitness Marathon', 'Complete 15 workout sessions this week and become a fitness legend!');
window.questMods.modifyQuestRequirements('weekly_exercise', 15, { workoutSessions: 15 });
window.questMods.modifyQuestDifficulty('weekly_exercise', 'legendary');
window.questMods.modifyQuestRewards('weekly_exercise', 2500, 750);
```

### Scenario 3: "Balanced Game Mode"
```javascript
// Make all quests easier and more rewarding
window.questMods.makeAllQuestsEasier();
window.questMods.increaseAllQuestRewards(1.5, 1.5);
```

### Scenario 4: "Hardcore Mode"
```javascript
// Make all quests harder but more rewarding
window.questMods.makeAllQuestsHarder();
window.questMods.increaseAllQuestRewards(2.0, 2.0);
```

## 🎮 Testing Checklist

### ✅ Basic Function Tests
- [ ] Import functions successfully
- [ ] List all quests
- [ ] Modify quest rewards
- [ ] Modify quest difficulty
- [ ] Modify quest requirements
- [ ] Modify quest progress
- [ ] Modify quest descriptions
- [ ] Modify quest categories
- [ ] Modify quest types

### ✅ Bulk Function Tests
- [ ] Increase all quest rewards
- [ ] Make all quests easier
- [ ] Make all quests harder

### ✅ Utility Function Tests
- [ ] Get quest by ID
- [ ] Check quest status
- [ ] Verify changes in UI

### ✅ Integration Tests
- [ ] Check if changes appear in the gamification dashboard
- [ ] Verify quest cards update with new data
- [ ] Test quest progress bars
- [ ] Check quest difficulty colors

## 🎯 Expected Results

After running the functions, you should see:

1. **Console Messages**: Success/error messages for each function
2. **UI Updates**: Changes reflected in the gamification dashboard
3. **Quest Cards**: Updated rewards, difficulty colors, progress bars
4. **Quest Lists**: New names, descriptions, and requirements

## 🚨 Troubleshooting

### If functions don't load:
```javascript
// Try this alternative import method
fetch('./src/services/demoData.ts')
  .then(response => response.text())
  .then(code => {
    console.log('Demo data file loaded');
    // Functions should be available in the global scope
  });
```

### If changes don't appear in UI:
1. **Refresh the page** to reload the demo data
2. **Check the console** for error messages
3. **Verify quest IDs** are correct
4. **Check if the gamification dashboard is using demo hooks**

### If you get import errors:
```javascript
// Use direct function calls (if functions are in global scope)
modifyQuestRewards('daily_water', 200, 50);
listAllQuests();
```

## 🎮 Pro Tips

1. **Start with `listAllQuests()`** to see current state
2. **Test one function at a time** to isolate issues
3. **Use `getQuestById()`** to verify changes
4. **Refresh the page** to see UI updates
5. **Try different quest IDs** to test various scenarios

## 🎯 Next Steps

After testing the functions:

1. **Create your own quest modifications**
2. **Build a quest management UI**
3. **Integrate with your app's state management**
4. **Add quest creation and deletion functions**
5. **Create quest templates and presets**

Happy testing! 🎮✨
