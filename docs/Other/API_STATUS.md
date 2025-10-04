# API Status & Health Monitoring

## Overview

The Diet Game API provides comprehensive health monitoring and status reporting to ensure reliable service delivery. This document outlines the monitoring systems, health check endpoints, and status reporting mechanisms.

## Health Check Endpoints

### Basic Health Check
```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "ai_service": "healthy",
    "external_apis": "healthy"
  }
}
```

### Detailed Health Check
```http
GET /api/v1/health/detailed
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "database": {
      "status": "healthy",
      "response_time": 12,
      "connections": 45,
      "max_connections": 100
    },
    "cache": {
      "status": "healthy",
      "response_time": 2,
      "memory_usage": "45%",
      "hit_rate": "92%"
    },
    "ai_service": {
      "status": "healthy",
      "response_time": 150,
      "queue_size": 3,
      "model_version": "gpt-4-turbo"
    },
    "external_apis": {
      "usda_database": "healthy",
      "edamam_api": "healthy",
      "spoonacular_api": "degraded",
      "grok_ai": "healthy"
    }
  },
  "metrics": {
    "requests_per_minute": 1250,
    "average_response_time": 85,
    "error_rate": 0.02,
    "active_users": 15420
  }
}
```

## Service Status Levels

### Status Definitions
- **Healthy**: Service is operating normally
- **Degraded**: Service is experiencing issues but still functional
- **Unhealthy**: Service is experiencing significant issues
- **Maintenance**: Service is under planned maintenance

### Status Indicators
```json
{
  "status": "healthy",           // Overall system status
  "services": {
    "database": "healthy",       // Individual service status
    "cache": "degraded",         // Service with issues
    "ai_service": "maintenance"  // Service under maintenance
  }
}
```

## Monitoring Metrics

### Performance Metrics
```http
GET /api/v1/metrics/performance
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response_times": {
      "average": 85,
      "p50": 45,
      "p95": 200,
      "p99": 500
    },
    "throughput": {
      "requests_per_second": 20.8,
      "requests_per_minute": 1250,
      "requests_per_hour": 75000
    },
    "error_rates": {
      "4xx_errors": 0.01,
      "5xx_errors": 0.005,
      "timeout_errors": 0.002
    }
  }
}
```

### System Metrics
```http
GET /api/v1/metrics/system
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cpu_usage": 45.2,
    "memory_usage": 67.8,
    "disk_usage": 23.4,
    "network_io": {
      "bytes_in": 1024000,
      "bytes_out": 2048000
    },
    "database": {
      "connections": 45,
      "query_time": 12,
      "cache_hit_rate": 92.5
    }
  }
}
```

## Alerting System

### Alert Types
- **Critical**: Service down or major functionality affected
- **Warning**: Performance degradation or minor issues
- **Info**: Maintenance notifications or status updates

### Alert Channels
- **Email**: Critical alerts sent to on-call team
- **Slack**: Real-time notifications to #api-alerts channel
- **PagerDuty**: Escalation for critical issues
- **Webhook**: Custom integrations for enterprise customers

### Alert Examples
```json
{
  "alert_id": "alert_123",
  "type": "critical",
  "service": "database",
  "message": "Database connection pool exhausted",
  "timestamp": "2024-01-15T10:30:00Z",
  "severity": "high",
  "status": "active"
}
```

## Status Page

### Public Status Page
The public status page is available at [status.dietgame.com](https://status.dietgame.com) and provides:

- **Current Status**: Overall system health
- **Service Status**: Individual service health
- **Incident History**: Past incidents and resolutions
- **Maintenance Windows**: Planned maintenance schedules
- **Performance Metrics**: Public performance data

### Status Page API
```http
GET /api/v1/status/public
```

**Response:**
```json
{
  "status": "healthy",
  "services": [
    {
      "name": "API",
      "status": "healthy",
      "uptime": "99.9%"
    },
    {
      "name": "Database",
      "status": "healthy",
      "uptime": "99.95%"
    },
    {
      "name": "AI Service",
      "status": "degraded",
      "uptime": "98.5%"
    }
  ],
  "incidents": [
    {
      "id": "incident_456",
      "title": "AI Service Performance Issues",
      "status": "investigating",
      "start_time": "2024-01-15T09:00:00Z",
      "impact": "minor"
    }
  ]
}
```

## Incident Management

### Incident Lifecycle
1. **Detection**: Automated monitoring detects issues
2. **Investigation**: Team investigates and identifies root cause
3. **Resolution**: Issue is resolved and service restored
4. **Post-Mortem**: Analysis and prevention measures

### Incident API
```http
GET /api/v1/incidents
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "incidents": [
      {
        "id": "incident_456",
        "title": "AI Service Performance Issues",
        "status": "resolved",
        "impact": "minor",
        "start_time": "2024-01-15T09:00:00Z",
        "end_time": "2024-01-15T10:15:00Z",
        "description": "AI service experiencing higher than normal response times",
        "resolution": "Increased server capacity and optimized queries",
        "affected_services": ["ai_coach", "recommendations"]
      }
    ]
  }
}
```

## Maintenance Windows

### Scheduled Maintenance
```http
GET /api/v1/maintenance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "upcoming": [
      {
        "id": "maintenance_789",
        "title": "Database Optimization",
        "scheduled_start": "2024-01-20T02:00:00Z",
        "scheduled_end": "2024-01-20T04:00:00Z",
        "affected_services": ["database", "api"],
        "impact": "minor",
        "description": "Database optimization and index updates"
      }
    ],
    "completed": [
      {
        "id": "maintenance_456",
        "title": "API Version Update",
        "start_time": "2024-01-10T01:00:00Z",
        "end_time": "2024-01-10T02:30:00Z",
        "status": "completed"
      }
    ]
  }
}
```

## Performance Benchmarks

### Response Time Targets
- **API Endpoints**: < 200ms (95th percentile)
- **Database Queries**: < 50ms (95th percentile)
- **AI Responses**: < 2 seconds (95th percentile)
- **File Uploads**: < 5 seconds (95th percentile)

### Availability Targets
- **Overall Uptime**: 99.9% (8.77 hours downtime per year)
- **Critical Services**: 99.95% (4.38 hours downtime per year)
- **Database**: 99.99% (52.56 minutes downtime per year)

### Throughput Targets
- **Concurrent Users**: 10,000+
- **Requests per Second**: 1,000+
- **Data Processing**: 1M+ records per hour

## Monitoring Tools

### Internal Monitoring
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **ELK Stack**: Log aggregation and analysis
- **New Relic**: Application performance monitoring

### External Monitoring
- **Pingdom**: Uptime monitoring
- **StatusCake**: Performance monitoring
- **UptimeRobot**: Multi-location monitoring

## API Usage Analytics

### Usage Statistics
```http
GET /api/v1/analytics/usage
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_requests": 1500000,
    "unique_users": 25000,
    "top_endpoints": [
      {
        "endpoint": "/api/v1/nutrition/meals",
        "requests": 450000,
        "percentage": 30
      },
      {
        "endpoint": "/api/v1/users/profile",
        "requests": 300000,
        "percentage": 20
      }
    ],
    "error_breakdown": {
      "4xx_errors": 15000,
      "5xx_errors": 7500,
      "rate_limit_errors": 5000
    }
  }
}
```

## Contact Information

### Support Channels
- **Status Page**: [status.dietgame.com](https://status.dietgame.com)
- **Email**: status@dietgame.com
- **Twitter**: [@DietGameStatus](https://twitter.com/DietGameStatus)
- **Slack**: #api-support channel

### Emergency Contacts
- **Critical Issues**: +1-555-API-HELP
- **On-Call Engineer**: oncall@dietgame.com
- **Escalation**: escalation@dietgame.com

---

*Last updated: January 15, 2024*
*API Version: v1.0.0*
