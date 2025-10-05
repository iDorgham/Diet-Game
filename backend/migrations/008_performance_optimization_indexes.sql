-- Performance Optimization Indexes Migration
-- Based on RECOMMENDATIONS_PERFORMANCE_OPTIMIZATION.md checklist
-- Sprint 9-10: Performance Optimization Implementation

-- 1. Optimized recommendation queries indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_user_confidence 
ON recommendations (user_id, confidence DESC, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friends_mutual 
ON friendships (user1_id, user2_id) 
INCLUDE (created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_engagement 
ON posts (created_at DESC, like_count DESC, comment_count DESC) 
WHERE privacy = 'public';

-- 2. Enhanced user behavior and interaction indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_behavior_patterns_updated 
ON user_behavior_patterns (user_id, last_updated DESC, pattern_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interaction_patterns_recent 
ON user_interaction_patterns (user_id, last_interaction DESC, interaction_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interaction_patterns_positive 
ON user_interaction_patterns (user_id, positive_interactions DESC) 
WHERE positive_interactions > 0;

-- 3. Recommendation generation and feedback indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_generation_performance 
ON recommendation_generation_log (user_id, recommendation_type, generation_time_ms, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_feedback_rating 
ON recommendation_feedback (user_id, recommendation_type, rating DESC, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_feedback_positive 
ON recommendation_feedback (user_id, feedback_type, created_at DESC) 
WHERE feedback_type = 'positive';

-- 4. ML model and algorithm performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ml_model_performance_latest 
ON ml_model_performance (model_version, algorithm_type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_algorithm_weights_user_algorithm 
ON algorithm_weights (user_id, algorithm_type, weight_name, last_updated DESC);

-- 5. Cache and embedding indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_cache_user_type 
ON recommendation_cache (user_id, recommendation_type, expires_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_embeddings_model_user 
ON user_embeddings (model_version, user_id, updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_item_embeddings_type_model 
ON item_embeddings (item_type, model_version, updated_at DESC);

-- 6. A/B testing and analytics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_ab_tests_active 
ON recommendation_ab_tests (user_id, test_name, created_at DESC) 
WHERE completed_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_importance_model_algorithm 
ON feature_importance (model_version, algorithm_type, importance_score DESC);

-- 7. Composite indexes for complex queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_user_type_confidence 
ON recommendations (user_id, recommendation_type, confidence DESC, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_privacy_engagement 
ON posts (user_id, privacy, created_at DESC, like_count DESC, comment_count DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_user_status_created 
ON friendships (user1_id, status, created_at DESC) 
INCLUDE (user2_id);

-- 8. Partial indexes for specific use cases
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_high_confidence 
ON recommendations (user_id, created_at DESC) 
WHERE confidence > 0.7;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_recent_public 
ON posts (created_at DESC, like_count DESC) 
WHERE privacy = 'public' AND created_at > NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interaction_patterns_active 
ON user_interaction_patterns (user_id, target_type, last_interaction DESC) 
WHERE last_interaction > NOW() - INTERVAL '30 days';

-- 9. Materialized views for complex aggregations
CREATE MATERIALIZED VIEW IF NOT EXISTS user_recommendation_stats AS
SELECT 
  user_id,
  recommendation_type,
  COUNT(*) as total_recommendations,
  AVG(confidence) as avg_confidence,
  COUNT(CASE WHEN accepted = true THEN 1 END) as accepted_count,
  COUNT(CASE WHEN feedback_type = 'positive' THEN 1 END) as positive_feedback_count,
  COUNT(CASE WHEN feedback_type = 'negative' THEN 1 END) as negative_feedback_count,
  AVG(rating) as avg_rating,
  MAX(created_at) as last_recommendation_date
FROM recommendations r
LEFT JOIN recommendation_feedback rf ON r.id = rf.recommendation_id
GROUP BY user_id, recommendation_type;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_recommendation_stats_user_type 
ON user_recommendation_stats (user_id, recommendation_type);

-- 10. Materialized view for team recommendation performance
CREATE MATERIALIZED VIEW IF NOT EXISTS team_recommendation_performance AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  COUNT(r.id) as total_recommendations,
  AVG(r.confidence) as avg_confidence,
  COUNT(CASE WHEN r.accepted = true THEN 1 END) as accepted_count,
  COUNT(CASE WHEN rf.feedback_type = 'positive' THEN 1 END) as positive_feedback,
  AVG(rf.rating) as avg_rating
FROM teams t
LEFT JOIN recommendations r ON t.id = r.target_id AND r.recommendation_type = 'team'
LEFT JOIN recommendation_feedback rf ON r.id = rf.recommendation_id
GROUP BY t.id, t.name;

-- Create index on team performance view
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_recommendation_performance_team 
ON team_recommendation_performance (team_id);

-- 11. Materialized view for content recommendation trends
CREATE MATERIALIZED VIEW IF NOT EXISTS content_recommendation_trends AS
SELECT 
  DATE_TRUNC('day', r.created_at) as recommendation_date,
  r.recommendation_type,
  COUNT(*) as daily_recommendations,
  AVG(r.confidence) as avg_confidence,
  COUNT(CASE WHEN r.accepted = true THEN 1 END) as daily_accepted,
  COUNT(CASE WHEN rf.feedback_type = 'positive' THEN 1 END) as daily_positive_feedback
FROM recommendations r
LEFT JOIN recommendation_feedback rf ON r.id = rf.recommendation_id
WHERE r.created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', r.created_at), r.recommendation_type
ORDER BY recommendation_date DESC;

-- Create index on content trends view
CREATE INDEX IF NOT EXISTS idx_content_recommendation_trends_date_type 
ON content_recommendation_trends (recommendation_date DESC, recommendation_type);

-- 12. Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_recommendation_materialized_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_recommendation_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY team_recommendation_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY content_recommendation_trends;
  
  -- Log the refresh
  INSERT INTO recommendation_generation_log (
    user_id, 
    recommendation_type, 
    algorithm_used, 
    recommendations_count, 
    generation_time_ms, 
    context
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, -- System user
    'system', 
    'materialized_view_refresh', 
    0, 
    0, 
    '{"action": "refresh_materialized_views", "timestamp": "' || NOW() || '"}'::jsonb
  );
END;
$$ LANGUAGE plpgsql;

-- 13. Create function to analyze index usage
CREATE OR REPLACE FUNCTION analyze_recommendation_index_usage()
RETURNS TABLE (
  index_name TEXT,
  table_name TEXT,
  index_size TEXT,
  index_scans BIGINT,
  tuples_read BIGINT,
  tuples_fetched BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.indexname::TEXT,
    i.tablename::TEXT,
    pg_size_pretty(pg_relation_size(i.indexname::regclass))::TEXT,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch
  FROM pg_indexes i
  JOIN pg_stat_user_indexes s ON i.indexname = s.indexrelname
  WHERE i.tablename IN (
    'recommendations', 
    'recommendation_feedback', 
    'user_behavior_patterns',
    'user_interaction_patterns',
    'recommendation_generation_log',
    'ml_model_performance',
    'algorithm_weights',
    'recommendation_cache',
    'user_embeddings',
    'item_embeddings',
    'recommendation_ab_tests',
    'feature_importance'
  )
  ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- 14. Create function to get query performance statistics
CREATE OR REPLACE FUNCTION get_recommendation_query_stats()
RETURNS TABLE (
  query_type TEXT,
  avg_execution_time_ms NUMERIC,
  total_calls BIGINT,
  cache_hit_ratio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN query LIKE '%recommendations%' THEN 'recommendations'
      WHEN query LIKE '%user_behavior%' THEN 'user_behavior'
      WHEN query LIKE '%interaction_patterns%' THEN 'interaction_patterns'
      WHEN query LIKE '%feedback%' THEN 'feedback'
      ELSE 'other'
    END as query_type,
    ROUND(AVG(mean_exec_time) * 1000, 2) as avg_execution_time_ms,
    SUM(calls) as total_calls,
    ROUND(AVG(shared_blks_hit::NUMERIC / NULLIF(shared_blks_hit + shared_blks_read, 0) * 100), 2) as cache_hit_ratio
  FROM pg_stat_statements
  WHERE query LIKE '%recommendation%' 
     OR query LIKE '%user_behavior%'
     OR query LIKE '%interaction_patterns%'
     OR query LIKE '%feedback%'
  GROUP BY query_type
  ORDER BY total_calls DESC;
END;
$$ LANGUAGE plpgsql;

-- 15. Add comments for documentation
COMMENT ON INDEX idx_recommendations_user_confidence IS 'Optimized index for user recommendations sorted by confidence and recency';
COMMENT ON INDEX idx_friends_mutual IS 'Optimized index for mutual friend queries with creation date';
COMMENT ON INDEX idx_posts_engagement IS 'Optimized index for public posts sorted by engagement and recency';
COMMENT ON MATERIALIZED VIEW user_recommendation_stats IS 'Aggregated user recommendation statistics for performance';
COMMENT ON MATERIALIZED VIEW team_recommendation_performance IS 'Team recommendation performance metrics';
COMMENT ON MATERIALIZED VIEW content_recommendation_trends IS 'Daily content recommendation trends and metrics';
COMMENT ON FUNCTION refresh_recommendation_materialized_views() IS 'Refreshes all recommendation-related materialized views';
COMMENT ON FUNCTION analyze_recommendation_index_usage() IS 'Analyzes usage statistics for recommendation indexes';
COMMENT ON FUNCTION get_recommendation_query_stats() IS 'Provides query performance statistics for recommendation queries';

-- 16. Schedule materialized view refresh (requires pg_cron extension)
-- Note: This will only work if pg_cron is installed and enabled
-- SELECT cron.schedule('refresh-recommendation-views', '*/15 * * * *', 'SELECT refresh_recommendation_materialized_views();');

-- 17. Create performance monitoring view
CREATE OR REPLACE VIEW recommendation_performance_monitoring AS
SELECT 
  'index_usage' as metric_type,
  index_name as metric_name,
  index_scans as metric_value,
  'index_scans' as metric_unit
FROM analyze_recommendation_index_usage()
UNION ALL
SELECT 
  'query_performance' as metric_type,
  query_type as metric_name,
  avg_execution_time_ms as metric_value,
  'milliseconds' as metric_unit
FROM get_recommendation_query_stats()
UNION ALL
SELECT 
  'materialized_view_size' as metric_type,
  'user_recommendation_stats' as metric_name,
  pg_relation_size('user_recommendation_stats') as metric_value,
  'bytes' as metric_unit
UNION ALL
SELECT 
  'materialized_view_size' as metric_type,
  'team_recommendation_performance' as metric_name,
  pg_relation_size('team_recommendation_performance') as metric_value,
  'bytes' as metric_unit
UNION ALL
SELECT 
  'materialized_view_size' as metric_type,
  'content_recommendation_trends' as metric_name,
  pg_relation_size('content_recommendation_trends') as metric_value,
  'bytes' as metric_unit;

COMMENT ON VIEW recommendation_performance_monitoring IS 'Comprehensive performance monitoring for recommendation system indexes and queries';
