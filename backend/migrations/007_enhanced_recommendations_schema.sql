-- Enhanced Recommendations Schema Migration
-- Advanced AI scoring and ML features for better recommendation accuracy

-- Create recommendation feedback table for learning
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id UUID NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('friend', 'team', 'content', 'mentorship')),
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('positive', 'negative', 'neutral')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    reason TEXT,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing recommendation_feedback table
DO $$ BEGIN
    -- Add feedback_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recommendation_feedback' AND column_name = 'feedback_type') THEN
        ALTER TABLE recommendation_feedback ADD COLUMN feedback_type VARCHAR(20) DEFAULT 'neutral';
        ALTER TABLE recommendation_feedback ADD CONSTRAINT recommendation_feedback_feedback_type_check 
            CHECK (feedback_type IN ('positive', 'negative', 'neutral'));
    END IF;
    
    -- Add reason column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recommendation_feedback' AND column_name = 'reason') THEN
        ALTER TABLE recommendation_feedback ADD COLUMN reason TEXT;
    END IF;
    
    -- Add context column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recommendation_feedback' AND column_name = 'context') THEN
        ALTER TABLE recommendation_feedback ADD COLUMN context JSONB;
    END IF;
END $$;

-- Create index for efficient feedback queries
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_type ON recommendation_feedback(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_created_at ON recommendation_feedback(created_at);

-- Create user behavior patterns table
CREATE TABLE IF NOT EXISTS user_behavior_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL,
    pattern_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for behavior patterns
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_user_id ON user_behavior_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_type ON user_behavior_patterns(pattern_type);

-- Create ML model performance tracking table
CREATE TABLE IF NOT EXISTS ml_model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version VARCHAR(20) NOT NULL,
    algorithm_type VARCHAR(50) NOT NULL,
    accuracy DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    training_samples INTEGER,
    validation_samples INTEGER,
    training_duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for model performance
CREATE INDEX IF NOT EXISTS idx_ml_model_performance_version ON ml_model_performance(model_version);
CREATE INDEX IF NOT EXISTS idx_ml_model_performance_algorithm ON ml_model_performance(algorithm_type);

-- Create user embeddings table for collaborative filtering
CREATE TABLE IF NOT EXISTS user_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    embedding_vector REAL[] NOT NULL,
    embedding_dimension INTEGER NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, model_version)
);

-- Create index for user embeddings
CREATE INDEX IF NOT EXISTS idx_user_embeddings_user_id ON user_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_embeddings_model_version ON user_embeddings(model_version);

-- Create item embeddings table for collaborative filtering
CREATE TABLE IF NOT EXISTS item_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('user', 'team', 'content', 'mentor')),
    embedding_vector REAL[] NOT NULL,
    embedding_dimension INTEGER NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, item_type, model_version)
);

-- Create index for item embeddings
CREATE INDEX IF NOT EXISTS idx_item_embeddings_item_id ON item_embeddings(item_id);
CREATE INDEX IF NOT EXISTS idx_item_embeddings_type ON item_embeddings(item_type);
CREATE INDEX IF NOT EXISTS idx_item_embeddings_model_version ON item_embeddings(model_version);

-- Create recommendation generation tracking table
CREATE TABLE IF NOT EXISTS recommendation_generation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    algorithm_used VARCHAR(50) NOT NULL,
    model_version VARCHAR(20),
    recommendations_count INTEGER NOT NULL,
    generation_time_ms INTEGER,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for generation log
CREATE INDEX IF NOT EXISTS idx_recommendation_generation_user_id ON recommendation_generation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_generation_type ON recommendation_generation_log(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_generation_created_at ON recommendation_generation_log(created_at);

-- Create user interaction patterns table
CREATE TABLE IF NOT EXISTS user_interaction_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    interaction_count INTEGER DEFAULT 1,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    positive_interactions INTEGER DEFAULT 0,
    negative_interactions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- Create index for interaction patterns
CREATE INDEX IF NOT EXISTS idx_user_interaction_patterns_user_id ON user_interaction_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interaction_patterns_target ON user_interaction_patterns(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_user_interaction_patterns_type ON user_interaction_patterns(interaction_type);

-- Create algorithm weight tracking table
CREATE TABLE IF NOT EXISTS algorithm_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    algorithm_type VARCHAR(50) NOT NULL,
    weight_name VARCHAR(50) NOT NULL,
    weight_value DECIMAL(5,4) NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.5,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, algorithm_type, weight_name)
);

-- Create index for algorithm weights
CREATE INDEX IF NOT EXISTS idx_algorithm_weights_user_id ON algorithm_weights(user_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_weights_algorithm ON algorithm_weights(algorithm_type);

-- Create recommendation cache table
CREATE TABLE IF NOT EXISTS recommendation_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    algorithm_used VARCHAR(50) NOT NULL,
    cached_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for recommendation cache
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_key ON recommendation_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_id ON recommendation_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_expires ON recommendation_cache(expires_at);

-- Create feature importance tracking table
CREATE TABLE IF NOT EXISTS feature_importance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version VARCHAR(20) NOT NULL,
    algorithm_type VARCHAR(50) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    importance_score DECIMAL(5,4) NOT NULL,
    feature_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for feature importance
CREATE INDEX IF NOT EXISTS idx_feature_importance_model ON feature_importance(model_version);
CREATE INDEX IF NOT EXISTS idx_feature_importance_algorithm ON feature_importance(algorithm_type);

-- Create recommendation A/B testing table
CREATE TABLE IF NOT EXISTS recommendation_ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    variant VARCHAR(50) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    algorithm_a VARCHAR(50) NOT NULL,
    algorithm_b VARCHAR(50) NOT NULL,
    assigned_algorithm VARCHAR(50) NOT NULL,
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for A/B tests
CREATE INDEX IF NOT EXISTS idx_recommendation_ab_tests_user_id ON recommendation_ab_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_ab_tests_name ON recommendation_ab_tests(test_name);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE OR REPLACE TRIGGER update_recommendation_feedback_updated_at 
    BEFORE UPDATE ON recommendation_feedback 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_behavior_patterns_updated_at 
    BEFORE UPDATE ON user_behavior_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_embeddings_updated_at 
    BEFORE UPDATE ON user_embeddings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_item_embeddings_updated_at 
    BEFORE UPDATE ON item_embeddings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_interaction_patterns_updated_at 
    BEFORE UPDATE ON user_interaction_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_algorithm_weights_updated_at 
    BEFORE UPDATE ON algorithm_weights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for analytics
CREATE OR REPLACE VIEW recommendation_performance_summary AS
SELECT 
    recommendation_type,
    algorithm_used,
    COUNT(*) as total_generations,
    AVG(recommendations_count) as avg_recommendations_per_generation,
    AVG(generation_time_ms) as avg_generation_time_ms,
    DATE_TRUNC('day', created_at) as generation_date
FROM recommendation_generation_log
GROUP BY recommendation_type, algorithm_used, DATE_TRUNC('day', created_at)
ORDER BY generation_date DESC;

CREATE OR REPLACE VIEW user_feedback_summary AS
SELECT 
    user_id,
    recommendation_type,
    feedback_type,
    COUNT(*) as feedback_count,
    AVG(rating) as avg_rating,
    DATE_TRUNC('week', created_at) as feedback_week
FROM recommendation_feedback
GROUP BY user_id, recommendation_type, feedback_type, DATE_TRUNC('week', created_at)
ORDER BY feedback_week DESC;

CREATE OR REPLACE VIEW ml_model_performance_summary AS
SELECT 
    model_version,
    algorithm_type,
    accuracy,
    precision_score,
    recall_score,
    f1_score,
    training_samples,
    created_at
FROM ml_model_performance
ORDER BY created_at DESC;

-- Insert default algorithm weights
INSERT INTO algorithm_weights (algorithm_type, weight_name, weight_value, confidence) VALUES
('friend_recommendation', 'mutual_friends', 0.30, 0.8),
('friend_recommendation', 'common_interests', 0.25, 0.8),
('friend_recommendation', 'activity_level', 0.20, 0.7),
('friend_recommendation', 'location', 0.15, 0.6),
('friend_recommendation', 'goals', 0.10, 0.7),
('team_recommendation', 'goal_alignment', 0.40, 0.8),
('team_recommendation', 'activity_compatibility', 0.30, 0.7),
('team_recommendation', 'location_proximity', 0.20, 0.6),
('team_recommendation', 'team_availability', 0.10, 0.8),
('content_recommendation', 'interest_relevance', 0.40, 0.8),
('content_recommendation', 'friend_connection', 0.30, 0.7),
('content_recommendation', 'engagement_prediction', 0.20, 0.6),
('content_recommendation', 'recency', 0.10, 0.5),
('mentorship_recommendation', 'goal_alignment', 0.40, 0.8),
('mentorship_recommendation', 'experience_match', 0.30, 0.7),
('mentorship_recommendation', 'availability', 0.20, 0.6),
('mentorship_recommendation', 'rating', 0.10, 0.8)
ON CONFLICT DO NOTHING;

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_recommendation_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM recommendation_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user recommendation statistics
CREATE OR REPLACE FUNCTION get_user_recommendation_stats(user_uuid UUID)
RETURNS TABLE (
    recommendation_type VARCHAR(50),
    total_recommendations BIGINT,
    positive_feedback BIGINT,
    negative_feedback BIGINT,
    avg_rating DECIMAL(3,2),
    last_recommendation TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rf.recommendation_type,
        COUNT(rgl.id) as total_recommendations,
        COUNT(CASE WHEN rf.feedback_type = 'positive' THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN rf.feedback_type = 'negative' THEN 1 END) as negative_feedback,
        AVG(rf.rating) as avg_rating,
        MAX(rgl.created_at) as last_recommendation
    FROM recommendation_generation_log rgl
    LEFT JOIN recommendation_feedback rf ON rgl.user_id = rf.user_id 
        AND rgl.recommendation_type = rf.recommendation_type
    WHERE rgl.user_id = user_uuid
    GROUP BY rf.recommendation_type;
END;
$$ LANGUAGE plpgsql;

-- Create function to update user behavior patterns
CREATE OR REPLACE FUNCTION update_user_behavior_pattern(
    user_uuid UUID,
    pattern_type_param VARCHAR(50),
    pattern_data_param JSONB,
    confidence_param DECIMAL(3,2)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_behavior_patterns (user_id, pattern_type, pattern_data, confidence_score)
    VALUES (user_uuid, pattern_type_param, pattern_data_param, confidence_param)
    ON CONFLICT (user_id, pattern_type) 
    DO UPDATE SET 
        pattern_data = pattern_data_param,
        confidence_score = confidence_param,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_type ON recommendation_feedback(user_id, recommendation_type);
CREATE INDEX IF NOT EXISTS idx_user_interaction_patterns_user_target ON user_interaction_patterns(user_id, target_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_generation_user_type ON recommendation_generation_log(user_id, recommendation_type);

-- Add comments for documentation
COMMENT ON TABLE recommendation_feedback IS 'Stores user feedback on recommendations for ML learning';
COMMENT ON TABLE user_behavior_patterns IS 'Stores learned user behavior patterns for personalization';
COMMENT ON TABLE ml_model_performance IS 'Tracks performance metrics of ML models';
COMMENT ON TABLE user_embeddings IS 'Stores user embeddings for collaborative filtering';
COMMENT ON TABLE item_embeddings IS 'Stores item embeddings for collaborative filtering';
COMMENT ON TABLE recommendation_generation_log IS 'Logs recommendation generation for analytics';
COMMENT ON TABLE user_interaction_patterns IS 'Tracks user interaction patterns for behavior analysis';
COMMENT ON TABLE algorithm_weights IS 'Stores dynamic algorithm weights per user';
COMMENT ON TABLE recommendation_cache IS 'Caches recommendation results for performance';
COMMENT ON TABLE feature_importance IS 'Tracks feature importance in ML models';
COMMENT ON TABLE recommendation_ab_tests IS 'Manages A/B testing for recommendation algorithms';
