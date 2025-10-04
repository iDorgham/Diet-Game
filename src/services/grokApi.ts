// Grok AI integration for Level 202/303
// Provides AI-powered nutrition recommendations and recipe generation

import axios from 'axios';
import { UserProfile } from '../types';

const GROK_API_URL = process.env.REACT_APP_GROK_API_URL || 'https://api.grok.ai/v1';
const GROK_API_KEY = process.env.REACT_APP_GROK_API_KEY || 'demo-key';

const grokClient = axios.create({
  baseURL: GROK_API_URL,
  headers: {
    'Authorization': `Bearer ${GROK_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

export interface GrokPlanRequest {
  profile: UserProfile;
  query: string;
  context?: {
    currentMeals?: any[];
    recentActivity?: any[];
    goals?: any;
  };
}

export interface GrokPlanResponse {
  plan: string;
  confidence: number;
  suggestions: string[];
  xpAward: number;
  followUpQuestions: string[];
}

// Mock responses for development
const mockGrokResponse = (query: string, dietType: string): GrokPlanResponse => {
  const responses = {
    breakfast: `For breakfast on your ${dietType}, I recommend a protein-rich meal to start your day. Try scrambled eggs with avocado and spinach, or Greek yogurt with berries and nuts. This will provide sustained energy and keep you satisfied until lunch.`,
    lunch: `For lunch, focus on lean proteins and vegetables. A grilled chicken salad with mixed greens, olive oil dressing, and nuts would be perfect for your ${dietType}. This combination provides protein, healthy fats, and essential nutrients.`,
    dinner: `For dinner, consider a balanced meal with fish or lean meat, steamed vegetables, and a small portion of complex carbs if your ${dietType} allows. This will help with recovery and provide nutrients for the next day.`,
    snack: `For healthy snacking on your ${dietType}, try nuts, Greek yogurt, or vegetable sticks with hummus. These options provide protein and healthy fats to keep you satisfied between meals.`,
    recipe: `Here's a personalized recipe for your ${dietType}: Start with a base of lean protein, add plenty of colorful vegetables, and use healthy cooking methods like grilling or steaming. Season with herbs and spices for flavor without extra calories.`,
    default: `Based on your ${dietType} and current goals, I recommend focusing on whole foods, adequate protein intake, and staying hydrated. Consider meal timing and portion control to optimize your results.`
  };

  const queryLower = query.toLowerCase();
  let response = responses.default;

  if (queryLower.includes('breakfast')) response = responses.breakfast;
  else if (queryLower.includes('lunch')) response = responses.lunch;
  else if (queryLower.includes('dinner')) response = responses.dinner;
  else if (queryLower.includes('snack')) response = responses.snack;
  else if (queryLower.includes('recipe') || queryLower.includes('cook')) response = responses.recipe;

  return {
    plan: response,
    confidence: 0.8 + Math.random() * 0.2, // 80-100% confidence
    suggestions: [
      'Track your water intake throughout the day',
      'Include protein with every meal',
      'Plan your meals in advance',
      'Listen to your body\'s hunger cues'
    ],
    xpAward: 10,
    followUpQuestions: [
      'How are you feeling today?',
      'Any specific dietary restrictions?',
      'What are your fitness goals?',
      'Need help with meal planning?'
    ]
  };
};

export const grokApi = {
  // Generate personalized nutrition plan
  async generatePlan(request: GrokPlanRequest): Promise<GrokPlanResponse> {
    try {
      // In development, return mock response
      if (process.env.NODE_ENV === 'development' || GROK_API_KEY === 'demo-key') {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockGrokResponse(request.query, request.profile.dietType)), 1500);
        });
      }

      const response = await grokClient.post('/ai/plan', request);
      return response.data;
    } catch (error) {
      console.error('Grok API error:', error);
      // Fallback to mock response
      return mockGrokResponse(request.query, request.profile.dietType);
    }
  },

  // Analyze food from image
  async analyzeFood(imageData: string, profile: UserProfile): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'development' || GROK_API_KEY === 'demo-key') {
        return {
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
      }

      const response = await grokClient.post('/ai/analyze-food', {
        image: imageData,
        profile,
        dietType: profile.dietType
      });
      return response.data;
    } catch (error) {
      console.error('Food analysis error:', error);
      throw error;
    }
  },

  // Get personalized recommendations
  async getRecommendations(profile: UserProfile): Promise<any[]> {
    try {
      if (process.env.NODE_ENV === 'development' || GROK_API_KEY === 'demo-key') {
        return [
          {
            id: 1,
            type: 'meal',
            title: 'Keto-Friendly Breakfast Bowl',
            description: 'High protein breakfast to start your day right.',
            confidence: 92,
            calories: 420,
            protein: 28,
            carbs: 8,
            fat: 32,
            prepTime: '15 min',
            difficulty: 'Easy'
          },
          {
            id: 2,
            type: 'tip',
            title: 'Hydration Boost',
            description: 'You\'re 2 glasses short of your daily water goal.',
            confidence: 88,
            tips: [
              'Add lemon slices to your water for flavor',
              'Set hourly reminders to drink water',
              'Eat water-rich foods like cucumber'
            ]
          },
          {
            id: 3,
            type: 'workout',
            title: 'Post-Meal Walk',
            description: 'A 10-minute walk after your last meal can help with digestion.',
            confidence: 85,
            duration: '10 minutes',
            intensity: 'Light',
            benefits: ['Improved digestion', 'Better blood sugar control']
          }
        ];
      }

      const response = await grokClient.post('/ai/recommendations', {
        profile,
        preferences: {
          dietType: profile.dietType,
          bodyType: profile.bodyType
        }
      });
      return response.data;
    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    }
  },

  // Generate recipe from ingredients
  async generateRecipe(ingredients: string[], profile: UserProfile): Promise<any> {
    try {
      const query = `Create a healthy recipe using these ingredients: ${ingredients.join(', ')}. Make it suitable for ${profile.dietType}. Include cooking instructions and nutritional benefits.`;
      
      const response = await this.generatePlan({
        profile,
        query,
        context: {
          currentMeals: [],
          recentActivity: [],
          goals: {}
        }
      });

      return {
        name: `Recipe with ${ingredients.join(', ')}`,
        description: response.plan,
        ingredients: ingredients,
        instructions: [
          '1. Prepare all ingredients',
          '2. Follow cooking method as described',
          '3. Season to taste',
          '4. Serve and enjoy!'
        ],
        confidence: response.confidence,
        xpReward: 15 + (ingredients.length * 2)
      };
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw error;
    }
  }
};
