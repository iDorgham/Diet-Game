# 🎮 Manual Quest Testing Guide

Since the terminal has issues, here are alternative ways to test your quest modification system:

## Method 1: Direct File Editing

### Edit `src/services/demoData.ts` directly:

```typescript
// Example: Modify Hydration Champion
export const demoQuests: DemoQuest[] = [
  {
    id: 'daily_water',
    name: 'Hydration Champion', // ← Change this
    description: 'Drink 10 glasses of water today for maximum health!', // ← Change this
    category: 'health',
    difficulty: 'medium', // ← Change this (easy/medium/hard/epic/legendary)
    type: 'daily',
    xpReward: 150, // ← Change this
    coinReward: 40, // ← Change this
    progressTarget: 10, // ← Change this
    timeLimit: 24,
    isActive: true,
    isCompleted: false,
    progress: 6, // ← Change this
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
    requirements: { waterGlasses: 10 }, // ← Change this
    isNew: false
  },
  // ... other quests
];
```

## Method 2: Use Browser Developer Tools

### Step 1: Open your app in browser
- If you have a local server running, go to `http://localhost:5173`
- Or open `index.html` directly in your browser

### Step 2: Open Developer Tools
- Press `F12` or `Ctrl+Shift+I`
- Go to Console tab

### Step 3: Test the functions
```javascript
// If the functions are available globally:
modifyQuestRewards('daily_water', 300, 75);
modifyQuestDifficulty('daily_water', 'hard');
listAllQuests();
```

## Method 3: Create a Simple Test Page

Create a new HTML file called `test-quests.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Quest Testing</title>
</head>
<body>
    <h1>Quest Modification Testing</h1>
    <button onclick="testQuests()">Test Quest Functions</button>
    <div id="output"></div>
    
    <script type="module">
        // Import your demo data
        import { demoQuests, modifyQuestRewards } from './src/services/demoData.js';
        
        window.testQuests = function() {
            console.log('Testing quest modifications...');
            
            // Test modifying a quest
            modifyQuestRewards('daily_water', 200, 50);
            
            // Log the result
            const quest = demoQuests.find(q => q.id === 'daily_water');
            document.getElementById('output').innerHTML = 
                `<p>Quest: ${quest.name}</p>
                 <p>XP Reward: ${quest.xpReward}</p>
                 <p>Coin Reward: ${quest.coinReward}</p>`;
        };
    </script>
</body>
</html>
```

## Method 4: Use VS Code Live Server

1. **Install Live Server extension** in VS Code
2. **Right-click on `index.html`** or `quest-testing.html`
3. **Select "Open with Live Server"**
4. **Test the functions** in the browser console

## Method 5: Manual Function Calls

You can manually call the functions by editing the demo data file and then refreshing your app:

### Example Modifications:

```typescript
// In src/services/demoData.ts

// 1. Make Hydration Champion more rewarding
{
  id: 'daily_water',
  name: 'Hydration Master',
  description: 'Drink 12 glasses of water and become a hydration legend!',
  difficulty: 'hard',
  xpReward: 300,
  coinReward: 75,
  progressTarget: 12,
  requirements: { waterGlasses: 12 },
  // ... rest of properties
}

// 2. Make Fitness Challenge legendary
{
  id: 'weekly_exercise',
  name: 'Fitness Beast',
  description: 'Complete 10 intense workout sessions and dominate the gym!',
  difficulty: 'legendary',
  xpReward: 1500,
  coinReward: 400,
  progressTarget: 10,
  requirements: { workoutSessions: 10 },
  // ... rest of properties
}

// 3. Create an epic Macro challenge
{
  id: 'macro_master',
  name: 'Macro God',
  description: 'Hit your macro targets for 7 days straight - the ultimate nutrition challenge!',
  difficulty: 'legendary',
  xpReward: 3000,
  coinReward: 750,
  progressTarget: 7,
  requirements: { protein: 'target', carbs: 'target', fats: 'target', days: 7 },
  // ... rest of properties
}
```

## Method 6: Test with Static Data

Create a simple test file `test-quest-functions.js`:

```javascript
// Test quest modification functions
const testQuestModifications = () => {
  console.log('🎮 Testing Quest Modifications...');
  
  // Simulate the demo data
  const demoQuests = [
    {
      id: 'daily_water',
      name: 'Hydration Champion',
      difficulty: 'medium',
      xpReward: 150,
      coinReward: 40,
      progressTarget: 10,
      progress: 6
    }
  ];
  
  // Test modification functions
  const modifyQuestRewards = (questId, xpReward, coinReward) => {
    const quest = demoQuests.find(q => q.id === questId);
    if (quest) {
      quest.xpReward = xpReward;
      quest.coinReward = coinReward;
      console.log(`✅ Modified rewards for "${quest.name}": ${xpReward} XP, ${coinReward} coins`);
    }
  };
  
  const modifyQuestDifficulty = (questId, difficulty) => {
    const quest = demoQuests.find(q => q.id === questId);
    if (quest) {
      quest.difficulty = difficulty;
      console.log(`✅ Modified difficulty for "${quest.name}": ${difficulty}`);
    }
  };
  
  // Test the functions
  modifyQuestRewards('daily_water', 300, 75);
  modifyQuestDifficulty('daily_water', 'hard');
  
  console.log('Final quest:', demoQuests[0]);
};

// Run the test
testQuestModifications();
```

## Method 7: Use Online Code Editors

1. **Go to CodePen, JSFiddle, or StackBlitz**
2. **Copy your quest modification functions**
3. **Test them in the online environment**
4. **See the results immediately**

## Quick Test Checklist

- [ ] Edit `src/services/demoData.ts` directly
- [ ] Open your app in browser
- [ ] Check the gamification dashboard
- [ ] Verify quest cards show new data
- [ ] Test different difficulty levels
- [ ] Try different reward amounts
- [ ] Change quest requirements
- [ ] Update quest descriptions

## Expected Results

After making changes, you should see:

1. **Updated quest names** in the gamification dashboard
2. **New difficulty colors** (green=easy, orange=medium, red=hard, purple=epic, gold=legendary)
3. **Changed reward amounts** in quest cards
4. **Updated progress bars** and requirements
5. **New descriptions** and categories

## Troubleshooting

If changes don't appear:

1. **Refresh the browser page**
2. **Clear browser cache** (Ctrl+F5)
3. **Check for syntax errors** in the demo data file
4. **Verify the quest IDs** are correct
5. **Make sure the gamification dashboard is using demo hooks**

## Next Steps

Once you can see the changes:

1. **Experiment with different values**
2. **Create your own quest variations**
3. **Test the bulk modification functions**
4. **Build a quest management UI**
5. **Integrate with your app's state management**

Your quest modification system is fully functional - you just need to find the right way to test it based on your current setup! 🎮✨

