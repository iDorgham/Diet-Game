#!/usr/bin/env node

/**
 * Icon Generation Script for Diet Game
 * Generates all required PWA icons from SVG templates
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Icon sizes required by PWA manifest
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

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

// Main app icon SVG template
const APP_ICON_SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
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
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bgGradient)" stroke="#FFFFFF" stroke-width="8"/>
  
  <!-- Main icon - Apple with bite -->
  <g transform="translate(256, 256)">
    <!-- Apple body -->
    <path d="M-60,-40 C-60,-80 -20,-100 20,-100 C60,-100 80,-80 80,-40 C80,0 60,20 20,20 C-20,20 -60,0 -60,-40 Z" 
          fill="url(#iconGradient)" stroke="#E5E7EB" stroke-width="2"/>
    
    <!-- Apple stem -->
    <rect x="-8" y="-100" width="16" height="20" rx="8" fill="#8B5CF6"/>
    
    <!-- Apple leaf -->
    <ellipse cx="15" cy="-90" rx="15" ry="8" fill="#10B981" transform="rotate(30 15 -90)"/>
    
    <!-- Bite mark -->
    <path d="M-20,-20 C-20,-30 -10,-35 0,-35 C10,-35 20,-30 20,-20" 
          fill="url(#bgGradient)" stroke="none"/>
    
    <!-- Nutrition elements -->
    <circle cx="-40" cy="30" r="6" fill="${COLORS.accent}"/>
    <circle cx="0" cy="40" r="6" fill="${COLORS.accent}"/>
    <circle cx="40" cy="30" r="6" fill="${COLORS.accent}"/>
  </g>
  
  <!-- Subtle pattern overlay -->
  <defs>
    <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="2" fill="#FFFFFF" opacity="0.1"/>
    </pattern>
  </defs>
  <rect width="512" height="512" fill="url(#dots)"/>
</svg>`;

// Maskable icon SVG template (with safe zone)
const MASKABLE_ICON_SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
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
  
  <!-- Safe zone background -->
  <rect width="512" height="512" fill="url(#bgGradient)"/>
  
  <!-- Main icon centered in safe zone (20% margin) -->
  <g transform="translate(256, 256) scale(0.6)">
    <!-- Apple body -->
    <path d="M-60,-40 C-60,-80 -20,-100 20,-100 C60,-100 80,-80 80,-40 C80,0 60,20 20,20 C-20,20 -60,0 -60,-40 Z" 
          fill="url(#iconGradient)" stroke="#E5E7EB" stroke-width="2"/>
    
    <!-- Apple stem -->
    <rect x="-8" y="-100" width="16" height="20" rx="8" fill="#8B5CF6"/>
    
    <!-- Apple leaf -->
    <ellipse cx="15" cy="-90" rx="15" ry="8" fill="#10B981" transform="rotate(30 15 -90)"/>
    
    <!-- Bite mark -->
    <path d="M-20,-20 C-20,-30 -10,-35 0,-35 C10,-35 20,-30 20,-20" 
          fill="url(#bgGradient)" stroke="none"/>
    
    <!-- Nutrition elements -->
    <circle cx="-40" cy="30" r="6" fill="${COLORS.accent}"/>
    <circle cx="0" cy="40" r="6" fill="${COLORS.accent}"/>
    <circle cx="40" cy="30" r="6" fill="${COLORS.accent}"/>
  </g>
</svg>`;

// Shortcut icons
const SHORTCUT_ICONS = {
  'task-shortcut': {
    name: 'Tasks',
    svg: `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="20" fill="url(#bgGradient)"/>
        <g transform="translate(48, 48)">
          <!-- Checklist -->
          <rect x="-30" y="-25" width="60" height="50" rx="8" fill="#FFFFFF" opacity="0.9"/>
          <line x1="-20" y1="-15" x2="-5" y2="0" stroke="${COLORS.success}" stroke-width="3" stroke-linecap="round"/>
          <line x1="-20" y1="0" x2="-5" y2="15" stroke="${COLORS.success}" stroke-width="3" stroke-linecap="round"/>
          <line x1="-20" y1="15" x2="5" y2="15" stroke="${COLORS.warning}" stroke-width="3" stroke-linecap="round"/>
          <circle cx="15" cy="15" r="3" fill="${COLORS.warning}"/>
        </g>
      </svg>`
  },
  'profile-shortcut': {
    name: 'Profile',
    svg: `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="20" fill="url(#bgGradient)"/>
        <g transform="translate(48, 48)">
          <!-- User profile -->
          <circle cx="0" cy="-10" r="12" fill="#FFFFFF" opacity="0.9"/>
          <path d="M-20,10 C-20,0 -10,-5 0,-5 C10,-5 20,0 20,10" fill="#FFFFFF" opacity="0.9"/>
        </g>
      </svg>`
  },
  'analytics-shortcut': {
    name: 'Analytics',
    svg: `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="20" fill="url(#bgGradient)"/>
        <g transform="translate(48, 48)">
          <!-- Chart bars -->
          <rect x="-25" y="15" width="8" height="20" fill="#FFFFFF" opacity="0.9"/>
          <rect x="-15" y="5" width="8" height="30" fill="#FFFFFF" opacity="0.9"/>
          <rect x="-5" y="-5" width="8" height="40" fill="#FFFFFF" opacity="0.9"/>
          <rect x="5" y="10" width="8" height="25" fill="#FFFFFF" opacity="0.9"/>
          <rect x="15" y="-10" width="8" height="45" fill="#FFFFFF" opacity="0.9"/>
        </g>
      </svg>`
  }
};

// Function to convert SVG to PNG
async function svgToPng(svgString, size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Create a data URL from SVG
  const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
  
  // Load and draw the image
  const img = await loadImage(svgDataUrl);
  ctx.drawImage(img, 0, 0, size, size);
  
  return canvas.toBuffer('image/png');
}

// Function to generate all icons
async function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  console.log('🎨 Generating Diet Game Icons...\n');
  
  // Generate standard app icons
  console.log('📱 Generating standard app icons...');
  for (const size of ICON_SIZES) {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    try {
      const pngBuffer = await svgToPng(APP_ICON_SVG, size);
      fs.writeFileSync(filepath, pngBuffer);
      console.log(`  ✅ Generated ${filename}`);
    } catch (error) {
      console.error(`  ❌ Failed to generate ${filename}:`, error.message);
    }
  }
  
  // Generate maskable icons
  console.log('\n🎭 Generating maskable icons...');
  for (const size of MASKABLE_SIZES) {
    const filename = `icon-maskable-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    
    try {
      const pngBuffer = await svgToPng(MASKABLE_ICON_SVG, size);
      fs.writeFileSync(filepath, pngBuffer);
      console.log(`  ✅ Generated ${filename}`);
    } catch (error) {
      console.error(`  ❌ Failed to generate ${filename}:`, error.message);
    }
  }
  
  // Generate shortcut icons
  console.log('\n⚡ Generating shortcut icons...');
  for (const [key, icon] of Object.entries(SHORTCUT_ICONS)) {
    const filename = `${key}.png`;
    const filepath = path.join(iconsDir, filename);
    
    try {
      const pngBuffer = await svgToPng(icon.svg, 96);
      fs.writeFileSync(filepath, pngBuffer);
      console.log(`  ✅ Generated ${filename} (${icon.name})`);
    } catch (error) {
      console.error(`  ❌ Failed to generate ${filename}:`, error.message);
    }
  }
  
  // Update SVG base files
  console.log('\n🎨 Updating SVG base files...');
  fs.writeFileSync(path.join(iconsDir, 'icon-base.svg'), APP_ICON_SVG);
  fs.writeFileSync(path.join(iconsDir, 'icon-maskable-base.svg'), MASKABLE_ICON_SVG);
  
  // Write shortcut SVG files
  for (const [key, icon] of Object.entries(SHORTCUT_ICONS)) {
    fs.writeFileSync(path.join(iconsDir, `${key}.svg`), icon.svg);
  }
  
  console.log('\n🎉 Icon generation complete!');
  console.log(`📁 Icons saved to: ${iconsDir}`);
  console.log('\n📋 Generated files:');
  console.log('  • Standard app icons (72x72 to 512x512)');
  console.log('  • Maskable icons (192x192, 512x512)');
  console.log('  • Shortcut icons (Tasks, Profile, Analytics)');
  console.log('  • SVG base files for future updates');
}

// Run the script
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons, COLORS };
