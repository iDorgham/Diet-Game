/**
 * Nutrition Routes
 * Nutrition tracking and analysis
 */

import { Router, Request, Response } from 'express';
import { rateLimiter } from '@/middleware/rateLimiter';
import { asyncHandler } from '@/middleware/errorHandler';
import { foodDatabaseService } from '@/services/foodDatabaseService';
import { nutritionApiService } from '@/services/nutritionApiService';

const router = Router();

// ============================================================================
// FOOD SEARCH AND DISCOVERY
// ============================================================================

// Search for food items
router.get('/search', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { q: query, category, brand, dietary_restrictions, max_calories, min_protein, verified_only, page = 1, limit = 20 } = req.query;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Query parameter is required',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  const filters = {
    category: category as string,
    brand: brand as string,
    dietary_restrictions: dietary_restrictions ? (dietary_restrictions as string).split(',') : undefined,
    max_calories: max_calories ? parseInt(max_calories as string) : undefined,
    min_protein: min_protein ? parseInt(min_protein as string) : undefined,
    verified_only: verified_only === 'true'
  };

  const result = await foodDatabaseService.searchFoodItems(
    query,
    filters,
    parseInt(page as string),
    parseInt(limit as string)
  );

  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// Get food item details
router.get('/food/:foodId', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { foodId } = req.params;
  
  const foodItem = await foodDatabaseService.getFoodItemById(foodId);
  
  if (!foodItem) {
    return res.status(404).json({
      success: false,
      error: 'Food item not found',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  res.json({
    success: true,
    data: foodItem,
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// ============================================================================
// FOOD LOGGING
// ============================================================================

// Log food item
router.post('/log', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { food_item_id, food_name, portion_size, unit, meal_type, notes } = req.body;
  
  // Validate required fields
  if (!food_name || !portion_size || !unit || !meal_type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: food_name, portion_size, unit, meal_type',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  // Validate meal_type
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];
  if (!validMealTypes.includes(meal_type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid meal_type. Must be one of: ' + validMealTypes.join(', '),
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  const logId = await foodDatabaseService.logFoodEntry(userId, {
    food_item_id,
    food_name,
    portion_size: parseFloat(portion_size),
    unit,
    meal_type,
    notes
  });

  res.json({
    success: true,
    data: {
      logId,
      userId,
      food_name,
      portion_size,
      unit,
      meal_type,
      notes
    },
    message: 'Food logged successfully',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// Get nutrition logs
router.get('/logs', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { start_date, end_date, meal_type, page = 1, limit = 50 } = req.query;
  
  let startDate: Date | undefined;
  let endDate: Date | undefined;
  
  if (start_date) {
    startDate = new Date(start_date as string);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid start_date format',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }
  }
  
  if (end_date) {
    endDate = new Date(end_date as string);
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid end_date format',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    }
  }

  const logs = await foodDatabaseService.getNutritionLogs(
    userId,
    startDate,
    endDate,
    meal_type as string
  );

  // Apply pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedLogs = logs.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      logs: paginatedLogs,
      total: logs.length,
      page: pageNum,
      limit: limitNum,
      has_more: endIndex < logs.length
    },
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// Delete nutrition log
router.delete('/logs/:logId', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { logId } = req.params;
  
  const deleted = await foodDatabaseService.deleteNutritionLog(logId, userId);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Nutrition log not found or access denied',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  res.json({
    success: true,
    message: 'Nutrition log deleted successfully',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// ============================================================================
// NUTRITION GOALS
// ============================================================================

// Set nutrition goals
router.post('/goals', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const goals = req.body;
  
  const goalId = await foodDatabaseService.setNutritionGoals(userId, goals);

  res.json({
    success: true,
    data: {
      goalId,
      userId,
      goals
    },
    message: 'Nutrition goals set successfully',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// Get current nutrition goals
router.get('/goals', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  const goals = await foodDatabaseService.getNutritionGoals(userId);

  res.json({
    success: true,
    data: goals,
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// ============================================================================
// DAILY NUTRITION SUMMARIES
// ============================================================================

// Get daily nutrition summary
router.get('/summary/:date', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { date } = req.params;
  
  const summaryDate = new Date(date);
  if (isNaN(summaryDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid date format',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  const summary = await foodDatabaseService.getDailyNutritionSummary(userId, summaryDate);

  res.json({
    success: true,
    data: summary,
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// Get nutrition summary for date range
router.get('/summary', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { start_date, end_date } = req.query;
  
  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      error: 'start_date and end_date are required',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  const startDate = new Date(start_date as string);
  const endDate = new Date(end_date as string);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid date format',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  const summaries = await foodDatabaseService.getNutritionSummaryRange(userId, startDate, endDate);

  res.json({
    success: true,
    data: {
      summaries,
      total: summaries.length,
      start_date: startDate,
      end_date: endDate
    },
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// ============================================================================
// RECIPE OPERATIONS
// ============================================================================

// Search recipes
router.get('/recipes/search', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { q: query, category, cuisine, difficulty, limit = 20 } = req.query;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Query parameter is required',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  const recipes = await foodDatabaseService.searchRecipes(
    query,
    category as string,
    cuisine as string,
    difficulty as string,
    parseInt(limit as string)
  );

  res.json({
    success: true,
    data: {
      recipes,
      total: recipes.length,
      query,
      filters: { category, cuisine, difficulty }
    },
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// Get recipe details
router.get('/recipes/:recipeId', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  
  const recipe = await foodDatabaseService.getRecipeById(recipeId);
  
  if (!recipe) {
    return res.status(404).json({
      success: false,
      error: 'Recipe not found',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  res.json({
    success: true,
    data: recipe,
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// Add new recipe
router.post('/recipes', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const recipe = req.body;
  
  // Validate required fields
  if (!recipe.title || !recipe.category || !recipe.ingredients || !recipe.instructions) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: title, category, ingredients, instructions',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  const recipeId = await foodDatabaseService.addRecipe(recipe, userId);

  res.json({
    success: true,
    data: {
      recipeId,
      userId,
      recipe: { ...recipe, id: recipeId }
    },
    message: 'Recipe added successfully',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

// ============================================================================
// NUTRITION ANALYSIS
// ============================================================================

// Get nutrition for ingredients
router.post('/analyze', rateLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { ingredients } = req.body;
  
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'ingredients array is required',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  const nutritionData = await nutritionApiService.getNutritionForIngredients(ingredients);

  res.json({
    success: true,
    data: {
      ingredients,
      nutrition: nutritionData
    },
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}));

export default router;
