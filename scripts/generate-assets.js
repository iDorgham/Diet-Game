#!/usr/bin/env node

/**
 * Complete Asset Generation Script for Diet Game
 * Generates all icons, images, and visual assets for the application
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Color scheme for Diet Game
const COLORS = {
  primary: '#4F46E5',      // Indigo
  secondary: '#10B981',    // Emerald
  accent: '#F59E0B',       // Amber
  background: '#F9FAFB',   // Gray 50
  text: '#111827',         // Gray 900
  success: '#059669',      // Emerald 600
  warning: '#D97706',      // Amber 600
  error: '#DC2626',        // Red 600
  info: '#2563EB'          // Blue 600
};

// Asset generation status
const status = {
  icons: false,
  images: false,
  screenshots: false,
  total: 0,
  completed: 0
};

// Function to run a script and handle errors
function runScript(scriptPath, description) {
  try {
    console.log(`\n🚀 ${description}...`);
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Function to create placeholder screenshots
function createPlaceholderScreenshots() {
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  console.log('\n📱 Creating placeholder screenshots...');
  
  // Desktop screenshot placeholder
  const desktopScreenshot = `
    <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${COLORS.background};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${COLORS.primary};stop-opacity:0.1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1280" height="720" fill="url(#bgGradient)"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="1280" height="80" fill="${COLORS.primary}"/>
      <text x="640" y="50" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-size="24" font-weight="bold">NutriQuest - Desktop Dashboard</text>
      
      <!-- Main content area -->
      <rect x="40" y="100" width="1200" height="580" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="2" rx="8"/>
      
      <!-- Dashboard cards -->
      <rect x="60" y="120" width="280" height="200" fill="${COLORS.primary}" opacity="0.1" rx="8"/>
      <text x="200" y="140" text-anchor="middle" fill="${COLORS.primary}" font-family="Arial" font-size="16" font-weight="bold">Today's Progress</text>
      
      <rect x="360" y="120" width="280" height="200" fill="${COLORS.secondary}" opacity="0.1" rx="8"/>
      <text x="500" y="140" text-anchor="middle" fill="${COLORS.secondary}" font-family="Arial" font-size="16" font-weight="bold">Meal Logging</text>
      
      <rect x="660" y="120" width="280" height="200" fill="${COLORS.accent}" opacity="0.1" rx="8"/>
      <text x="800" y="140" text-anchor="middle" fill="${COLORS.accent}" font-family="Arial" font-size="16" font-weight="bold">Achievements</text>
      
      <rect x="960" y="120" width="280" height="200" fill="${COLORS.success}" opacity="0.1" rx="8"/>
      <text x="1100" y="140" text-anchor="middle" fill="${COLORS.success}" font-family="Arial" font-size="16" font-weight="bold">AI Coach</text>
      
      <!-- Footer -->
      <text x="640" y="680" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="14">Desktop Screenshot - Coming Soon</text>
    </svg>`;
  
  // Mobile screenshot placeholder
  const mobileScreenshot = `
    <svg width="375" height="812" viewBox="0 0 375 812" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${COLORS.background};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${COLORS.primary};stop-opacity:0.1" />
        </linearGradient>
      </defs>
      
      <!-- Phone frame -->
      <rect x="0" y="0" width="375" height="812" fill="url(#bgGradient)" rx="20"/>
      
      <!-- Status bar -->
      <rect x="0" y="0" width="375" height="44" fill="${COLORS.primary}"/>
      <text x="187" y="28" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-size="12">9:41</text>
      
      <!-- Header -->
      <rect x="0" y="44" width="375" height="60" fill="${COLORS.primary}"/>
      <text x="187" y="80" text-anchor="middle" fill="#FFFFFF" font-family="Arial" font-size="18" font-weight="bold">NutriQuest</text>
      
      <!-- Main content -->
      <rect x="20" y="120" width="335" height="600" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1" rx="8"/>
      
      <!-- Dashboard elements -->
      <rect x="40" y="140" width="295" height="120" fill="${COLORS.primary}" opacity="0.1" rx="8"/>
      <text x="187" y="160" text-anchor="middle" fill="${COLORS.primary}" font-family="Arial" font-size="14" font-weight="bold">Today's Progress</text>
      
      <rect x="40" y="280" width="295" height="120" fill="${COLORS.secondary}" opacity="0.1" rx="8"/>
      <text x="187" y="300" text-anchor="middle" fill="${COLORS.secondary}" font-family="Arial" font-size="14" font-weight="bold">Quick Log Meal</text>
      
      <rect x="40" y="420" width="295" height="120" fill="${COLORS.accent}" opacity="0.1" rx="8"/>
      <text x="187" y="440" text-anchor="middle" fill="${COLORS.accent}" font-family="Arial" font-size="14" font-weight="bold">Achievements</text>
      
      <rect x="40" y="560" width="295" height="120" fill="${COLORS.success}" opacity="0.1" rx="8"/>
      <text x="187" y="580" text-anchor="middle" fill="${COLORS.success}" font-family="Arial" font-size="14" font-weight="bold">AI Coach Chat</text>
      
      <!-- Bottom navigation -->
      <rect x="0" y="740" width="375" height="72" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
      
      <!-- Footer -->
      <text x="187" y="800" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="12">Mobile Screenshot - Coming Soon</text>
    </svg>`;
  
  // Write screenshot files
  fs.writeFileSync(path.join(screenshotsDir, 'desktop-home.svg'), desktopScreenshot);
  fs.writeFileSync(path.join(screenshotsDir, 'mobile-home.svg'), mobileScreenshot);
  
  console.log('  ✅ Created desktop-home.svg');
  console.log('  ✅ Created mobile-home.svg');
  
  return true;
}

// Function to create asset documentation
function createAssetDocumentation() {
  const docsDir = path.join(__dirname, '..', 'docs');
  const assetDocPath = path.join(docsDir, 'ASSETS.md');
  
  const assetDocumentation = `# Diet Game - Asset Documentation

## Overview

This document provides a comprehensive guide to all visual assets used in the Diet Game application, including icons, images, and their usage guidelines.

## 🎨 Design System

### Color Palette
- **Primary**: ${COLORS.primary} (Indigo) - Main brand color
- **Secondary**: ${COLORS.secondary} (Emerald) - Success states, positive actions
- **Accent**: ${COLORS.accent} (Amber) - Highlights, warnings, achievements
- **Background**: ${COLORS.background} (Gray 50) - Page backgrounds
- **Text**: ${COLORS.text} (Gray 900) - Primary text color
- **Success**: ${COLORS.success} (Emerald 600) - Success messages
- **Warning**: ${COLORS.warning} (Amber 600) - Warning messages
- **Error**: ${COLORS.error} (Red 600) - Error messages
- **Info**: ${COLORS.info} (Blue 600) - Information messages

### Typography
- **Primary Font**: Inter, system-ui, sans-serif
- **Monospace**: 'Fira Code', 'Monaco', 'Consolas', monospace

## 📱 PWA Icons

### Standard Icons
Located in \`public/icons/\`:
- \`icon-72x72.png\` - Small app icon
- \`icon-96x96.png\` - Medium app icon
- \`icon-128x128.png\` - Standard app icon
- \`icon-144x144.png\` - Windows tile icon
- \`icon-152x152.png\` - iOS home screen icon
- \`icon-192x192.png\` - Android home screen icon
- \`icon-384x384.png\` - Large app icon
- \`icon-512x512.png\` - Extra large app icon

### Maskable Icons
- \`icon-maskable-192x192.png\` - Android adaptive icon
- \`icon-maskable-512x512.png\` - Large adaptive icon

### Shortcut Icons
- \`task-shortcut.png\` - Tasks shortcut (96x96)
- \`profile-shortcut.png\` - Profile shortcut (96x96)
- \`analytics-shortcut.png\` - Analytics shortcut (96x96)

### SVG Base Files
- \`icon-base.svg\` - Main app icon template
- \`icon-maskable-base.svg\` - Maskable icon template
- \`task-shortcut.svg\` - Tasks icon template
- \`profile-shortcut.svg\` - Profile icon template
- \`analytics-shortcut.svg\` - Analytics icon template

## 🏆 Achievement Badges

Located in \`public/images/achievements/\`:

### Available Achievements
- **first-meal** - First Meal logged
- **streak-7** - 7-day streak maintained
- **level-5** - Reached level 5

### File Formats
Each achievement is available in:
- PNG format (128x128) for web display
- SVG format for scalable usage

## 🍽️ Meal Icons

Located in \`public/images/meals/\`:

### Meal Types
- **breakfast** - Morning meal icon
- **lunch** - Midday meal icon
- **dinner** - Evening meal icon

### File Formats
Each meal icon is available in:
- PNG format (64x64) for web display
- SVG format for scalable usage

## 🖼️ Background Images

### Hero Background
- **hero-bg.png** - High-resolution hero background (1920x1080)
- **hero-bg.svg** - Scalable hero background

### Usage Guidelines
- Use PNG for fixed-size displays
- Use SVG for responsive/resizable displays
- Maintain aspect ratio when scaling

## 📸 Screenshots

Located in \`public/screenshots/\`:

### PWA Screenshots
- **desktop-home.svg** - Desktop dashboard screenshot
- **mobile-home.svg** - Mobile dashboard screenshot

### Usage
These screenshots are used in the PWA manifest for app store listings and installation prompts.

## 🛠️ Asset Generation

### Scripts
- \`scripts/generate-assets.js\` - Complete asset generation
- \`scripts/generate-icons.js\` - Icon generation only
- \`scripts/generate-images.js\` - Image generation only

### Usage
\`\`\`bash
# Generate all assets
npm run generate-assets

# Generate icons only
npm run generate-icons

# Generate images only
npm run generate-images
\`\`\`

### Dependencies
- Node.js canvas library for PNG generation
- SVG templates for scalable graphics

## 📋 Asset Checklist

### Required for PWA
- [x] Standard app icons (72x72 to 512x512)
- [x] Maskable icons (192x192, 512x512)
- [x] Shortcut icons (96x96)
- [x] Screenshots (desktop, mobile)

### Required for App
- [x] Achievement badges
- [x] Meal type icons
- [x] Hero background
- [x] Logo variations

### Optional Enhancements
- [ ] Exercise illustrations
- [ ] Ingredient photos
- [ ] Onboarding illustrations
- [ ] Loading animations
- [ ] Error state illustrations

## 🎯 Best Practices

### Icon Design
- Use consistent stroke width (2px for 64x64, 4px for 128x128)
- Maintain visual hierarchy with proper contrast
- Ensure icons are recognizable at small sizes
- Use the established color palette

### Image Optimization
- Use SVG for scalable graphics
- Use PNG for complex images with transparency
- Optimize file sizes for web delivery
- Provide multiple resolutions for different use cases

### Accessibility
- Ensure sufficient color contrast (4.5:1 minimum)
- Provide alternative text for all images
- Use semantic color choices (green for success, red for errors)
- Test with screen readers

## 🔄 Maintenance

### Regular Updates
- Review and update assets quarterly
- Add new achievements and meal types as needed
- Update screenshots when UI changes
- Optimize file sizes regularly

### Version Control
- Keep SVG source files for easy editing
- Version control all generated assets
- Document changes in asset changelog
- Maintain backup of original designs

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
*Generated by: Diet Game Asset Generation System*
`;

  fs.writeFileSync(assetDocPath, assetDocumentation);
  console.log('  ✅ Created ASSETS.md documentation');
  
  return true;
}

// Main asset generation function
async function generateAllAssets() {
  console.log('🎨 Diet Game - Complete Asset Generation');
  console.log('==========================================\n');
  
  // Update status
  status.total = 4;
  
  // Generate icons
  status.icons = runScript('./generate-icons.js', 'Generating PWA icons');
  if (status.icons) status.completed++;
  
  // Generate images
  status.images = runScript('./generate-images.js', 'Generating images and illustrations');
  if (status.images) status.completed++;
  
  // Create placeholder screenshots
  status.screenshots = createPlaceholderScreenshots();
  if (status.screenshots) status.completed++;
  
  // Create documentation
  const docsCreated = createAssetDocumentation();
  if (docsCreated) status.completed++;
  
  // Summary
  console.log('\n🎉 Asset Generation Complete!');
  console.log('==============================');
  console.log(`✅ Icons: ${status.icons ? 'Generated' : 'Failed'}`);
  console.log(`✅ Images: ${status.images ? 'Generated' : 'Failed'}`);
  console.log(`✅ Screenshots: ${status.screenshots ? 'Created' : 'Failed'}`);
  console.log(`✅ Documentation: ${docsCreated ? 'Created' : 'Failed'}`);
  console.log(`\n📊 Progress: ${status.completed}/${status.total} completed`);
  
  if (status.completed === status.total) {
    console.log('\n🎊 All assets generated successfully!');
    console.log('\n📁 Generated files:');
    console.log('  • PWA icons (72x72 to 512x512)');
    console.log('  • Maskable icons (192x192, 512x512)');
    console.log('  • Shortcut icons (Tasks, Profile, Analytics)');
    console.log('  • Achievement badges (PNG + SVG)');
    console.log('  • Meal type icons (PNG + SVG)');
    console.log('  • Hero background (PNG + SVG)');
    console.log('  • Screenshot placeholders');
    console.log('  • Asset documentation');
    
    console.log('\n🚀 Next steps:');
    console.log('  1. Review generated assets in public/ directory');
    console.log('  2. Test PWA installation with new icons');
    console.log('  3. Update any hardcoded asset references');
    console.log('  4. Add new assets as needed for features');
  } else {
    console.log('\n⚠️  Some assets failed to generate. Check the errors above.');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateAllAssets().catch(console.error);
}

module.exports = { generateAllAssets, COLORS };
