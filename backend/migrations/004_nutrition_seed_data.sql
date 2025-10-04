-- Migration 004: Nutrition Seed Data
-- Diet Game Nutrition System
-- Created: Week 3 - Nutrition Database Integration

-- =============================================
-- 1. SAMPLE FOOD ITEMS
-- =============================================

INSERT INTO food_items (
    name, brand, category, subcategory, description,
    nutritional_info, serving_size, ingredients, allergens, dietary_tags,
    source, verified, confidence_score
) VALUES
-- Fruits
('Apple', NULL, 'Fruits', 'Fresh Fruits', 'Fresh red apple', 
 '{"calories": 52, "protein": 0.3, "carbs": 13.8, "fat": 0.2, "fiber": 2.4, "sugar": 10.4, "sodium": 1}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Apple"]', '[]', '["vegan", "gluten-free", "dairy-free"]',
 'USDA', true, 0.95),

('Banana', NULL, 'Fruits', 'Fresh Fruits', 'Fresh yellow banana',
 '{"calories": 89, "protein": 1.1, "carbs": 22.8, "fat": 0.3, "fiber": 2.6, "sugar": 12.2, "sodium": 1}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Banana"]', '[]', '["vegan", "gluten-free", "dairy-free"]',
 'USDA', true, 0.95),

('Orange', NULL, 'Fruits', 'Citrus Fruits', 'Fresh orange',
 '{"calories": 47, "protein": 0.9, "carbs": 11.8, "fat": 0.1, "fiber": 2.4, "sugar": 9.4, "sodium": 0}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Orange"]', '[]', '["vegan", "gluten-free", "dairy-free"]',
 'USDA', true, 0.95),

-- Vegetables
('Broccoli', NULL, 'Vegetables', 'Cruciferous', 'Fresh broccoli florets',
 '{"calories": 34, "protein": 2.8, "carbs": 6.6, "fat": 0.4, "fiber": 2.6, "sugar": 1.5, "sodium": 33}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Broccoli"]', '[]', '["vegan", "gluten-free", "dairy-free", "keto"]',
 'USDA', true, 0.95),

('Carrot', NULL, 'Vegetables', 'Root Vegetables', 'Fresh orange carrot',
 '{"calories": 41, "protein": 0.9, "carbs": 9.6, "fat": 0.2, "fiber": 2.8, "sugar": 4.7, "sodium": 69}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Carrot"]', '[]', '["vegan", "gluten-free", "dairy-free"]',
 'USDA', true, 0.95),

('Spinach', NULL, 'Vegetables', 'Leafy Greens', 'Fresh spinach leaves',
 '{"calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4, "fiber": 2.2, "sugar": 0.4, "sodium": 79}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Spinach"]', '[]', '["vegan", "gluten-free", "dairy-free", "keto"]',
 'USDA', true, 0.95),

-- Grains
('Brown Rice', NULL, 'Grains & Cereals', 'Whole Grains', 'Cooked brown rice',
 '{"calories": 111, "protein": 2.6, "carbs": 23.0, "fat": 0.9, "fiber": 1.8, "sugar": 0.4, "sodium": 5}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Brown Rice"]', '[]', '["vegan", "gluten-free", "dairy-free"]',
 'USDA', true, 0.95),

('Quinoa', NULL, 'Grains & Cereals', 'Pseudo-grains', 'Cooked quinoa',
 '{"calories": 120, "protein": 4.4, "carbs": 22.0, "fat": 1.9, "fiber": 2.8, "sugar": 0.9, "sodium": 7}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Quinoa"]', '[]', '["vegan", "gluten-free", "dairy-free"]',
 'USDA', true, 0.95),

('Whole Wheat Bread', 'Generic', 'Grains & Cereals', 'Bread', 'Whole wheat bread slice',
 '{"calories": 247, "protein": 13.4, "carbs": 41.3, "fat": 4.2, "fiber": 6.0, "sugar": 4.3, "sodium": 681}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Whole Wheat Flour", "Water", "Yeast", "Salt"]', '["gluten"]', '["vegan", "dairy-free"]',
 'USDA', true, 0.95),

-- Proteins
('Chicken Breast', NULL, 'Meat & Seafood', 'Poultry', 'Skinless, boneless chicken breast',
 '{"calories": 165, "protein": 31.0, "carbs": 0, "fat": 3.6, "fiber": 0, "sugar": 0, "sodium": 74}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Chicken Breast"]', '[]', '["gluten-free", "dairy-free", "keto"]',
 'USDA', true, 0.95),

('Salmon', NULL, 'Meat & Seafood', 'Fish', 'Atlantic salmon fillet',
 '{"calories": 208, "protein": 25.4, "carbs": 0, "fat": 12.4, "fiber": 0, "sugar": 0, "sodium": 44}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Salmon"]', '["fish"]', '["gluten-free", "dairy-free", "keto"]',
 'USDA', true, 0.95),

('Eggs', NULL, 'Dairy & Eggs', 'Eggs', 'Large chicken eggs',
 '{"calories": 155, "protein": 13.0, "carbs": 1.1, "fat": 11.0, "fiber": 0, "sugar": 1.1, "sodium": 124}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Eggs"]', '["eggs"]', '["gluten-free", "dairy-free", "keto"]',
 'USDA', true, 0.95),

-- Dairy
('Greek Yogurt', 'Generic', 'Dairy & Eggs', 'Yogurt', 'Plain Greek yogurt',
 '{"calories": 59, "protein": 10.0, "carbs": 3.6, "fat": 0.4, "fiber": 0, "sugar": 3.6, "sodium": 36}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Milk", "Live Cultures"]', '["dairy"]', '["gluten-free"]',
 'USDA', true, 0.95),

('Cheddar Cheese', 'Generic', 'Dairy & Eggs', 'Cheese', 'Sharp cheddar cheese',
 '{"calories": 403, "protein": 25.0, "carbs": 1.3, "fat": 33.1, "fiber": 0, "sugar": 0.5, "sodium": 621}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Milk", "Salt", "Enzymes"]', '["dairy"]', '["gluten-free", "keto"]',
 'USDA', true, 0.95),

-- Nuts & Seeds
('Almonds', NULL, 'Nuts & Seeds', 'Tree Nuts', 'Raw almonds',
 '{"calories": 579, "protein": 21.2, "carbs": 21.6, "fat": 49.9, "fiber": 12.5, "sugar": 4.4, "sodium": 1}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Almonds"]', '["tree-nuts"]', '["vegan", "gluten-free", "dairy-free", "keto"]',
 'USDA', true, 0.95),

('Chia Seeds', NULL, 'Nuts & Seeds', 'Seeds', 'Dried chia seeds',
 '{"calories": 486, "protein": 16.5, "carbs": 42.1, "fat": 30.7, "fiber": 34.4, "sugar": 0, "sodium": 16}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Chia Seeds"]', '[]', '["vegan", "gluten-free", "dairy-free", "keto"]',
 'USDA', true, 0.95),

-- Fats & Oils
('Olive Oil', 'Extra Virgin', 'Fats & Oils', 'Oils', 'Extra virgin olive oil',
 '{"calories": 884, "protein": 0, "carbs": 0, "fat": 100, "fiber": 0, "sugar": 0, "sodium": 2}',
 '{"amount": 100, "unit": "ml", "grams": 100}',
 '["Olives"]', '[]', '["vegan", "gluten-free", "dairy-free", "keto"]',
 'USDA', true, 0.95),

('Avocado', NULL, 'Fruits', 'Tropical Fruits', 'Fresh avocado',
 '{"calories": 160, "protein": 2.0, "carbs": 8.5, "fat": 14.7, "fiber": 6.7, "sugar": 0.7, "sodium": 7}',
 '{"amount": 100, "unit": "g", "grams": 100}',
 '["Avocado"]', '[]', '["vegan", "gluten-free", "dairy-free", "keto"]',
 'USDA', true, 0.95);

-- =============================================
-- 2. SAMPLE RECIPES
-- =============================================

INSERT INTO recipes (
    title, description, category, cuisine, difficulty,
    prep_time, cook_time, total_time, servings,
    ingredients, instructions, nutritional_info,
    tags, images, rating, review_count, source, is_verified, is_public
) VALUES
(
    'Mediterranean Quinoa Bowl',
    'A healthy and delicious quinoa bowl with Mediterranean flavors',
    'Main Course',
    'Mediterranean',
    'easy',
    15, 20, 35, 2,
    '[
        {"name": "Quinoa", "amount": 1, "unit": "cup", "notes": "uncooked"},
        {"name": "Cherry Tomatoes", "amount": 1, "unit": "cup", "notes": "halved"},
        {"name": "Cucumber", "amount": 1, "unit": "medium", "notes": "diced"},
        {"name": "Red Onion", "amount": 0.25, "unit": "cup", "notes": "diced"},
        {"name": "Kalamata Olives", "amount": 0.5, "unit": "cup", "notes": "pitted"},
        {"name": "Feta Cheese", "amount": 0.5, "unit": "cup", "notes": "crumbled"},
        {"name": "Olive Oil", "amount": 3, "unit": "tbsp"},
        {"name": "Lemon Juice", "amount": 2, "unit": "tbsp"},
        {"name": "Fresh Herbs", "amount": 0.25, "unit": "cup", "notes": "chopped"}
    ]',
    '[
        {"step_number": 1, "instruction": "Cook quinoa according to package instructions and let cool", "duration": 15},
        {"step_number": 2, "instruction": "In a large bowl, combine cooked quinoa with tomatoes, cucumber, and red onion", "duration": 5},
        {"step_number": 3, "instruction": "Add olives and feta cheese to the bowl", "duration": 2},
        {"step_number": 4, "instruction": "Whisk together olive oil and lemon juice for dressing", "duration": 2},
        {"step_number": 5, "instruction": "Pour dressing over salad and toss gently", "duration": 2},
        {"step_number": 6, "instruction": "Garnish with fresh herbs and serve", "duration": 1}
    ]',
    '{"calories": 420, "protein": 16, "carbs": 52, "fat": 18, "fiber": 8, "sugar": 6, "sodium": 680}',
    '["healthy", "vegetarian", "mediterranean", "quinoa", "salad"]',
    '[]',
    4.5, 23, 'USER', true, true
),
(
    'Grilled Salmon with Roasted Vegetables',
    'Simple and healthy grilled salmon with seasonal roasted vegetables',
    'Main Course',
    'American',
    'medium',
    20, 25, 45, 4,
    '[
        {"name": "Salmon Fillets", "amount": 4, "unit": "pieces", "notes": "6 oz each"},
        {"name": "Broccoli", "amount": 2, "unit": "cups", "notes": "florets"},
        {"name": "Carrots", "amount": 2, "unit": "cups", "notes": "sliced"},
        {"name": "Bell Peppers", "amount": 2, "unit": "medium", "notes": "sliced"},
        {"name": "Olive Oil", "amount": 4, "unit": "tbsp"},
        {"name": "Garlic", "amount": 3, "unit": "cloves", "notes": "minced"},
        {"name": "Lemon", "amount": 1, "unit": "medium", "notes": "juiced"},
        {"name": "Salt", "amount": 1, "unit": "tsp"},
        {"name": "Black Pepper", "amount": 0.5, "unit": "tsp"},
        {"name": "Fresh Dill", "amount": 2, "unit": "tbsp", "notes": "chopped"}
    ]',
    '[
        {"step_number": 1, "instruction": "Preheat oven to 425°F (220°C)", "duration": 5},
        {"step_number": 2, "instruction": "Toss vegetables with 2 tbsp olive oil, garlic, salt, and pepper", "duration": 5},
        {"step_number": 3, "instruction": "Roast vegetables for 20-25 minutes until tender", "duration": 25},
        {"step_number": 4, "instruction": "Season salmon with salt, pepper, and lemon juice", "duration": 5},
        {"step_number": 5, "instruction": "Heat grill pan and cook salmon 4-5 minutes per side", "duration": 10},
        {"step_number": 6, "instruction": "Serve salmon over roasted vegetables, garnished with dill", "duration": 2}
    ]',
    '{"calories": 380, "protein": 35, "carbs": 12, "fat": 22, "fiber": 4, "sugar": 6, "sodium": 520}',
    '["healthy", "gluten-free", "keto", "salmon", "roasted"]',
    '[]',
    4.8, 45, 'USER', true, true
),
(
    'Green Smoothie Bowl',
    'Nutritious and colorful smoothie bowl packed with vitamins',
    'Breakfast',
    'Healthy',
    'easy',
    10, 0, 10, 1,
    '[
        {"name": "Banana", "amount": 1, "unit": "medium", "notes": "frozen"},
        {"name": "Spinach", "amount": 2, "unit": "cups", "notes": "fresh"},
        {"name": "Mango", "amount": 0.5, "unit": "cup", "notes": "frozen"},
        {"name": "Greek Yogurt", "amount": 0.5, "unit": "cup", "notes": "plain"},
        {"name": "Almond Milk", "amount": 0.5, "unit": "cup"},
        {"name": "Chia Seeds", "amount": 1, "unit": "tbsp"},
        {"name": "Granola", "amount": 0.25, "unit": "cup"},
        {"name": "Berries", "amount": 0.25, "unit": "cup", "notes": "mixed"},
        {"name": "Coconut Flakes", "amount": 1, "unit": "tbsp"}
    ]',
    '[
        {"step_number": 1, "instruction": "Add banana, spinach, mango, yogurt, and almond milk to blender", "duration": 2},
        {"step_number": 2, "instruction": "Blend until smooth and creamy", "duration": 2},
        {"step_number": 3, "instruction": "Pour smoothie into a bowl", "duration": 1},
        {"step_number": 4, "instruction": "Top with chia seeds, granola, berries, and coconut flakes", "duration": 3},
        {"step_number": 5, "instruction": "Serve immediately", "duration": 1}
    ]',
    '{"calories": 320, "protein": 18, "carbs": 45, "fat": 8, "fiber": 12, "sugar": 28, "sodium": 180}',
    '["healthy", "vegetarian", "smoothie", "breakfast", "green"]',
    '[]',
    4.3, 67, 'USER', true, true
),
(
    'Keto Chicken Caesar Salad',
    'Low-carb Caesar salad with grilled chicken and homemade dressing',
    'Main Course',
    'American',
    'medium',
    15, 15, 30, 2,
    '[
        {"name": "Chicken Breast", "amount": 2, "unit": "pieces", "notes": "6 oz each"},
        {"name": "Romaine Lettuce", "amount": 1, "unit": "head", "notes": "chopped"},
        {"name": "Parmesan Cheese", "amount": 0.5, "unit": "cup", "notes": "grated"},
        {"name": "Caesar Dressing", "amount": 0.25, "unit": "cup", "notes": "sugar-free"},
        {"name": "Olive Oil", "amount": 2, "unit": "tbsp"},
        {"name": "Garlic Powder", "amount": 1, "unit": "tsp"},
        {"name": "Salt", "amount": 0.5, "unit": "tsp"},
        {"name": "Black Pepper", "amount": 0.25, "unit": "tsp"},
        {"name": "Lemon", "amount": 0.5, "unit": "medium", "notes": "juiced"}
    ]',
    '[
        {"step_number": 1, "instruction": "Season chicken with garlic powder, salt, and pepper", "duration": 5},
        {"step_number": 2, "instruction": "Heat olive oil in a pan and cook chicken 6-7 minutes per side", "duration": 15},
        {"step_number": 3, "instruction": "Let chicken rest, then slice into strips", "duration": 5},
        {"step_number": 4, "instruction": "Toss lettuce with Caesar dressing", "duration": 2},
        {"step_number": 5, "instruction": "Top salad with chicken strips and parmesan cheese", "duration": 2},
        {"step_number": 6, "instruction": "Drizzle with lemon juice and serve", "duration": 1}
    ]',
    '{"calories": 450, "protein": 42, "carbs": 8, "fat": 28, "fiber": 3, "sugar": 4, "sodium": 890}',
    '["keto", "low-carb", "gluten-free", "caesar", "chicken"]',
    '[]',
    4.6, 34, 'USER', true, true
);

-- =============================================
-- 3. SAMPLE NUTRITION GOALS
-- =============================================

-- Note: These will be created when users set their goals, but we can create some example goals
-- for demonstration purposes. In practice, these would be created through the API.

-- =============================================
-- 4. SAMPLE BARCODE PRODUCTS
-- =============================================

INSERT INTO barcode_products (
    barcode, product_name, brand, category,
    product_info, nutritional_info, source, verified
) VALUES
(
    '0123456789012',
    'Organic Whole Milk',
    'Generic Organic',
    'Dairy & Eggs',
    '{"description": "Fresh organic whole milk", "size": "1 gallon", "expiration": "7 days"}',
    '{"calories": 150, "protein": 8, "carbs": 12, "fat": 8, "fiber": 0, "sugar": 12, "sodium": 120}',
    'CUSTOM',
    true
),
(
    '0123456789013',
    'Whole Grain Bread',
    'Generic Bakery',
    'Grains & Cereals',
    '{"description": "Whole grain bread with seeds", "size": "1 loaf", "expiration": "5 days"}',
    '{"calories": 247, "protein": 13, "carbs": 41, "fat": 4, "fiber": 6, "sugar": 4, "sodium": 681}',
    'CUSTOM',
    true
),
(
    '0123456789014',
    'Greek Yogurt',
    'Generic Dairy',
    'Dairy & Eggs',
    '{"description": "Plain Greek yogurt", "size": "32 oz", "expiration": "14 days"}',
    '{"calories": 59, "protein": 10, "carbs": 4, "fat": 0, "fiber": 0, "sugar": 4, "sodium": 36}',
    'CUSTOM',
    true
);

-- =============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Additional indexes for better search performance
CREATE INDEX idx_food_items_name_trgm ON food_items USING gin (name gin_trgm_ops);
CREATE INDEX idx_food_items_description_trgm ON food_items USING gin (description gin_trgm_ops);
CREATE INDEX idx_recipes_title_trgm ON recipes USING gin (title gin_trgm_ops);
CREATE INDEX idx_recipes_description_trgm ON recipes USING gin (description gin_trgm_ops);

-- =============================================
-- 6. UPDATE STATISTICS
-- =============================================

-- Update table statistics for better query planning
ANALYZE food_items;
ANALYZE recipes;
ANALYZE barcode_products;
ANALYZE nutrition_logs;
ANALYZE daily_nutrition_summaries;
ANALYZE user_nutrition_goals;

