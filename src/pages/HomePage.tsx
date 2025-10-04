// HomePage component following docs/specs/homepage.md
// EARS-001 through EARS-005 implementation with oceanic color palette

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Trophy, 
  Activity, 
  Coins, 
  Star,
  Clock,
  ShoppingCart,
  ChefHat,
  Utensils,
  Target,
  TrendingUp,
  Users,
  MapPin,
  Phone,
  Globe
} from 'lucide-react';
import { useNutriStore, useProgress, useUserProfile, useHeaderStatus, useXPProgress, useStars } from '../store/nutriStore';
import { calculateXPForNextLevel, getNextStarThreshold, getScoreRemainingForNextStar } from '../utils/xp-system';
import AnimatedProgressBar from '../components/animations/AnimatedProgressBar';

// News ticker data
const newsItems = [
  { text: "🎉 New Keto recipes added to your meal plan!", icon: ChefHat, color: "text-green-500" },
  { text: "💪 Complete 3 tasks today for bonus XP!", icon: Target, color: "text-blue-500" },
  { text: "🛒 Your shopping list is ready for pickup", icon: ShoppingCart, color: "text-purple-500" },
  { text: "⭐ You're 150 points away from your next star!", icon: Star, color: "text-yellow-500" },
  { text: "🏃‍♂️ Don't forget your evening workout", icon: Activity, color: "text-red-500" },
];

// Shopping metrics data
const shoppingMetrics = {
  itemsNo: 12,
  totalWeight: "8.5",
  totalPrice: "$45.20",
  protein: "85g",
  fats: "45g",
  calories: "1,200",
  carbs: "25g"
};

// Recommended markets
const recommendedMarkets = [
  {
    name: "Fresh Market Co.",
    location: "2.3 miles away",
    call: "(555) 123-4567",
    website: "freshmarket.com",
    reason: "Best prices for organic produce"
  },
  {
    name: "Health Foods Plus",
    location: "1.8 miles away", 
    call: "(555) 987-6543",
    website: "healthfoodsplus.com",
    reason: "Specializes in keto-friendly items"
  }
];

// Today's tasks data
const todaysTasks = [
  {
    id: 1,
    name: "Breakfast: Keto Pancakes",
    icon: Utensils,
    time: "8:00 AM",
    completed: true,
    type: 'Meal' as const,
    scoreReward: 15,
    coinReward: 10,
    xpReward: 15
  },
  {
    id: 2,
    name: "Grocery Shopping",
    icon: ShoppingCart,
    time: "2:00 PM",
    completed: false,
    type: 'Shopping' as const,
    scoreReward: 20,
    coinReward: 15,
    xpReward: 20
  },
  {
    id: 3,
    name: "Meal Prep: Chicken Salad",
    icon: ChefHat,
    time: "6:00 PM",
    completed: false,
    type: 'Cooking' as const,
    scoreReward: 30,
    coinReward: 20,
    xpReward: 30
  }
];

// Days Card with Star Milestones Component
const DaysCardWithStars: React.FC<{ score: number }> = ({ score }) => {
  const stars = useStars();
  const nextThreshold = getNextStarThreshold(score);
  const remaining = getScoreRemainingForNextStar(score);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Days Score</h3>
            <p className="text-2xl font-bold text-blue-600">{score}</p>
          </div>
        </div>
      </div>
      
      {/* Star Milestones */}
      <div className="flex items-center space-x-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= stars 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      
      {nextThreshold && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">{remaining}</span> points to next star
        </div>
      )}
    </div>
  );
};

// Level Card with XP Progress Component
const LevelCardWithXP: React.FC<{ 
  level: number; 
  currentXP: number; 
  bodyType: string; 
}> = ({ level, currentXP, bodyType }) => {
  const xpProgress = useXPProgress();
  const nextLevelXP = calculateXPForNextLevel(level);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Level</h3>
            <p className="text-2xl font-bold text-green-600">{level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Body Type</p>
          <p className="text-sm font-medium text-gray-800">{bodyType}</p>
        </div>
      </div>
      
      {/* XP Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>XP Progress</span>
          <span>{currentXP}/{nextLevelXP}</span>
        </div>
        <AnimatedProgressBar 
          progress={xpProgress} 
          maxValue={nextLevelXP}
          currentValue={currentXP}
          color="#10B981"
          height={8}
          showLabel={false}
          showPercentage={false}
        />
      </div>
    </div>
  );
};

// Generic Dashboard Card Component
const DashboardCard: React.FC<{
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  bgColor?: string;
  textColor?: string;
}> = ({ icon: Icon, label, value, bgColor = "bg-purple-100", textColor = "text-purple-600" }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center space-x-3">
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// News Ticker Component
const NewsTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentItem = newsItems[currentIndex];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-xl p-4 text-white">
      <div className="flex items-center space-x-3">
        <currentItem.icon className="w-5 h-5" />
        <p className="text-sm font-medium animate-pulse">
          {currentItem.text}
        </p>
      </div>
    </div>
  );
};

// Task List Component
const TaskList: React.FC = () => {
  const { completeTask } = useNutriStore();
  const [localCompletedTasks, setLocalCompletedTasks] = useState<number[]>([]);

  const handleTaskComplete = async (task: typeof todaysTasks[0]) => {
    if (localCompletedTasks.includes(task.id)) return;
    
    setLocalCompletedTasks(prev => [...prev, task.id]);
    await completeTask(task.id, task.type, 0); // Assuming no streak for now
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Plan</h3>
      {todaysTasks.map((task) => {
        const isCompleted = localCompletedTasks.includes(task.id) || task.completed;
        const Icon = task.icon;
        
        return (
          <div
            key={task.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              isCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            } transition-colors`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isCompleted ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Icon className={`w-5 h-5 ${
                  isCompleted ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <p className={`font-medium ${
                  isCompleted ? 'text-green-800 line-through' : 'text-gray-800'
                }`}>
                  {task.name}
                </p>
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{task.time}</span>
                </p>
              </div>
            </div>
            
            {!isCompleted && (
              <button
                onClick={() => handleTaskComplete(task)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Complete
              </button>
            )}
            
            {isCompleted && (
              <div className="flex items-center space-x-2 text-green-600">
                <span className="text-sm font-medium">+{task.xpReward} XP</span>
                <span className="text-sm">✓</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Shopping List Component
const ShoppingList: React.FC = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800">Shopping List</h3>
    
    {/* Nutrition Metrics Grid */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-gray-800">{shoppingMetrics.itemsNo}</p>
        <p className="text-xs text-gray-600">Items</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-gray-800">{shoppingMetrics.totalWeight}kg</p>
        <p className="text-xs text-gray-600">Weight</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-gray-800">{shoppingMetrics.totalPrice}</p>
        <p className="text-xs text-gray-600">Total</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-2xl font-bold text-gray-800">{shoppingMetrics.calories}</p>
        <p className="text-xs text-gray-600">Calories</p>
      </div>
    </div>

    {/* Nutrition Breakdown */}
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Protein</span>
        <span className="font-medium">{shoppingMetrics.protein}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Fats</span>
        <span className="font-medium">{shoppingMetrics.fats}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Carbs</span>
        <span className="font-medium">{shoppingMetrics.carbs}</span>
      </div>
    </div>

    {/* Recommended Markets */}
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">Recommended Markets</h4>
      <div className="space-y-3">
        {recommendedMarkets.map((market, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-gray-800">{market.name}</h5>
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{market.location}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{market.reason}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Call market"
                  aria-label="Call market"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Visit website"
                  aria-label="Visit website"
                >
                  <Globe className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Main HomePage Component
const HomePage: React.FC = () => {
  const progress = useProgress();
  const userProfile = useUserProfile();
  const headerStatus = useHeaderStatus();
  const { isLoading, error } = useNutriStore();

  // Memoize expensive calculations
  const memoizedStars = useMemo(() => useStars(), [progress.score]);
  const memoizedXPProgress = useMemo(() => useXPProgress(), [progress.currentXP, progress.level]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Status Panel */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">NutriQuest</h1>
              <p className="text-blue-200 text-sm">
                {headerStatus.currentDayTime.day} • {headerStatus.currentDayTime.time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">Welcome, {userProfile.userName}</p>
              <p className="text-sm">{userProfile.dietType}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Dashboard Metrics - 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DaysCardWithStars score={progress.score} />
          <LevelCardWithXP 
            level={progress.level} 
            currentXP={progress.currentXP} 
            bodyType={userProfile.bodyType} 
          />
          <DashboardCard
            icon={Activity}
            label="Fitness Score"
            value="85"
            bgColor="bg-orange-100"
            textColor="text-orange-600"
          />
          <DashboardCard
            icon={Coins}
            label="Diet Coins"
            value={progress.coins}
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
          />
        </div>

        {/* News Ticker */}
        <NewsTicker />

        {/* Weekly Focus - 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Plan (Left) */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <TaskList />
          </div>

          {/* Shopping List (Right) */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <ShoppingList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;