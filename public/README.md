# Diet Game - Public Assets

## 📁 Directory Structure

```
public/
├── icons/                    # PWA and app icons
│   ├── icon-*.png           # Standard app icons (72x72 to 512x512)
│   ├── icon-maskable-*.png  # Maskable icons for Android
│   ├── *-shortcut.png       # App shortcut icons
│   ├── icon-base.svg        # Main app icon template
│   ├── icon-maskable-base.svg # Maskable icon template
│   └── generate-icons.html  # Icon generation tool
├── images/                   # Application images
│   ├── achievements/        # Achievement badges
│   ├── meals/              # Meal type icons
│   ├── exercises/          # Exercise illustrations
│   ├── ingredients/        # Ingredient photos
│   ├── onboarding/         # Onboarding illustrations
│   ├── illustrations/      # General illustrations
│   ├── backgrounds/        # Background images
│   ├── logo.svg           # Main application logo
│   ├── logo-dark.svg      # Dark mode logo
│   ├── hero-bg.svg        # Hero background
│   └── placeholder-avatar.svg # Default avatar
├── screenshots/             # PWA screenshots
│   ├── desktop-home.svg    # Desktop dashboard
│   └── mobile-home.svg     # Mobile dashboard
├── manifest.json           # PWA manifest
└── sw.js                   # Service worker
```

## 🎨 Asset Generation

### Quick Start
```bash
# Generate all assets
npm run generate-assets

# Generate icons only
npm run generate-icons

# Generate images only
npm run generate-images
```

### Manual Generation
```bash
# Navigate to scripts directory
cd scripts

# Run individual scripts
node generate-assets.js    # Complete asset generation
node generate-icons.js     # PWA icons only
node generate-images.js    # Images and illustrations only
```

## 📱 PWA Icons

### Standard Icons
Required for Progressive Web App functionality:

| Size | File | Purpose |
|------|------|---------|
| 72x72 | `icon-72x72.png` | Small app icon |
| 96x96 | `icon-96x96.png` | Medium app icon |
| 128x128 | `icon-128x128.png` | Standard app icon |
| 144x144 | `icon-144x144.png` | Windows tile icon |
| 152x152 | `icon-152x152.png` | iOS home screen icon |
| 192x192 | `icon-192x192.png` | Android home screen icon |
| 384x384 | `icon-384x384.png` | Large app icon |
| 512x512 | `icon-512x512.png` | Extra large app icon |

### Maskable Icons
For Android adaptive icons:

| Size | File | Purpose |
|------|------|---------|
| 192x192 | `icon-maskable-192x192.png` | Android adaptive icon |
| 512x512 | `icon-maskable-512x512.png` | Large adaptive icon |

### Shortcut Icons
For app shortcuts and quick actions:

| File | Purpose | Size |
|------|---------|------|
| `task-shortcut.png` | Tasks shortcut | 96x96 |
| `profile-shortcut.png` | Profile shortcut | 96x96 |
| `analytics-shortcut.png` | Analytics shortcut | 96x96 |

## 🏆 Achievement Badges

Located in `images/achievements/`:

### Available Achievements
- **first-meal** - First meal logged
- **streak-7** - 7-day streak maintained  
- **level-5** - Reached level 5

### File Formats
Each achievement is available in:
- **PNG** (128x128) - For web display
- **SVG** - For scalable usage

## 🍽️ Meal Icons

Located in `images/meals/`:

### Meal Types
- **breakfast** - Morning meal icon
- **lunch** - Midday meal icon
- **dinner** - Evening meal icon

### File Formats
Each meal icon is available in:
- **PNG** (64x64) - For web display
- **SVG** - For scalable usage

## 🖼️ Background Images

### Hero Background
- **hero-bg.png** - High-resolution (1920x1080)
- **hero-bg.svg** - Scalable vector version

### Usage Guidelines
- Use PNG for fixed-size displays
- Use SVG for responsive/resizable displays
- Maintain aspect ratio when scaling

## 📸 Screenshots

Located in `screenshots/`:

### PWA Screenshots
- **desktop-home.svg** - Desktop dashboard
- **mobile-home.svg** - Mobile dashboard

These are used in the PWA manifest for app store listings and installation prompts.

## 🎨 Design System

### Color Palette
- **Primary**: #4F46E5 (Indigo) - Main brand color
- **Secondary**: #10B981 (Emerald) - Success states
- **Accent**: #F59E0B (Amber) - Highlights, achievements
- **Background**: #F9FAFB (Gray 50) - Page backgrounds
- **Text**: #111827 (Gray 900) - Primary text
- **Success**: #059669 (Emerald 600) - Success messages
- **Warning**: #D97706 (Amber 600) - Warning messages
- **Error**: #DC2626 (Red 600) - Error messages
- **Info**: #2563EB (Blue 600) - Information messages

### Typography
- **Primary Font**: Inter, system-ui, sans-serif
- **Monospace**: 'Fira Code', 'Monaco', 'Consolas', monospace

## 🛠️ Customization

### Adding New Icons
1. Create SVG template in appropriate script
2. Add to generation function
3. Run generation script
4. Update documentation

### Adding New Images
1. Create SVG template in `generate-images.js`
2. Add to appropriate category (achievements, meals, etc.)
3. Run generation script
4. Update this README

### Modifying Colors
1. Update `COLORS` object in generation scripts
2. Regenerate all assets
3. Update design system documentation

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

## 📞 Support

For questions about assets:
- **Generation Issues**: Check script logs and dependencies
- **Design Questions**: Review design system documentation
- **Usage Questions**: Check component documentation
- **Technical Issues**: Contact the development team

---

*Last updated: January 15, 2024*
*Generated by: Diet Game Asset Generation System*