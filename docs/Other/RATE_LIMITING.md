# Rate Limiting Guide

## Overview

The Diet Game API implements rate limiting to ensure fair usage and protect against abuse. This guide explains the rate limiting policies, how to handle rate limit responses, and best practices for API consumption.

## Rate Limit Policies

### Endpoint Categories

| Category | Limit | Window | Description |
|----------|-------|--------|-------------|
| Authentication | 5 requests | 1 minute | Login, registration, password reset |
| General API | 100 requests | 1 hour | Most API endpoints |
| Search | 50 requests | 1 hour | Food search, user search |
| File Upload | 10 requests | 1 hour | Image uploads, document uploads |
| AI Coach | 20 requests | 1 hour | AI recommendations and chat |
| Social | 200 requests | 1 hour | Posts, comments, likes |

### User-Based Limits

| User Type | General API | Search | AI Coach |
|-----------|-------------|--------|----------|
| Free | 100/hour | 50/hour | 20/hour |
| Premium | 500/hour | 200/hour | 100/hour |
| Enterprise | 2000/hour | 1000/hour | 500/hour |

## Rate Limit Headers

Every API response includes rate limit information in the headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
X-RateLimit-Retry-After: 60
```

### Header Descriptions

- **X-RateLimit-Limit**: Maximum requests allowed in the current window
- **X-RateLimit-Remaining**: Number of requests remaining in the current window
- **X-RateLimit-Reset**: Unix timestamp when the rate limit window resets
- **X-RateLimit-Retry-After**: Seconds to wait before retrying (only present when rate limited)

## Rate Limit Response

When rate limited, the API returns a 429 status code:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60,
    "limit": 100,
    "remaining": 0,
    "resetTime": "2024-01-15T11:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

## Handling Rate Limits

### JavaScript Implementation

```javascript
class APIClient {
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, options);
      
      // Check if rate limited
      if (response.status === 429) {
        const data = await response.json();
        const retryAfter = data.error.retryAfter || 60;
        
        console.warn(`Rate limited. Retrying after ${retryAfter} seconds`);
        
        // Wait and retry
        await this.sleep(retryAfter * 1000);
        return this.makeRequest(url, options);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Python Implementation

```python
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class APIClient:
    def __init__(self):
        self.session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

    def make_request(self, url, **kwargs):
        response = self.session.get(url, **kwargs)
        
        if response.status_code == 429:
            retry_after = int(response.headers.get('X-RateLimit-Retry-After', 60))
            print(f"Rate limited. Waiting {retry_after} seconds...")
            time.sleep(retry_after)
            return self.make_request(url, **kwargs)
        
        return response
```

## Best Practices

### 1. Monitor Rate Limit Headers

```javascript
function handleResponse(response) {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  console.log(`Rate limit: ${remaining}/${limit}, resets at ${new Date(reset * 1000)}`);
  
  // Implement backoff if approaching limit
  if (remaining < 10) {
    console.warn('Approaching rate limit, consider slowing down requests');
  }
}
```

### 2. Implement Exponential Backoff

```javascript
class RateLimitedClient {
  constructor() {
    this.baseDelay = 1000; // 1 second
    this.maxDelay = 30000; // 30 seconds
  }

  async makeRequest(url, options = {}, attempt = 1) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt - 1),
          this.maxDelay
        );
        
        console.log(`Rate limited. Waiting ${delay}ms before retry ${attempt}`);
        await this.sleep(delay);
        
        return this.makeRequest(url, options, attempt + 1);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }
}
```

### 3. Batch Requests When Possible

```javascript
// ❌ Multiple individual requests
const user1 = await api.getUser('user1');
const user2 = await api.getUser('user2');
const user3 = await api.getUser('user3');

// ✅ Batch request
const users = await api.getUsers(['user1', 'user2', 'user3']);
```

### 4. Cache Responses

```javascript
class CachedAPIClient {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async makeRequest(url, options = {}) {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.response;
    }
    
    const response = await fetch(url, options);
    
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
    
    return response;
  }
}
```

## Rate Limit Exemptions

### Premium Users
Premium users have higher rate limits and priority access:

```javascript
// Check user tier
const user = await api.getUserProfile();
if (user.tier === 'premium') {
  // Higher rate limits apply
  console.log('Premium user - enhanced rate limits');
}
```

### Enterprise Customers
Enterprise customers can request custom rate limits:

```http
POST /api/v1/enterprise/rate-limits
Authorization: Bearer <enterprise-token>
Content-Type: application/json

{
  "requestedLimits": {
    "general": 5000,
    "search": 2000,
    "aiCoach": 1000
  },
  "justification": "High-volume integration requirements"
}
```

## Monitoring and Analytics

### Rate Limit Usage Dashboard
Access your rate limit usage through the developer dashboard:

```http
GET /api/v1/analytics/rate-limits
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentUsage": {
      "general": 45,
      "search": 12,
      "aiCoach": 8
    },
    "limits": {
      "general": 100,
      "search": 50,
      "aiCoach": 20
    },
    "resetTimes": {
      "general": "2024-01-15T11:00:00Z",
      "search": "2024-01-15T11:00:00Z",
      "aiCoach": "2024-01-15T11:00:00Z"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Unexpected Rate Limiting**
   - Check if you're making requests too frequently
   - Verify your user tier and associated limits
   - Review your request patterns

2. **Rate Limit Not Resetting**
   - Ensure you're using the correct timezone
   - Check if you're hitting multiple rate limit windows
   - Verify your API key is valid

3. **Inconsistent Limits**
   - Different endpoints have different limits
   - User tier affects rate limits
   - Some endpoints have burst allowances

### Debug Mode
Enable debug logging to monitor rate limit behavior:

```javascript
const api = new DietGameAPI({
  baseUrl: 'https://api.dietgame.com/v1',
  debug: true,
  onRateLimit: (info) => {
    console.log('Rate limit hit:', info);
  }
});
```

## Contact Support

If you need higher rate limits or have questions about rate limiting:

- **Email**: api-support@dietgame.com
- **Documentation**: [API Documentation](./API_DOCUMENTATION.md)
- **Status Page**: [status.dietgame.com](https://status.dietgame.com)
