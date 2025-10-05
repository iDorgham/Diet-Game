-- Migration 003: Nutrition Tracking Schema
-- Diet Game Nutrition System
-- Created: Week 3 - Nutrition Database Integration

-- =============================================
-- 1. FOOD DATABASE TABLES
-- =============================================

-- Food items database with comprehensive nutritional data
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    barcode VARCHAR(50) UNIQUE,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    description TEXT,
    
    -- Nutritional information per 100g
    nutritional_info JSONB NOT NULL DEFAULT '{}',
    
    -- Serving size information
    serving_size JSONB NOT NULL DEFAULT '{}',
    
    -- Additional food properties
    ingredients TEXT[],
    allergens TEXT[],
    certifications TEXT[],
    dietary_tags TEXT[], -- 'vegan', 'gluten-free', 'keto', etc.
    
    -- Data source and verification
    source VARCHAR(50) NOT NULL CHECK (source IN ('USDA', 'EDAMAM', 'SPOONACULAR', 'USER', 'CUSTOM')),
    verified BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- User nutrition goals and targets
CREATE TABLE user_nutrition_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Daily targets
    daily_calories INTEGER,
    daily_protein DECIMAL(8,2), -- grams
    daily_carbs DECIMAL(8,2),   -- grams
    daily_fat DECIMAL(8,2),     -- grams
    daily_fiber DECIMAL(8,2),   -- grams
    daily_sugar DECIMAL(8,2),   -- grams
    daily_sodium DECIMAL(8,2),  -- mg
    daily_water DECIMAL(8,2),   -- liters
    
    -- Macronutrient ratios (percentages)
    protein_ratio DECIMAL(5,2) DEFAULT 25.0,
    carbs_ratio DECIMAL(5,2) DEFAULT 45.0,
    fat_ratio DECIMAL(5,2) DEFAULT 30.0,
    
    -- Micronutrient targets
    micronutrient_targets JSONB DEFAULT '{}',
    
    -- Dietary restrictions and preferences
    dietary_restrictions TEXT[] DEFAULT '{}',
    health_goals TEXT[] DEFAULT '{}',
    
    -- Goal status
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Nutrition logs for user food entries
CREATE TABLE nutrition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
    
    -- Food entry details
    food_name VARCHAR(200) NOT NULL,
    portion_size DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'grams', 'cups', 'pieces', 'servings', 'ml'
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
    
    -- Calculated nutritional values for this entry
    nutritional_data JSONB NOT NULL DEFAULT '{}',
    
    -- Additional information
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily nutrition summaries for analytics
CREATE TABLE daily_nutrition_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Daily totals
    total_calories INTEGER DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    total_fat DECIMAL(8,2) DEFAULT 0,
    total_fiber DECIMAL(8,2) DEFAULT 0,
    total_sugar DECIMAL(8,2) DEFAULT 0,
    total_sodium DECIMAL(8,2) DEFAULT 0,
    total_water DECIMAL(8,2) DEFAULT 0,
    
    -- Meal breakdown
    meal_breakdown JSONB DEFAULT '{}',
    
    -- Goal progress
    goal_progress JSONB DEFAULT '{}',
    
    -- Nutrition score (0-100)
    nutrition_score INTEGER DEFAULT 0,
    
    -- Insights and recommendations
    insights JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- =============================================
-- 2. RECIPE DATABASE TABLES
-- =============================================

-- Recipe definitions
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    cuisine VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    
    -- Timing information
    prep_time INTEGER, -- minutes
    cook_time INTEGER, -- minutes
    total_time INTEGER, -- minutes
    servings INTEGER DEFAULT 1,
    
    -- Recipe content
    ingredients JSONB NOT NULL DEFAULT '[]',
    instructions JSONB NOT NULL DEFAULT '[]',
    
    -- Nutritional information per serving
    nutritional_info JSONB NOT NULL DEFAULT '{}',
    
    -- Recipe metadata
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    
    -- AR and special features
    ar_model_url TEXT,
    video_url TEXT,
    
    -- Source and verification
    source VARCHAR(50) DEFAULT 'USER' CHECK (source IN ('USER', 'SPOONACULAR', 'EDAMAM', 'CUSTOM')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User recipe interactions (saves, ratings, reviews)
CREATE TABLE user_recipe_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    
    -- Interaction types
    is_saved BOOLEAN DEFAULT FALSE,
    is_cooked BOOLEAN DEFAULT FALSE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    
    -- Cooking data
    cooked_at TIMESTAMP WITH TIME ZONE,
    modifications TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- =============================================
-- 3. FOOD RECOGNITION AND BARCODE TABLES
-- =============================================

-- Barcode database for product lookup
CREATE TABLE barcode_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    
    -- Product information
    product_info JSONB DEFAULT '{}',
    nutritional_info JSONB DEFAULT '{}',
    
    -- Data source
    source VARCHAR(50) NOT NULL CHECK (source IN ('OPENFOODFACTS', 'USDA', 'CUSTOM')),
    verified BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food recognition logs for AI/ML training
CREATE TABLE food_recognition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Image and recognition data
    image_url TEXT,
    image_hash VARCHAR(64),
    recognized_foods JSONB DEFAULT '[]',
    confidence_scores JSONB DEFAULT '{}',
    
    -- Recognition metadata
    recognition_method VARCHAR(50) CHECK (recognition_method IN ('AI_VISION', 'BARCODE', 'MANUAL')),
    processing_time_ms INTEGER,
    
    -- User feedback
    user_corrections JSONB DEFAULT '{}',
    is_accurate BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================

-- Food items indexes
CREATE INDEX idx_food_items_name ON food_items(name);
CREATE INDEX idx_food_items_category ON food_items(category);
CREATE INDEX idx_food_items_barcode ON food_items(barcode);
CREATE INDEX idx_food_items_source ON food_items(source);
CREATE INDEX idx_food_items_verified ON food_items(verified);
CREATE INDEX idx_food_items_dietary_tags ON food_items USING GIN(dietary_tags);

-- Nutrition goals indexes
CREATE INDEX idx_user_nutrition_goals_user_id ON user_nutrition_goals(user_id);
CREATE INDEX idx_user_nutrition_goals_active ON user_nutrition_goals(user_id, is_active) WHERE is_active = TRUE;

-- Nutrition logs indexes
CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_logged_at ON nutrition_logs(logged_at);
CREATE INDEX idx_nutrition_logs_meal_type ON nutrition_logs(meal_type);
CREATE INDEX idx_nutrition_logs_food_item_id ON nutrition_logs(food_item_id);
-- Note: Removed problematic index that used non-immutable function
-- CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, date_trunc('day', logged_at));

-- Daily summaries indexes
CREATE INDEX idx_daily_nutrition_summaries_user_id ON daily_nutrition_summaries(user_id);
CREATE INDEX idx_daily_nutrition_summaries_date ON daily_nutrition_summaries(date);
CREATE INDEX idx_daily_nutrition_summaries_user_date ON daily_nutrition_summaries(user_id, date);

-- Recipe indexes
CREATE INDEX idx_recipes_title ON recipes(title);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_rating ON recipes(rating);
CREATE INDEX idx_recipes_public ON recipes(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX idx_recipes_created_by ON recipes(created_by);

-- Recipe interactions indexes
CREATE INDEX idx_user_recipe_interactions_user_id ON user_recipe_interactions(user_id);
CREATE INDEX idx_user_recipe_interactions_recipe_id ON user_recipe_interactions(recipe_id);
CREATE INDEX idx_user_recipe_interactions_saved ON user_recipe_interactions(user_id, is_saved) WHERE is_saved = TRUE;
CREATE INDEX idx_user_recipe_interactions_cooked ON user_recipe_interactions(user_id, is_cooked) WHERE is_cooked = TRUE;

-- Barcode products indexes
CREATE INDEX idx_barcode_products_barcode ON barcode_products(barcode);
CREATE INDEX idx_barcode_products_brand ON barcode_products(brand);
CREATE INDEX idx_barcode_products_category ON barcode_products(category);

-- Food recognition logs indexes
CREATE INDEX idx_food_recognition_logs_user_id ON food_recognition_logs(user_id);
CREATE INDEX idx_food_recognition_logs_created_at ON food_recognition_logs(created_at);
CREATE INDEX idx_food_recognition_logs_method ON food_recognition_logs(recognition_method);

-- =============================================
-- 5. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

-- Apply triggers to nutrition tables
CREATE TRIGGER update_food_items_updated_at BEFORE UPDATE ON food_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_nutrition_goals_updated_at BEFORE UPDATE ON user_nutrition_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_nutrition_summaries_updated_at BEFORE UPDATE ON daily_nutrition_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_recipe_interactions_updated_at BEFORE UPDATE ON user_recipe_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on nutrition tables
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recipe_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_recognition_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutrition data
CREATE POLICY "Users can view public food items" ON food_items FOR SELECT USING (true);
CREATE POLICY "Users can insert food items" ON food_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own food items" ON food_items FOR UPDATE USING (created_by IS NULL);

CREATE POLICY "Users can manage their own nutrition goals" ON user_nutrition_goals FOR ALL USING (true);
CREATE POLICY "Users can manage their own nutrition logs" ON nutrition_logs FOR ALL USING (true);
CREATE POLICY "Users can manage their own daily summaries" ON daily_nutrition_summaries FOR ALL USING (true);

CREATE POLICY "Users can view public recipes" ON recipes FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage their own recipes" ON recipes FOR ALL USING (true);
CREATE POLICY "Users can manage their own recipe interactions" ON user_recipe_interactions FOR ALL USING (true);

CREATE POLICY "Users can view their own recognition logs" ON food_recognition_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert recognition logs" ON food_recognition_logs FOR INSERT WITH CHECK (true);

-- =============================================
-- 7. FUNCTIONS FOR NUTRITION CALCULATIONS
-- =============================================

-- Function to calculate nutrition per serving
CREATE OR REPLACE FUNCTION calculate_nutrition_per_serving(
    p_food_item_id UUID,
    p_portion_size DECIMAL,
    p_unit VARCHAR
) RETURNS JSONB AS $$
DECLARE
    v_food_item RECORD;
    v_nutrition JSONB;
    v_multiplier DECIMAL;
BEGIN
    -- Get food item data
    SELECT nutritional_info, serving_size INTO v_food_item
    FROM food_items 
    WHERE id = p_food_item_id;
    
    IF NOT FOUND THEN
        RETURN '{}';
    END IF;
    
    -- Calculate multiplier based on portion size and unit
    -- This is a simplified calculation - in production, you'd need more complex unit conversion
    v_multiplier := p_portion_size / 100.0; -- Assuming nutritional_info is per 100g
    
    -- Calculate nutrition for the portion
    v_nutrition := jsonb_build_object(
        'calories', (v_food_item.nutritional_info->>'calories')::DECIMAL * v_multiplier,
        'protein', (v_food_item.nutritional_info->>'protein')::DECIMAL * v_multiplier,
        'carbs', (v_food_item.nutritional_info->>'carbs')::DECIMAL * v_multiplier,
        'fat', (v_food_item.nutritional_info->>'fat')::DECIMAL * v_multiplier,
        'fiber', (v_food_item.nutritional_info->>'fiber')::DECIMAL * v_multiplier,
        'sugar', (v_food_item.nutritional_info->>'sugar')::DECIMAL * v_multiplier,
        'sodium', (v_food_item.nutritional_info->>'sodium')::DECIMAL * v_multiplier
    );
    
    RETURN v_nutrition;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily nutrition summary
CREATE OR REPLACE FUNCTION update_daily_nutrition_summary(
    p_user_id UUID,
    p_date DATE
) RETURNS VOID AS $$
DECLARE
    v_totals RECORD;
    v_goals RECORD;
    v_summary_id UUID;
BEGIN
    -- Calculate daily totals from nutrition logs
    SELECT 
        COALESCE(SUM((nutritional_data->>'calories')::INTEGER), 0) as total_calories,
        COALESCE(SUM((nutritional_data->>'protein')::DECIMAL), 0) as total_protein,
        COALESCE(SUM((nutritional_data->>'carbs')::DECIMAL), 0) as total_carbs,
        COALESCE(SUM((nutritional_data->>'fat')::DECIMAL), 0) as total_fat,
        COALESCE(SUM((nutritional_data->>'fiber')::DECIMAL), 0) as total_fiber,
        COALESCE(SUM((nutritional_data->>'sugar')::DECIMAL), 0) as total_sugar,
        COALESCE(SUM((nutritional_data->>'sodium')::DECIMAL), 0) as total_sodium
    INTO v_totals
    FROM nutrition_logs 
    WHERE user_id = p_user_id 
    AND logged_at::date = p_date;
    
    -- Get user goals
    SELECT * INTO v_goals
    FROM user_nutrition_goals 
    WHERE user_id = p_user_id 
    AND is_active = TRUE 
    AND (start_date <= p_date AND (end_date IS NULL OR end_date >= p_date))
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Insert or update daily summary
    INSERT INTO daily_nutrition_summaries (
        user_id, date, total_calories, total_protein, total_carbs, 
        total_fat, total_fiber, total_sugar, total_sodium
    ) VALUES (
        p_user_id, p_date, v_totals.total_calories, v_totals.total_protein, 
        v_totals.total_carbs, v_totals.total_fat, v_totals.total_fiber, 
        v_totals.total_sugar, v_totals.total_sodium
    )
    ON CONFLICT (user_id, date) 
    DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        total_protein = EXCLUDED.total_protein,
        total_carbs = EXCLUDED.total_carbs,
        total_fat = EXCLUDED.total_fat,
        total_fiber = EXCLUDED.total_fiber,
        total_sugar = EXCLUDED.total_sugar,
        total_sodium = EXCLUDED.total_sodium,
        updated_at = NOW();
    
    -- Calculate nutrition score if goals exist
    IF v_goals IS NOT NULL THEN
        -- Simple nutrition score calculation (0-100)
        -- In production, this would be more sophisticated
        UPDATE daily_nutrition_summaries 
        SET nutrition_score = LEAST(100, GREATEST(0, 
            CASE 
                WHEN v_goals.daily_calories > 0 THEN 
                    LEAST(100, (v_totals.total_calories::DECIMAL / v_goals.daily_calories) * 100)
                ELSE 0 
            END
        ))
        WHERE user_id = p_user_id AND date = p_date;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update daily summary when nutrition log is inserted/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_daily_nutrition_summary(OLD.user_id, OLD.logged_at::date);
        RETURN OLD;
    ELSE
        PERFORM update_daily_nutrition_summary(NEW.user_id, NEW.logged_at::date);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nutrition_logs_update_daily_summary
    AFTER INSERT OR UPDATE OR DELETE ON nutrition_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_update_daily_summary();
