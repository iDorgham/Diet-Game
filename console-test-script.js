// 🎮 Quest Modification Console Testing Script
// Copy and paste this entire script into your browser console

console.log('🎮 Loading Quest Modification Testing Script...');

// Function to load quest modification functions
async function loadQuestMods() {
    try {
        // Import the demo data module
        const module = await import('./src/services/demoData.js');
        window.questMods = module;
        console.log('✅ Quest modification functions loaded successfully!');
        console.log('Available functions:', Object.keys(module).filter(key => 
            key.startsWith('modify') || key.startsWith('increase') || 
            key.startsWith('make') || key.startsWith('get') || key.startsWith('list')
        ));
        return module;
    } catch (error) {
        console.error('❌ Error loading quest functions:', error);
        console.log('💡 Make sure your dev server is running (npm run dev)');
        return null;
    }
}

// Load the functions
loadQuestMods().then(questMods => {
    if (questMods) {
        console.log('🎯 Quest Modification Functions Ready!');
        console.log('Try these commands:');
        console.log('');
        console.log('// List all quests');
        console.log('questMods.listAllQuests();');
        console.log('');
        console.log('// Modify Hydration Champion rewards');
        console.log('questMods.modifyQuestRewards("daily_water", 300, 75);');
        console.log('');
        console.log('// Make Fitness Challenge legendary');
        console.log('questMods.modifyQuestDifficulty("weekly_exercise", "legendary");');
        console.log('');
        console.log('// Double all quest rewards');
        console.log('questMods.increaseAllQuestRewards(2.0, 2.0);');
        console.log('');
        console.log('// Make all quests easier');
        console.log('questMods.makeAllQuestsEasier();');
        console.log('');
        console.log('// Get specific quest details');
        console.log('questMods.getQuestById("daily_water");');
        console.log('');
        console.log('🎮 Happy testing!');
    }
});

// Quick test functions
window.testQuestMods = {
    // Test basic functionality
    testBasic: function() {
        if (!window.questMods) {
            console.log('❌ Quest functions not loaded');
            return;
        }
        
        console.log('🧪 Testing basic quest modifications...');
        
        // Test listing quests
        console.log('📋 Listing all quests:');
        window.questMods.listAllQuests();
        
        // Test getting a quest
        console.log('🔍 Getting Hydration Champion details:');
        const quest = window.questMods.getQuestById('daily_water');
        console.log(quest);
        
        console.log('✅ Basic tests completed!');
    },
    
    // Test reward modifications
    testRewards: function() {
        if (!window.questMods) {
            console.log('❌ Quest functions not loaded');
            return;
        }
        
        console.log('💰 Testing reward modifications...');
        
        // Modify Hydration Champion rewards
        window.questMods.modifyQuestRewards('daily_water', 200, 50);
        
        // Modify Fitness Challenge rewards
        window.questMods.modifyQuestRewards('weekly_exercise', 800, 200);
        
        // Check the changes
        const hydrationQuest = window.questMods.getQuestById('daily_water');
        const fitnessQuest = window.questMods.getQuestById('weekly_exercise');
        
        console.log('✅ Reward modifications completed!');
        console.log('Hydration Champion rewards:', hydrationQuest.xpReward, 'XP,', hydrationQuest.coinReward, 'coins');
        console.log('Fitness Challenge rewards:', fitnessQuest.xpReward, 'XP,', fitnessQuest.coinReward, 'coins');
    },
    
    // Test difficulty modifications
    testDifficulty: function() {
        if (!window.questMods) {
            console.log('❌ Quest functions not loaded');
            return;
        }
        
        console.log('⚡ Testing difficulty modifications...');
        
        // Make Hydration Champion harder
        window.questMods.modifyQuestDifficulty('daily_water', 'hard');
        
        // Make Fitness Challenge legendary
        window.questMods.modifyQuestDifficulty('weekly_exercise', 'legendary');
        
        // Check the changes
        const hydrationQuest = window.questMods.getQuestById('daily_water');
        const fitnessQuest = window.questMods.getQuestById('weekly_exercise');
        
        console.log('✅ Difficulty modifications completed!');
        console.log('Hydration Champion difficulty:', hydrationQuest.difficulty);
        console.log('Fitness Challenge difficulty:', fitnessQuest.difficulty);
    },
    
    // Test bulk modifications
    testBulk: function() {
        if (!window.questMods) {
            console.log('❌ Quest functions not loaded');
            return;
        }
        
        console.log('🎮 Testing bulk modifications...');
        
        // Double all rewards
        window.questMods.increaseAllQuestRewards(2.0, 2.0);
        console.log('💰 Doubled all quest rewards');
        
        // Make all quests easier
        window.questMods.makeAllQuestsEasier();
        console.log('😊 Made all quests easier');
        
        console.log('✅ Bulk modifications completed!');
    },
    
    // Test fun scenarios
    testScenarios: function() {
        if (!window.questMods) {
            console.log('❌ Quest functions not loaded');
            return;
        }
        
        console.log('🎯 Testing fun scenarios...');
        
        // Hydration Challenge
        window.questMods.modifyQuestDescription('daily_water', 'Hydration Master', 'Drink 15 glasses of water and become the ultimate hydration champion!');
        window.questMods.modifyQuestRequirements('daily_water', 15, { waterGlasses: 15 });
        window.questMods.modifyQuestDifficulty('daily_water', 'epic');
        window.questMods.modifyQuestRewards('daily_water', 500, 125);
        console.log('💧 Hydration Challenge activated!');
        
        // Fitness Marathon
        window.questMods.modifyQuestDescription('weekly_exercise', 'Fitness Marathon', 'Complete 15 workout sessions this week and become a fitness legend!');
        window.questMods.modifyQuestRequirements('weekly_exercise', 15, { workoutSessions: 15 });
        window.questMods.modifyQuestDifficulty('weekly_exercise', 'legendary');
        window.questMods.modifyQuestRewards('weekly_exercise', 2500, 750);
        console.log('💪 Fitness Marathon activated!');
        
        console.log('✅ Fun scenarios completed!');
    },
    
    // Run all tests
    runAll: function() {
        console.log('🚀 Running all quest modification tests...');
        this.testBasic();
        setTimeout(() => this.testRewards(), 1000);
        setTimeout(() => this.testDifficulty(), 2000);
        setTimeout(() => this.testBulk(), 3000);
        setTimeout(() => this.testScenarios(), 4000);
        setTimeout(() => {
            console.log('🎉 All tests completed! Check your gamification dashboard to see the changes.');
        }, 5000);
    }
};

// Make quest modification functions easily accessible
window.quest = {
    // Quick access to quest modification functions
    rewards: (id, xp, coins) => window.questMods?.modifyQuestRewards(id, xp, coins),
    difficulty: (id, diff) => window.questMods?.modifyQuestDifficulty(id, diff),
    requirements: (id, target, req) => window.questMods?.modifyQuestRequirements(id, target, req),
    progress: (id, prog) => window.questMods?.modifyQuestProgress(id, prog),
    description: (id, name, desc) => window.questMods?.modifyQuestDescription(id, name, desc),
    category: (id, cat) => window.questMods?.modifyQuestCategory(id, cat),
    type: (id, type) => window.questMods?.modifyQuestType(id, type),
    
    // Quick access to bulk functions
    doubleRewards: () => window.questMods?.increaseAllQuestRewards(2.0, 2.0),
    easier: () => window.questMods?.makeAllQuestsEasier(),
    harder: () => window.questMods?.makeAllQuestsHarder(),
    
    // Quick access to utility functions
    get: (id) => window.questMods?.getQuestById(id),
    list: () => window.questMods?.listAllQuests(),
    
    // Quest IDs for easy reference
    ids: {
        hydration: 'daily_water',
        fitness: 'weekly_exercise',
        mealPrep: 'meal_prep',
        morning: 'morning_routine',
        social: 'social_challenge',
        sleep: 'sleep_optimization',
        macro: 'macro_master'
    }
};

console.log('🎮 Quest Modification Testing Script Loaded!');
console.log('Available commands:');
console.log('- testQuestMods.runAll() - Run all tests');
console.log('- testQuestMods.testBasic() - Test basic functionality');
console.log('- testQuestMods.testRewards() - Test reward modifications');
console.log('- testQuestMods.testDifficulty() - Test difficulty modifications');
console.log('- testQuestMods.testBulk() - Test bulk modifications');
console.log('- testQuestMods.testScenarios() - Test fun scenarios');
console.log('');
console.log('Quick access functions:');
console.log('- quest.rewards("daily_water", 200, 50) - Modify rewards');
console.log('- quest.difficulty("daily_water", "hard") - Change difficulty');
console.log('- quest.doubleRewards() - Double all rewards');
console.log('- quest.easier() - Make all quests easier');
console.log('- quest.list() - List all quests');
console.log('');
console.log('Quest IDs: quest.ids.hydration, quest.ids.fitness, etc.');
console.log('');
console.log('🎯 Ready to test! Try: testQuestMods.runAll()');
