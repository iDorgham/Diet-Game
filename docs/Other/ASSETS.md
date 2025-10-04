# Diet Game - Asset Documentation

## Overview

This document provides a comprehensive guide to all visual assets used in the Diet Game application, including icons, images, and their usage guidelines.

## 🎨 Design System

### Color Palette
- **Primary**: #4F46E5 (Indigo) - Main brand color
- **Secondary**: #10B981 (Emerald) - Success states, positive actions
- **Accent**: #F59E0B (Amber) - Highlights, warnings, achievements
- **Background**: #F9FAFB (Gray 50) - Page backgrounds
- **Text**: #111827 (Gray 900) - Primary text color
- **Success**: #059669 (Emerald 600) - Success messages
- **Warning**: #D97706 (Amber 600) - Warning messages
- **Error**: #DC2626 (Red 600) - Error messages
- **Info**: #2563EB (Blue 600) - Information messages

### Typography
- **Primary Font**: Inter, system-ui, sans-serif
- **Monospace**: 'Fira Code', 'Monaco', 'Consolas', monospace

## 📱 PWA Icons

### Standard Icons
Located in `public/icons/`:
- `icon-72x72.png` - Small app icon
- `icon-96x96.png` - Medium app icon
- `icon-128x128.png` - Standard app icon
- `icon-144x144.png` - Windows tile icon
- `icon-152x152.png` - iOS home screen icon
- `icon-192x192.png` - Android home screen icon
- `icon-384x384.png` - Large app icon
- `icon-512x512.png` - Extra large app icon

### Maskable Icons
- `icon-maskable-192x192.png` - Android adaptive icon
- `icon-maskable-512x512.png` - Large adaptive icon

### Shortcut Icons
- `task-shortcut.png` - Tasks shortcut (96x96)
- `profile-shortcut.png` - Profile shortcut (96x96)
- `analytics-shortcut.png` - Analytics shortcut (96x96)

### SVG Base Files
- `icon-base.svg` - Main app icon template
- `icon-maskable-base.svg` - Maskable icon template
- `task-shortcut.svg` - Tasks icon template
- `profile-shortcut.svg` - Profile icon template
- `analytics-shortcut.svg` - Analytics icon template

## 🏆 Achievement Badges

Located in `public/images/achievements/`:

### Available Achievements
- **first-meal** - First Meal logged
- **streak-7** - 7-day streak maintained
- **level-5** - Reached level 5

### File Formats
Each achievement is available in:
- PNG format (128x128) for web display
- SVG format for scalable usage

## 🍽️ Meal Icons

Located in `public/images/meals/`:

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

Located in `public/screenshots/`:

### PWA Screenshots
- **desktop-home.svg** - Desktop dashboard screenshot
- **mobile-home.svg** - Mobile dashboard screenshot

### Usage
These screenshots are used in the PWA manifest for app store listings and installation prompts.

## 🛠️ Asset Generation

### Scripts
- `scripts/generate-assets.js` - Complete asset generation
- `scripts/generate-icons.js` - Icon generation only
- `scripts/generate-images.js` - Image generation only

### Usage
```bash
# Generate all assets
npm run generate-assets

# Generate icons only
npm run generate-icons

# Generate images only
npm run generate-images
```

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

*Last updated: January 15, 2024*
*Generated by: Diet Game Asset Generation System*
