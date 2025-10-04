# Authentication Guide

## Overview

The Diet Game API uses JWT (JSON Web Token) based authentication to secure all protected endpoints. This guide explains how to authenticate with the API and manage user sessions.

## Authentication Flow

### 1. User Registration/Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "johndoe"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

### 2. Using Access Token
Include the access token in the Authorization header for all protected requests:

```http
GET /api/v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Token Refresh
When the access token expires, use the refresh token to get a new one:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Token Management

### Access Token
- **Lifetime**: 1 hour (3600 seconds)
- **Purpose**: Authenticate API requests
- **Storage**: Secure storage recommended (not localStorage for web apps)

### Refresh Token
- **Lifetime**: 7 days
- **Purpose**: Obtain new access tokens
- **Storage**: Secure storage (httpOnly cookies recommended)

### Token Structure
```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "username": "johndoe",
  "iat": 1642248000,
  "exp": 1642251600,
  "type": "access"
}
```

## Security Best Practices

### Client-Side Storage
```javascript
// ❌ Don't store tokens in localStorage
localStorage.setItem('token', accessToken);

// ✅ Use secure storage
// For web apps: httpOnly cookies
// For mobile apps: secure keychain/keystore
```

### Token Refresh Implementation
```javascript
class APIClient {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  async makeRequest(url, options = {}) {
    // Add authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      // If token expired, refresh and retry
      if (response.status === 401) {
        await this.refreshAccessToken();
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(url, { ...options, headers });
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken() {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    const data = await response.json();
    this.accessToken = data.data.accessToken;
  }
}
```

## Error Handling

### Authentication Errors
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or expired token
- `TOKEN_EXPIRED`: Access token has expired
- `INVALID_REFRESH_TOKEN`: Refresh token is invalid
- `ACCOUNT_LOCKED`: Account is temporarily locked

## Multi-Factor Authentication (MFA)

### Enable MFA
```http
POST /api/v1/auth/mfa/enable
Authorization: Bearer <token>
```

### Verify MFA
```http
POST /api/v1/auth/mfa/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}
```

## OAuth Integration

### Google OAuth
```http
POST /api/v1/auth/oauth/google
Content-Type: application/json

{
  "idToken": "google_id_token"
}
```

### Apple OAuth
```http
POST /api/v1/auth/oauth/apple
Content-Type: application/json

{
  "identityToken": "apple_identity_token",
  "authorizationCode": "apple_auth_code"
}
```

## Session Management

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### Revoke All Sessions
```http
POST /api/v1/auth/revoke-all
Authorization: Bearer <token>
```

## Rate Limiting

Authentication endpoints have stricter rate limits:
- **Login attempts**: 5 per minute per IP
- **Registration**: 3 per minute per IP
- **Password reset**: 3 per hour per email

## Troubleshooting

### Common Issues

1. **Token Expired**
   - Solution: Use refresh token to get new access token

2. **Invalid Token Format**
   - Ensure token starts with "Bearer "
   - Check for extra spaces or characters

3. **CORS Issues**
   - Ensure your domain is whitelisted
   - Check preflight request handling

### Debug Mode
Enable debug logging to troubleshoot authentication issues:

```javascript
const api = new DietGameAPI({
  baseUrl: 'https://api.dietgame.com/v1',
  debug: true
});
```

## Migration from Legacy Auth

If migrating from a legacy authentication system:

1. **Backward Compatibility**: Legacy tokens supported for 30 days
2. **Migration Endpoint**: `/api/v1/auth/migrate`
3. **Data Transfer**: User data automatically migrated

```http
POST /api/v1/auth/migrate
Content-Type: application/json

{
  "legacyToken": "old_token_here",
  "newPassword": "new_secure_password"
}
```
