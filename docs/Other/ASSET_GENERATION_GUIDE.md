# Asset Generation Guide

## Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Install canvas library (required for PNG generation)
npm install canvas
```

### Generate All Assets
```bash
# Generate complete asset set
npm run generate-assets
```

This will create:
- ✅ All PWA icons (72x72 to 512x512)
- ✅ Maskable icons for Android
- ✅ Shortcut icons for app shortcuts
- ✅ Achievement badges
- ✅ Meal type icons
- ✅ Hero background
- ✅ Screenshot placeholders
- ✅ Complete documentation

## Individual Generation

### Icons Only
```bash
npm run generate-icons
```

### Images Only
```bash
npm run generate-images
```

## Manual Generation

```bash
# Navigate to scripts directory
cd scripts

# Run individual scripts
node generate-assets.js    # Complete generation
node generate-icons.js     # Icons only
node generate-images.js    # Images only
```

## Output Structure

After generation, your `public/` directory will contain:

```
public/
├── icons/
│   ├── icon-72x72.png to icon-512x512.png
│   ├── icon-maskable-192x192.png, icon-maskable-512x512.png
│   ├── task-shortcut.png, profile-shortcut.png, analytics-shortcut.png
│   └── *.svg base files
├── images/
│   ├── achievements/ (PNG + SVG)
│   ├── meals/ (PNG + SVG)
│   ├── hero-bg.png, hero-bg.svg
│   └── logo.svg, logo-dark.svg
└── screenshots/
    ├── desktop-home.svg
    └── mobile-home.svg
```

## Troubleshooting

### Canvas Installation Issues
```bash
# On macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# On Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# On Windows
# Use pre-built binaries or WSL
```

### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/*.js
```

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

## Customization

### Adding New Icons
1. Edit `scripts/generate-icons.js`
2. Add new icon to `SHORTCUT_ICONS` object
3. Run `npm run generate-icons`

### Adding New Images
1. Edit `scripts/generate-images.js`
2. Add new image to appropriate category
3. Run `npm run generate-images`

### Changing Colors
1. Update `COLORS` object in generation scripts
2. Regenerate all assets
3. Update documentation

## Integration

### PWA Manifest
The generated icons are automatically referenced in `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### React Components
Use generated assets in your components:

```jsx
// Achievement badge
<img src="/images/achievements/first-meal.png" alt="First Meal Achievement" />

// Meal icon
<img src="/images/meals/breakfast.svg" alt="Breakfast" />

// App icon
<img src="/icons/icon-192x192.png" alt="Diet Game" />
```

## Best Practices

1. **Always use SVG for scalable graphics**
2. **Use PNG for complex images with transparency**
3. **Optimize file sizes for web delivery**
4. **Provide alternative text for accessibility**
5. **Test on different devices and screen sizes**

## Support

For issues with asset generation:
1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure you have write permissions to the `public/` directory
4. Check the troubleshooting section above

---

*This guide is part of the Diet Game project documentation.*
