// Leveling System - Level progression and requirements
// Sprint 7-8: Core Backend Development - Day 2 Task 2.2

import { logger } from './logger.js';

export class LevelingSystem {
  
  // XP requirements for each level (progressive scaling)
  static readonly LEVEL_XP_REQUIREMENTS = [
    0,      // Level 1 (starting level)
    100,    // Level 2
    250,    // Level 3
    450,    // Level 4
    700,    // Level 5
    1000,   // Level 6
    1350,   // Level 7
    1750,   // Level 8
    2200,   // Level 9
    2700,   // Level 10
    3250,   // Level 11
    3850,   // Level 12
    4500,   // Level 13
    5200,   // Level 14
    5950,   // Level 15
    6750,   // Level 16
    7600,   // Level 17
    8500,   // Level 18
    9450,   // Level 19
    10450,  // Level 20
    11500,  // Level 21
    12600,  // Level 22
    13750,  // Level 23
    14950,  // Level 24
    16200,  // Level 25
    17500,  // Level 26
    18850,  // Level 27
    20250,  // Level 28
    21700,  // Level 29
    23200,  // Level 30
    24800,  // Level 31
    26450,  // Level 32
    28150,  // Level 33
    29900,  // Level 34
    31700,  // Level 35
    33550,  // Level 36
    35450,  // Level 37
    37400,  // Level 38
    39400,  // Level 39
    41450,  // Level 40
    43550,  // Level 41
    45700,  // Level 42
    47900,  // Level 43
    50150,  // Level 44
    52450,  // Level 45
    54800,  // Level 46
    57200,  // Level 47
    59650,  // Level 48
    62150,  // Level 49
    64700,  // Level 50
    67300,  // Level 51
    69950,  // Level 52
    72650,  // Level 53
    75400,  // Level 54
    78200,  // Level 55
    81050,  // Level 56
    83950,  // Level 57
    86900,  // Level 58
    89900,  // Level 59
    92950,  // Level 60
    96050,  // Level 61
    99200,  // Level 62
    102400, // Level 63
    105650, // Level 64
    108950, // Level 65
    112300, // Level 66
    115700, // Level 67
    119150, // Level 68
    122650, // Level 69
    126200, // Level 70
    129800, // Level 71
    133450, // Level 72
    137150, // Level 73
    140900, // Level 74
    144700, // Level 75
    148550, // Level 76
    152450, // Level 77
    156400, // Level 78
    160400, // Level 79
    164450, // Level 80
    168550, // Level 81
    172700, // Level 82
    176900, // Level 83
    181150, // Level 84
    185450, // Level 85
    189800, // Level 86
    194200, // Level 87
    198650, // Level 88
    203150, // Level 89
    207700, // Level 90
    212300, // Level 91
    216950, // Level 92
    221650, // Level 93
    226400, // Level 94
    231200, // Level 95
    236050, // Level 96
    240950, // Level 97
    245900, // Level 98
    250900, // Level 99
    255950  // Level 100 (max level)
  ];

  // Level titles and special rewards
  static readonly LEVEL_TITLES = {
    1: 'Novice',
    5: 'Apprentice',
    10: 'Journeyman',
    15: 'Expert',
    20: 'Master',
    25: 'Grandmaster',
    30: 'Champion',
    40: 'Legend',
    50: 'Mythic',
    60: 'Transcendent',
    70: 'Divine',
    80: 'Celestial',
    90: 'Eternal',
    100: 'Godlike'
  };

  // Feature unlocks by level
  static readonly FEATURE_UNLOCKS = {
    5: ['advanced_quests', 'social_features'],
    10: ['leaderboards', 'achievement_gallery'],
    15: ['skill_trees', 'specialization'],
    20: ['guild_system', 'team_challenges'],
    25: ['premium_shop', 'exclusive_items'],
    30: ['seasonal_events', 'limited_editions'],
    40: ['mentor_system', 'teaching_bonuses'],
    50: ['custom_achievements', 'personal_quests'],
    60: ['beta_features', 'early_access'],
    70: ['exclusive_events', 'vip_status'],
    80: ['legendary_items', 'unique_titles'],
    90: ['cosmic_rewards', 'universe_access'],
    100: ['omnipotence', 'reality_control']
  };

  /**
   * Calculate level from total XP
   */
  static calculateLevel(totalXP) {
    for (let level = this.LEVEL_XP_REQUIREMENTS.length - 1; level >= 1; level--) {
      if (totalXP >= this.LEVEL_XP_REQUIREMENTS[level - 1]) {
        return level;
      }
    }
    return 1; // Minimum level
  }

  /**
   * Get XP required for a specific level
   */
  static getXPRequiredForLevel(level) {
    if (level < 1 || level > this.LEVEL_XP_REQUIREMENTS.length) {
      throw new Error(`Invalid level: ${level}`);
    }
    return this.LEVEL_XP_REQUIREMENTS[level - 1];
  }

  /**
   * Get XP required for next level
   */
  static getXPRequiredForNextLevel(currentLevel) {
    const nextLevel = currentLevel + 1;
    if (nextLevel > this.LEVEL_XP_REQUIREMENTS.length) {
      return 0; // Max level reached
    }
    return this.LEVEL_XP_REQUIREMENTS[nextLevel - 1];
  }

  /**
   * Calculate XP progress within current level
   */
  static calculateLevelProgress(currentXP, level) {
    const currentLevelXP = this.getXPRequiredForLevel(level);
    const nextLevelXP = this.getXPRequiredForNextLevel(level);
    
    if (nextLevelXP === 0) {
      return 100; // Max level reached
    }
    
    const progressXP = currentXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    
    return Math.min(100, Math.max(0, (progressXP / requiredXP) * 100));
  }

  /**
   * Process level up and return results
   */
  static processLevelUp({ currentLevel, currentXP, totalXP }) {
    const newLevel = this.calculateLevel(totalXP);
    const leveledUp = newLevel > currentLevel;
    
    if (!leveledUp) {
      return {
        newLevel: currentLevel,
        newCurrentXP: currentXP,
        leveledUp: false,
        bonusCoins: 0,
        bonusMultiplier: 1.0,
        unlockedFeatures: [],
        title: this.LEVEL_TITLES[currentLevel] || 'Unknown'
      };
    }

    // Calculate new current XP (XP within the new level)
    const newLevelXP = this.getXPRequiredForLevel(newLevel);
    const newCurrentXP = totalXP - newLevelXP;

    // Calculate level up bonus
    const bonusCoins = this.calculateLevelUpBonus(newLevel);
    const bonusMultiplier = this.calculateLevelUpMultiplier(newLevel);

    // Get unlocked features
    const unlockedFeatures = this.getUnlockedFeatures(newLevel);

    // Get new title
    const title = this.LEVEL_TITLES[newLevel] || 'Unknown';

    logger.info('Level up processed', {
      oldLevel: currentLevel,
      newLevel,
      totalXP,
      bonusCoins,
      unlockedFeatures
    });

    return {
      newLevel,
      newCurrentXP,
      leveledUp: true,
      bonusCoins,
      bonusMultiplier,
      unlockedFeatures,
      title,
      celebrationMessage: this.generateCelebrationMessage(newLevel, title)
    };
  }

  /**
   * Calculate level up bonus coins
   */
  static calculateLevelUpBonus(level) {
    // Base bonus + level-based bonus
    return 50 + (level * 10);
  }

  /**
   * Calculate level up bonus multiplier
   */
  static calculateLevelUpMultiplier(level) {
    // Slight multiplier increase with level
    return 1.0 + (level * 0.01);
  }

  /**
   * Get features unlocked at a specific level
   */
  static getUnlockedFeatures(level) {
    const unlockedFeatures = [];
    
    for (const [unlockLevel, features] of Object.entries(this.FEATURE_UNLOCKS)) {
      if (level >= parseInt(unlockLevel)) {
        unlockedFeatures.push(...features);
      }
    }
    
    return unlockedFeatures;
  }

  /**
   * Get newly unlocked features (features unlocked at this level but not previous)
   */
  static getNewlyUnlockedFeatures(currentLevel, newLevel) {
    const currentFeatures = this.getUnlockedFeatures(currentLevel);
    const newFeatures = this.getUnlockedFeatures(newLevel);
    
    return newFeatures.filter(feature => !currentFeatures.includes(feature));
  }

  /**
   * Generate celebration message for level up
   */
  static generateCelebrationMessage(level, title) {
    const messages = [
      `🎉 Congratulations! You've reached Level ${level} and earned the title "${title}"!`,
      `🌟 Amazing! Level ${level} achieved! You are now a "${title}"!`,
      `✨ Incredible progress! Welcome to Level ${level}, "${title}"!`,
      `🏆 Outstanding! You've ascended to Level ${level} and become a "${title}"!`,
      `🎊 Fantastic! Level ${level} unlocked! Your new title: "${title}"!`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get level statistics
   */
  static getLevelStats(level) {
    const xpRequired = this.getXPRequiredForLevel(level);
    const nextLevelXP = this.getXPRequiredForNextLevel(level);
    const xpToNext = nextLevelXP - xpRequired;
    const title = this.LEVEL_TITLES[level] || 'Unknown';
    const features = this.getUnlockedFeatures(level);
    
    return {
      level,
      title,
      xpRequired,
      xpToNext,
      features,
      isMaxLevel: level >= this.LEVEL_XP_REQUIREMENTS.length
    };
  }

  /**
   * Calculate XP needed to reach a target level
   */
  static calculateXPToReachLevel(currentXP, targetLevel) {
    const targetXP = this.getXPRequiredForLevel(targetLevel);
    return Math.max(0, targetXP - currentXP);
  }

  /**
   * Get level distribution statistics
   */
  static getLevelDistribution() {
    return {
      totalLevels: this.LEVEL_XP_REQUIREMENTS.length,
      maxLevel: this.LEVEL_XP_REQUIREMENTS.length,
      maxXP: this.LEVEL_XP_REQUIREMENTS[this.LEVEL_XP_REQUIREMENTS.length - 1],
      averageXPPerLevel: this.calculateAverageXPPerLevel(),
      milestoneLevels: this.getMilestoneLevels()
    };
  }

  /**
   * Calculate average XP per level
   */
  static calculateAverageXPPerLevel() {
    const totalLevels = this.LEVEL_XP_REQUIREMENTS.length - 1;
    const totalXP = this.LEVEL_XP_REQUIREMENTS[this.LEVEL_XP_REQUIREMENTS.length - 1];
    return Math.round(totalXP / totalLevels);
  }

  /**
   * Get milestone levels (every 10 levels)
   */
  static getMilestoneLevels() {
    const milestones = [];
    for (let i = 10; i <= this.LEVEL_XP_REQUIREMENTS.length; i += 10) {
      milestones.push({
        level: i,
        xpRequired: this.getXPRequiredForLevel(i),
        title: this.LEVEL_TITLES[i] || 'Unknown',
        features: this.getUnlockedFeatures(i)
      });
    }
    return milestones;
  }

  /**
   * Validate level parameters
   */
  static validateLevel(level) {
    if (typeof level !== 'number' || level < 1 || level > this.LEVEL_XP_REQUIREMENTS.length) {
      throw new Error(`Invalid level: ${level}. Must be between 1 and ${this.LEVEL_XP_REQUIREMENTS.length}`);
    }
    return true;
  }

  /**
   * Get level progression curve data
   */
  static getLevelProgressionCurve(maxLevel = 50) {
    const curve = [];
    for (let level = 1; level <= Math.min(maxLevel, this.LEVEL_XP_REQUIREMENTS.length); level++) {
      curve.push({
        level,
        xpRequired: this.getXPRequiredForLevel(level),
        xpToNext: this.getXPRequiredForNextLevel(level) - this.getXPRequiredForLevel(level),
        title: this.LEVEL_TITLES[level] || 'Unknown'
      });
    }
    return curve;
  }
}
