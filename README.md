# 🎮 Diet Game - AI-Powered Gamified Nutrition App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> Transform your nutrition journey with AI-powered meal planning, gamified tracking, and personalized coaching.

## 🌟 Features

### 🎯 Core Functionality
- **AI-Powered Meal Planning** - Personalized nutrition recommendations
- **Gamified Progress Tracking** - XP system, levels, and achievements
- **Real-time Nutrition Analysis** - Comprehensive macro and micronutrient tracking
- **Social Community** - Connect with friends and share progress
- **Smart Shopping Lists** - AI-generated shopping lists with nutrition insights

### 🎮 Gamification System
- **XP & Leveling** - Earn experience points for healthy habits
- **Achievement Badges** - Unlock rewards for milestones
- **Quest System** - Daily and weekly challenges
- **Leaderboards** - Compete with friends and community
- **Reward Economy** - Virtual currency for premium features

### 🤖 AI Coach Features
- **Personalized Recommendations** - AI-driven meal and exercise suggestions
- **Progress Analysis** - Intelligent insights and trend analysis
- **Goal Setting** - Smart goal recommendations based on your data
- **Habit Formation** - AI-powered habit tracking and optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+ or yarn 1.22+
- Firebase account (for backend services)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/diet-game.git
cd diet-game

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase configuration

# Start development server
npm run dev
```

### First Time Setup

1. **Configure Firebase**:
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login and initialize
   firebase login
   firebase init
   ```

2. **Set up AI Services**:
   - Get Grok API key for AI features
   - Configure nutrition database API keys
   - Set up monitoring services

3. **Run the Application**:
   ```bash
   npm run dev
   # Open http://localhost:5173
   ```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern component-based UI
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast development and build tooling
- **Zustand** - Lightweight state management
- **React Query** - Server state management

### Backend & Services
- **Firebase** - Authentication, Firestore, Storage
- **Grok AI API** - AI-powered recommendations
- **External APIs** - Nutrition data, recipe databases

### Development & Testing
- **Vitest** - Unit and integration testing
- **Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
diet-game/
├── 📁 src/                    # Source code
│   ├── 📁 components/         # Reusable UI components
│   ├── 📁 pages/             # Page components
│   ├── 📁 services/          # API and external services
│   ├── 📁 store/             # State management
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 utils/             # Utility functions
│   └── 📁 types/             # TypeScript definitions
├── 📁 docs/                  # Comprehensive documentation
│   ├── 📁 specs/             # Feature specifications
│   ├── 📁 architecture/      # System architecture
│   ├── 📁 ui-components/     # Component documentation
│   └── 📁 gamification/      # Gamification features
├── 📁 public/                # Static assets
└── 📁 scripts/               # Build and utility scripts
```

## 🎨 Design System

### Color Palette
- **Primary**: `#085492` (Ocean Blue)
- **Secondary**: `#71E6DE` (Mint Green)
- **Accent**: `#998B73` (Warm Brown)
- **Background**: `#EDF0F2` (Light Gray)
- **Text**: `#374151` (Dark Gray)

### Typography
- **Headings**: Inter, system fonts
- **Body**: Inter, system fonts
- **Code**: JetBrains Mono, monospace

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Firebase
```bash
firebase deploy
```

### Docker Deployment
```bash
docker build -t diet-game .
docker run -p 3000:3000 diet-game
```

## 📚 Documentation

- **[Complete Documentation](./docs/README.md)** - Comprehensive project documentation
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Development setup and guidelines
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - API reference and integration
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Testing Guide](./docs/TESTING_GUIDE.md)** - Testing strategies and implementation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./docs/DEVELOPER_GUIDE.md#contributing) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **Testing**: 80%+ coverage required

## 📊 Performance

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Bundle Size
- **Main Bundle**: < 500KB gzipped
- **Load Time**: < 3s on 3G
- **Time to Interactive**: < 5s

## 🔒 Security & Privacy

- **GDPR Compliant** - User data handling
- **Firebase Security Rules** - Database protection
- **Input Validation** - XSS and injection prevention
- **HTTPS Only** - Secure communication

## 📱 Platform Support

### Web Browsers
- **Chrome**: 90+ (Primary)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Mobile Support
- **Responsive Design** - Mobile-first approach
- **PWA Features** - Offline support, app-like experience
- **Touch Optimization** - Mobile-friendly interactions

## 🌍 Internationalization

### Supported Languages
- **English** (Primary)
- **Spanish** (Planned)
- **French** (Planned)
- **German** (Planned)

## 📞 Support

- **Documentation**: [Complete Docs](./docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/diet-game/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/diet-game/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cursor AI** - Development acceleration
- **Firebase** - Backend infrastructure
- **Tailwind CSS** - Styling framework
- **React Community** - Component ecosystem
- **Open Source Contributors** - Community support

---

## 🎯 Roadmap

### Q1 2024
- [ ] Advanced AI coaching features
- [ ] Social community enhancements
- [ ] Mobile app development
- [ ] Advanced analytics dashboard

### Q2 2024
- [ ] Multi-language support
- [ ] Advanced gamification features
- [ ] Integration with fitness trackers
- [ ] Premium subscription features

### Q3 2024
- [ ] AI-powered meal prep suggestions
- [ ] Advanced nutrition analysis
- [ ] Community challenges and events
- [ ] Professional nutritionist integration

---

*Built with ❤️ using Spec-Driven Development (SDD) principles and modern web technologies.*
