# Security Setup Guide

## Quick Start

Follow these steps to set up the comprehensive security implementation for your Diet Game API:

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Security Environment Variables

```bash
npm run setup:security
```

This will generate secure random keys for:
- JWT secrets
- Encryption keys
- Session secrets
- Rate limiting configuration

### 3. Run Security Database Migration

```bash
npm run migrate:security
```

This will create all security-related database tables and indexes.

### 4. Run All Migrations (Optional)

```bash
npm run migrate
```

This will run all pending migrations including the security schema.

### 5. Start the Server

```bash
npm run dev
```

## Security Features Overview

### 🔐 Authentication & Authorization
- **JWT with Role-Based Access Control**: 6 user roles with granular permissions
- **Token Rotation**: Automatic refresh token rotation for enhanced security
- **Session Management**: Active session tracking with version control
- **Multi-Device Support**: Track and manage multiple device sessions

### 🛡️ Data Protection
- **Encryption at Rest**: AES-256-GCM encryption for sensitive data
- **Encryption in Transit**: HTTPS/TLS with security headers
- **Data Masking**: Automatic PII masking in logs and responses
- **Field-Level Encryption**: Separate encryption for PII, health, and financial data

### 📋 GDPR/CCPA Compliance
- **Consent Management**: Complete consent tracking and withdrawal
- **Data Subject Rights**: Access, rectification, erasure, portability
- **Data Processing Records**: Complete audit trail of data processing
- **Right to be Forgotten**: Automated data anonymization

### 🚦 Rate Limiting & Validation
- **Multi-Tier Rate Limiting**: Different limits for different endpoint types
- **Input Sanitization**: XSS and SQL injection prevention
- **File Upload Security**: Malware scanning and type validation
- **Request Size Limits**: Protection against large payload attacks

### 📊 Security Monitoring
- **Comprehensive Audit Logging**: All security events tracked
- **Risk Scoring**: Real-time user risk assessment
- **Suspicious Activity Detection**: Automated threat detection
- **Real-time Alerts**: Immediate notification of security events

## API Endpoints

### Authentication
```
POST /api/v1/auth/login          # User login
POST /api/v1/auth/register       # User registration
POST /api/v1/auth/refresh        # Token refresh
POST /api/v1/auth/logout         # User logout
```

### Security Management
```
GET  /api/v1/security/profile           # Security profile
GET  /api/v1/security/sessions          # Active sessions
DELETE /api/v1/security/sessions/:id    # Revoke session
POST /api/v1/security/password/change   # Change password
POST /api/v1/security/2fa/enable        # Enable 2FA
```

### GDPR Compliance
```
POST /api/v1/security/consent           # Record consent
GET  /api/v1/security/consent           # Get consents
POST /api/v1/security/consent/withdraw  # Withdraw consent
GET  /api/v1/security/data-portability  # Export data
POST /api/v1/security/data-erasure      # Delete data
```

### Admin Security
```
GET  /api/v1/security/audit/events      # Security events
GET  /api/v1/security/audit/risk-score  # User risk score
POST /api/v1/security/admin/users/:id/lock    # Lock user
POST /api/v1/security/admin/users/:id/unlock  # Unlock user
```

## Database Schema

The security implementation creates 13 new tables:

### Core Security Tables
- `user_sessions` - Active user sessions
- `token_blacklist` - Revoked tokens
- `security_events` - Security audit log
- `encrypted_data` - Encrypted sensitive data

### GDPR Compliance Tables
- `consent_records` - User consent tracking
- `data_processing_records` - Data processing activity
- `data_subject_requests` - GDPR requests

### Authentication Tables
- `password_history` - Password history
- `password_reset_tokens` - Reset tokens
- `user_2fa_settings` - 2FA configuration
- `user_2fa_attempts` - 2FA attempts

### Configuration Tables
- `user_security_settings` - User preferences
- `security_policies` - System policies

## Configuration

### Environment Variables

The security setup script generates these variables:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Keys
ENCRYPTION_KEY=your-32-character-encryption-key
PII_ENCRYPTION_KEY=your-pii-encryption-key
HEALTH_ENCRYPTION_KEY=your-health-encryption-key
FINANCIAL_ENCRYPTION_KEY=your-financial-encryption-key

# Session Configuration
SESSION_SECRET=your-session-secret

# Security Settings
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5
RATE_LIMIT_AI_MAX_REQUESTS=10
```

### Security Policies

Default security policies are created:

- **Password Policy**: 8+ characters, complexity requirements
- **Rate Limit Policy**: Tiered rate limiting by endpoint
- **Data Retention Policy**: 7-year retention for user data

## Testing Security Features

### 1. Test Authentication
```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","username":"testuser","displayName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

### 2. Test Rate Limiting
```bash
# Make multiple requests to test rate limiting
for i in {1..10}; do
  curl -X GET http://localhost:3000/api/v1/health
done
```

### 3. Test GDPR Endpoints
```bash
# Get user consents (requires authentication)
curl -X GET http://localhost:3000/api/v1/security/consent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Request data portability
curl -X GET http://localhost:3000/api/v1/security/data-portability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Monitoring and Alerts

### Security Events
All security events are logged with severity levels:
- **Low**: Normal operations
- **Medium**: Failed authentications, rate limits
- **High**: Suspicious activity
- **Critical**: Security breaches

### Risk Scoring
Users are assigned risk scores based on:
- Recent security events
- Failed login attempts
- Suspicious activity patterns
- Unusual access patterns

### Real-time Monitoring
- Security events are logged in real-time
- High-risk activities trigger immediate alerts
- Admin dashboard shows security status

## Troubleshooting

### Common Issues

1. **Migration Fails**
   ```bash
   # Check database connection
   npm run test:database
   
   # Run specific migration
   npm run migrate:security
   ```

2. **JWT Token Issues**
   ```bash
   # Regenerate JWT secrets
   npm run setup:security
   ```

3. **Rate Limiting Too Strict**
   ```bash
   # Adjust rate limits in .env
   RATE_LIMIT_MAX_REQUESTS=200
   ```

### Logs and Debugging

Security events are logged with detailed context:
- User ID and session information
- IP address and user agent
- Request details and response codes
- Risk scores and severity levels

## Production Deployment

### Security Checklist

- [ ] Generate new security keys for production
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable database encryption
- [ ] Configure backup and recovery
- [ ] Set up log aggregation
- [ ] Enable security scanning

### Performance Considerations

- Security middleware adds minimal overhead
- Database indexes optimize security queries
- Caching reduces repeated security checks
- Rate limiting prevents abuse

## Support

For security questions or issues:
- Check the logs for detailed error information
- Review the security implementation guide
- Contact the security team at security@dietgame.com

## Updates and Maintenance

### Regular Tasks
- Review security logs weekly
- Update security policies quarterly
- Rotate encryption keys annually
- Conduct security audits bi-annually

### Security Updates
- Monitor for security vulnerabilities
- Update dependencies regularly
- Apply security patches promptly
- Test security features after updates
