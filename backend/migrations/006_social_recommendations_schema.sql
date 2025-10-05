-- Migration 006: Social Recommendations and Insights Schema
-- Sprint 11-12: AI-powered social recommendations and insights

-- Create roles if they don't exist
DO $$ BEGIN
    CREATE ROLE dietgame_app;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create recommendation feedback table
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id UUID NOT NULL,
    recommendation_type VARCHAR(20) NOT NULL CHECK (recommendation_type IN ('friend', 'team', 'content', 'mentorship')),
    action VARCHAR(20) NOT NULL CHECK (action IN ('accepted', 'rejected', 'ignored')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendation performance tracking table
CREATE TABLE IF NOT EXISTS recommendation_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(20) NOT NULL CHECK (recommendation_type IN ('friend', 'team', 'content', 'mentorship')),
    total_recommendations INTEGER DEFAULT 0,
    accepted_recommendations INTEGER DEFAULT 0,
    rejected_recommendations INTEGER DEFAULT 0,
    ignored_recommendations INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    acceptance_rate DECIMAL(5,2) DEFAULT 0.0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recommendation_type, period_start, period_end)
);

-- Create social insights cache table
CREATE TABLE IF NOT EXISTS social_insights_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insights_data JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendation algorithm versioning table
CREATE TABLE IF NOT EXISTS recommendation_algorithm_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    algorithm_name VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    parameters JSONB NOT NULL,
    is_active BOOLEAN DEFAULT false,
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(algorithm_name, version)
);

-- Create user recommendation preferences table
CREATE TABLE IF NOT EXISTS user_recommendation_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(20) NOT NULL CHECK (recommendation_type IN ('friend', 'team', 'content', 'mentorship')),
    enabled BOOLEAN DEFAULT true,
    min_confidence DECIMAL(3,2) DEFAULT 0.5,
    max_age_hours INTEGER DEFAULT 24,
    filters JSONB,
    notification_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recommendation_type)
);

-- Create recommendation interaction tracking table
CREATE TABLE IF NOT EXISTS recommendation_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_id UUID NOT NULL,
    recommendation_type VARCHAR(20) NOT NULL CHECK (recommendation_type IN ('friend', 'team', 'content', 'mentorship')),
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'click', 'accept', 'reject', 'ignore', 'share')),
    interaction_data JSONB,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_type ON recommendation_feedback(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_created_at ON recommendation_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_action ON recommendation_feedback(action);

CREATE INDEX IF NOT EXISTS idx_recommendation_performance_user_id ON recommendation_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_performance_type ON recommendation_performance(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_performance_period ON recommendation_performance(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_social_insights_cache_user_id ON social_insights_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_social_insights_cache_expires_at ON social_insights_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_recommendation_preferences_user_id ON user_recommendation_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendation_preferences_type ON user_recommendation_preferences(recommendation_type);

CREATE INDEX IF NOT EXISTS idx_recommendation_interactions_user_id ON recommendation_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_interactions_type ON recommendation_interactions(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_interactions_created_at ON recommendation_interactions(created_at);

-- Create triggers for updated_at columns
CREATE TRIGGER update_recommendation_feedback_updated_at BEFORE UPDATE ON recommendation_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendation_performance_updated_at BEFORE UPDATE ON recommendation_performance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_insights_cache_updated_at BEFORE UPDATE ON social_insights_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recommendation_algorithm_versions_updated_at BEFORE UPDATE ON recommendation_algorithm_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_recommendation_preferences_updated_at BEFORE UPDATE ON user_recommendation_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for recommendation analytics
CREATE OR REPLACE FUNCTION get_recommendation_performance_stats(
    user_uuid UUID,
    period_days INTEGER DEFAULT 30
)
RETURNS TABLE(
    recommendation_type VARCHAR(20),
    total_recommendations BIGINT,
    accepted_recommendations BIGINT,
    rejected_recommendations BIGINT,
    ignored_recommendations BIGINT,
    acceptance_rate DECIMAL(5,2),
    average_rating DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rf.recommendation_type,
        COUNT(*) as total_recommendations,
        COUNT(CASE WHEN rf.action = 'accepted' THEN 1 END) as accepted_recommendations,
        COUNT(CASE WHEN rf.action = 'rejected' THEN 1 END) as rejected_recommendations,
        COUNT(CASE WHEN rf.action = 'ignored' THEN 1 END) as ignored_recommendations,
        ROUND(
            (COUNT(CASE WHEN rf.action = 'accepted' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
            2
        ) as acceptance_rate,
        ROUND(AVG(rf.rating), 2) as average_rating
    FROM recommendation_feedback rf
    WHERE rf.user_id = user_uuid
    AND rf.created_at >= NOW() - INTERVAL '1 day' * period_days
    GROUP BY rf.recommendation_type
    ORDER BY rf.recommendation_type;
END;
$$ LANGUAGE plpgsql;

-- Function to get user recommendation preferences
CREATE OR REPLACE FUNCTION get_user_recommendation_preferences(user_uuid UUID)
RETURNS TABLE(
    recommendation_type VARCHAR(20),
    enabled BOOLEAN,
    min_confidence DECIMAL(3,2),
    max_age_hours INTEGER,
    filters JSONB,
    notification_settings JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        urp.recommendation_type,
        urp.enabled,
        urp.min_confidence,
        urp.max_age_hours,
        urp.filters,
        urp.notification_settings
    FROM user_recommendation_preferences urp
    WHERE urp.user_id = user_uuid
    ORDER BY urp.recommendation_type;
END;
$$ LANGUAGE plpgsql;

-- Function to update recommendation performance
CREATE OR REPLACE FUNCTION update_recommendation_performance(
    user_uuid UUID,
    rec_type VARCHAR(20),
    period_start DATE,
    period_end DATE
)
RETURNS VOID AS $$
DECLARE
    total_recs INTEGER;
    accepted_recs INTEGER;
    rejected_recs INTEGER;
    ignored_recs INTEGER;
    avg_rating DECIMAL(3,2);
    acceptance_rate DECIMAL(5,2);
BEGIN
    -- Calculate statistics
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN action = 'accepted' THEN 1 END),
        COUNT(CASE WHEN action = 'rejected' THEN 1 END),
        COUNT(CASE WHEN action = 'ignored' THEN 1 END),
        ROUND(AVG(rating), 2)
    INTO total_recs, accepted_recs, rejected_recs, ignored_recs, avg_rating
    FROM recommendation_feedback
    WHERE user_id = user_uuid
    AND recommendation_type = rec_type
    AND created_at::DATE BETWEEN period_start AND period_end;

    -- Calculate acceptance rate
    IF total_recs > 0 THEN
        acceptance_rate := ROUND((accepted_recs::DECIMAL / total_recs) * 100, 2);
    ELSE
        acceptance_rate := 0.0;
    END IF;

    -- Insert or update performance record
    INSERT INTO recommendation_performance (
        user_id, recommendation_type, total_recommendations, accepted_recommendations,
        rejected_recommendations, ignored_recommendations, average_rating,
        acceptance_rate, period_start, period_end
    ) VALUES (
        user_uuid, rec_type, total_recs, accepted_recs, rejected_recs,
        ignored_recs, avg_rating, acceptance_rate, period_start, period_end
    )
    ON CONFLICT (user_id, recommendation_type, period_start, period_end)
    DO UPDATE SET
        total_recommendations = EXCLUDED.total_recommendations,
        accepted_recommendations = EXCLUDED.accepted_recommendations,
        rejected_recommendations = EXCLUDED.rejected_recommendations,
        ignored_recommendations = EXCLUDED.ignored_recommendations,
        average_rating = EXCLUDED.average_rating,
        acceptance_rate = EXCLUDED.acceptance_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired insights cache
CREATE OR REPLACE FUNCTION cleanup_expired_insights_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM social_insights_cache
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommendation interaction analytics
CREATE OR REPLACE FUNCTION get_recommendation_interaction_analytics(
    user_uuid UUID,
    period_days INTEGER DEFAULT 30
)
RETURNS TABLE(
    recommendation_type VARCHAR(20),
    interaction_type VARCHAR(20),
    interaction_count BIGINT,
    unique_recommendations BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ri.recommendation_type,
        ri.interaction_type,
        COUNT(*) as interaction_count,
        COUNT(DISTINCT ri.recommendation_id) as unique_recommendations
    FROM recommendation_interactions ri
    WHERE ri.user_id = user_uuid
    AND ri.created_at >= NOW() - INTERVAL '1 day' * period_days
    GROUP BY ri.recommendation_type, ri.interaction_type
    ORDER BY ri.recommendation_type, ri.interaction_type;
END;
$$ LANGUAGE plpgsql;

-- Insert default algorithm versions
INSERT INTO recommendation_algorithm_versions (algorithm_name, version, parameters, is_active) VALUES
('friend_matching', '1.0.0', '{"mutual_friends_weight": 0.3, "common_interests_weight": 0.25, "activity_level_weight": 0.2, "location_weight": 0.15, "goals_weight": 0.1}', true),
('team_matching', '1.0.0', '{"goal_alignment_weight": 0.4, "activity_match_weight": 0.3, "location_match_weight": 0.2, "availability_weight": 0.1}', true),
('content_recommendation', '1.0.0', '{"interest_score_weight": 0.4, "friend_boost_weight": 0.3, "engagement_score_weight": 0.2, "recency_weight": 0.1}', true),
('mentorship_matching', '1.0.0', '{"goal_alignment_weight": 0.4, "experience_match_weight": 0.3, "availability_weight": 0.2, "rating_weight": 0.1}', true)
ON CONFLICT (algorithm_name, version) DO NOTHING;

-- Insert default user preferences for existing users
INSERT INTO user_recommendation_preferences (user_id, recommendation_type, enabled, min_confidence, max_age_hours, filters, notification_settings)
SELECT 
    u.id,
    rec_type,
    true,
    0.5,
    24,
    '{}'::jsonb,
    '{"email": true, "push": true, "in_app": true}'::jsonb
FROM users u
CROSS JOIN (VALUES ('friend'), ('team'), ('content'), ('mentorship')) AS types(rec_type)
WHERE NOT EXISTS (
    SELECT 1 FROM user_recommendation_preferences urp 
    WHERE urp.user_id = u.id AND urp.recommendation_type = rec_type
);

-- Create a scheduled job to clean up expired cache (this would typically be handled by a cron job or scheduler)
-- For now, we'll create a function that can be called periodically
CREATE OR REPLACE FUNCTION schedule_insights_cache_cleanup()
RETURNS VOID AS $$
BEGIN
    -- This function can be called by a scheduled job to clean up expired cache
    PERFORM cleanup_expired_insights_cache();
    
    -- Log the cleanup
    INSERT INTO system_logs (level, message, metadata)
    VALUES ('INFO', 'Insights cache cleanup completed', 
            jsonb_build_object('function', 'cleanup_expired_insights_cache', 'timestamp', NOW()));
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE recommendation_feedback IS 'Stores user feedback on AI recommendations for improving algorithms';
COMMENT ON TABLE recommendation_performance IS 'Tracks performance metrics for recommendation algorithms per user';
COMMENT ON TABLE social_insights_cache IS 'Caches generated social insights to improve performance';
COMMENT ON TABLE recommendation_algorithm_versions IS 'Tracks different versions of recommendation algorithms';
COMMENT ON TABLE user_recommendation_preferences IS 'User preferences for recommendation types and settings';
COMMENT ON TABLE recommendation_interactions IS 'Tracks user interactions with recommendations for analytics';

COMMENT ON FUNCTION get_recommendation_performance_stats IS 'Returns performance statistics for user recommendations over a specified period';
COMMENT ON FUNCTION get_user_recommendation_preferences IS 'Returns user preferences for all recommendation types';
COMMENT ON FUNCTION update_recommendation_performance IS 'Updates or creates performance records for recommendation types';
COMMENT ON FUNCTION cleanup_expired_insights_cache IS 'Removes expired insights cache entries';
COMMENT ON FUNCTION get_recommendation_interaction_analytics IS 'Returns analytics on user interactions with recommendations';
COMMENT ON FUNCTION schedule_insights_cache_cleanup IS 'Scheduled function to clean up expired insights cache';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON recommendation_feedback TO dietgame_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON recommendation_performance TO dietgame_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON social_insights_cache TO dietgame_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON recommendation_algorithm_versions TO dietgame_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_recommendation_preferences TO dietgame_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON recommendation_interactions TO dietgame_app;

GRANT EXECUTE ON FUNCTION get_recommendation_performance_stats TO dietgame_app;
GRANT EXECUTE ON FUNCTION get_user_recommendation_preferences TO dietgame_app;
GRANT EXECUTE ON FUNCTION update_recommendation_performance TO dietgame_app;
GRANT EXECUTE ON FUNCTION cleanup_expired_insights_cache TO dietgame_app;
GRANT EXECUTE ON FUNCTION get_recommendation_interaction_analytics TO dietgame_app;
GRANT EXECUTE ON FUNCTION schedule_insights_cache_cleanup TO dietgame_app;
