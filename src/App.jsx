import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { Heart, Star, Lock, CheckCircle, RefreshCw, XCircle, Loader, Dumbbell, Droplet, Gift, BookOpen, Home, ListChecks, ShoppingCart, Users, ClipboardList, TrendingUp, Wallet, Scale, Activity, MapPin, BatteryCharging, Coffee, Sun, Utensils, Eye, User, Zap, ChevronDown, MessageSquare, Globe, Clock, Filter, ChevronLeft, ChevronRight, Archive, LineChart, Phone, Link } from 'lucide-react';
import HomePage from './pages/HomePage';

// --- Global Variables (Demo Configuration) ---
const appId = 'diet-planner-demo';
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};
const initialAuthToken = null;

// --- UTILITIES ---
const withRetry = async (fn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed. Retrying...`, error.message);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
};

// --- XP & LEVELING LOGIC ---
const calculateXPForNextLevel = (level) => level * 100;

const checkAndApplyLevelUp = (currentProgress, xpGained, setMessage) => {
    let { level, currentXP, coins } = currentProgress;
    let newXP = currentXP + xpGained;
    let leveledUp = false;
    let bonusCoins = 0;

    while (newXP >= calculateXPForNextLevel(level)) {
        const xpRequired = calculateXPForNextLevel(level);
        newXP -= xpRequired;
        level += 1;
        leveledUp = true;
        bonusCoins += 50;
        setMessage(`✨ Congratulations! You reached Level ${level}! (+${bonusCoins} Bonus Coins!)`);
    }

    return {
        level,
        currentXP: newXP,
        bonusCoins,
        leveledUp
    };
};

// --- CORE DATA & CONFIG ---
const CURRENCY_SYMBOL = 'LE'; // NEW GLOBAL CURRENCY
const RECIPE_COST = 20;
const REWARD_CYCLE_HOURS = 12; // 12 hours for the daily check-in
const RECIPES_PER_PAGE = 6;

// NEW utility function for hardness color
const getHardnessColor = (hardness) => {
    switch (hardness) {
        case 'Easy': return 'bg-green-500';
        case 'Medium': return 'bg-yellow-500';
        case 'Hard': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
};

const ALL_RECIPES_DATA = [
    { id: 101, name: "Coconut Curry Chickpeas", mealType: "Dinner", prepTime: 20, rating: 4.7, image: "https://placehold.co/150x100/374151/E5E7EB?text=Curry", hardness: 'Easy', isInventoryAvailable: true },
    { id: 102, name: "High-Protein Oatmeal Jars", mealType: "Breakfast", prepTime: 10, rating: 4.9, image: "https://placehold.co/150x100/374151/E5E7EB?text=Oats", hardness: 'Easy', isInventoryAvailable: true },
    { id: 103, name: "Grilled Steak & Asparagus", mealType: "Dinner", prepTime: 25, rating: 4.5, image: "https://placehold.co/150x100/374151/E5E7EB?text=Steak", hardness: 'Medium', isInventoryAvailable: false },
    { id: 104, name: "Vegan Lentil Soup", mealType: "Lunch", prepTime: 40, rating: 4.2, image: "https://placehold.co/150x100/374151/E5E7EB?text=Soup", hardness: 'Medium', isInventoryAvailable: false },
    { id: 105, name: "Keto Fat Bombs (10x)", mealType: "Snack", prepTime: 15, rating: 4.8, image: "https://placehold.co/150x100/374151/E5E7EB?text=Fats", hardness: 'Easy', isInventoryAvailable: true },
    { id: 106, name: "Mediterranean Salmon & Veg", mealType: "Dinner", prepTime: 30, rating: 4.6, image: "https://placehold.co/150x100/374150/E5E7EB?text=Salmon", hardness: 'Medium', isInventoryAvailable: true },
    { id: 107, name: "Smoothie Bowl (Berry)", mealType: "Breakfast", prepTime: 5, rating: 4.9, image: "https://placehold.co/150x100/374151/E5E7EB?text=Berry", hardness: 'Easy', isInventoryAvailable: true },
    { id: 108, name: "Quick Chicken Wraps", mealType: "Lunch", prepTime: 15, rating: 4.4, image: "https://placehold.co/150x100/374151/E5E7EB?text=Wrap", hardness: 'Easy', isInventoryAvailable: false },
    { id: 109, name: "Overnight Chocolate Chia", mealType: "Breakfast", prepTime: 10, rating: 4.7, image: "https://placehold.co/150x100/374151/E5E7EB?text=Chia", hardness: 'Easy', isInventoryAvailable: true },
    { id: 110, name: "Spicy Shrimp Stir-fry", mealType: "Dinner", prepTime: 25, rating: 4.3, image: "https://placehold.co/150x100/374151/E5E7EB?text=Shrimp", hardness: 'Medium', isInventoryAvailable: true },
    { id: 111, name: "Tuna Salad Lettuce Cups", mealType: "Lunch", prepTime: 10, rating: 4.6, image: "https://placehold.co/150x100/374151/E5E7EB?text=Tuna", hardness: 'Easy', isInventoryAvailable: true },
    { id: 112, name: "Energy Bites (No-Bake)", mealType: "Snack", prepTime: 20, rating: 4.5, image: "https://placehold.co/150x100/374151/E5E7EB?text=Energy", hardness: 'Medium', isInventoryAvailable: false },
    { id: 113, name: "Baked Tofu with Peanut Sauce", mealType: "Dinner", prepTime: 35, rating: 4.8, image: "https://placehold.co/150x100/374151/E5E7EB?text=Tofu", hardness: 'Hard', isInventoryAvailable: false },
    { id: 114, name: "Egg Muffins (Batch Prep)", mealType: "Breakfast", prepTime: 30, rating: 4.4, image: "https://placehold.co/150x100/374151/E5E7EB?text=Muffin", hardness: 'Medium', isInventoryAvailable: true },
    { id: 115, name: "Chicken & Veggie Skewers", mealType: "Dinner", prepTime: 45, rating: 4.1, image: "https://placehold.co/150x100/374151/E5E7EB?text=Skewers", hardness: 'Hard', isInventoryAvailable: false },
    { id: 116, name: "Avocado Toast Upgrade", mealType: "Breakfast", prepTime: 10, rating: 4.0, image: "https://placehold.co/150x100/374151/E5E7EB?text=Toast", hardness: 'Easy', isInventoryAvailable: true },
    { id: 117, name: "Cauliflower Pizza Crust", mealType: "Dinner", prepTime: 50, rating: 4.5, image: "https://placehold.co/150x100/374151/E5E7EB?text=Pizza", hardness: 'Hard', isInventoryAvailable: false },
    { id: 118, name: "Simple Side Salad", mealType: "Lunch", prepTime: 5, rating: 3.9, image: "https://placehold.co/150x100/374151/E5E7EB?text=Salad", hardness: 'Easy', isInventoryAvailable: true },
];

const MEAL_TYPES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];
const PREP_TIME_FILTERS = ['All', 'Quick (<30 min)', 'Standard (>30 min)'];

const NAV_PAGES = [
    { id: 'Home', title: 'Home', icon: Home, position: 'left', iconOnly: true },
    { id: 'Coach', title: 'Coach', icon: MessageSquare, position: 'left' },
    { id: 'Tasks', title: 'Tasks', icon: ListChecks, position: 'left' },
    { id: 'Nutrition', title: 'Nutrition', icon: Utensils, position: 'left' }, 
    { id: 'Workouts', title: 'Workouts', icon: Dumbbell, position: 'left' }, // RENAMED FROM 'Exercise'
    { id: 'Finance', title: 'Finance', icon: Wallet, position: 'left' },
    { id: 'Gamification', title: 'Gamification', icon: Star, position: 'right' },
    { id: 'Rewards', title: 'Rewards', icon: Gift, position: 'right' },
    { id: 'Recipes', title: 'Recipes', icon: BookOpen, position: 'hidden' },
    { id: 'Shopping', title: 'Shopping', icon: ShoppingCart, position: 'hidden' },
    { id: 'Inventory', title: 'Inventory', icon: Archive, position: 'hidden' }, 
];

const USER_MENU_ITEMS = [
    { id: 'Profile', title: 'Profile', icon: User, section: 'Account' },
    { id: 'AccountUpgrade', title: 'Account Upgrade', icon: Zap, section: 'Account' },
    { id: 'Privacy', title: 'Privacy', icon: Lock, section: 'Account' },
    { id: 'SignOut', title: 'Sign Out (Placeholder)', icon: XCircle, section: 'Account' },
    { id: 'DietType', title: 'Diet Type', icon: Droplet, section: 'Diet & Preferences' },
    { id: 'FoodPrefs', title: 'Food Preferences', icon: Heart, section: 'Diet & Preferences' },
    { id: 'Budget', title: 'Budget', icon: Wallet, section: 'Financial' },
    { id: 'Health', title: 'Health Metrics', icon: Activity, section: 'Health Data' },
    { id: 'ExerciseSettings', title: 'Workout Plan', icon: Dumbbell, section: 'Health Data' }, // RENAMED
    { id: 'Reports', title: 'Progress Reports', icon: TrendingUp, section: 'Health Data' },
    { id: 'Media', title: 'Media (Body & Food Photos)', icon: Eye, section: 'Health Data' },
    { id: 'Goals', title: 'Goals & Targets', icon: ClipboardList, section: 'Game' },
    { id: 'ScoreBoard', title: 'Score Board', icon: TrendingUp, section: 'Game' },
];

const LEGAL_LINKS = [
    { name: "Terms of Service", id: "Terms" },
    { name: "Privacy Policy", id: "Privacy" },
];
const SUPPORT_LINKS = [
    { name: "Help & FAQ", id: "FAQ" },
    { name: "Contact Support", id: "Support" },
];
const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
];

// --- CORE TASK DATA ---
const getDailyTasks = () => ([
    { id: 1, name: "Meal: High-Protein Scramble", icon: Coffee, time: '7:30 AM', completed: true, type: 'Meal', scoreReward: 2, coinReward: 0, xpReward: 15 }, 
    { id: 2, name: "Meal: Lemon Herb Chicken Salad", icon: Sun, time: '1:00 PM', completed: false, type: 'Meal', scoreReward: 2, coinReward: 0, xpReward: 15 },
    { id: 3, name: "Complete Dinner Prep Shopping", icon: ShoppingCart, time: '3:00 PM', completed: false, type: 'Shopping', scoreReward: 3, coinReward: 0, xpReward: 20 },
    { id: 4, name: "Meal: Mediterranean Salmon Dinner", icon: Utensils, time: '7:00 PM', completed: false, type: 'Meal', scoreReward: 2, coinReward: 0, xpReward: 15 },
    { id: 5, name: "Cook: Overnight Oats Prep", icon: BookOpen, time: '8:30 PM', completed: false, type: 'Cooking', scoreReward: 5, coinReward: 1, xpReward: 30 }, 
]);

// --- Trello Style Task Data (Used for WEEKLY GOALS) ---
const DUMMY_PLANNING_TASKS = {
    'todo': [
        { id: 1, title: 'Finalize Next Week\'s Macros', details: 'Review performance report and adjust protein targets.', tag: 'Planning', icon: ClipboardList, xpReward: 5 },
        { id: 2, title: 'Batch Prep High-Fiber Snacks', details: 'Cook 2 dozen energy bites for quick snacks.', tag: 'Cooking', icon: Utensils, xpReward: 10 },
        { id: 3, title: 'Verify Gym Class Schedule', details: 'Check for morning HIIT classes on Tuesday and Thursday.', tag: 'Workouts', icon: Dumbbell, xpReward: 5 },
    ],
    'in-progress': [
        { id: 4, title: 'Complete Dinner Prep Shopping', details: 'Buy salmon, avocado, and spices from Market.', tag: 'Shopping', icon: ShoppingCart, xpReward: 15 },
    ],
    'done': [
        { id: 5, title: 'Set Up Monthly Budget', details: 'Allocate LE450 to food budget in settings.', tag: 'Financial', icon: Wallet, xpReward: 5 },
        { id: 6, title: 'Claim Onboarding Gift', details: 'Received 2000 Coins and 1000 XP.', tag: 'Rewards', icon: Gift, xpReward: 0 },
    ],
};

const DUMMY_MONTHLY_MILESTONES = [
    { id: 10, title: 'Hit Level 5 Milestone', icon: Zap, status: '85% Progress', color: 'text-indigo-600' },
    { id: 11, title: 'Reduce Eating Out', icon: Wallet, status: 'Completed', color: 'text-green-600' },
    { id: 12, title: 'Learn 5 New Keto Recipes', icon: BookOpen, status: '2/5 Completed', color: 'text-yellow-600' },
];

const COLUMN_TITLES = {
    'todo': { title: 'To Do', icon: ListChecks, color: 'border-red-400 bg-red-50/50' },
    'in-progress': { title: 'In Progress', icon: Loader, color: 'border-yellow-400 bg-yellow-50/50' },
    'done': { title: 'Completed', icon: CheckCircle, color: 'border-green-400 bg-green-50/50' },
};
// --- END Trello Style Task Data ---

// --- CUSTOM COMPONENTS (DEFINED BEFORE APP) ---

// FOOTER COMPONENT
const Footer = ({ currentLanguage, setCurrentLanguage, setMessage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (lang) => {
        setCurrentLanguage(lang.code);
        setMessage(`🌍 Language switched to: ${lang.name}.`);
        setIsOpen(false);
    };

    const handleLinkClick = (name) => {
        setMessage(`🔗 Navigating to: ${name}. (Placeholder link in demo)`);
    };
    
    return (
        <footer className="mt-12 border-t border-gray-200 py-4 text-sm text-gray-500">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-center md:justify-between items-center space-y-3 md:space-y-0">
                
                <p className="text-center md:text-left">
                    © {new Date().getFullYear()} Diet Planner Game. All rights reserved.
                </p>

                <div className="flex flex-wrap justify-center items-center space-x-4">
                    
                    {LEGAL_LINKS.map(link => (
                        <button key={link.id} onClick={() => handleLinkClick(link.name)} className="hover:text-indigo-600 transition">
                            {link.name}
                        </button>
                    ))}
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    
                    {SUPPORT_LINKS.map(link => (
                        <button key={link.id} onClick={() => handleLinkClick(link.name)} className="hover:text-indigo-600 transition">
                            {link.name}
                        </button>
                    ))}
                    <span className="text-gray-300 hidden sm:inline">|</span>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center space-x-1 hover:text-indigo-600 transition p-1 rounded-md"
                        >
                            <Globe className="w-4 h-4" strokeWidth={2} />
                            <span className="font-medium text-gray-700 hover:text-indigo-600 transition">{LANGUAGES.find(l => l.code === currentLanguage)?.name}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        
                        {isOpen && (
                            <div className="absolute bottom-full mb-2 right-0 w-40 bg-white rounded-lg shadow-xl py-1 z-30 border border-gray-200">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang)}
                                        className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center ${currentLanguage === lang.code ? 'font-bold bg-indigo-50 text-indigo-600' : ''}`}
                                    >
                                        {lang.name}
                                        {currentLanguage === lang.code && <CheckCircle className="w-4 h-4 ml-auto text-indigo-500" strokeWidth={2} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Continue with the rest of the components... (I'll create a simplified version for demo purposes)

// Import Firebase services
import { AuthService, FirestoreService, ErrorHandler } from './services/firebase';

// Level 303: Advanced imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useNutriStore, useNutriActions } from './store/nutriStore';
import { useRealtimeSync } from './hooks/useNutriQueries';
import AdvancedTaskManager from './components/tasks/AdvancedTaskManager';
import UserProfileForm from './components/forms/UserProfileForm';
import { XPProgressBar, ScoreProgressBar } from './components/animations/AnimatedProgressBar';

// Performance Optimizations
import OptimizedGamificationDashboard from './components/gamification/OptimizedGamificationDashboard';
import PerformanceMonitor from './components/PerformanceMonitor';
import './styles/performance-optimizations.css';
import './utils/performanceDemo'; // Auto-starts performance monitoring

// MAIN APP COMPONENT (SIMPLIFIED FOR DEMO)
const App = () => {
    // App state
    const [activePage, setActivePage] = useState('Home');
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState({ score: 3500, coins: 2000, recipesUnlocked: 10, level: 3, currentXP: 150 });
    const [userProfile, setUserProfile] = useState({ userName: 'Yasser', dietType: 'Keto Diet', bodyType: 'Mesomorph', weight: '175 lbs' });
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [localCompletedTasks, setLocalCompletedTasks] = useState([1]); // Task 1 is completed by default

    // Firebase integration state
    const [isAuthReady, setIsAuthReady] = useState(true); // Set to true for demo
    const [userId, setUserId] = useState('demo-user-id');
    const [isLoading, setIsLoading] = useState(false); // Set to false for demo

    // Initialize Firebase and authentication
    useEffect(() => {
        // For demo mode, skip Firebase initialization
        console.log('Demo mode - skipping Firebase initialization');
    }, []);

    const handleTaskCompletion = async (score, coins, xp, name) => {
        try {
            // Update local state immediately for responsive UI
            setProgress(prev => ({
                ...prev,
                score: prev.score + score,
                coins: prev.coins + coins,
                currentXP: prev.currentXP + xp
            }));
            
            setMessage(`✅ Task "${name}" completed! (+${score} Score, +${coins} Coin, +${xp} XP)`);
        } catch (error) {
            console.error('Task completion error:', error);
            setMessage(`❌ Failed to complete task: ${error.message}`);
        }
    };

    const handleUserMenuClick = (pageId, title) => {
        setActivePage(pageId);
        setMessage(`⚙️ Navigated to: ${title}. (Configuration screen placeholder)`);
    };

    // Mock header status for demo
    const headerStatus = {
        currentDayTime: { day: 'Sat', time: '12:01 AM' },
        daysUntilNextPlan: 2,
        dietType: userProfile.dietType,
        nextCookingTime: { isPending: true, timeString: '2h 30m', minutesRemaining: 150 },
        nextWorkoutTime: { isPending: true, timeString: '5h 15m' }
    };

    if (isLoading || !isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader className="animate-spin w-8 h-8 text-indigo-600 mr-3" />
                <p className="text-gray-600 font-semibold">
                    {isLoading ? 'Initializing Diet Planner Game...' : 'Loading user data...'}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-inter">
            <div className="max-w-6xl mx-auto">
                <header className="bg-indigo-700 shadow-md sticky top-0 z-10">
                    <div className="p-4 flex items-center justify-between">
                        <h1 className="text-3xl font-extrabold text-white flex items-center">
                            <Users className="w-8 h-8 mr-2 text-indigo-200" strokeWidth={1.5}/>
                            Diet Planner Game
                        </h1>
                        
                        <div className="flex items-center space-x-2">
                            <div className="hidden lg:flex items-start space-x-4 text-xs bg-indigo-900/50 p-2.5 rounded-lg border border-indigo-700/50">
                                <div className="flex items-start text-indigo-200">
                                    <Clock className="w-4 h-4 mr-1.5 mt-[1px]" strokeWidth={1.5} />
                                    <div className="flex flex-col">
                                        <p className="font-semibold">Sat</p>
                                        <p className="text-xs text-indigo-300/80">12:01 AM</p>
                                    </div>
                                </div>
                                <div className="flex items-start text-indigo-200 border-l border-indigo-500/50 pl-4">
                                    <Utensils className="w-4 h-4 mr-1.5 mt-[1px]" strokeWidth={1.5} />
                                    <div className="flex flex-col">
                                        <p className="font-semibold">Diet Type:</p>
                                        <p className="text-xs text-indigo-300/80">Keto</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 px-4 py-3 rounded-lg transition duration-150 hover:bg-indigo-700/50 text-white">
                                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm border-2 border-white">
                                    Y
                                </div>
                                <span className="hidden sm:inline font-semibold text-sm">Yasser</span>
                            </div>
                        </div>
                    </div>

                    <nav className="bg-indigo-800 shadow-lg">
                        <div className="flex justify-between overflow-x-auto whitespace-nowrap"> 
                            <div className="flex">
                                {NAV_PAGES.filter(p => p.position === 'left').map((page) => {
                                    const Icon = page.icon;
                                    const isIconOnly = page.iconOnly;
                                    const customPadding = page.id === 'Home' ? 'px-[30px]' : 'px-4';
                                    
                                    return (
                                        <button
                                            key={page.id}
                                            onClick={() => {
                                                setActivePage(page.id);
                                                setMessage('');
                                            }}
                                            className={`relative flex items-center py-3 text-sm font-semibold transition duration-200 ${customPadding}
                                                ${activePage === page.id
                                                    ? 'bg-indigo-900 text-white border-b-4 border-indigo-300'
                                                    : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isIconOnly ? '' : 'mr-2'}`} strokeWidth={1.5} />
                                            {!isIconOnly && page.title}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-shrink-0 items-center">
                                {NAV_PAGES.filter(p => p.position === 'right').map((page) => {
                                    const Icon = page.icon;
                                    
                                    return (
                                        <button
                                            key={page.id}
                                            onClick={() => {
                                                setActivePage(page.id);
                                                setMessage('');
                                            }}
                                            className={`relative flex items-center px-4 py-3 text-sm font-semibold transition duration-200 ${
                                                activePage === page.id
                                                    ? 'bg-indigo-900 text-white border-b-4 border-indigo-300'
                                                    : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5 mr-2" strokeWidth={1.5} />
                                            {page.title}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>
                </header>
                
                <main className="p-4">
                    {message && (
                        <div className={`p-4 mb-4 rounded-lg shadow-md ${message.startsWith('✅') || message.startsWith('🥳') || message.startsWith('🎁') || message.startsWith('⭐') || message.startsWith('⚙️') || message.startsWith('🏆') || message.startsWith('✨') ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`}>
                            {message.startsWith('❌') ? <XCircle className="inline w-4 h-4 mr-2 text-red-500" strokeWidth={1.5} /> : <CheckCircle className="inline w-4 h-4 mr-2 text-green-500" strokeWidth={1.5} />}
                            <span className="font-semibold">{message}</span>
                        </div>
                    )}
                    
                    {/* Render pages based on activePage */}
                    {activePage === 'Home' ? (
                        <HomePage />
                    ) : activePage === 'Gamification' ? (
                        <div className="p-4 sm:p-6">
                            <OptimizedGamificationDashboard 
                                userId={userId}
                                className="optimized-dashboard"
                            />
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Home className="w-7 h-7 mr-3 text-indigo-600" strokeWidth={1.5} /> {activePage} Page
                            </h2>
                            
                            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 shadow-md">
                                <h3 className="text-xl font-bold text-indigo-800 mb-2 flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2" strokeWidth={2} /> Demo Mode
                                </h3>
            