/**
 * Nutrition API Service
 * Handles integration with external nutrition databases
 */

import axios, { AxiosResponse } from 'axios';
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
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
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

export interface SearchFilters {
  category?: string;
  brand?: string;
  dietary_restrictions?: string[];
  max_calories?: number;
  min_protein?: number;
  verified_only?: boolean;
}

export interface SearchResult {
  items: FoodItem[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ============================================================================
// USDA API INTEGRATION
// ============================================================================

class USDAService {
  private readonly baseUrl = 'https://api.nal.usda.gov/fdc/v1';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = config.externalApis.usda.apiKey;
    if (!this.apiKey) {
      console.warn('USDA API key not configured');
    }
  }

  async searchFoods(query: string, pageSize: number = 25): Promise<FoodItem[]> {
    if (!this.apiKey) {
      throw new Error('USDA API key not configured');
    }

    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/foods/search`, {
        params: {
          api_key: this.apiKey,
          query,
          pageSize,
          sortBy: 'dataType.keyword',
          sortOrder: 'asc'
        },
        timeout: 10000
      });

      return this.transformUSDAResponse(response.data);
    } catch (error) {
      console.error('USDA API error:', error);
      throw new Error('Failed to search USDA database');
    }
  }

  async getFoodDetails(fdcId: string): Promise<FoodItem | null> {
    if (!this.apiKey) {
      throw new Error('USDA API key not configured');
    }

    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/food/${fdcId}`, {
        params: {
          api_key: this.apiKey
        },
        timeout: 10000
      });

      return this.transformUSDAFoodDetail(response.data);
    } catch (error) {
      console.error('USDA API error:', error);
      return null;
    }
  }

  private transformUSDAResponse(data: any): FoodItem[] {
    if (!data.foods) return [];

    return data.foods.map((food: any) => ({
      id: `usda_${food.fdcId}`,
      name: food.description,
      brand: food.brandOwner || undefined,
      category: this.categorizeFood(food.description),
      description: food.description,
      nutritional_info: this.extractNutritionData(food.foodNutrients),
      serving_size: {
        amount: 100,
        unit: 'g',
        grams: 100
      },
      source: 'USDA' as const,
      verified: true,
      confidence_score: 0.95
    }));
  }

  private transformUSDAFoodDetail(data: any): FoodItem {
    return {
      id: `usda_${data.fdcId}`,
      name: data.description,
      brand: data.brandOwner || undefined,
      category: this.categorizeFood(data.description),
      description: data.description,
      nutritional_info: this.extractNutritionData(data.foodNutrients),
      serving_size: {
        amount: 100,
        unit: 'g',
        grams: 100
      },
      ingredients: data.ingredients ? [data.ingredients] : undefined,
      source: 'USDA' as const,
      verified: true,
      confidence_score: 0.95
    };
  }

  private extractNutritionData(nutrients: any[]): NutritionData {
    const nutrition: NutritionData = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    if (!nutrients) return nutrition;

    nutrients.forEach(nutrient => {
      const name = nutrient.nutrient?.name?.toLowerCase() || '';
      const amount = nutrient.amount || 0;

      switch (name) {
        case 'energy':
        case 'calories':
          nutrition.calories = amount;
          break;
        case 'protein':
          nutrition.protein = amount;
          break;
        case 'carbohydrate, by difference':
        case 'carbohydrates':
          nutrition.carbs = amount;
          break;
        case 'total lipid (fat)':
        case 'fat':
          nutrition.fat = amount;
          break;
        case 'fiber, total dietary':
        case 'fiber':
          nutrition.fiber = amount;
          break;
        case 'sugars, total including nlea':
        case 'sugar':
          nutrition.sugar = amount;
          break;
        case 'sodium, na':
        case 'sodium':
          nutrition.sodium = amount;
          break;
        case 'cholesterol':
          nutrition.cholesterol = amount;
          break;
        case 'fatty acids, total saturated':
          nutrition.saturated_fat = amount;
          break;
      }
    });

    return nutrition;
  }

  private categorizeFood(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('chicken') || desc.includes('beef') || desc.includes('pork') || desc.includes('fish')) {
      return 'Meat & Seafood';
    } else if (desc.includes('apple') || desc.includes('banana') || desc.includes('orange') || desc.includes('fruit')) {
      return 'Fruits';
    } else if (desc.includes('carrot') || desc.includes('broccoli') || desc.includes('vegetable')) {
      return 'Vegetables';
    } else if (desc.includes('bread') || desc.includes('rice') || desc.includes('pasta') || desc.includes('cereal')) {
      return 'Grains & Cereals';
    } else if (desc.includes('milk') || desc.includes('cheese') || desc.includes('yogurt') || desc.includes('dairy')) {
      return 'Dairy';
    } else if (desc.includes('oil') || desc.includes('butter') || desc.includes('fat')) {
      return 'Fats & Oils';
    } else {
      return 'Other';
    }
  }
}

// ============================================================================
// EDAMAM API INTEGRATION
// ============================================================================

class EdamamService {
  private readonly baseUrl = 'https://api.edamam.com/api/food-database/v2';
  private readonly appId: string;
  private readonly appKey: string;

  constructor() {
    this.appId = config.externalApis.edamam.appId;
    this.appKey = config.externalApis.edamam.appKey;
    
    if (!this.appId || !this.appKey) {
      console.warn('Edamam API credentials not configured');
    }
  }

  async searchFoods(query: string, limit: number = 20): Promise<FoodItem[]> {
    if (!this.appId || !this.appKey) {
      throw new Error('Edamam API credentials not configured');
    }

    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/parser`, {
        params: {
          app_id: this.appId,
          app_key: this.appKey,
          ingr: query,
          limit
        },
        timeout: 10000
      });

      return this.transformEdamamResponse(response.data);
    } catch (error) {
      console.error('Edamam API error:', error);
      throw new Error('Failed to search Edamam database');
    }
  }

  async getNutritionData(ingredients: string[]): Promise<NutritionData | null> {
    if (!this.appId || !this.appKey) {
      throw new Error('Edamam API credentials not configured');
    }

    try {
      const response: AxiosResponse = await axios.post(
        'https://api.edamam.com/api/nutrition-details',
        {
          app_id: this.appId,
          app_key: this.appKey,
          ingr: ingredients
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      return this.extractEdamamNutrition(response.data);
    } catch (error) {
      console.error('Edamam nutrition API error:', error);
      return null;
    }
  }

  private transformEdamamResponse(data: any): FoodItem[] {
    if (!data.hints) return [];

    return data.hints.map((hint: any) => ({
      id: `edamam_${hint.food.foodId}`,
      name: hint.food.label,
      brand: hint.food.brand || undefined,
      category: hint.food.category || 'Other',
      description: hint.food.label,
      nutritional_info: this.extractEdamamNutrition(hint.food.nutrients),
      serving_size: {
        amount: 100,
        unit: 'g',
        grams: 100
      },
      source: 'EDAMAM' as const,
      verified: true,
      confidence_score: 0.9
    }));
  }

  private extractEdamamNutrition(nutrients: any): NutritionData {
    if (!nutrients) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    return {
      calories: nutrients.ENERC_KCAL || 0,
      protein: nutrients.PROCNT || 0,
      carbs: nutrients.CHOCDF || 0,
      fat: nutrients.FAT || 0,
      fiber: nutrients.FIBTG || 0,
      sugar: nutrients.SUGAR || 0,
      sodium: nutrients.NA || 0,
      cholesterol: nutrients.CHOLE || 0,
      saturated_fat: nutrients.FASAT || 0
    };
  }
}

// ============================================================================
// SPOONACULAR API INTEGRATION
// ============================================================================

class SpoonacularService {
  private readonly baseUrl = 'https://api.spoonacular.com';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = config.externalApis.spoonacular.apiKey;
    if (!this.apiKey) {
      console.warn('Spoonacular API key not configured');
    }
  }

  async searchRecipes(query: string, limit: number = 20): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('Spoonacular API key not configured');
    }

    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/recipes/complexSearch`, {
        params: {
          apiKey: this.apiKey,
          query,
          number: limit,
          addRecipeInformation: true,
          addRecipeNutrition: true
        },
        timeout: 10000
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Spoonacular API error:', error);
      throw new Error('Failed to search Spoonacular database');
    }
  }

  async getRecipeDetails(recipeId: number): Promise<any | null> {
    if (!this.apiKey) {
      throw new Error('Spoonacular API key not configured');
    }

    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/recipes/${recipeId}/information`, {
        params: {
          apiKey: this.apiKey,
          includeNutrition: true
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('Spoonacular API error:', error);
      return null;
    }
  }

  async searchFoodProducts(query: string, limit: number = 20): Promise<FoodItem[]> {
    if (!this.apiKey) {
      throw new Error('Spoonacular API key not configured');
    }

    try {
      const response: AxiosResponse = await axios.get(`${this.baseUrl}/food/products/search`, {
        params: {
          apiKey: this.apiKey,
          query,
          number: limit,
          addProductInformation: true
        },
        timeout: 10000
      });

      return this.transformSpoonacularProducts(response.data.products || []);
    } catch (error) {
      console.error('Spoonacular API error:', error);
      throw new Error('Failed to search Spoonacular products');
    }
  }

  private transformSpoonacularProducts(products: any[]): FoodItem[] {
    return products.map(product => ({
      id: `spoonacular_${product.id}`,
      name: product.title,
      brand: product.brand || undefined,
      category: product.category || 'Other',
      description: product.title,
      nutritional_info: this.extractSpoonacularNutrition(product.nutrition),
      serving_size: {
        amount: 100,
        unit: 'g',
        grams: 100
      },
      source: 'SPOONACULAR' as const,
      verified: true,
      confidence_score: 0.85
    }));
  }

  private extractSpoonacularNutrition(nutrition: any): NutritionData {
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
}

// ============================================================================
// MAIN NUTRITION API SERVICE
// ============================================================================

export class NutritionApiService {
  private usdaService: USDAService;
  private edamamService: EdamamService;
  private spoonacularService: SpoonacularService;

  constructor() {
    this.usdaService = new USDAService();
    this.edamamService = new EdamamService();
    this.spoonacularService = new SpoonacularService();
  }

  /**
   * Search for food items across all available databases
   */
  async searchFoods(
    query: string, 
    filters: SearchFilters = {}, 
    page: number = 1, 
    limit: number = 20
  ): Promise<SearchResult> {
    const allResults: FoodItem[] = [];
    const promises: Promise<FoodItem[]>[] = [];

    // Search USDA database
    try {
      promises.push(this.usdaService.searchFoods(query, limit));
    } catch (error) {
      console.warn('USDA search failed:', error);
    }

    // Search Edamam database
    try {
      promises.push(this.edamamService.searchFoods(query, limit));
    } catch (error) {
      console.warn('Edamam search failed:', error);
    }

    // Search Spoonacular products
    try {
      promises.push(this.spoonacularService.searchFoodProducts(query, limit));
    } catch (error) {
      console.warn('Spoonacular search failed:', error);
    }

    // Wait for all searches to complete
    const results = await Promise.allSettled(promises);
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      }
    });

    // Apply filters
    let filteredResults = this.applyFilters(allResults, filters);

    // Remove duplicates based on name similarity
    filteredResults = this.removeDuplicates(filteredResults);

    // Sort by confidence score and relevance
    filteredResults.sort((a, b) => {
      if (a.confidence_score !== b.confidence_score) {
        return b.confidence_score - a.confidence_score;
      }
      return a.name.localeCompare(b.name);
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return {
      items: paginatedResults,
      total: filteredResults.length,
      page,
      limit,
      has_more: endIndex < filteredResults.length
    };
  }

  /**
   * Get detailed food information by ID
   */
  async getFoodDetails(foodId: string): Promise<FoodItem | null> {
    const [source, id] = foodId.split('_');

    switch (source) {
      case 'usda':
        return await this.usdaService.getFoodDetails(id);
      case 'edamam':
        // Edamam doesn't have a direct get by ID endpoint
        return null;
      case 'spoonacular':
        const recipe = await this.spoonacularService.getRecipeDetails(parseInt(id));
        return recipe ? this.transformRecipeToFoodItem(recipe) : null;
      default:
        return null;
    }
  }

  /**
   * Get nutrition data for a list of ingredients
   */
  async getNutritionForIngredients(ingredients: string[]): Promise<NutritionData | null> {
    try {
      return await this.edamamService.getNutritionData(ingredients);
    } catch (error) {
      console.error('Failed to get nutrition for ingredients:', error);
      return null;
    }
  }

  /**
   * Search for recipes
   */
  async searchRecipes(query: string, limit: number = 20): Promise<any[]> {
    try {
      return await this.spoonacularService.searchRecipes(query, limit);
    } catch (error) {
      console.error('Failed to search recipes:', error);
      return [];
    }
  }

  /**
   * Get recipe details
   */
  async getRecipeDetails(recipeId: number): Promise<any | null> {
    try {
      return await this.spoonacularService.getRecipeDetails(recipeId);
    } catch (error) {
      console.error('Failed to get recipe details:', error);
      return null;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private applyFilters(items: FoodItem[], filters: SearchFilters): FoodItem[] {
    return items.filter(item => {
      if (filters.category && item.category !== filters.category) {
        return false;
      }

      if (filters.brand && item.brand !== filters.brand) {
        return false;
      }

      if (filters.dietary_restrictions && filters.dietary_restrictions.length > 0) {
        const hasRequiredTag = filters.dietary_restrictions.some(restriction =>
          item.dietary_tags?.includes(restriction)
        );
        if (!hasRequiredTag) return false;
      }

      if (filters.max_calories && item.nutritional_info.calories > filters.max_calories) {
        return false;
      }

      if (filters.min_protein && item.nutritional_info.protein < filters.min_protein) {
        return false;
      }

      if (filters.verified_only && !item.verified) {
        return false;
      }

      return true;
    });
  }

  private removeDuplicates(items: FoodItem[]): FoodItem[] {
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

  private transformRecipeToFoodItem(recipe: any): FoodItem {
    return {
      id: `spoonacular_${recipe.id}`,
      name: recipe.title,
      category: 'Recipe',
      description: recipe.summary?.replace(/<[^>]*>/g, '') || recipe.title,
      nutritional_info: this.extractRecipeNutrition(recipe.nutrition),
      serving_size: {
        amount: recipe.servings || 1,
        unit: 'serving',
        grams: 100
      },
      source: 'SPOONACULAR' as const,
      verified: true,
      confidence_score: 0.9
    };
  }

  private extractRecipeNutrition(nutrition: any): NutritionData {
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
}

// Export singleton instance
export const nutritionApiService = new NutritionApiService();

