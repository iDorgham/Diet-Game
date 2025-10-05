-- Level 5: Continuous Improvement Database Schema
-- Advanced continuous improvement with federated learning, automated optimization, and predictive analytics

-- =====================================================
-- FEDERATED LEARNING TABLES
-- =====================================================

-- Federated learning models
CREATE TABLE IF NOT EXISTS federated_learning_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL UNIQUE,
    model_type VARCHAR(50) NOT NULL, -- 'recommendation', 'userBehavior', 'performance'
    global_model_data JSONB,
    version INTEGER DEFAULT 1,
    participants_count INTEGER DEFAULT 0,
    last_aggregation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Federated learning participants
CREATE TABLE IF NOT EXISTS federated_learning_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES federated_learning_models(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    local_model_data JSONB,
    local_update JSONB,
    participation_count INTEGER DEFAULT 1,
    last_participation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_id, user_id)
);

-- Federated learning aggregations
CREATE TABLE IF NOT EXISTS federated_learning_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES federated_learning_models(id) ON DELETE CASCADE,
    aggregation_type VARCHAR(50) NOT NULL, -- 'federated_averaging', 'differential_privacy'
    participants_count INTEGER NOT NULL,
    aggregated_update JSONB,
    privacy_budget DECIMAL(10,6),
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- AUTOMATED OPTIMIZATION TABLES
-- =====================================================

-- Optimization strategies
CREATE TABLE IF NOT EXISTS optimization_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_name VARCHAR(100) NOT NULL UNIQUE,
    strategy_type VARCHAR(50) NOT NULL, -- 'performance', 'accuracy', 'userExperience'
    rules JSONB NOT NULL, -- Array of condition-action rules
    is_active BOOLEAN DEFAULT true,
    last_execution TIMESTAMP WITH TIME ZONE,
    execution_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimization executions
CREATE TABLE IF NOT EXISTS optimization_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES optimization_strategies(id) ON DELETE CASCADE,
    execution_type VARCHAR(50) NOT NULL, -- 'automated', 'manual', 'scheduled'
    trigger_condition TEXT,
    action_taken VARCHAR(100) NOT NULL,
    metrics_before JSONB,
    metrics_after JSONB,
    improvement_percentage DECIMAL(5,2),
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'failed', 'partial'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimization history
CREATE TABLE IF NOT EXISTS optimization_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    optimization_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    current_value DECIMAL(10,4),
    target_value DECIMAL(10,4),
    priority VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    result VARCHAR(50) NOT NULL, -- 'executed', 'skipped', 'failed'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- =====================================================
-- PREDICTIVE ANALYTICS TABLES
-- =====================================================

-- Prediction models
CREATE TABLE IF NOT EXISTS prediction_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL UNIQUE,
    model_type VARCHAR(50) NOT NULL, -- 'timeSeries', 'behavioral', 'load'
    algorithm VARCHAR(100) NOT NULL, -- 'LSTM', 'ARIMA', 'Prophet', 'RandomForest'
    horizon_hours INTEGER NOT NULL,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.85,
    is_active BOOLEAN DEFAULT true,
    last_training TIMESTAMP WITH TIME ZONE,
    last_prediction TIMESTAMP WITH TIME ZONE,
    average_confidence DECIMAL(3,2) DEFAULT 0.0,
    accuracy_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES prediction_models(id) ON DELETE CASCADE,
    prediction_value DECIMAL(10,4) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    prediction_horizon INTEGER NOT NULL,
    actual_value DECIMAL(10,4), -- Filled in when actual data becomes available
    accuracy DECIMAL(3,2), -- Calculated when actual_value is available
    trend VARCHAR(20) NOT NULL, -- 'up', 'down', 'stable'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    recommendations JSONB, -- Array of recommendation strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Historical data for predictions
CREATE TABLE IF NOT EXISTS prediction_historical_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES prediction_models(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    is_predicted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ADAPTIVE UI TABLES
-- =====================================================

-- User UI adaptations
CREATE TABLE IF NOT EXISTS user_ui_adaptations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    adaptation_type VARCHAR(50) NOT NULL, -- 'layout', 'features', 'interactions', 'theme', 'density', 'animations'
    adaptation_value VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    learning_source VARCHAR(50) NOT NULL, -- 'behavior_analysis', 'user_feedback', 'a_b_test'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, adaptation_type)
);

-- User behavior patterns
CREATE TABLE IF NOT EXISTS user_behavior_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    pattern_type VARCHAR(50) NOT NULL, -- 'click_patterns', 'time_spent', 'feature_usage', 'error_rates'
    pattern_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, pattern_type)
);

-- UI adaptation learning
CREATE TABLE IF NOT EXISTS ui_adaptation_learning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'click', 'time_spent', 'feature_usage', 'error', 'preference'
    action_data JSONB NOT NULL,
    adaptation_triggered JSONB, -- The adaptation that was triggered by this action
    learning_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANOMALY DETECTION TABLES
-- =====================================================

-- Anomaly detection models
CREATE TABLE IF NOT EXISTS anomaly_detection_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL UNIQUE,
    model_type VARCHAR(50) NOT NULL, -- 'performance', 'userBehavior', 'systemHealth'
    algorithm VARCHAR(100) NOT NULL, -- 'IsolationForest', 'OneClassSVM', 'LocalOutlierFactor'
    sensitivity DECIMAL(3,2) DEFAULT 0.95,
    window_size INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    last_training TIMESTAMP WITH TIME ZONE,
    last_detection TIMESTAMP WITH TIME ZONE,
    detection_count INTEGER DEFAULT 0,
    false_positive_rate DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly detections
CREATE TABLE IF NOT EXISTS anomaly_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES anomaly_detection_models(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    detected_value DECIMAL(10,4) NOT NULL,
    baseline_mean DECIMAL(10,4) NOT NULL,
    baseline_std DECIMAL(10,4) NOT NULL,
    threshold DECIMAL(10,4) NOT NULL,
    deviation DECIMAL(10,4) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    is_anomaly BOOLEAN NOT NULL,
    auto_remediation_attempted BOOLEAN DEFAULT false,
    auto_remediation_successful BOOLEAN DEFAULT false,
    remediation_action VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Auto-remediation rules
CREATE TABLE IF NOT EXISTS auto_remediation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    metric_name VARCHAR(100) NOT NULL,
    severity_threshold VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    remediation_action VARCHAR(100) NOT NULL,
    action_parameters JSONB,
    is_active BOOLEAN DEFAULT true,
    success_rate DECIMAL(3,2) DEFAULT 0.0,
    execution_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CONTINUOUS IMPROVEMENT FEEDBACK
-- =====================================================

-- Continuous improvement feedback
CREATE TABLE IF NOT EXISTS continuous_improvement_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    feedback_type VARCHAR(50) NOT NULL, -- 'performance', 'accuracy', 'userExperience', 'anomaly'
    metric_name VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    context_data JSONB, -- Additional context about the feedback
    is_processed BOOLEAN DEFAULT false,
    processing_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Federated learning indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_federated_models_name ON federated_learning_models(model_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_federated_participants_model_user ON federated_learning_participants(model_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_federated_aggregations_model_created ON federated_learning_aggregations(model_id, created_at DESC);

-- Optimization indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_optimization_strategies_name ON optimization_strategies(strategy_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_optimization_executions_strategy_created ON optimization_executions(strategy_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_optimization_history_type_timestamp ON optimization_history(optimization_type, timestamp DESC);

-- Prediction indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prediction_models_name ON prediction_models(model_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_predictions_model_created ON predictions(model_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prediction_historical_model_timestamp ON prediction_historical_data(model_id, timestamp DESC);

-- Adaptive UI indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_ui_adaptations_user_type ON user_ui_adaptations(user_id, adaptation_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_behavior_patterns_user_type ON user_behavior_patterns(user_id, pattern_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ui_adaptation_learning_user_created ON ui_adaptation_learning(user_id, created_at DESC);

-- Anomaly detection indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_anomaly_models_name ON anomaly_detection_models(model_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_anomaly_detections_model_created ON anomaly_detections(model_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_anomaly_detections_metric_severity ON anomaly_detections(metric_name, severity);

-- Feedback indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_continuous_improvement_feedback_user_created ON continuous_improvement_feedback(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_continuous_improvement_feedback_type_processed ON continuous_improvement_feedback(feedback_type, is_processed);

-- =====================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- =====================================================

-- Continuous improvement metrics summary
CREATE MATERIALIZED VIEW IF NOT EXISTS continuous_improvement_metrics_summary AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_improvements,
    COUNT(CASE WHEN result = 'executed' THEN 1 END) as successful_improvements,
    COUNT(CASE WHEN result = 'failed' THEN 1 END) as failed_improvements,
    AVG(CASE WHEN current_value IS NOT NULL AND target_value IS NOT NULL 
        THEN ((target_value - current_value) / current_value * 100) END) as avg_improvement_percentage
FROM optimization_history
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Federated learning performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS federated_learning_performance_summary AS
SELECT 
    flm.model_name,
    flm.participants_count,
    flm.last_aggregation,
    COUNT(fla.id) as total_aggregations,
    AVG(fla.participants_count) as avg_participants_per_aggregation,
    AVG((fla.performance_metrics->>'accuracy')::DECIMAL) as avg_accuracy
FROM federated_learning_models flm
LEFT JOIN federated_learning_aggregations fla ON flm.id = fla.model_id
WHERE fla.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY flm.id, flm.model_name, flm.participants_count, flm.last_aggregation;

-- Prediction accuracy summary
CREATE MATERIALIZED VIEW IF NOT EXISTS prediction_accuracy_summary AS
SELECT 
    pm.model_name,
    pm.model_type,
    COUNT(p.id) as total_predictions,
    COUNT(CASE WHEN p.actual_value IS NOT NULL THEN 1 END) as predictions_with_actuals,
    AVG(p.confidence) as avg_confidence,
    AVG(p.accuracy) as avg_accuracy,
    AVG(CASE WHEN p.actual_value IS NOT NULL 
        THEN ABS(p.prediction_value - p.actual_value) / p.actual_value * 100 END) as avg_error_percentage
FROM prediction_models pm
LEFT JOIN predictions p ON pm.id = p.model_id
WHERE p.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY pm.id, pm.model_name, pm.model_type;

-- Anomaly detection summary
CREATE MATERIALIZED VIEW IF NOT EXISTS anomaly_detection_summary AS
SELECT 
    adm.model_name,
    adm.model_type,
    COUNT(ad.id) as total_detections,
    COUNT(CASE WHEN ad.is_anomaly = true THEN 1 END) as anomalies_detected,
    COUNT(CASE WHEN ad.auto_remediation_attempted = true THEN 1 END) as auto_remediations_attempted,
    COUNT(CASE WHEN ad.auto_remediation_successful = true THEN 1 END) as successful_remediations,
    AVG(ad.deviation) as avg_deviation
FROM anomaly_detection_models adm
LEFT JOIN anomaly_detections ad ON adm.id = ad.model_id
WHERE ad.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY adm.id, adm.model_name, adm.model_type;

-- =====================================================
-- FUNCTIONS FOR CONTINUOUS IMPROVEMENT
-- =====================================================

-- Function to update optimization strategy success rate
CREATE OR REPLACE FUNCTION update_optimization_strategy_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE optimization_strategies 
    SET 
        success_rate = (
            SELECT 
                CASE 
                    WHEN COUNT(*) = 0 THEN 0.0
                    ELSE (COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100
                END
            FROM optimization_executions 
            WHERE strategy_id = NEW.strategy_id
        ),
        execution_count = (
            SELECT COUNT(*) 
            FROM optimization_executions 
            WHERE strategy_id = NEW.strategy_id
        ),
        last_execution = NEW.created_at
    WHERE id = NEW.strategy_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for optimization strategy updates
CREATE TRIGGER trigger_update_optimization_strategy_success_rate
    AFTER INSERT ON optimization_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_optimization_strategy_success_rate();

-- Function to calculate prediction accuracy
CREATE OR REPLACE FUNCTION calculate_prediction_accuracy()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.actual_value IS NOT NULL AND NEW.prediction_value IS NOT NULL THEN
        NEW.accuracy = 1.0 - (ABS(NEW.prediction_value - NEW.actual_value) / NEW.actual_value);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for prediction accuracy calculation
CREATE TRIGGER trigger_calculate_prediction_accuracy
    BEFORE UPDATE ON predictions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_prediction_accuracy();

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_continuous_improvement_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW continuous_improvement_metrics_summary;
    REFRESH MATERIALIZED VIEW federated_learning_performance_summary;
    REFRESH MATERIALIZED VIEW prediction_accuracy_summary;
    REFRESH MATERIALIZED VIEW anomaly_detection_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA FOR CONTINUOUS IMPROVEMENT
-- =====================================================

-- Insert default federated learning models
INSERT INTO federated_learning_models (model_name, model_type, version) VALUES
('recommendation', 'recommendation', 1),
('userBehavior', 'userBehavior', 1),
('performance', 'performance', 1)
ON CONFLICT (model_name) DO NOTHING;

-- Insert default optimization strategies
INSERT INTO optimization_strategies (strategy_name, strategy_type, rules) VALUES
('performance_optimization', 'performance', '[
    {"condition": "responseTime > 200", "action": "optimizeQueries"},
    {"condition": "cacheHitRate < 0.8", "action": "adjustCacheTTL"},
    {"condition": "errorRate > 0.05", "action": "increaseRetries"},
    {"condition": "memoryUsage > 0.8", "action": "optimizeMemory"}
]'),
('accuracy_optimization', 'accuracy', '[
    {"condition": "accuracy < 0.85", "action": "retrainModels"},
    {"condition": "confidence < 0.8", "action": "adjustWeights"},
    {"condition": "diversity < 0.7", "action": "increaseDiversity"}
]'),
('user_experience_optimization', 'userExperience', '[
    {"condition": "userSatisfaction < 0.8", "action": "improveUX"},
    {"condition": "engagementRate < 0.6", "action": "increaseEngagement"},
    {"condition": "retentionRate < 0.7", "action": "improveRetention"}
]')
ON CONFLICT (strategy_name) DO NOTHING;

-- Insert default prediction models
INSERT INTO prediction_models (model_name, model_type, algorithm, horizon_hours, confidence_threshold) VALUES
('performance', 'timeSeries', 'LSTM', 24, 0.85),
('userBehavior', 'behavioral', 'RandomForest', 24, 0.80),
('systemLoad', 'load', 'Prophet', 24, 0.90)
ON CONFLICT (model_name) DO NOTHING;

-- Insert default anomaly detection models
INSERT INTO anomaly_detection_models (model_name, model_type, algorithm, sensitivity) VALUES
('performance', 'performance', 'IsolationForest', 0.95),
('userBehavior', 'userBehavior', 'OneClassSVM', 0.90),
('systemHealth', 'systemHealth', 'LocalOutlierFactor', 0.95)
ON CONFLICT (model_name) DO NOTHING;

-- Insert default auto-remediation rules
INSERT INTO auto_remediation_rules (rule_name, metric_name, severity_threshold, remediation_action) VALUES
('scale_up_resources', 'responseTime', 'high', 'scaleUpResources'),
('activate_circuit_breaker', 'errorRate', 'high', 'activateCircuitBreaker'),
('trigger_garbage_collection', 'memoryUsage', 'high', 'triggerGarbageCollection'),
('retrain_models', 'accuracy', 'medium', 'retrainModels'),
('adjust_algorithm_weights', 'confidence', 'medium', 'adjustWeights')
ON CONFLICT (rule_name) DO NOTHING;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE federated_learning_models IS 'Stores federated learning models for collaborative AI training';
COMMENT ON TABLE optimization_strategies IS 'Defines automated optimization strategies and rules';
COMMENT ON TABLE prediction_models IS 'Stores predictive analytics models and their configurations';
COMMENT ON TABLE user_ui_adaptations IS 'Tracks user-specific UI adaptations based on behavior analysis';
COMMENT ON TABLE anomaly_detection_models IS 'Stores anomaly detection models for system monitoring';
COMMENT ON TABLE continuous_improvement_feedback IS 'Collects user feedback for continuous improvement learning';

COMMENT ON FUNCTION update_optimization_strategy_success_rate() IS 'Updates optimization strategy success rates based on execution results';
COMMENT ON FUNCTION calculate_prediction_accuracy() IS 'Calculates prediction accuracy when actual values become available';
COMMENT ON FUNCTION refresh_continuous_improvement_views() IS 'Refreshes all continuous improvement materialized views';

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant permissions to application user (adjust username as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO diet_game_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO diet_game_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO diet_game_app;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
INSERT INTO migration_log (migration_name, executed_at, status) 
VALUES ('009_level5_continuous_improvement', CURRENT_TIMESTAMP, 'completed')
ON CONFLICT (migration_name) DO UPDATE SET 
    executed_at = CURRENT_TIMESTAMP, 
    status = 'completed';
