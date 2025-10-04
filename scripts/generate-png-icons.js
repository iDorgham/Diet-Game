#!/usr/bin/env node

/**
 * PNG Icon Generator for NutriQuest
 * Automatically converts SVG icons to PNG files for PWA
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Icon configurations
const iconConfigs = [
  // Standard icons
  { source: 'icon-base.svg', sizes: [72, 96, 128, 144, 152, 192, 384, 512], prefix: 'icon' },
  // Maskable icons
  { source: 'icon-maskable-base.svg', sizes: [192, 512], prefix: 'icon-maskable' },
  // Shortcut icons
  { source: 'task-shortcut.svg', sizes: [96], prefix: 'task-shortcut' },
  { source: 'profile-shortcut.svg', sizes: [96], prefix: 'profile-shortcut' },
  { source: 'analytics-shortcut.svg', sizes: [96], prefix: 'analytics-shortcut' }
];

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const outputDir = iconsDir;

async function generatePNGIcon(sourceFile, size, outputName) {
  try {
    const sourcePath = path.join(iconsDir, sourceFile);
    const outputPath = path.join(outputDir, outputName);
    
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Source file not found: ${sourceFile}`);
      return false;
    }
    
    // Read SVG content
    const svgContent = fs.readFileSync(sourcePath, 'utf8');
    
    // Create canvas
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Convert SVG to image
    const img = await loadImage(`data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`);
    
    // Draw image on canvas
    ctx.drawImage(img, 0, 0, size, size);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Generated: ${outputName} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating ${outputName}:`, error.message);
    return false;
  }
}

async function generateAllIcons() {
  console.log('🎮 NutriQuest PNG Icon Generator');
  console.log('================================\n');
  
  let successCount = 0;
  let totalCount = 0;
  
  for (const config of iconConfigs) {
    for (const size of config.sizes) {
      totalCount++;
      const outputName = config.sizes.length === 1 
        ? `${config.prefix}.png`
        : `${config.prefix}-${size}x${size}.png`;
      
      const success = await generatePNGIcon(config.source, size, outputName);
      if (success) successCount++;
    }
  }
  
  console.log('\n================================');
  console.log(`📊 Generation Complete: ${successCount}/${totalCount} icons generated`);
  
  if (successCount === totalCount) {
    console.log('🎉 All icons generated successfully!');
    console.log('\n📁 Generated files:');
    
    // List generated files
    const files = fs.readdirSync(outputDir).filter(file => file.endsWith('.png'));
    files.forEach(file => {
      const stats = fs.statSync(path.join(outputDir, file));
      console.log(`   ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    });
    
    console.log('\n🚀 Your PWA icons are ready!');
    console.log('   - Icons are configured in manifest.json');
    console.log('   - Test PWA installation in your browser');
    console.log('   - Icons will appear on home screen when installed');
  } else {
    console.log('⚠️  Some icons failed to generate. Check the errors above.');
  }
}

// Check if canvas is available
try {
  require('canvas');
  generateAllIcons();
} catch (error) {
  console.log('❌ Canvas module not found. Installing...');
  console.log('Please run: npm install canvas');
  console.log('\nAlternatively, you can:');
  console.log('1. Open public/icons/generate-icons.html in your browser');
  console.log('2. Right-click each icon and save as PNG');
  console.log('3. Use the filenames shown in the interface');
}
