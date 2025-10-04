# Diet Game - API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the Diet Game application, covering all RESTful endpoints, authentication, data models, and integration patterns. The API follows RESTful principles with JWT authentication and standardized response formats.

## 🚀 Quick Start

### Base URL
```
Production: https://api.dietgame.com/v1
Staging: https://staging-api.dietgame.com/v1
Development: http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

### Response Format
All API responses follow a consistent format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

## 📚 Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Nutrition Tracking](#nutrition-tracking)
3. [Gamification System](#gamification-system)
4. [Social Features](#social-features)
5. [AI Coach Integration](#ai-coach-integration)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [SDK & Examples](#sdk--examples)

---

## 🔐 Authentication & User Management

### User Registration
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "johndoe",
  "displayName": "John Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "height": 180,
  "weight": 75,
  "activityLevel": "moderate",
  "dietaryRestrictions": ["vegetarian"],
  "healthGoals": ["weight_loss"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "johndoe",
      "displayName": "John Doe",
      "isVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

### User Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Token Refresh
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johndoe",
    "displayName": "John Doe",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "height": 180,
    "weight": 75,
    "activityLevel": "moderate",
    "dietaryRestrictions": ["vegetarian"],
    "healthGoals": ["weight_loss"],
    "profile": {
      "bio": "Health enthusiast",
      "profileImageUrl": "https://example.com/profile.jpg",
      "timezone": "UTC",
      "language": "en"
    }
  }
}
```

### Update User Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "John Doe",
  "height": 180,
  "weight": 75,
  "activityLevel": "moderate",
  "dietaryRestrictions": ["vegetarian", "gluten_free"],
  "healthGoals": ["weight_loss", "muscle_gain"]
}
```

---

## 🍎 Nutrition Tracking

### Search Foods
```http
GET /api/v1/nutrition/foods/search?query=chicken&limit=20&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "id": "food_123",
        "name": "Chicken Breast",
        "brand": "Generic",
        "category": "Poultry",
        "servingSize": 100,
        "servingUnit": "g",
        "calories": 165,
        "protein": 31,
        "carbohydrates": 0,
        "fat": 3.6,
        "fiber": 0,
        "sugar": 0,
        "sodium": 74
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Log Meal
```http
POST /api/v1/nutrition/meals
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "mealType": "lunch",
  "foods": [
    {
      "foodId": "food_123",
      "quantity": 150,
      "unit": "g"
    }
  ],
  "notes": "Delicious and healthy lunch"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "meal_123",
    "date": "2024-01-15",
    "mealType": "lunch",
    "totalCalories": 450,
    "totalProtein": 35,
    "totalCarbohydrates": 25,
    "totalFat": 15,
    "foods": [
      {
        "foodId": "food_123",
        "name": "Chicken Breast",
        "quantity": 150,
        "unit": "g",
        "calories": 248,
        "protein": 46.5
      }
    ],
    "notes": "Delicious and healthy lunch"
  }
}
```

### Get Daily Nutrition Summary
```http
GET /api/v1/nutrition/daily-summary?date=2024-01-15
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "meals": [
      {
        "id": "meal_123",
        "mealType": "breakfast",
        "calories": 350,
        "protein": 15,
        "carbohydrates": 45,
        "fat": 12
      }
    ],
    "totals": {
      "calories": 1800,
      "protein": 120,
      "carbohydrates": 180,
      "fat": 65,
      "fiber": 25,
      "sugar": 45,
      "sodium": 2300
    },
    "goals": {
      "calories": 2000,
      "protein": 150,
      "carbohydrates": 200,
      "fat": 70
    },
    "progress": {
      "calories": 0.9,
      "protein": 0.8,
      "carbohydrates": 0.9,
      "fat": 0.93
    }
  }
}
```

### Set Nutrition Goals
```http
POST /api/v1/nutrition/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "goalType": "weight_loss",
  "targetWeight": 70,
  "targetCalories": 1800,
  "targetProtein": 120,
  "targetCarbohydrates": 180,
  "targetFat": 60,
  "targetFiber": 25,
  "targetSugar": 50,
  "targetSodium": 2300,
  "startDate": "2024-01-15",
  "targetDate": "2024-04-15"
}
```

### Barcode Scanning
```http
POST /api/v1/nutrition/foods/scan-barcode
Authorization: Bearer <token>
Content-Type: application/json

{
  "barcode": "1234567890123"
}
```

### Image Recognition
```http
POST /api/v1/nutrition/foods/recognize-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "image": <file>
}
```

---

## 🎮 Gamification System

### Get User Progress
```http
GET /api/v1/gamification/progress
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "level": 5,
    "experience": 1250,
    "totalPoints": 2500,
    "currentStreak": 7,
    "longestStreak": 15,
    "achievementsUnlocked": 12,
    "challengesCompleted": 8,
    "lastActivityDate": "2024-01-15"
  }
}
```

### Get Achievements
```http
GET /api/v1/gamification/achievements
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unlocked": [
      {
        "id": "ach_123",
        "name": "First Meal",
        "description": "Log your first meal",
        "icon": "https://example.com/icons/first-meal.png",
        "points": 50,
        "unlockedAt": "2024-01-10T10:30:00Z"
      }
    ],
    "available": [
      {
        "id": "ach_456",
        "name": "Week Warrior",
        "description": "Maintain a 7-day streak",
        "icon": "https://example.com/icons/week-warrior.png",
        "points": 200,
        "progress": 0.6
      }
    ]
  }
}
```

### Get Active Challenges
```http
GET /api/v1/gamification/challenges/active
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "daily": [
      {
        "id": "challenge_123",
        "title": "Eat 5 Vegetables Today",
        "description": "Include at least 5 different vegetables in your meals",
        "type": "daily",
        "requirements": {
          "vegetables": 5
        },
        "rewards": {
          "points": 100
        },
        "progress": 0.6,
        "endDate": "2024-01-15T23:59:59Z"
      }
    ],
    "weekly": [
      {
        "id": "challenge_456",
        "title": "Meal Prep Master",
        "description": "Plan and prepare 5 meals this week",
        "type": "weekly",
        "requirements": {
          "plannedMeals": 5
        },
        "rewards": {
          "points": 500,
          "badge": "meal_prep_master"
        },
        "progress": 0.4,
        "endDate": "2024-01-21T23:59:59Z"
      }
    ]
  }
}
```

### Join Challenge
```http
POST /api/v1/gamification/challenges/{challengeId}/join
Authorization: Bearer <token>
```

### Get Leaderboard
```http
GET /api/v1/gamification/leaderboard/{category}?timeRange=weekly&limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "rank": 1,
        "userId": "user_123",
        "username": "johndoe",
        "score": 2500,
        "profileImageUrl": "https://example.com/profile.jpg"
      }
    ],
    "userRank": {
      "rank": 15,
      "score": 1800
    },
    "totalParticipants": 1000,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

---

## 👥 Social Features

### Get User Feed
```http
GET /api/v1/social/feed?limit=20&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_123",
        "user": {
          "id": "user_456",
          "username": "jane_doe",
          "profileImageUrl": "https://example.com/profile.jpg"
        },
        "content": "Just completed my first week of healthy eating! 🎉",
        "postType": "achievement",
        "mediaUrls": ["https://example.com/achievement.jpg"],
        "tags": ["healthy_eating", "achievement"],
        "likesCount": 15,
        "commentsCount": 3,
        "sharesCount": 2,
        "createdAt": "2024-01-15T10:30:00Z",
        "isLiked": false
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Create Post
```http
POST /api/v1/social/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Check out this amazing healthy recipe I tried today!",
  "postType": "recipe",
  "mediaUrls": ["https://example.com/recipe.jpg"],
  "tags": ["recipe", "healthy", "cooking"],
  "isPublic": true
}
```

### Like Post
```http
POST /api/v1/social/posts/{postId}/like
Authorization: Bearer <token>
```

### Add Comment
```http
POST /api/v1/social/posts/{postId}/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great recipe! I'll definitely try this."
}
```

### Get Friends
```http
GET /api/v1/social/friends
Authorization: Bearer <token>
```

### Send Friend Request
```http
POST /api/v1/social/friend-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "toUserId": "user_456",
  "message": "Let's be friends and motivate each other!"
}
```

### Accept Friend Request
```http
POST /api/v1/social/friend-request/{requestId}/accept
Authorization: Bearer <token>
```

---

## 🤖 AI Coach Integration

### Get Meal Recommendations
```http
POST /api/v1/ai-coach/recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "meal_suggestions",
  "context": {
    "timeOfDay": "lunch",
    "dietaryRestrictions": ["vegetarian"],
    "calorieTarget": 500,
    "preferences": ["quick", "healthy"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec_123",
        "type": "meal",
        "title": "Mediterranean Quinoa Bowl",
        "description": "A nutritious and delicious quinoa bowl with vegetables",
        "calories": 480,
        "protein": 18,
        "carbohydrates": 65,
        "fat": 12,
        "prepTime": 15,
        "difficulty": "easy",
        "ingredients": [
          "1 cup quinoa",
          "1 cup mixed vegetables",
          "2 tbsp olive oil"
        ],
        "instructions": "Cook quinoa, sauté vegetables, combine and serve",
        "confidence": 0.85
      }
    ],
    "context": {
      "reasoning": "Based on your vegetarian preferences and calorie target",
      "alternatives": ["Greek Salad", "Veggie Wrap"]
    }
  }
}
```

### Get Food Analysis
```http
POST /api/v1/ai-coach/analyze-food
Authorization: Bearer <token>
Content-Type: application/json

{
  "foodItem": {
    "name": "Chicken Breast",
    "quantity": 150,
    "calories": 248
  },
  "context": "meal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "overall": "Good choice! Your lunch is well-balanced.",
      "strengths": [
        "High protein content",
        "Appropriate portion size",
        "Good calorie range for lunch"
      ],
      "suggestions": [
        "Consider adding more vegetables for fiber",
        "Include a healthy fat source like avocado"
      ],
      "score": 8.5,
      "nextMeal": "Consider a lighter dinner to balance your daily intake"
    }
  }
}
```

### Get Motivational Message
```http
GET /api/v1/ai-coach/motivational-message?context=daily_checkin
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "type": "encouragement",
      "content": "Great job on logging your meals today! You're building healthy habits that will last a lifetime. Keep up the excellent work! 💪",
      "tone": "positive",
      "context": "daily_checkin",
      "actionableAdvice": "Try to include one more serving of vegetables in your next meal",
      "encouragementLevel": 8
    },
    "nextSteps": [
      "Log your next meal",
      "Check your progress toward daily goals",
      "Share your achievement with friends"
    ]
  }
}
```

### AI Chat
```http
POST /api/v1/ai-coach/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What should I eat for breakfast to help with weight loss?",
  "context": {
    "currentGoals": ["weight_loss"],
    "dietaryRestrictions": ["vegetarian"],
    "timeOfDay": "morning"
  },
  "conversationId": "conv_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "For a weight-loss focused vegetarian breakfast, I recommend a protein-rich meal that will keep you satisfied until lunch. Try a Greek yogurt parfait with berries and nuts, or scrambled tofu with vegetables. Both options provide protein and fiber to help control hunger while staying within your calorie goals.",
    "conversationId": "conv_123",
    "suggestions": [
      "Greek yogurt parfait recipe",
      "Tofu scramble ideas",
      "Vegetarian protein sources"
    ],
    "xpEarned": 10,
    "followUpQuestions": [
      "Would you like a specific recipe?",
      "Do you have any food allergies?",
      "What's your typical breakfast routine?"
    ]
  }
}
```

---

## ❌ Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

### HTTP Status Codes
- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict
- **422 Unprocessable Entity**: Validation error
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Common Error Codes
- `UNAUTHORIZED`: Invalid or expired token
- `VALIDATION_ERROR`: Invalid input data
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server error

---

## 🚦 Rate Limiting

### Rate Limit Rules
- **Authentication**: 5 requests per minute
- **General API**: 100 requests per minute
- **Search**: 50 requests per minute
- **File Upload**: 10 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
X-RateLimit-Retry-After: 60
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## 📚 SDK & Examples

### JavaScript/TypeScript SDK
```typescript
import { DietGameAPI } from '@dietgame/api-client';

const api = new DietGameAPI({
  baseUrl: 'https://api.dietgame.com/v1',
  apiKey: 'your-api-key'
});

// Authentication
const user = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Log a meal
const meal = await api.nutrition.logMeal({
  date: '2024-01-15',
  mealType: 'lunch',
  foods: [
    {
      foodId: 'food_123',
      quantity: 150,
      unit: 'g'
    }
  ]
});

// Get AI recommendations
const recommendations = await api.aiCoach.getRecommendations({
  type: 'meal_suggestions',
  context: {
    timeOfDay: 'lunch',
    dietaryRestrictions: ['vegetarian']
  }
});
```

### Python SDK
```python
from dietgame import DietGameAPI

api = DietGameAPI(
    base_url='https://api.dietgame.com/v1',
    api_key='your-api-key'
)

# Authentication
user = api.auth.login(
    email='user@example.com',
    password='password123'
)

# Log a meal
meal = api.nutrition.log_meal(
    date='2024-01-15',
    meal_type='lunch',
    foods=[
        {
            'foodId': 'food_123',
            'quantity': 150,
            'unit': 'g'
        }
    ]
)
```

### cURL Examples
```bash
# Login
curl -X POST https://api.dietgame.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get user profile
curl -X GET https://api.dietgame.com/v1/users/profile \
  -H "Authorization: Bearer <token>"

# Log a meal
curl -X POST https://api.dietgame.com/v1/nutrition/meals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "mealType": "lunch",
    "foods": [{"foodId": "food_123", "quantity": 150, "unit": "g"}]
  }'
```

---

## 🔗 Related Documentation

- [API Endpoints Requirements](../specs/api-endpoints/requirements.md)
- [API Endpoints Design](../specs/api-endpoints/design.md)
- [API Endpoints Tasks](../specs/api-endpoints/tasks.md)
- [Database Schema](../specs/database-schema/design.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Rate Limiting Guide](./RATE_LIMITING.md)

---

## 📞 Support

For API support and questions:
- **Documentation**: This API documentation
- **Technical Issues**: Contact the API team
- **Feature Requests**: Submit via GitHub issues
- **Status Page**: [status.dietgame.com](https://status.dietgame.com)

---

*Last updated: January 15, 2024*
*API Version: v1.0.0*