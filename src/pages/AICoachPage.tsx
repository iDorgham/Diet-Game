// AI Coach Page - Following docs/specs/ai-coach-system/requirements.md
// EARS-AI-001 through EARS-AI-005 implementation

import React, { useState, useEffect } from 'react';
import {
  Brain,
  MessageCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Heart,
  Zap,
  Apple,
  Droplets,
  Activity,
  ChefHat,
  Utensils,
  Camera,
  Search,
  Send,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BookOpen,
  Award,
  Users,
  X
} from 'lucide-react';
import { useNutriStore, useProgress, useUserProfile } from '../store/nutriStore';
import AnimatedProgressBar from '../components/animations/AnimatedProgressBar';

// Mock AI recommendations
const mockRecommendations = [
  {
    id: 1,
    type: 'meal',
    title: 'Keto-Friendly Breakfast Bowl',
    description: 'Based on your current macros, try this protein-rich breakfast to start your day right.',
    confidence: 92,
    calories: 420,
    protein: 28,
    carbs: 8,
    fat: 32,
    prepTime: '15 min',
    difficulty: 'Easy',
    ingredients: ['Eggs', 'Avocado', 'Spinach', 'Bacon', 'Cheese'],
    instructions: [
      'Cook 2 eggs to your preference',
      'Sauté spinach in butter',
      'Slice half an avocado',
      'Cook 2 strips of bacon',
      'Combine all ingredients in a bowl'
    ],
    whyRecommended: 'High protein content helps meet your daily goal while staying within keto macros.',
    alternatives: [
      { name: 'Greek Yogurt Parfait', calories: 380, protein: 25 },
      { name: 'Protein Smoothie', calories: 350, protein: 30 }
    ]
  },
  {
    id: 2,
    type: 'tip',
    title: 'Hydration Boost',
    description: 'You\'re 2 glasses short of your daily water goal. Here are some hydrating tips.',
    confidence: 88,
    tips: [
      'Add lemon slices to your water for flavor',
      'Set hourly reminders to drink water',
      'Eat water-rich foods like cucumber and watermelon',
      'Track your water intake with our app'
    ],
    whyRecommended: 'Proper hydration improves metabolism and helps with weight management.'
  },
  {
    id: 3,
    type: 'workout',
    title: 'Post-Meal Walk',
    description: 'A 10-minute walk after your last meal can help with digestion and blood sugar control.',
    confidence: 85,
    duration: '10 minutes',
    intensity: 'Light',
    benefits: ['Improved digestion', 'Better blood sugar control', 'Increased metabolism'],
    whyRecommended: 'Light activity after meals helps your body process nutrients more efficiently.'
  }
];

// Mock motivational messages
const motivationalMessages = [
  {
    id: 1,
    type: 'achievement',
    message: '🎉 Congratulations! You\'ve completed 7 days in a row! Your consistency is paying off.',
    timestamp: '2 hours ago',
    icon: Award
  },
  {
    id: 2,
    type: 'encouragement',
    message: '💪 You\'re doing great! Remember, every healthy choice counts towards your goals.',
    timestamp: '1 day ago',
    icon: Heart
  },
  {
    id: 3,
    type: 'tip',
    message: '💡 Pro tip: Eating protein with every meal helps maintain stable blood sugar levels.',
    timestamp: '2 days ago',
    icon: Lightbulb
  }
];

// Mock food analysis results
const mockFoodAnalysis = {
  score: 78,
  breakdown: {
    nutrition: 85,
    portion: 70,
    timing: 80,
    variety: 75
  },
  feedback: [
    {
      type: 'positive',
      message: 'Great protein content! This meal will help you reach your daily goal.'
    },
    {
      type: 'suggestion',
      message: 'Consider adding some leafy greens for extra fiber and micronutrients.'
    },
    {
      type: 'warning',
      message: 'Watch your sodium intake - this meal is on the higher side.'
    }
  ],
  alternatives: [
    {
      name: 'Grilled Chicken Salad',
      improvement: '+15 nutrition score',
      reason: 'Lower sodium, higher fiber'
    },
    {
      name: 'Baked Salmon with Vegetables',
      improvement: '+12 nutrition score',
      reason: 'Better omega-3 content'
    }
  ]
};

// AI Chat Component
const AIChat: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hi! I\'m your AI nutrition coach. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I understand you\'re asking about ' + inputMessage + '. Let me provide you with some personalized recommendations based on your current progress and goals.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Brain className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">AI Coach Chat</h3>
          <p className="text-sm text-gray-600">Ask me anything about nutrition and health</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask your AI coach..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Personalized Recommendations Component
const PersonalizedRecommendations: React.FC = () => {
  const [recommendations] = useState(mockRecommendations);
  const [selectedRec, setSelectedRec] = useState<any>(null);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'meal': return ChefHat;
      case 'tip': return Lightbulb;
      case 'workout': return Activity;
      default: return Target;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Personalized Recommendations</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          <RefreshCw className="w-4 h-4 inline mr-1" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => {
          const Icon = getRecommendationIcon(rec.type);
          
          return (
            <div
              key={rec.id}
              onClick={() => setSelectedRec(rec)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{rec.title}</h4>
                    <span className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                      {rec.confidence}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  
                  {rec.type === 'meal' && (
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span>{rec.calories} cal</span>
                      <span>{rec.protein}g protein</span>
                      <span>{rec.prepTime}</span>
                      <span>{rec.difficulty}</span>
                    </div>
                  )}
                  
                  {rec.type === 'workout' && (
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span>{rec.duration}</span>
                      <span>{rec.intensity} intensity</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation Detail Modal */}
      {selectedRec && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedRec.title}</h3>
              <button
                onClick={() => setSelectedRec(null)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">{selectedRec.description}</p>
              
              {selectedRec.type === 'meal' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2">Nutrition Info</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Calories:</span>
                          <span>{selectedRec.calories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protein:</span>
                          <span>{selectedRec.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carbs:</span>
                          <span>{selectedRec.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fat:</span>
                          <span>{selectedRec.fat}g</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2">Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Prep Time:</span>
                          <span>{selectedRec.prepTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Difficulty:</span>
                          <span>{selectedRec.difficulty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span>{selectedRec.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRec.ingredients.map((ingredient: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Instructions</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {selectedRec.instructions.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-blue-800 mb-1">Why Recommended</h4>
                    <p className="text-sm text-blue-700">{selectedRec.whyRecommended}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Alternatives</h4>
                    <div className="space-y-2">
                      {selectedRec.alternatives.map((alt: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{alt.name}</span>
                          <span className="text-xs text-gray-500">{alt.calories} cal, {alt.protein}g protein</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedRec.type === 'tip' && (
                <>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Tips</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {selectedRec.tips.map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-blue-800 mb-1">Why Recommended</h4>
                    <p className="text-sm text-blue-700">{selectedRec.whyRecommended}</p>
                  </div>
                </>
              )}

              {selectedRec.type === 'workout' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2">Workout Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{selectedRec.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Intensity:</span>
                          <span>{selectedRec.intensity}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2">Benefits</h4>
                      <ul className="text-sm text-gray-600">
                        {selectedRec.benefits.map((benefit: string, index: number) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-blue-800 mb-1">Why Recommended</h4>
                    <p className="text-sm text-blue-700">{selectedRec.whyRecommended}</p>
                  </div>
                </>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedRec(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Apply Recommendation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Food Analysis Component
const FoodAnalysis: React.FC = () => {
  const [analysis] = useState(mockFoodAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeFood = () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Search className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Food Analysis</h3>
          <p className="text-sm text-gray-600">Get instant feedback on your food choices</p>
        </div>
      </div>

      {/* Analysis Input */}
      <div className="space-y-4 mb-6">
        <div className="flex space-x-3">
          <button
            onClick={handleAnalyzeFood}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>Analyze Photo</span>
          </button>
          <button
            onClick={handleAnalyzeFood}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>Search Food</span>
          </button>
        </div>

        {isAnalyzing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Analyzing your food...</p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      <div className="space-y-4">
        {/* Overall Score */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-semibold text-gray-800">Nutrition Score</span>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(analysis.score)} mb-2`}>
            {analysis.score}
          </div>
          <AnimatedProgressBar
            progress={analysis.score}
            maxValue={100}
            currentValue={analysis.score}
            color="#10B981"
            height={8}
            showLabel={false}
            showPercentage={false}
          />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(analysis.breakdown).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                <span className={`text-sm font-bold ${getScoreColor(value)}`}>{value}</span>
              </div>
              <AnimatedProgressBar
                progress={value}
                maxValue={100}
                currentValue={value}
                color="#10B981"
                height={4}
                showLabel={false}
                showPercentage={false}
              />
            </div>
          ))}
        </div>

        {/* Feedback */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">AI Feedback</h4>
          {analysis.feedback.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                item.type === 'positive'
                  ? 'bg-green-50 border border-green-200'
                  : item.type === 'warning'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                {item.type === 'positive' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
                {item.type === 'warning' && <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                {item.type === 'suggestion' && <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />}
                <p className="text-sm text-gray-700">{item.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Alternatives */}
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Healthier Alternatives</h4>
          <div className="space-y-2">
            {analysis.alternatives.map((alt, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">{alt.name}</span>
                <div className="text-right">
                  <span className="text-xs text-green-600 font-medium">{alt.improvement}</span>
                  <p className="text-xs text-blue-600">{alt.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Motivational Messages Component
const MotivationalMessages: React.FC = () => {
  const [messages] = useState(motivationalMessages);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Award;
      case 'encouragement': return Heart;
      case 'tip': return Lightbulb;
      default: return MessageCircle;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-50 border-yellow-200';
      case 'encouragement': return 'bg-pink-50 border-pink-200';
      case 'tip': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Motivational Messages</h3>
      <div className="space-y-3">
        {messages.map((message) => {
          const Icon = getMessageIcon(message.type);
          
          return (
            <div
              key={message.id}
              className={`p-4 rounded-lg border ${getMessageColor(message.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 mb-1">{message.message}</p>
                  <p className="text-xs text-gray-500">{message.timestamp}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main AI Coach Page
const AICoachPage: React.FC = () => {
  const progress = useProgress();
  const userProfile = useUserProfile();
  const { isLoading, error } = useNutriStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI coach...</p>
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
              <h1 className="text-2xl font-bold">AI Nutrition Coach</h1>
              <p className="text-blue-200 text-sm">
                Your personalized nutrition assistant powered by AI
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
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Chat */}
          <AIChat />

          {/* Food Analysis */}
          <FoodAnalysis />
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <PersonalizedRecommendations />
        </div>

        {/* Motivational Messages */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <MotivationalMessages />
        </div>
      </div>
    </div>
  );
};

export default AICoachPage;
