-- Security Features Database Schema
-- Comprehensive security implementation for Diet Game API
-- Migration: 006_security_features_schema.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USER SESSIONS AND TOKEN MANAGEMENT
-- ============================================================================

-- User sessions table (skip if already exists from initial schema)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    token_version BIGINT NOT NULL DEFAULT 1,
    access_token_hash VARCHAR(255),
    refresh_token_hash VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    location_country VARCHAR(2),
    location_region VARCHAR(100),
    location_city VARCHAR(100),
    device_type VARCHAR(50),
    device_os VARCHAR(100),
    device_browser VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing user_sessions table if they don't exist
DO $$ BEGIN
    -- Add session_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'session_id') THEN
        ALTER TABLE user_sessions ADD COLUMN session_id VARCHAR(255);
        UPDATE user_sessions SET session_id = id::text WHERE session_id IS NULL;
        ALTER TABLE user_sessions ALTER COLUMN session_id SET NOT NULL;
        ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_session_id_unique UNIQUE (session_id);
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'token_version') THEN
        ALTER TABLE user_sessions ADD COLUMN token_version BIGINT DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'access_token_hash') THEN
        ALTER TABLE user_sessions ADD COLUMN access_token_hash VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'refresh_token_hash') THEN
        ALTER TABLE user_sessions ADD COLUMN refresh_token_hash VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'ip_address') THEN
        ALTER TABLE user_sessions ADD COLUMN ip_address INET;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_agent') THEN
        ALTER TABLE user_sessions ADD COLUMN user_agent TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'location_country') THEN
        ALTER TABLE user_sessions ADD COLUMN location_country VARCHAR(2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'location_region') THEN
        ALTER TABLE user_sessions ADD COLUMN location_region VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'location_city') THEN
        ALTER TABLE user_sessions ADD COLUMN location_city VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'device_type') THEN
        ALTER TABLE user_sessions ADD COLUMN device_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'device_os') THEN
        ALTER TABLE user_sessions ADD COLUMN device_os VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'device_browser') THEN
        ALTER TABLE user_sessions ADD COLUMN device_browser VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'last_activity') THEN
        ALTER TABLE user_sessions ADD COLUMN last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'updated_at') THEN
        ALTER TABLE user_sessions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Token blacklist table
CREATE TABLE IF NOT EXISTS token_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    token_type VARCHAR(20) NOT NULL, -- 'access' or 'refresh'
    reason VARCHAR(100), -- 'logout', 'revoke', 'expired', 'security'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECURITY AUDIT LOGGING
-- ============================================================================

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    request_id VARCHAR(100),
    endpoint VARCHAR(500),
    method VARCHAR(10),
    status_code INTEGER,
    message TEXT NOT NULL,
    details JSONB,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    location_country VARCHAR(2),
    location_region VARCHAR(100),
    location_city VARCHAR(100),
    location_coordinates POINT,
    device_type VARCHAR(50),
    device_os VARCHAR(100),
    device_browser VARCHAR(100),
    device_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security event types enum
DO $$ BEGIN
    CREATE TYPE security_event_type AS ENUM (
    'authentication_success',
    'authentication_failure',
    'authorization_success',
    'authorization_failure',
    'token_generated',
    'token_revoked',
    'token_expired',
    'password_changed',
    'password_reset_requested',
    'password_reset_completed',
    'account_locked',
    'account_unlocked',
    'suspicious_activity',
    'data_access',
    'data_modification',
    'data_deletion',
    'file_upload',
    'file_download',
    'api_access',
    'rate_limit_exceeded',
    'sql_injection_attempt',
    'xss_attempt',
    'csrf_attempt',
    'brute_force_attempt',
    'privilege_escalation_attempt',
    'data_breach_attempt',
    'malicious_file_upload',
    'unusual_location_access',
    'unusual_time_access',
    'consent_granted',
    'consent_withdrawn',
    'data_export',
    'data_erasure',
    'system_error',
    'configuration_change'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- GDPR/CCPA COMPLIANCE
-- ============================================================================

-- Consent records table
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,
    granted BOOLEAN NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    purpose TEXT NOT NULL,
    data_categories TEXT[] NOT NULL,
    retention_period_days INTEGER NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data processing records table
CREATE TABLE IF NOT EXISTS data_processing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_category VARCHAR(50) NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    data_controller VARCHAR(255) NOT NULL,
    data_processor VARCHAR(255),
    retention_period_days INTEGER NOT NULL,
    is_anonymized BOOLEAN DEFAULT false,
    is_encrypted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data subject requests table
CREATE TABLE IF NOT EXISTS data_subject_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'restriction', 'portability', 'objection', 'withdraw_consent')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    description TEXT,
    requested_data_types TEXT[],
    verification_method VARCHAR(50),
    verification_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PASSWORD SECURITY
-- ============================================================================

-- Password history table
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TWO-FACTOR AUTHENTICATION
-- ============================================================================

-- Two-factor authentication settings table
CREATE TABLE IF NOT EXISTS user_2fa_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    secret_key_encrypted TEXT NOT NULL,
    backup_codes_encrypted TEXT[],
    is_enabled BOOLEAN DEFAULT false,
    enabled_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Two-factor authentication attempts table
CREATE TABLE IF NOT EXISTS user_2fa_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(10) NOT NULL,
    is_successful BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECURITY SETTINGS AND CONFIGURATION
-- ============================================================================

-- User security settings table
CREATE TABLE IF NOT EXISTS user_security_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    login_alerts BOOLEAN DEFAULT true,
    data_sharing BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    analytics_tracking BOOLEAN DEFAULT true,
    privacy_level VARCHAR(20) DEFAULT 'standard' CHECK (privacy_level IN ('minimal', 'standard', 'enhanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security policies table
CREATE TABLE IF NOT EXISTS security_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_name VARCHAR(100) UNIQUE NOT NULL,
    policy_type VARCHAR(50) NOT NULL,
    policy_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENCRYPTED DATA STORAGE
-- ============================================================================

-- Encrypted data table for sensitive information
CREATE TABLE IF NOT EXISTS encrypted_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL, -- 'pii', 'health', 'financial', 'generic'
    data_key VARCHAR(100) NOT NULL, -- field name or identifier
    encrypted_value TEXT NOT NULL,
    encryption_method VARCHAR(50) NOT NULL DEFAULT 'aes-256-gcm',
    key_version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, data_type, data_key)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Token blacklist indexes
CREATE INDEX IF NOT EXISTS idx_token_blacklist_token_hash ON token_blacklist(token_hash);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Security events indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score);

-- Consent records indexes
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_created_at ON consent_records(created_at);

-- Data processing records indexes
CREATE INDEX IF NOT EXISTS idx_data_processing_user_id ON data_processing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_data_processing_category ON data_processing_records(data_category);
CREATE INDEX IF NOT EXISTS idx_data_processing_created_at ON data_processing_records(created_at);

-- Data subject requests indexes
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_user_id ON data_subject_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_type ON data_subject_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON data_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_created_at ON data_subject_requests(created_at);

-- Password security indexes
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON password_history(created_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- 2FA indexes
CREATE INDEX IF NOT EXISTS idx_user_2fa_settings_user_id ON user_2fa_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_attempts_user_id ON user_2fa_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_attempts_created_at ON user_2fa_attempts(created_at);

-- Encrypted data indexes
CREATE INDEX IF NOT EXISTS idx_encrypted_data_user_id ON encrypted_data(user_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_data_type ON encrypted_data(data_type);
CREATE INDEX IF NOT EXISTS idx_encrypted_data_key ON encrypted_data(data_key);

-- ============================================================================
-- ROLES AND PERMISSIONS
-- ============================================================================

-- Create roles if they don't exist
DO $$ BEGIN
    CREATE ROLE authenticated_users;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create helper function for current user ID
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
BEGIN
    -- This is a simplified version - in production you'd get this from JWT or session
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all security tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user sessions
CREATE POLICY user_sessions_policy ON user_sessions
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for token blacklist
CREATE POLICY token_blacklist_policy ON token_blacklist
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for security events (users can only see their own events)
CREATE POLICY security_events_user_policy ON security_events
    FOR SELECT TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for consent records
CREATE POLICY consent_records_policy ON consent_records
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for data processing records
CREATE POLICY data_processing_policy ON data_processing_records
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for data subject requests
CREATE POLICY data_subject_requests_policy ON data_subject_requests
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for password history
CREATE POLICY password_history_policy ON password_history
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for password reset tokens
CREATE POLICY password_reset_tokens_policy ON password_reset_tokens
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for 2FA settings
CREATE POLICY user_2fa_settings_policy ON user_2fa_settings
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for 2FA attempts
CREATE POLICY user_2fa_attempts_policy ON user_2fa_attempts
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for security settings
CREATE POLICY user_security_settings_policy ON user_security_settings
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- RLS Policies for encrypted data
CREATE POLICY encrypted_data_policy ON encrypted_data
    FOR ALL TO authenticated_users
    USING (user_id = current_user_id());

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_data_subject_requests_updated_at BEFORE UPDATE ON data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_2fa_settings_updated_at BEFORE UPDATE ON user_2fa_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_security_settings_updated_at BEFORE UPDATE ON user_security_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_encrypted_data_updated_at BEFORE UPDATE ON encrypted_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_security_policies_updated_at BEFORE UPDATE ON security_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM token_blacklist WHERE expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old security events
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_events 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND severity IN ('low', 'medium');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user risk score
CREATE OR REPLACE FUNCTION calculate_user_risk_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    event_count INTEGER;
BEGIN
    -- Calculate risk based on recent security events
    SELECT COUNT(*) INTO event_count
    FROM security_events
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days';
    
    -- Base risk score from event count
    risk_score := LEAST(event_count * 2, 50);
    
    -- Add risk for high severity events
    SELECT COUNT(*) INTO event_count
    FROM security_events
    WHERE user_id = p_user_id
    AND severity IN ('high', 'critical')
    AND created_at > NOW() - INTERVAL '7 days';
    
    risk_score := risk_score + (event_count * 10);
    
    -- Cap at 100
    RETURN LEAST(risk_score, 100);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default security policies
INSERT INTO security_policies (policy_name, policy_type, policy_data) VALUES
('password_policy', 'authentication', '{
    "minLength": 8,
    "maxLength": 128,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSymbols": true,
    "forbiddenPasswords": ["password", "123456", "qwerty", "abc123"]
}'),
('rate_limit_policy', 'api', '{
    "general": {"windowMs": 900000, "maxRequests": 100},
    "authentication": {"windowMs": 900000, "maxRequests": 5},
    "ai": {"windowMs": 60000, "maxRequests": 10}
}'),
('data_retention_policy', 'privacy', '{
    "userData": 2555,
    "auditLogs": 90,
    "sessionData": 30
}')
ON CONFLICT (policy_name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_sessions IS 'Active user sessions with token management';
COMMENT ON TABLE token_blacklist IS 'Revoked tokens for security';
COMMENT ON TABLE security_events IS 'Comprehensive security audit log';
COMMENT ON TABLE consent_records IS 'GDPR consent management';
COMMENT ON TABLE data_processing_records IS 'Data processing activity log';
COMMENT ON TABLE data_subject_requests IS 'GDPR data subject requests';
COMMENT ON TABLE password_history IS 'Password history for reuse prevention';
COMMENT ON TABLE password_reset_tokens IS 'Secure password reset tokens';
COMMENT ON TABLE user_2fa_settings IS 'Two-factor authentication settings';
COMMENT ON TABLE user_2fa_attempts IS '2FA verification attempts';
COMMENT ON TABLE user_security_settings IS 'User security preferences';
COMMENT ON TABLE security_policies IS 'System security policies';
COMMENT ON TABLE encrypted_data IS 'Encrypted sensitive data storage';
