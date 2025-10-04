/**
 * Nutrition Service
 * Frontend service for nutrition tracking and food database integration
 */

import { config } from '../config/environment';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturated_fat?: number;
  trans_fat?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: string;
  subcategory?: string;
  description?: string;
  nutritional_info: NutritionData;
  serving_size: {
    amount: number;
    unit: string;
    grams?: number;
  };
  ingredients?: string[];
  allergens?: string[];
  dietary_tags?: string[];
  source: 'USDA' | 'EDAMAM' | 'SPOONACULAR' | 'USER' | 'CUSTOM';
  verified: boolean;
  confidence_score: number;
}

export interface FoodLogEntry {
  id: string;
  user_id: string;
  food_item_id?: string;
  food_name: string;
  portion_size: number;
  unit: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  nutritional_data: NutritionData;
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
  nutritional_info: NutritionData;
  tags: string[];
  images: string[];
  rating: number;
  review_count: number;
  source: 'USER' | 'SPOONACULAR' | 'EDAMAM' | 'CUSTOM';
  created_by?: string;
  is_verified: boolean;
  is_public: boolean;
}

export interface SearchFilters {
  category?: string;
  brand?: string;
  dietary_restrictions?: string[];
  max_calories?: number;
  min_protein?: number;
  verified_only?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ============================================================================
// API BASE CONFIGURATION
// ============================================================================

const API_BASE_URL = config.api.baseUrl || 'http://localhost:3000/api/v1';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// NUTRITION SERVICE CLASS
// ============================================================================

export class NutritionService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/nutrition`;
    this.authToken = this.getAuthToken();
  }

  // ============================================================================
  // AUTHENTICATION HELPERS
  // ============================================================================

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data.data || data;
  }

  // ============================================================================
  // FOOD SEARCH AND DISCOVERY
  // ============================================================================

  /**
   * Search for food items
   */
  async searchFoods(
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResult<FoodItem>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add filters to params
    if (filters.category) params.append('category', filters.category);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.dietary_restrictions?.length) {
      params.append('dietary_restrictions', filters.dietary_restrictions.join(','));
    }
    if (filters.max_calories) params.append('max_calories', filters.max_calories.toString());
    if (filters.min_protein) params.append('min_protein', filters.min_protein.toString());
    if (filters.verified_only) params.append('verified_only', 'true');

    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<SearchResult<FoodItem>>(response);
  }

  /**
   * Get food item details by ID
   */
  async getFoodItem(foodId: string): Promise<FoodItem> {
    const response = await fetch(`${this.baseUrl}/food/${foodId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<FoodItem>(response);
  }

  // ============================================================================
  // FOOD LOGGING
  // ============================================================================

  /**
   * Log a food entry
   */
  async logFood(foodData: {
    food_item_id?: string;
    food_name: string;
    portion_size: number;
    unit: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
    notes?: string;
  }): Promise<{ logId: string }> {
    const response = await fetch(`${this.baseUrl}/log`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(foodData),
    });

    return this.handleResponse<{ logId: string }>(response);
  }

  /**
   * Get nutrition logs
   */
  async getNutritionLogs(options: {
    start_date?: Date;
    end_date?: Date;
    meal_type?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    logs: FoodLogEntry[];
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  }> {
    const params = new URLSearchParams();
    
    if (options.start_date) {
      params.append('start_date', options.start_date.toISOString().split('T')[0]);
    }
    if (options.end_date) {
      params.append('end_date', options.end_date.toISOString().split('T')[0]);
    }
    if (options.meal_type) {
      params.append('meal_type', options.meal_type);
    }
    if (options.page) {
      params.append('page', options.page.toString());
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }

    const response = await fetch(`${this.baseUrl}/logs?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{
      logs: FoodLogEntry[];
      total: number;
      page: number;
      limit: number;
      has_more: boolean;
    }>(response);
  }

  /**
   * Delete a nutrition log
   */
  async deleteNutritionLog(logId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/logs/${logId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    await this.handleResponse<void>(response);
  }

  // ============================================================================
  // NUTRITION GOALS
  // ============================================================================

  /**
   * Set nutrition goals
   */
  async setNutritionGoals(goals: Partial<NutritionGoal>): Promise<{ goalId: string }> {
    const response = await fetch(`${this.baseUrl}/goals`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(goals),
    });

    return this.handleResponse<{ goalId: string }>(response);
  }

  /**
   * Get current nutrition goals
   */
  async getNutritionGoals(): Promise<NutritionGoal | null> {
    const response = await fetch(`${this.baseUrl}/goals`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<NutritionGoal | null>(response);
  }

  // ============================================================================
  // DAILY NUTRITION SUMMARIES
  // ============================================================================

  /**
   * Get daily nutrition summary
   */
  async getDailySummary(date: Date): Promise<DailyNutritionSummary | null> {
    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(`${this.baseUrl}/summary/${dateStr}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<DailyNutritionSummary | null>(response);
  }

  /**
   * Get nutrition summary for date range
   */
  async getSummaryRange(
    startDate: Date,
    endDate: Date
  ): Promise<{
    summaries: DailyNutritionSummary[];
    total: number;
    start_date: Date;
    end_date: Date;
  }> {
    const params = new URLSearchParams({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    const response = await fetch(`${this.baseUrl}/summary?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{
      summaries: DailyNutritionSummary[];
      total: number;
      start_date: Date;
      end_date: Date;
    }>(response);
  }

  // ============================================================================
  // RECIPE OPERATIONS
  // ============================================================================

  /**
   * Search for recipes
   */
  async searchRecipes(
    query: string,
    options: {
      category?: string;
      cuisine?: string;
      difficulty?: string;
      limit?: number;
    } = {}
  ): Promise<{
    recipes: Recipe[];
    total: number;
    query: string;
    filters: Record<string, any>;
  }> {
    const params = new URLSearchParams({
      q: query,
    });

    if (options.category) params.append('category', options.category);
    if (options.cuisine) params.append('cuisine', options.cuisine);
    if (options.difficulty) params.append('difficulty', options.difficulty);
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await fetch(`${this.baseUrl}/recipes/search?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{
      recipes: Recipe[];
      total: number;
      query: string;
      filters: Record<string, any>;
    }>(response);
  }

  /**
   * Get recipe details
   */
  async getRecipe(recipeId: string): Promise<Recipe> {
    const response = await fetch(`${this.baseUrl}/recipes/${recipeId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<Recipe>(response);
  }

  /**
   * Add a new recipe
   */
  async addRecipe(recipe: Omit<Recipe, 'id'>): Promise<{ recipeId: string }> {
    const response = await fetch(`${this.baseUrl}/recipes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(recipe),
    });

    return this.handleResponse<{ recipeId: string }>(response);
  }

  // ============================================================================
  // NUTRITION ANALYSIS
  // ============================================================================

  /**
   * Analyze nutrition for ingredients
   */
  async analyzeIngredients(ingredients: string[]): Promise<{
    ingredients: string[];
    nutrition: NutritionData | null;
  }> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ingredients }),
    });

    return this.handleResponse<{
      ingredients: string[];
      nutrition: NutritionData | null;
    }>(response);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate nutrition for a portion
   */
  calculateNutritionForPortion(
    baseNutrition: NutritionData,
    portionSize: number,
    unit: string,
    servingSize: { amount: number; unit: string; grams?: number }
  ): NutritionData {
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
      sodium: Math.round((baseNutrition.sodium || 0) * multiplier * 100) / 100,
      cholesterol: Math.round((baseNutrition.cholesterol || 0) * multiplier * 100) / 100,
      saturated_fat: Math.round((baseNutrition.saturated_fat || 0) * multiplier * 100) / 100,
      trans_fat: Math.round((baseNutrition.trans_fat || 0) * multiplier * 100) / 100,
    };
  }

  /**
   * Calculate daily nutrition totals from logs
   */
  calculateDailyTotals(logs: FoodLogEntry[]): NutritionData {
    return logs.reduce((totals, log) => ({
      calories: totals.calories + (log.nutritional_data.calories || 0),
      protein: totals.protein + (log.nutritional_data.protein || 0),
      carbs: totals.carbs + (log.nutritional_data.carbs || 0),
      fat: totals.fat + (log.nutritional_data.fat || 0),
      fiber: totals.fiber + (log.nutritional_data.fiber || 0),
      sugar: totals.sugar + (log.nutritional_data.sugar || 0),
      sodium: totals.sodium + (log.nutritional_data.sodium || 0),
      cholesterol: totals.cholesterol + (log.nutritional_data.cholesterol || 0),
      saturated_fat: totals.saturated_fat + (log.nutritional_data.saturated_fat || 0),
      trans_fat: totals.trans_fat + (log.nutritional_data.trans_fat || 0),
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
      saturated_fat: 0,
      trans_fat: 0,
    });
  }

  /**
   * Calculate nutrition progress percentage
   */
  calculateProgress(consumed: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, Math.max(0, (consumed / target) * 100));
  }

  /**
   * Get nutrition score (0-100)
   */
  calculateNutritionScore(
    consumed: NutritionData,
    goals: NutritionGoal
  ): number {
    const scores = [];

    // Calories score (40% weight)
    if (goals.daily_calories) {
      const calorieScore = Math.max(0, 100 - Math.abs(consumed.calories - goals.daily_calories) / goals.daily_calories * 100);
      scores.push({ score: calorieScore, weight: 0.4 });
    }

    // Protein score (25% weight)
    if (goals.daily_protein) {
      const proteinScore = Math.min(100, (consumed.protein / goals.daily_protein) * 100);
      scores.push({ score: proteinScore, weight: 0.25 });
    }

    // Carbs score (20% weight)
    if (goals.daily_carbs) {
      const carbScore = Math.max(0, 100 - Math.abs(consumed.carbs - goals.daily_carbs) / goals.daily_carbs * 100);
      scores.push({ score: carbScore, weight: 0.2 });
    }

    // Fat score (15% weight)
    if (goals.daily_fat) {
      const fatScore = Math.max(0, 100 - Math.abs(consumed.fat - goals.daily_fat) / goals.daily_fat * 100);
      scores.push({ score: fatScore, weight: 0.15 });
    }

    // Calculate weighted average
    const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
    const weightedScore = scores.reduce((sum, item) => sum + (item.score * item.weight), 0);
    
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }
}

// Export singleton instance
export const nutritionService = new NutritionService();

// Export types for use in components
export type {
  NutritionData,
  FoodItem,
  FoodLogEntry,
  NutritionGoal,
  DailyNutritionSummary,
  Recipe,
  SearchFilters,
  SearchResult,
};

