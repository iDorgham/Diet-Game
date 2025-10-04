#!/usr/bin/env node

/**
 * Image Generation Script for Diet Game
 * Generates all required images, illustrations, and visual assets
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Import colors from icon generator
const { COLORS } = require('./generate-icons');

// Create directories
const createDirectories = () => {
  const dirs = [
    'public/images/achievements',
    'public/images/meals',
    'public/images/exercises',
    'public/images/ingredients',
    'public/images/onboarding',
    'public/images/illustrations',
    'public/images/backgrounds',
    'public/screenshots'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// Achievement badges
const ACHIEVEMENT_ICONS = {
  'first-meal': {
    name: 'First Meal',
    description: 'Log your first meal',
    svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.success};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#F3F4F6;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Badge background -->
        <circle cx="64" cy="64" r="60" fill="url(#bgGradient)" stroke="#FFFFFF" stroke-width="4"/>
        
        <!-- Plate with food -->
        <g transform="translate(64, 64)">
          <!-- Plate -->
          <circle cx="0" cy="0" r="25" fill="url(#iconGradient)" stroke="#E5E7EB" stroke-width="2"/>
          
          <!-- Food items -->
          <circle cx="-10" cy="-5" r="6" fill="${COLORS.accent}"/>
          <rect x="-5" y="5" width="10" height="8" rx="2" fill="${COLORS.success}"/>
          <ellipse cx="8" cy="0" rx="4" ry="6" fill="${COLORS.primary}"/>
          
          <!-- Fork -->
          <rect x="20" y="-15" width="2" height="20" fill="#6B7280"/>
          <rect x="18" y="-15" width="6" height="2" fill="#6B7280"/>
        </g>
        
        <!-- Sparkle effects -->
        <g opacity="0.8">
          <circle cx="20" cy="20" r="2" fill="#FFFFFF"/>
          <circle cx="108" cy="25" r="1.5" fill="#FFFFFF"/>
          <circle cx="25" cy="100" r="1" fill="#FFFFFF"/>
          <circle cx="100" cy="105" r="2" fill="#FFFFFF"/>
        </g>
      </svg>`
  },
  'streak-7': {
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.warning};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.accent};stop-opacity:1" />
          </linearGradient>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#F3F4F6;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Badge background -->
        <circle cx="64" cy="64" r="60" fill="url(#bgGradient)" stroke="#FFFFFF" stroke-width="4"/>
        
        <!-- Calendar with streak -->
        <g transform="translate(64, 64)">
          <!-- Calendar base -->
          <rect x="-20" y="-15" width="40" height="30" rx="4" fill="url(#iconGradient)" stroke="#E5E7EB" stroke-width="2"/>
          
          <!-- Calendar header -->
          <rect x="-20" y="-15" width="40" height="8" rx="4" fill="${COLORS.primary}"/>
          <text x="0" y="-9" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-size="6" font-weight="bold">7</text>
          
          <!-- Streak flames -->
          <g transform="translate(0, 20)">
            <path d="M-15,-5 C-15,-10 -10,-15 -5,-15 C0,-15 5,-10 5,-5 C5,0 0,5 -5,5 C-10,5 -15,0 -15,-5 Z" fill="${COLORS.warning}"/>
            <path d="M-10,-8 C-10,-12 -6,-15 -2,-15 C2,-15 6,-12 6,-8 C6,-4 2,0 -2,0 C-6,0 -10,-4 -10,-8 Z" fill="${COLORS.accent}"/>
          </g>
        </g>
        
        <!-- Fire particles -->
        <g opacity="0.6">
          <circle cx="30" cy="30" r="1" fill="${COLORS.warning}"/>
          <circle cx="95" cy="35" r="1.5" fill="${COLORS.accent}"/>
          <circle cx="35" cy="95" r="1" fill="${COLORS.warning}"/>
          <circle cx="90" cy="90" r="1" fill="${COLORS.accent}"/>
        </g>
      </svg>`
  },
  'level-5': {
    name: 'Rising Star',
    description: 'Reach level 5',
    svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#F3F4F6;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Badge background -->
        <circle cx="64" cy="64" r="60" fill="url(#bgGradient)" stroke="#FFFFFF" stroke-width="4"/>
        
        <!-- Star -->
        <g transform="translate(64, 64)">
          <path d="M0,-20 L6,-6 L20,-6 L10,2 L16,16 L0,8 L-16,16 L-10,2 L-20,-6 L-6,-6 Z" 
                fill="url(#iconGradient)" stroke="#E5E7EB" stroke-width="2"/>
          
          <!-- Level number -->
          <text x="0" y="25" text-anchor="middle" fill="${COLORS.primary}" font-family="Arial" font-size="16" font-weight="bold">5</text>
        </g>
        
        <!-- Sparkle effects -->
        <g opacity="0.8">
          <circle cx="25" cy="25" r="2" fill="#FFFFFF"/>
          <circle cx="100" cy="30" r="1.5" fill="#FFFFFF"/>
          <circle cx="30" cy="100" r="1" fill="#FFFFFF"/>
          <circle cx="95" cy="95" r="2" fill="#FFFFFF"/>
          <circle cx="15" cy="80" r="1" fill="#FFFFFF"/>
          <circle cx="110" cy="70" r="1.5" fill="#FFFFFF"/>
        </g>
      </svg>`
  }
};

// Meal type icons
const MEAL_ICONS = {
  'breakfast': {
    name: 'Breakfast',
    svg: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.accent};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.warning};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Plate -->
        <circle cx="32" cy="40" r="20" fill="url(#bgGradient)" stroke="#FFFFFF" stroke-width="2"/>
        
        <!-- Pancakes -->
        <ellipse cx="32" cy="35" rx="12" ry="3" fill="#8B4513"/>
        <ellipse cx="32" cy="38" rx="12" ry="3" fill="#A0522D"/>
        <ellipse cx="32" cy="41" rx="12" ry="3" fill="#8B4513"/>
        
        <!-- Syrup -->
        <path d="M20,35 Q32,30 44,35" stroke="#8B4513" stroke-width="2" fill="none"/>
        
        <!-- Butter -->
        <rect x="30" y="33" width="4" height="2" fill="#FFD700"/>
        
        <!-- Fork -->
        <rect x="45" y="25" width="1" height="10" fill="#6B7280"/>
        <rect x="44" y="25" width="3" height="1" fill="#6B7280"/>
      </svg>`
  },
  'lunch': {
    name: 'Lunch',
    svg: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.success};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Plate -->
        <circle cx="32" cy="40" r="20" fill="url(#bgGradient)" stroke="#FFFFFF" stroke-width="2"/>
        
        <!-- Salad bowl -->
        <path d="M20,35 Q32,30 44,35 Q44,45 32,45 Q20,45 20,35 Z" fill="#228B22"/>
        
        <!-- Vegetables -->
        <circle cx="28" cy="38" r="3" fill="#FF6347"/>
        <circle cx="36" cy="40" r="2" fill="#FFD700"/>
        <rect x="30" y="35" width="4" height="2" fill="#32CD32"/>
        <ellipse cx="32" cy="42" rx="3" ry="1" fill="#8B4513"/>
        
        <!-- Fork -->
        <rect x="45" y="25" width="1" height="10" fill="#6B7280"/>
        <rect x="44" y="25" width="3" height="1" fill="#6B7280"/>
      </svg>`
  },
  'dinner': {
    name: 'Dinner',
    svg: `
      <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Plate -->
        <circle cx="32" cy="40" r="20" fill="url(#bgGradient)" stroke="#FFFFFF" stroke-width="2"/>
        
        <!-- Main dish -->
        <ellipse cx="32" cy="38" rx="10" ry="6" fill="#8B4513"/>
        
        <!-- Side dishes -->
        <circle cx="25" cy="42" r="4" fill="#32CD32"/>
        <circle cx="39" cy="42" r="4" fill="#FF6347"/>
        
        <!-- Garnish -->
        <path d="M28,35 Q32,32 36,35" stroke="#FFD700" stroke-width="1" fill="none"/>
        
        <!-- Fork -->
        <rect x="45" y="25" width="1" height="10" fill="#6B7280"/>
        <rect x="44" y="25" width="3" height="1" fill="#6B7280"/>
      </svg>`
  }
};

// Hero background
const HERO_BACKGROUND_SVG = `
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:0.1" />
      <stop offset="50%" style="stop-color:${COLORS.secondary};stop-opacity:0.05" />
      <stop offset="100%" style="stop-color:${COLORS.accent};stop-opacity:0.1" />
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <circle cx="30" cy="30" r="1" fill="${COLORS.primary}" opacity="0.1"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="1920" height="1080" fill="url(#bgGradient)"/>
  <rect width="1920" height="1080" fill="url(#dots)"/>
  
  <!-- Floating elements -->
  <g opacity="0.3">
    <!-- Apple -->
    <circle cx="200" cy="200" r="40" fill="${COLORS.success}"/>
    <rect x="195" y="160" width="10" height="15" fill="#8B5CF6"/>
    
    <!-- Carrot -->
    <ellipse cx="1600" cy="300" rx="15" ry="40" fill="${COLORS.accent}"/>
    <ellipse cx="1600" cy="260" rx="8" ry="15" fill="#32CD32"/>
    
    <!-- Broccoli -->
    <circle cx="300" cy="800" r="25" fill="${COLORS.success}"/>
    <rect x="295" y="825" width="10" height="20" fill="#8B4513"/>
    
    <!-- Orange -->
    <circle cx="1500" cy="700" r="30" fill="${COLORS.accent}"/>
    
    <!-- Banana -->
    <ellipse cx="400" cy="400" rx="8" ry="35" fill="#FFD700" transform="rotate(30 400 400)"/>
  </g>
  
  <!-- Subtle grid -->
  <defs>
    <pattern id="grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="${COLORS.primary}" stroke-width="0.5" opacity="0.1"/>
    </pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#grid)"/>
</svg>`;

// Function to convert SVG to PNG
async function svgToPng(svgString, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
  const img = await loadImage(svgDataUrl);
  ctx.drawImage(img, 0, 0, width, height);
  
  return canvas.toBuffer('image/png');
}

// Function to generate all images
async function generateImages() {
  createDirectories();
  
  console.log('🎨 Generating Diet Game Images...\n');
  
  // Generate achievement badges
  console.log('🏆 Generating achievement badges...');
  for (const [key, achievement] of Object.entries(ACHIEVEMENT_ICONS)) {
    const filename = `${key}.png`;
    const filepath = path.join(__dirname, '..', 'public', 'images', 'achievements', filename);
    
    try {
      const pngBuffer = await svgToPng(achievement.svg, 128, 128);
      fs.writeFileSync(filepath, pngBuffer);
      console.log(`  ✅ Generated ${filename} (${achievement.name})`);
    } catch (error) {
      console.error(`  ❌ Failed to generate ${filename}:`, error.message);
    }
  }
  
  // Generate meal icons
  console.log('\n🍽️ Generating meal icons...');
  for (const [key, meal] of Object.entries(MEAL_ICONS)) {
    const filename = `${key}.png`;
    const filepath = path.join(__dirname, '..', 'public', 'images', 'meals', filename);
    
    try {
      const pngBuffer = await svgToPng(meal.svg, 64, 64);
      fs.writeFileSync(filepath, pngBuffer);
      console.log(`  ✅ Generated ${filename} (${meal.name})`);
    } catch (error) {
      console.error(`  ❌ Failed to generate ${filename}:`, error.message);
    }
  }
  
  // Generate hero background
  console.log('\n🌅 Generating hero background...');
  try {
    const heroPng = await svgToPng(HERO_BACKGROUND_SVG, 1920, 1080);
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'images', 'hero-bg.png'), heroPng);
    console.log('  ✅ Generated hero-bg.png');
  } catch (error) {
    console.error('  ❌ Failed to generate hero background:', error.message);
  }
  
  // Update SVG files
  console.log('\n📝 Updating SVG files...');
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'images', 'hero-bg.svg'), HERO_BACKGROUND_SVG);
  
  // Write achievement SVG files
  for (const [key, achievement] of Object.entries(ACHIEVEMENT_ICONS)) {
    fs.writeFileSync(
      path.join(__dirname, '..', 'public', 'images', 'achievements', `${key}.svg`), 
      achievement.svg
    );
  }
  
  // Write meal SVG files
  for (const [key, meal] of Object.entries(MEAL_ICONS)) {
    fs.writeFileSync(
      path.join(__dirname, '..', 'public', 'images', 'meals', `${key}.svg`), 
      meal.svg
    );
  }
  
  console.log('\n🎉 Image generation complete!');
  console.log('📁 Images saved to: public/images/');
  console.log('\n📋 Generated files:');
  console.log('  • Achievement badges (PNG + SVG)');
  console.log('  • Meal type icons (PNG + SVG)');
  console.log('  • Hero background (PNG + SVG)');
}

// Run the script
if (require.main === module) {
  generateImages().catch(console.error);
}

module.exports = { generateImages, ACHIEVEMENT_ICONS, MEAL_ICONS };
