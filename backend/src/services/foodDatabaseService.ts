/**
 * Food Database Service
 * Handles food database operations and business logic
 */

import { Pool } from 'pg';
import { nutritionApiService, FoodItem, SearchFilters, SearchResult } from './nutritionApiService';
import { config } from '../config/environment';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface FoodLogEntry {
  id: string;
  user_id: string;
  food_item_id?: string;
  food_name: string;
  portion_size: number;
  unit: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  nutritional_data: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  notes?: string;
  logged_at: Date;
}

export interface NutritionGoal {
  id: string;
  user_id: string;
  daily_calories?: number;
  daily_protein?: number;
  daily_carbs?: number;
  daily_fat?: number;
  daily_fiber?: number;
  daily_sugar?: number;
  daily_sodium?: number;
  daily_water?: number;
  protein_ratio?: number;
  carbs_ratio?: number;
  fat_ratio?: number;
  dietary_restrictions: string[];
  health_goals: string[];
  is_active: boolean;
  start_date: Date;
  end_date?: Date;
}

export interface DailyNutritionSummary {
  id: string;
  user_id: string;
  date: Date;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sugar: number;
  total_sodium: number;
  total_water: number;
  meal_breakdown: Record<string, any>;
  goal_progress: Record<string, any>;
  nutrition_score: number;
  insights: Record<string, any>;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  category: string;
  cuisine?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings: number;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    step_number: number;
    instruction: string;
    duration?: number;
    temperature?: number;
    equipment?: string[];
    tips?: string[];
  }>;
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  tags: string[];
  images: string[];
  rating: number;
  review_count: number;
  source: 'USER' | 'SPOONACULAR' | 'EDAMAM' | 'CUSTOM';
  created_by?: string;
  is_verified: boolean;
  is_public: boolean;
}

// ============================================================================
// FOOD DATABASE SERVICE CLASS
// ============================================================================

export class FoodDatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  // ============================================================================
  // FOOD ITEM OPERATIONS
  // ============================================================================

  /**
   * Search for food items in local database and external APIs
   */
  async searchFoodItems(
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResult> {
    try {
      // First search local database
      const localResults = await this.searchLocalFoodItems(query, filters, page, limit);
      
      // If we have enough local results, return them
      if (localResults.items.length >= limit) {
        return localResults;
      }

      // Otherwise, search external APIs
      const externalResults = await nutritionApiService.searchFoods(
        query,
        filters,
        page,
        Math.max(limit - localResults.items.length, 10)
      );

      // Combine and deduplicate results
      const combinedResults = this.combineSearchResults(localResults, externalResults);
      
      return {
        items: combinedResults.items.slice(0, limit),
        total: combinedResults.total,
        page,
        limit,
        has_more: combinedResults.items.length > limit
      };
    } catch (error) {
      console.error('Error searching food items:', error);
      throw new Error('Failed to search food items');
    }
  }

  /**
   * Get food item by ID
   */
  async getFoodItemById(foodId: string): Promise<FoodItem | null> {
    try {
      // Check if it's a local food item
      if (!foodId.includes('_')) {
        const result = await this.pool.query(
          'SELECT * FROM food_items WHERE id = $1',
          [foodId]
        );
        
        if (result.rows.length > 0) {
          return this.transformDbRowToFoodItem(result.rows[0]);
        }
      }

      // Otherwise, get from external API
      return await nutritionApiService.getFoodDetails(foodId);
    } catch (error) {
      console.error('Error getting food item:', error);
      return null;
    }
  }

  /**
   * Add a new food item to the database
   */
  async addFoodItem(foodItem: Omit<FoodItem, 'id'>, userId?: string): Promise<string> {
    try {
      const result = await this.pool.query(
        `INSERT INTO food_items (
          name, brand, barcode, category, subcategory, description,
          nutritional_info, serving_size, ingredients, allergens,
          dietary_tags, source, verified, confidence_score, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          foodItem.name,
          foodItem.brand,
          foodItem.barcode,
          foodItem.category,
          foodItem.subcategory,
          foodItem.description,
          JSON.stringify(foodItem.nutritional_info),
          JSON.stringify(foodItem.serving_size),
          foodItem.ingredients,
          foodItem.allergens,
          foodItem.dietary_tags,
          foodItem.source,
          foodItem.verified,
          foodItem.confidence_score,
          userId
        ]
      );

      return result.rows[0].id;
    } catch (error) {
      console.error('Error adding food item:', error);
      throw new Error('Failed to add food item');
    }
  }

  // ============================================================================
  // NUTRITION LOGGING OPERATIONS
  // ============================================================================

  /**
   * Log a food entry for a user
   */
  async logFoodEntry(
    userId: string,
    foodData: {
      food_item_id?: string;
      food_name: string;
      portion_size: number;
      unit: string;
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
      notes?: string;
    }
  ): Promise<string> {
    try {
      // Get nutritional data
      let nutritionalData;
      
      if (foodData.food_item_id) {
        const foodItem = await this.getFoodItemById(foodData.food_item_id);
        if (foodItem) {
          nutritionalData = this.calculateNutritionForPortion(
            foodItem.nutritional_info,
            foodData.portion_size,
            foodData.unit,
            foodItem.serving_size
          );
        }
      }

      // If no nutritional data from food item, use basic calculation
      if (!nutritionalData) {
        nutritionalData = await this.estimateNutrition(foodData.food_name, foodData.portion_size, foodData.unit);
      }

      // Insert nutrition log
      const result = await this.pool.query(
        `INSERT INTO nutrition_logs (
          user_id, food_item_id, food_name, portion_size, unit,
          meal_type, nutritional_data, notes, logged_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          userId,
          foodData.food_item_id,
          foodData.food_name,
          foodData.portion_size,
          foodData.unit,
          foodData.meal_type,
          JSON.stringify(nutritionalData),
          foodData.notes,
          new Date()
        ]
      );

      // Update daily summary
      await this.updateDailyNutritionSummary(userId, new Date());

      return result.rows[0].id;
    } catch (error) {
      console.error('Error logging food entry:', error);
      throw new Error('Failed to log food entry');
    }
  }

  /**
   * Get nutrition logs for a user
   */
  async getNutritionLogs(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    mealType?: string
  ): Promise<FoodLogEntry[]> {
    try {
      let query = `
        SELECT * FROM nutrition_logs 
        WHERE user_id = $1
      `;
      const params: any[] = [userId];
      let paramIndex = 2;

      if (startDate) {
        query += ` AND logged_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND logged_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      if (mealType) {
        query += ` AND meal_type = $${paramIndex}`;
        params.push(mealType);
        paramIndex++;
      }

      query += ` ORDER BY logged_at DESC`;

      const result = await this.pool.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        food_item_id: row.food_item_id,
        food_name: row.food_name,
        portion_size: row.portion_size,
        unit: row.unit,
        meal_type: row.meal_type,
        nutritional_data: row.nutritional_data,
        notes: row.notes,
        logged_at: row.logged_at
      }));
    } catch (error) {
      console.error('Error getting nutrition logs:', error);
      throw new Error('Failed to get nutrition logs');
    }
  }

  /**
   * Delete a nutrition log entry
   */
  async deleteNutritionLog(logId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        'DELETE FROM nutrition_logs WHERE id = $1 AND user_id = $2',
        [logId, userId]
      );

      if (result.rowCount && result.rowCount > 0) {
        // Update daily summary
        await this.updateDailyNutritionSummary(userId, new Date());
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting nutrition log:', error);
      throw new Error('Failed to delete nutrition log');
    }
  }

  // ============================================================================
  // NUTRITION GOALS OPERATIONS
  // ============================================================================

  /**
   * Set nutrition goals for a user
   */
  async setNutritionGoals(userId: string, goals: Partial<NutritionGoal>): Promise<string> {
    try {
      // Deactivate current goals
      await this.pool.query(
        'UPDATE user_nutrition_goals SET is_active = false WHERE user_id = $1',
        [userId]
      );

      // Insert new goals
      const result = await this.pool.query(
        `INSERT INTO user_nutrition_goals (
          user_id, daily_calories, daily_protein, daily_carbs, daily_fat,
          daily_fiber, daily_sugar, daily_sodium, daily_water,
          protein_ratio, carbs_ratio, fat_ratio,
          dietary_restrictions, health_goals, is_active, start_date, end_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id`,
        [
          userId,
          goals.daily_calories,
          goals.daily_protein,
          goals.daily_carbs,
          goals.daily_fat,
          goals.daily_fiber,
          goals.daily_sugar,
          goals.daily_sodium,
          goals.daily_water,
          goals.protein_ratio,
          goals.carbs_ratio,
          goals.fat_ratio,
          goals.dietary_restrictions || [],
          goals.health_goals || [],
          true,
          goals.start_date || new Date(),
          goals.end_date
        ]
      );

      return result.rows[0].id;
    } catch (error) {
      console.error('Error setting nutrition goals:', error);
      throw new Error('Failed to set nutrition goals');
    }
  }

  /**
   * Get current nutrition goals for a user
   */
  async getNutritionGoals(userId: string): Promise<NutritionGoal | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM user_nutrition_goals 
         WHERE user_id = $1 AND is_active = true 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        daily_calories: row.daily_calories,
        daily_protein: row.daily_protein,
        daily_carbs: row.daily_carbs,
        daily_fat: row.daily_fat,
        daily_fiber: row.daily_fiber,
        daily_sugar: row.daily_sugar,
        daily_sodium: row.daily_sodium,
        daily_water: row.daily_water,
        protein_ratio: row.protein_ratio,
        carbs_ratio: row.carbs_ratio,
        fat_ratio: row.fat_ratio,
        dietary_restrictions: row.dietary_restrictions || [],
        health_goals: row.health_goals || [],
        is_active: row.is_active,
        start_date: row.start_date,
        end_date: row.end_date
      };
    } catch (error) {
      console.error('Error getting nutrition goals:', error);
      throw new Error('Failed to get nutrition goals');
    }
  }

  // ============================================================================
  // DAILY NUTRITION SUMMARY OPERATIONS
  // ============================================================================

  /**
   * Get daily nutrition summary for a user
   */
  async getDailyNutritionSummary(userId: string, date: Date): Promise<DailyNutritionSummary | null> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM daily_nutrition_summaries WHERE user_id = $1 AND date = $2',
        [userId, date]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        date: row.date,
        total_calories: row.total_calories,
        total_protein: row.total_protein,
        total_carbs: row.total_carbs,
        total_fat: row.total_fat,
        total_fiber: row.total_fiber,
        total_sugar: row.total_sugar,
        total_sodium: row.total_sodium,
        total_water: row.total_water,
        meal_breakdown: row.meal_breakdown || {},
        goal_progress: row.goal_progress || {},
        nutrition_score: row.nutrition_score,
        insights: row.insights || {}
      };
    } catch (error) {
      console.error('Error getting daily nutrition summary:', error);
      throw new Error('Failed to get daily nutrition summary');
    }
  }

  /**
   * Get nutrition summary for a date range
   */
  async getNutritionSummaryRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyNutritionSummary[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM daily_nutrition_summaries 
         WHERE user_id = $1 AND date >= $2 AND date <= $3 
         ORDER BY date DESC`,
        [userId, startDate, endDate]
      );

      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        date: row.date,
        total_calories: row.total_calories,
        total_protein: row.total_protein,
        total_carbs: row.total_carbs,
        total_fat: row.total_fat,
        total_fiber: row.total_fiber,
        total_sugar: row.total_sugar,
        total_sodium: row.total_sodium,
        total_water: row.total_water,
        meal_breakdown: row.meal_breakdown || {},
        goal_progress: row.goal_progress || {},
        nutrition_score: row.nutrition_score,
        insights: row.insights || {}
      }));
    } catch (error) {
      console.error('Error getting nutrition summary range:', error);
      throw new Error('Failed to get nutrition summary range');
    }
  }

  // ============================================================================
  // RECIPE OPERATIONS
  // ============================================================================

  /**
   * Search for recipes
   */
  async searchRecipes(
    query: string,
    category?: string,
    cuisine?: string,
    difficulty?: string,
    limit: number = 20
  ): Promise<Recipe[]> {
    try {
      // Search external APIs first
      const externalRecipes = await nutritionApiService.searchRecipes(query, limit);
      
      // Transform external recipes to our format
      const transformedRecipes = externalRecipes.map(recipe => this.transformExternalRecipe(recipe));
      
      // Also search local database
      let localQuery = `
        SELECT * FROM recipes 
        WHERE is_public = true AND (
          title ILIKE $1 OR description ILIKE $1
        )
      `;
      const params: any[] = [`%${query}%`];
      let paramIndex = 2;

      if (category) {
        localQuery += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (cuisine) {
        localQuery += ` AND cuisine = $${paramIndex}`;
        params.push(cuisine);
        paramIndex++;
      }

      if (difficulty) {
        localQuery += ` AND difficulty = $${paramIndex}`;
        params.push(difficulty);
        paramIndex++;
      }

      localQuery += ` ORDER BY rating DESC, review_count DESC LIMIT $${paramIndex}`;
      params.push(limit);

      const localResult = await this.pool.query(localQuery, params);
      const localRecipes = localResult.rows.map(row => this.transformDbRowToRecipe(row));

      // Combine and deduplicate
      const allRecipes = [...transformedRecipes, ...localRecipes];
      return this.removeDuplicateRecipes(allRecipes).slice(0, limit);
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw new Error('Failed to search recipes');
    }
  }

  /**
   * Get recipe by ID
   */
  async getRecipeById(recipeId: string): Promise<Recipe | null> {
    try {
      // Check if it's an external recipe
      if (recipeId.startsWith('spoonacular_')) {
        const externalId = parseInt(recipeId.replace('spoonacular_', ''));
        const externalRecipe = await nutritionApiService.getRecipeDetails(externalId);
        return externalRecipe ? this.transformExternalRecipe(externalRecipe) : null;
      }

      // Get from local database
      const result = await this.pool.query(
        'SELECT * FROM recipes WHERE id = $1',
        [recipeId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.transformDbRowToRecipe(result.rows[0]);
    } catch (error) {
      console.error('Error getting recipe:', error);
      return null;
    }
  }

  /**
   * Add a new recipe
   */
  async addRecipe(recipe: Omit<Recipe, 'id'>, userId?: string): Promise<string> {
    try {
      const result = await this.pool.query(
        `INSERT INTO recipes (
          title, description, category, cuisine, difficulty,
          prep_time, cook_time, total_time, servings,
          ingredients, instructions, nutritional_info,
          tags, images, rating, review_count, source,
          created_by, is_verified, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id`,
        [
          recipe.title,
          recipe.description,
          recipe.category,
          recipe.cuisine,
          recipe.difficulty,
          recipe.prep_time,
          recipe.cook_time,
          recipe.total_time,
          recipe.servings,
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.instructions),
          JSON.stringify(recipe.nutritional_info),
          recipe.tags,
          recipe.images,
          recipe.rating,
          recipe.review_count,
          recipe.source,
          userId,
          recipe.is_verified,
          recipe.is_public
        ]
      );

      return result.rows[0].id;
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw new Error('Failed to add recipe');
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async searchLocalFoodItems(
    query: string,
    filters: SearchFilters,
    page: number,
    limit: number
  ): Promise<SearchResult> {
    let sql = `
      SELECT * FROM food_items 
      WHERE name ILIKE $1 OR description ILIKE $1
    `;
    const params: any[] = [`%${query}%`];
    let paramIndex = 2;

    if (filters.category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.brand) {
      sql += ` AND brand = $${paramIndex}`;
      params.push(filters.brand);
      paramIndex++;
    }

    if (filters.verified_only) {
      sql += ` AND verified = true`;
    }

    sql += ` ORDER BY confidence_score DESC, name ASC`;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, (page - 1) * limit);

    const result = await this.pool.query(sql, params);
    
    return {
      items: result.rows.map(row => this.transformDbRowToFoodItem(row)),
      total: result.rows.length,
      page,
      limit,
      has_more: result.rows.length === limit
    };
  }

  private combineSearchResults(local: SearchResult, external: SearchResult): SearchResult {
    const combinedItems = [...local.items, ...external.items];
    const uniqueItems = this.removeDuplicateFoodItems(combinedItems);

    return {
      items: uniqueItems,
      total: uniqueItems.length,
      page: local.page,
      limit: local.limit,
      has_more: uniqueItems.length > local.limit
    };
  }

  private removeDuplicateFoodItems(items: FoodItem[]): FoodItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = item.name.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private removeDuplicateRecipes(recipes: Recipe[]): Recipe[] {
    const seen = new Set<string>();
    return recipes.filter(recipe => {
      const key = recipe.title.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private transformDbRowToFoodItem(row: any): FoodItem {
    return {
      id: row.id,
      name: row.name,
      brand: row.brand,
      barcode: row.barcode,
      category: row.category,
      subcategory: row.subcategory,
      description: row.description,
      nutritional_info: row.nutritional_info,
      serving_size: row.serving_size,
      ingredients: row.ingredients,
      allergens: row.allergens,
      dietary_tags: row.dietary_tags,
      source: row.source,
      verified: row.verified,
      confidence_score: row.confidence_score
    };
  }

  private transformDbRowToRecipe(row: any): Recipe {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      cuisine: row.cuisine,
      difficulty: row.difficulty,
      prep_time: row.prep_time,
      cook_time: row.cook_time,
      total_time: row.total_time,
      servings: row.servings,
      ingredients: row.ingredients,
      instructions: row.instructions,
      nutritional_info: row.nutritional_info,
      tags: row.tags,
      images: row.images,
      rating: row.rating,
      review_count: row.review_count,
      source: row.source,
      created_by: row.created_by,
      is_verified: row.is_verified,
      is_public: row.is_public
    };
  }

  private transformExternalRecipe(recipe: any): Recipe {
    return {
      id: `spoonacular_${recipe.id}`,
      title: recipe.title,
      description: recipe.summary?.replace(/<[^>]*>/g, '') || '',
      category: recipe.dishTypes?.[0] || 'Other',
      cuisine: recipe.cuisines?.[0] || undefined,
      difficulty: this.mapDifficulty(recipe.readyInMinutes),
      prep_time: recipe.preparationMinutes,
      cook_time: recipe.cookingMinutes,
      total_time: recipe.readyInMinutes,
      servings: recipe.servings,
      ingredients: recipe.extendedIngredients?.map((ing: any) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        notes: ing.original
      })) || [],
      instructions: recipe.analyzedInstructions?.[0]?.steps?.map((step: any) => ({
        step_number: step.number,
        instruction: step.step,
        duration: step.length?.number,
        equipment: step.equipment?.map((eq: any) => eq.name) || []
      })) || [],
      nutritional_info: this.extractRecipeNutrition(recipe.nutrition),
      tags: [...(recipe.dishTypes || []), ...(recipe.cuisines || [])],
      images: recipe.image ? [recipe.image] : [],
      rating: recipe.spoonacularScore / 20, // Convert to 5-star scale
      review_count: recipe.aggregateLikes || 0,
      source: 'SPOONACULAR' as const,
      is_verified: true,
      is_public: true
    };
  }

  private mapDifficulty(readyInMinutes: number): 'easy' | 'medium' | 'hard' | 'expert' {
    if (readyInMinutes <= 30) return 'easy';
    if (readyInMinutes <= 60) return 'medium';
    if (readyInMinutes <= 120) return 'hard';
    return 'expert';
  }

  private extractRecipeNutrition(nutrition: any): any {
    if (!nutrition || !nutrition.nutrients) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const nutrients = nutrition.nutrients;
    return {
      calories: nutrients.find((n: any) => n.name === 'Calories')?.amount || 0,
      protein: nutrients.find((n: any) => n.name === 'Protein')?.amount || 0,
      carbs: nutrients.find((n: any) => n.name === 'Carbohydrates')?.amount || 0,
      fat: nutrients.find((n: any) => n.name === 'Fat')?.amount || 0,
      fiber: nutrients.find((n: any) => n.name === 'Fiber')?.amount || 0,
      sugar: nutrients.find((n: any) => n.name === 'Sugar')?.amount || 0,
      sodium: nutrients.find((n: any) => n.name === 'Sodium')?.amount || 0
    };
  }

  private calculateNutritionForPortion(
    baseNutrition: any,
    portionSize: number,
    unit: string,
    servingSize: any
  ): any {
    // Convert portion to grams if needed
    let grams = portionSize;
    
    if (unit !== 'g' && unit !== 'grams') {
      // Simple conversion - in production, you'd need a proper unit conversion library
      if (unit === 'cups') grams = portionSize * 240; // Approximate
      else if (unit === 'tbsp') grams = portionSize * 15;
      else if (unit === 'tsp') grams = portionSize * 5;
      else if (unit === 'ml') grams = portionSize;
      else if (unit === 'oz') grams = portionSize * 28.35;
    }

    const multiplier = grams / (servingSize.grams || 100);
    
    return {
      calories: Math.round((baseNutrition.calories || 0) * multiplier),
      protein: Math.round((baseNutrition.protein || 0) * multiplier * 100) / 100,
      carbs: Math.round((baseNutrition.carbs || 0) * multiplier * 100) / 100,
      fat: Math.round((baseNutrition.fat || 0) * multiplier * 100) / 100,
      fiber: Math.round((baseNutrition.fiber || 0) * multiplier * 100) / 100,
      sugar: Math.round((baseNutrition.sugar || 0) * multiplier * 100) / 100,
      sodium: Math.round((baseNutrition.sodium || 0) * multiplier * 100) / 100
    };
  }

  private async estimateNutrition(foodName: string, portionSize: number, unit: string): Promise<any> {
    // Try to get nutrition data from external API
    try {
      const nutritionData = await nutritionApiService.getNutritionForIngredients([foodName]);
      if (nutritionData) {
        return this.calculateNutritionForPortion(
          nutritionData,
          portionSize,
          unit,
          { amount: 100, unit: 'g', grams: 100 }
        );
      }
    } catch (error) {
      console.warn('Failed to estimate nutrition from API:', error);
    }

    // Fallback to basic estimation
    return {
      calories: Math.round(portionSize * 2), // Rough estimate
      protein: Math.round(portionSize * 0.1 * 100) / 100,
      carbs: Math.round(portionSize * 0.2 * 100) / 100,
      fat: Math.round(portionSize * 0.05 * 100) / 100,
      fiber: Math.round(portionSize * 0.02 * 100) / 100,
      sugar: Math.round(portionSize * 0.05 * 100) / 100,
      sodium: Math.round(portionSize * 0.1 * 100) / 100
    };
  }

  private async updateDailyNutritionSummary(userId: string, date: Date): Promise<void> {
    try {
      await this.pool.query('SELECT update_daily_nutrition_summary($1, $2)', [userId, date]);
    } catch (error) {
      console.error('Error updating daily nutrition summary:', error);
    }
  }
}

// Export singleton instance
export const foodDatabaseService = new FoodDatabaseService();

