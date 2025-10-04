// Nutrition Tracking Page - Following docs/specs/nutrition-tracking/requirements.md
// EARS-NUT-001 through EARS-NUT-006 implementation

import React, { useState, useEffect } from 'react';
import {
  Search,
  Camera,
  Barcode,
  Plus,
  Minus,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  Filter,
  Star,
  CheckCircle,
  AlertCircle,
  Utensils,
  Apple,
  Droplets,
  Zap,
  Activity
} from 'lucide-react';
import { useNutriStore, useProgress, useUserProfile } from '../store/nutriStore';
import AnimatedProgressBar from '../components/animations/AnimatedProgressBar';

// Mock food database
const mockFoodDatabase = [
  {
    id: 1,
    name: "Grilled Chicken Breast",
    brand: "Fresh Market",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    barcode: "1234567890123",
    category: "Protein",
    servingSize: "100g",
    image: "/images/chicken-breast.jpg"
  },
  {
    id: 2,
    name: "Avocado",
    brand: "Organic Farms",
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    fiber: 7,
    sugar: 0.7,
    sodium: 7,
    barcode: "2345678901234",
    category: "Healthy Fats",
    servingSize: "100g",
    image: "/images/avocado.jpg"
  },
  {
    id: 3,
    name: "Quinoa",
    brand: "Ancient Grains",
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fat: 1.9,
    fiber: 2.8,
    sugar: 0.9,
    sodium: 7,
    barcode: "3456789012345",
    category: "Grains",
    servingSize: "100g",
    image: "/images/quinoa.jpg"
  }
];

// Mock daily goals
const dailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  fiber: 25,
  water: 8
};

// Mock logged foods for today
const mockLoggedFoods = [
  {
    id: 1,
    food: mockFoodDatabase[0],
    amount: 150,
    meal: "Breakfast",
    time: "8:30 AM",
    calories: 248,
    protein: 47,
    carbs: 0,
    fat: 5.4
  },
  {
    id: 2,
    food: mockFoodDatabase[1],
    amount: 100,
    meal: "Lunch",
    time: "12:15 PM",
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15
  }
];

// Food Search Component
const FoodSearch: React.FC<{
  onFoodSelect: (food: any) => void;
}> = ({ onFoodSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      const results = mockFoodDatabase.filter(food =>
        food.name.toLowerCase().includes(term.toLowerCase()) ||
        food.brand.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for food items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Camera className="w-4 h-4" />
          <span>Scan Food</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Barcode className="w-4 h-4" />
          <span>Scan Barcode</span>
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Search Results</h3>
          {searchResults.map((food) => (
            <div
              key={food.id}
              onClick={() => onFoodSelect(food)}
              className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Utensils className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{food.name}</h4>
                <p className="text-sm text-gray-600">{food.brand} • {food.calories} cal per {food.servingSize}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{food.calories} cal</p>
                <p className="text-xs text-gray-600">{food.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Nutrition Goals Progress Component
const NutritionGoals: React.FC = () => {
  const [loggedFoods] = useState(mockLoggedFoods);
  
  // Calculate totals from logged foods
  const totals = loggedFoods.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat,
    fiber: acc.fiber + (item.food.fiber * item.amount / 100),
    water: acc.water + 0 // Water tracking would be separate
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 });

  const goals = [
    { name: 'Calories', current: totals.calories, target: dailyGoals.calories, unit: 'cal', color: 'bg-red-500', icon: Zap },
    { name: 'Protein', current: totals.protein, target: dailyGoals.protein, unit: 'g', color: 'bg-blue-500', icon: Target },
    { name: 'Carbs', current: totals.carbs, target: dailyGoals.carbs, unit: 'g', color: 'bg-yellow-500', icon: Apple },
    { name: 'Fat', current: totals.fat, target: dailyGoals.fat, unit: 'g', color: 'bg-green-500', icon: Droplets },
    { name: 'Fiber', current: totals.fiber, target: dailyGoals.fiber, unit: 'g', color: 'bg-purple-500', icon: Activity },
    { name: 'Water', current: totals.water, target: dailyGoals.water, unit: 'glasses', color: 'bg-cyan-500', icon: Droplets }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Today's Nutrition Goals</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const Icon = goal.icon;
          
          return (
            <div key={goal.name} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${goal.color} bg-opacity-10`}>
                    <Icon className={`w-4 h-4 ${goal.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(goal.current)}/{goal.target} {goal.unit}
                </span>
              </div>
              <AnimatedProgressBar
                progress={Math.min(progress, 100)}
                maxValue={goal.target}
                currentValue={goal.current}
                color={goal.color.replace('bg-', '#')}
                height={6}
                showLabel={false}
                showPercentage={false}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{Math.round(progress)}%</span>
                <span>{goal.target - Math.round(goal.current)} {goal.unit} remaining</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Logged Foods Component
const LoggedFoods: React.FC = () => {
  const [loggedFoods, setLoggedFoods] = useState(mockLoggedFoods);

  const removeFood = (id: number) => {
    setLoggedFoods(prev => prev.filter(food => food.id !== id));
  };

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'Breakfast': return '🌅';
      case 'Lunch': return '☀️';
      case 'Dinner': return '🌙';
      case 'Snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Logged Foods</h3>
        <span className="text-sm text-gray-500">{loggedFoods.length} items</span>
      </div>

      {loggedFoods.length === 0 ? (
        <div className="text-center py-8">
          <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No foods logged today</p>
          <p className="text-sm text-gray-400">Start by searching and adding foods above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loggedFoods.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getMealIcon(item.meal)}</span>
                      <h4 className="font-medium text-gray-800">{item.food.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.amount}g • {item.meal} • {item.time}
                    </p>
                    <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                      <span>{item.calories} cal</span>
                      <span>{item.protein}g protein</span>
                      <span>{item.carbs}g carbs</span>
                      <span>{item.fat}g fat</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFood(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove food item"
                  aria-label="Remove food item"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Nutrition Analysis Component
const NutritionAnalysis: React.FC = () => {
  const [loggedFoods] = useState(mockLoggedFoods);
  
  const totals = loggedFoods.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const nutritionScore = Math.min(100, Math.max(0, 
    (totals.protein / dailyGoals.protein) * 30 +
    (Math.min(totals.carbs, dailyGoals.carbs) / dailyGoals.carbs) * 25 +
    (Math.min(totals.fat, dailyGoals.fat) / dailyGoals.fat) * 25 +
    (Math.min(totals.calories, dailyGoals.calories) / dailyGoals.calories) * 20
  ));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent nutrition balance!';
    if (score >= 60) return 'Good progress, keep it up!';
    return 'Consider adding more variety to your meals.';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Nutrition Analysis</h3>
      
      {/* Nutrition Score */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-800">Nutrition Score</span>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(nutritionScore)} mb-2`}>
            {Math.round(nutritionScore)}
          </div>
          <p className="text-gray-600 mb-4">{getScoreMessage(nutritionScore)}</p>
          <AnimatedProgressBar
            progress={nutritionScore}
            maxValue={100}
            currentValue={nutritionScore}
            color="#10B981"
            height={8}
            showLabel={false}
            showPercentage={false}
          />
        </div>
      </div>

      {/* Macronutrient Breakdown */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Macronutrient Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Protein</span>
            <span className="text-sm font-medium">{totals.protein}g</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Carbohydrates</span>
            <span className="text-sm font-medium">{totals.carbs}g</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Fat</span>
            <span className="text-sm font-medium">{totals.fat}g</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Calories</span>
            <span className="text-sm font-medium">{totals.calories} cal</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>Recommendations</span>
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Add more leafy greens to increase fiber intake</li>
          <li>• Consider a protein-rich snack to meet your daily goal</li>
          <li>• Stay hydrated - aim for 8 glasses of water today</li>
        </ul>
      </div>
    </div>
  );
};

// Main Nutrition Tracking Page
const NutritionTrackingPage: React.FC = () => {
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const progress = useProgress();
  const userProfile = useUserProfile();
  const { isLoading, error } = useNutriStore();

  const handleFoodSelect = (food: any) => {
    setSelectedFood(food);
    setShowFoodModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nutrition tracker...</p>
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
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Nutrition Tracker</h1>
              <p className="text-blue-200 text-sm">
                Track your daily nutrition and achieve your health goals
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
        {/* Food Search Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Food</h2>
          <FoodSearch onFoodSelect={handleFoodSelect} />
        </div>

        {/* Nutrition Goals */}
        <NutritionGoals />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logged Foods */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <LoggedFoods />
          </div>

          {/* Nutrition Analysis */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <NutritionAnalysis />
          </div>
        </div>
      </div>

      {/* Food Selection Modal */}
      {showFoodModal && selectedFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add {selectedFood.name}</h3>
                <button
                  onClick={() => setShowFoodModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Utensils className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-medium text-gray-800">{selectedFood.name}</h4>
                <p className="text-sm text-gray-600">{selectedFood.brand}</p>
                <p className="text-sm text-gray-500">{selectedFood.calories} cal per {selectedFood.servingSize}</p>
              </div>

              <div className="space-y-3">
                <label htmlFor="amount-input" className="block text-sm font-medium text-gray-700">Amount (grams)</label>
                <input
                  id="amount-input"
                  type="number"
                  defaultValue="100"
                  placeholder="Enter amount in grams"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="meal-select" className="block text-sm font-medium text-gray-700">Meal</label>
                <select 
                  id="meal-select"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select meal type"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFoodModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Add food logic here
                    setShowFoodModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Food
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionTrackingPage;
