-- Phase 15 Advanced Database Optimizations
-- Enhanced performance with partitioning, advanced indexes, and query optimization

-- ==============================================
-- TABLE PARTITIONING FOR LARGE TABLES
-- ==============================================

-- Partition user_activity_logs by date (monthly partitions)
CREATE TABLE IF NOT EXISTS user_activity_logs_partitioned (
    LIKE user_activity_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for the current year and next year
DO $$
DECLARE
    start_date DATE := '2024-01-01';
    end_date DATE := '2025-12-31';
    current_date DATE := start_date;
    partition_name TEXT;
    next_month DATE;
BEGIN
    WHILE current_date <= end_date LOOP
        next_month := current_date + INTERVAL '1 month';
        partition_name := 'user_activity_logs_' || to_char(current_date, 'YYYY_MM');
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF user_activity_logs_partitioned 
                       FOR VALUES FROM (%L) TO (%L)', 
                       partition_name, current_date, next_month);
        
        current_date := next_month;
    END LOOP;
END $$;

-- Partition recommendations by user_id (hash partitioning)
CREATE TABLE IF NOT EXISTS recommendations_partitioned (
    LIKE recommendations INCLUDING ALL
) PARTITION BY HASH (user_id);

-- Create hash partitions (8 partitions for better distribution)
DO $$
DECLARE
    i INTEGER;
    partition_name TEXT;
BEGIN
    FOR i IN 0..7 LOOP
        partition_name := 'recommendations_part_' || i;
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF recommendations_partitioned 
                       FOR VALUES WITH (modulus 8, remainder %s)', 
                       partition_name, i);
    END LOOP;
END $$;

-- ==============================================
-- ADVANCED INDEXES FOR COMPLEX QUERIES
-- ==============================================

-- Composite indexes for recommendation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_user_type_confidence_created 
ON recommendations (user_id, recommendation_type, confidence DESC, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_team_confidence_created 
ON recommendations (team_id, confidence DESC, created_at DESC) 
WHERE team_id IS NOT NULL;

-- Partial indexes for active recommendations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendations_active_high_confidence 
ON recommendations (user_id, created_at DESC) 
WHERE status = 'active' AND confidence > 0.8;

-- Covering index for user progress queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_covering 
ON user_progress (user_id, level, xp, created_at) 
INCLUDE (achievements_unlocked, current_streak);

-- Advanced gamification indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_user_type_progress 
ON user_achievements (user_id, achievement_type, progress DESC, unlocked_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quests_user_status_due 
ON user_quests (user_id, status, due_date) 
WHERE status IN ('active', 'completed');

-- Social features indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_user_status_created 
ON friendships (user_id, status, created_at DESC) 
WHERE status = 'accepted';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_team_role_active 
ON team_members (team_id, role, joined_at DESC) 
WHERE status = 'active';

-- ==============================================
-- MATERIALIZED VIEWS FOR COMPLEX AGGREGATIONS
-- ==============================================

-- User performance summary materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS user_performance_summary AS
SELECT 
    u.user_id,
    u.username,
    up.level,
    up.xp,
    up.current_streak,
    COUNT(DISTINCT ua.achievement_id) as achievements_count,
    COUNT(DISTINCT uq.quest_id) as quests_completed,
    AVG(r.confidence) as avg_recommendation_confidence,
    COUNT(DISTINCT f.friend_id) as friends_count,
    COUNT(DISTINCT tm.team_id) as teams_count,
    MAX(ual.created_at) as last_activity
FROM users u
LEFT JOIN user_progress up ON u.user_id = up.user_id
LEFT JOIN user_achievements ua ON u.user_id = ua.user_id AND ua.unlocked_at IS NOT NULL
LEFT JOIN user_quests uq ON u.user_id = uq.user_id AND uq.status = 'completed'
LEFT JOIN recommendations r ON u.user_id = r.user_id
LEFT JOIN friendships f ON u.user_id = f.user_id AND f.status = 'accepted'
LEFT JOIN team_members tm ON u.user_id = tm.user_id AND tm.status = 'active'
LEFT JOIN user_activity_logs ual ON u.user_id = ual.user_id
GROUP BY u.user_id, u.username, up.level, up.xp, up.current_streak;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_performance_summary_user_id 
ON user_performance_summary (user_id);

-- Team performance summary materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS team_performance_summary AS
SELECT 
    t.team_id,
    t.team_name,
    COUNT(DISTINCT tm.user_id) as member_count,
    AVG(up.level) as avg_member_level,
    SUM(up.xp) as total_team_xp,
    COUNT(DISTINCT ua.achievement_id) as total_achievements,
    COUNT(DISTINCT tc.challenge_id) as active_challenges,
    MAX(tm.joined_at) as last_member_joined
FROM teams t
LEFT JOIN team_members tm ON t.team_id = tm.team_id AND tm.status = 'active'
LEFT JOIN user_progress up ON tm.user_id = up.user_id
LEFT JOIN user_achievements ua ON tm.user_id = ua.user_id AND ua.unlocked_at IS NOT NULL
LEFT JOIN team_challenges tc ON t.team_id = tc.team_id AND tc.status = 'active'
GROUP BY t.team_id, t.team_name;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_performance_summary_team_id 
ON team_performance_summary (team_id);

-- Recommendation performance analytics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS recommendation_analytics AS
SELECT 
    DATE_TRUNC('day', r.created_at) as date,
    r.recommendation_type,
    COUNT(*) as total_recommendations,
    AVG(r.confidence) as avg_confidence,
    COUNT(CASE WHEN rf.feedback_type = 'positive' THEN 1 END) as positive_feedback,
    COUNT(CASE WHEN rf.feedback_type = 'negative' THEN 1 END) as negative_feedback,
    COUNT(CASE WHEN r.status = 'accepted' THEN 1 END) as accepted_recommendations
FROM recommendations r
LEFT JOIN recommendation_feedback rf ON r.recommendation_id = rf.recommendation_id
GROUP BY DATE_TRUNC('day', r.created_at), r.recommendation_type;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_date_type 
ON recommendation_analytics (date, recommendation_type);

-- ==============================================
-- PERFORMANCE FUNCTIONS
-- ==============================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_performance_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_performance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY team_performance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY recommendation_analytics;
    
    -- Log the refresh
    INSERT INTO system_logs (log_type, message, created_at)
    VALUES ('performance', 'Materialized views refreshed', NOW());
END;
$$ LANGUAGE plpgsql;

-- Function to get user performance metrics
CREATE OR REPLACE FUNCTION get_user_performance_metrics(p_user_id INTEGER)
RETURNS TABLE (
    user_id INTEGER,
    username VARCHAR(255),
    level INTEGER,
    xp INTEGER,
    achievements_count BIGINT,
    quests_completed BIGINT,
    avg_recommendation_confidence NUMERIC,
    friends_count BIGINT,
    teams_count BIGINT,
    last_activity TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM user_performance_summary
    WHERE user_performance_summary.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get team performance metrics
CREATE OR REPLACE FUNCTION get_team_performance_metrics(p_team_id INTEGER)
RETURNS TABLE (
    team_id INTEGER,
    team_name VARCHAR(255),
    member_count BIGINT,
    avg_member_level NUMERIC,
    total_team_xp BIGINT,
    total_achievements BIGINT,
    active_challenges BIGINT,
    last_member_joined TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM team_performance_summary
    WHERE team_performance_summary.team_id = p_team_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommendation analytics
CREATE OR REPLACE FUNCTION get_recommendation_analytics(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    date DATE,
    recommendation_type VARCHAR(100),
    total_recommendations BIGINT,
    avg_confidence NUMERIC,
    positive_feedback BIGINT,
    negative_feedback BIGINT,
    accepted_recommendations BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM recommendation_analytics
    WHERE recommendation_analytics.date BETWEEN p_start_date AND p_end_date
    ORDER BY date DESC, recommendation_type;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- QUERY OPTIMIZATION HINTS
-- ==============================================

-- Create function to analyze query performance
CREATE OR REPLACE FUNCTION analyze_query_performance(p_query TEXT)
RETURNS TABLE (
    query_plan TEXT,
    execution_time NUMERIC,
    cost_estimate NUMERIC
) AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    plan_result TEXT;
BEGIN
    start_time := clock_timestamp();
    
    -- Get query plan
    EXECUTE 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' || p_query INTO plan_result;
    
    end_time := clock_timestamp();
    
    RETURN QUERY
    SELECT 
        plan_result::TEXT as query_plan,
        EXTRACT(EPOCH FROM (end_time - start_time)) as execution_time,
        0::NUMERIC as cost_estimate; -- Placeholder for cost
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- AUTOMATED MAINTENANCE
-- ==============================================

-- Create function for automated maintenance
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS void AS $$
BEGIN
    -- Update table statistics
    ANALYZE;
    
    -- Refresh materialized views
    PERFORM refresh_performance_views();
    
    -- Clean up old logs (keep last 90 days)
    DELETE FROM user_activity_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
    
    DELETE FROM system_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
    
    -- Log maintenance completion
    INSERT INTO system_logs (log_type, message, created_at)
    VALUES ('maintenance', 'Automated maintenance completed', NOW());
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- PERFORMANCE MONITORING VIEWS
-- ==============================================

-- View for slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100 -- Queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- View for index usage statistics
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'LOW_USAGE'
        ELSE 'ACTIVE'
    END as usage_status
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- View for table statistics
CREATE OR REPLACE VIEW table_performance_stats AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- ==============================================
-- SCHEDULED JOBS
-- ==============================================

-- Create extension for pg_cron if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule materialized view refresh (every hour)
SELECT cron.schedule('refresh-performance-views', '0 * * * *', 'SELECT refresh_performance_views();');

-- Schedule maintenance (daily at 2 AM)
SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT perform_maintenance();');

-- Schedule statistics update (every 4 hours)
SELECT cron.schedule('update-statistics', '0 */4 * * *', 'ANALYZE;');

-- ==============================================
-- PERFORMANCE CONFIGURATION
-- ==============================================

-- Update PostgreSQL configuration for better performance
-- Note: These require superuser privileges and server restart

-- Set work memory for better query performance
-- ALTER SYSTEM SET work_mem = '256MB';

-- Set shared buffers for better caching
-- ALTER SYSTEM SET shared_buffers = '1GB';

-- Set effective cache size
-- ALTER SYSTEM SET effective_cache_size = '4GB';

-- Set random page cost for SSD storage
-- ALTER SYSTEM SET random_page_cost = 1.1;

-- Set checkpoint completion target
-- ALTER SYSTEM SET checkpoint_completion_target = 0.9;

-- ==============================================
-- COMPLETION LOG
-- ==============================================

INSERT INTO system_logs (log_type, message, created_at)
VALUES ('migration', 'Phase 15 advanced database optimizations completed', NOW());

-- Log the completion
DO $$
BEGIN
    RAISE NOTICE 'Phase 15 advanced database optimizations migration completed successfully';
    RAISE NOTICE 'Created partitioned tables, advanced indexes, materialized views, and performance functions';
    RAISE NOTICE 'Scheduled automated maintenance and monitoring jobs';
END $$;
