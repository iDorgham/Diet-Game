/**
 * Performance Monitor Component
 * Monitors and displays performance metrics for recommendations system
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  Database, 
  Wifi, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';

interface PerformanceMetrics {
  apiResponseTime: number;
  cacheHitRate: number;
  realtimeLatency: number;
  memoryUsage: number;
  errorRate: number;
  throughput: number;
  lastUpdated: Date;
}

interface PerformanceMonitorProps {
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function PerformanceMonitor({
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 5000
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: 0,
    cacheHitRate: 0,
    realtimeLatency: 0,
    memoryUsage: 0,
    errorRate: 0,
    throughput: 0,
    lastUpdated: new Date()
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate performance monitoring
  const collectMetrics = () => {
    const newMetrics: PerformanceMetrics = {
      apiResponseTime: Math.random() * 200 + 50, // 50-250ms
      cacheHitRate: Math.random() * 0.3 + 0.7, // 70-100%
      realtimeLatency: Math.random() * 50 + 10, // 10-60ms
      memoryUsage: Math.random() * 0.2 + 0.1, // 10-30%
      errorRate: Math.random() * 0.05, // 0-5%
      throughput: Math.random() * 100 + 50, // 50-150 req/s
      lastUpdated: new Date()
    };

    setMetrics(newMetrics);
    setPerformanceHistory(prev => [newMetrics, ...prev.slice(0, 19)]); // Keep last 20
  };

  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      intervalRef.current = setInterval(collectMetrics, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, isMonitoring, refreshInterval]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    collectMetrics();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'text-green-600', icon: CheckCircle };
    if (value <= thresholds.warning) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'poor', color: 'text-red-600', icon: XCircle };
  };

  const getPerformanceTrend = (current: number, previous: number) => {
    if (previous === 0) return { trend: 'stable', icon: Activity, color: 'text-gray-600' };
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return { trend: 'up', icon: TrendingUp, color: 'text-red-600' };
    if (change < -5) return { trend: 'down', icon: TrendingDown, color: 'text-green-600' };
    return { trend: 'stable', icon: Activity, color: 'text-gray-600' };
  };

  const apiStatus = getPerformanceStatus(metrics.apiResponseTime, { good: 100, warning: 200 });
  const cacheStatus = getPerformanceStatus(metrics.cacheHitRate, { good: 0.9, warning: 0.7 });
  const realtimeStatus = getPerformanceStatus(metrics.realtimeLatency, { good: 30, warning: 100 });
  const memoryStatus = getPerformanceStatus(metrics.memoryUsage, { good: 0.2, warning: 0.5 });
  const errorStatus = getPerformanceStatus(metrics.errorRate, { good: 0.01, warning: 0.05 });

  const previousMetrics = performanceHistory[1];
  const apiTrend = previousMetrics ? getPerformanceTrend(metrics.apiResponseTime, previousMetrics.apiResponseTime) : null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant={isMonitoring ? "default" : "secondary"}
            className={isMonitoring ? "bg-green-100 text-green-800" : ""}
          >
            {isMonitoring ? "Monitoring" : "Stopped"}
          </Badge>
          
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            variant="outline"
            size="sm"
          >
            {isMonitoring ? "Stop" : "Start"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Clock className="h-4 w-4 text-gray-600" />
            {apiTrend && (
              <apiTrend.icon className={`h-3 w-3 ${apiTrend.color}`} />
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(metrics.apiResponseTime)}ms
          </div>
          <div className="text-xs text-gray-600">API Response</div>
          <div className={`text-xs ${apiStatus.color} flex items-center justify-center space-x-1`}>
            <apiStatus.icon className="h-3 w-3" />
            <span>{apiStatus.status}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Database className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(metrics.cacheHitRate * 100)}%
          </div>
          <div className="text-xs text-gray-600">Cache Hit Rate</div>
          <div className={`text-xs ${cacheStatus.color} flex items-center justify-center space-x-1`}>
            <cacheStatus.icon className="h-3 w-3" />
            <span>{cacheStatus.status}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Wifi className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(metrics.realtimeLatency)}ms
          </div>
          <div className="text-xs text-gray-600">Real-time Latency</div>
          <div className={`text-xs ${realtimeStatus.color} flex items-center justify-center space-x-1`}>
            <realtimeStatus.icon className="h-3 w-3" />
            <span>{realtimeStatus.status}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Activity className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(metrics.memoryUsage * 100)}%
          </div>
          <div className="text-xs text-gray-600">Memory Usage</div>
          <div className={`text-xs ${memoryStatus.color} flex items-center justify-center space-x-1`}>
            <memoryStatus.icon className="h-3 w-3" />
            <span>{memoryStatus.status}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(metrics.errorRate * 100)}%
          </div>
          <div className="text-xs text-gray-600">Error Rate</div>
          <div className={`text-xs ${errorStatus.color} flex items-center justify-center space-x-1`}>
            <errorStatus.icon className="h-3 w-3" />
            <span>{errorStatus.status}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(metrics.throughput)}
          </div>
          <div className="text-xs text-gray-600">Throughput (req/s)</div>
          <div className="text-xs text-gray-500">Good</div>
        </div>
      </div>

      {/* Performance Progress Bars */}
      {showDetails && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700">API Response Time</span>
              <span className="text-gray-600">{Math.round(metrics.apiResponseTime)}ms</span>
            </div>
            <Progress 
              value={Math.min((metrics.apiResponseTime / 300) * 100, 100)} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700">Cache Hit Rate</span>
              <span className="text-gray-600">{Math.round(metrics.cacheHitRate * 100)}%</span>
            </div>
            <Progress 
              value={metrics.cacheHitRate * 100} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700">Real-time Latency</span>
              <span className="text-gray-600">{Math.round(metrics.realtimeLatency)}ms</span>
            </div>
            <Progress 
              value={Math.min((metrics.realtimeLatency / 100) * 100, 100)} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700">Memory Usage</span>
              <span className="text-gray-600">{Math.round(metrics.memoryUsage * 100)}%</span>
            </div>
            <Progress 
              value={metrics.memoryUsage * 100} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700">Error Rate</span>
              <span className="text-gray-600">{Math.round(metrics.errorRate * 100)}%</span>
            </div>
            <Progress 
              value={Math.min((metrics.errorRate / 0.1) * 100, 100)} 
              className="h-2"
            />
          </div>
        </div>
      )}

      {/* Performance History Chart */}
      {showDetails && performanceHistory.length > 1 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Trends</h4>
          <div className="h-32 bg-gray-50 rounded-lg p-3">
            <div className="flex items-end justify-between h-full space-x-1">
              {performanceHistory.slice(0, 10).map((metric, index) => (
                <div
                  key={index}
                  className="flex-1 bg-blue-500 rounded-t"
                  style={{
                    height: `${(metric.apiResponseTime / 300) * 100}%`,
                    minHeight: '4px'
                  }}
                  title={`${Math.round(metric.apiResponseTime)}ms`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {metrics.lastUpdated.toLocaleTimeString()}
      </div>
    </Card>
  );
}

// Performance optimization suggestions component
export function PerformanceOptimizationSuggestions() {
  const [suggestions, setSuggestions] = useState([
    {
      id: 1,
      type: 'cache',
      title: 'Enable Redis Caching',
      description: 'Implement Redis caching for recommendation queries to reduce API response time',
      impact: 'high',
      effort: 'medium',
      status: 'pending'
    },
    {
      id: 2,
      type: 'database',
      title: 'Optimize Database Queries',
      description: 'Add database indexes for recommendation filtering and sorting',
      impact: 'high',
      effort: 'low',
      status: 'pending'
    },
    {
      id: 3,
      type: 'realtime',
      title: 'Implement Connection Pooling',
      description: 'Use connection pooling for WebSocket connections to improve real-time performance',
      impact: 'medium',
      effort: 'medium',
      status: 'pending'
    },
    {
      id: 4,
      type: 'frontend',
      title: 'Enable Code Splitting',
      description: 'Implement lazy loading for recommendation components to reduce initial bundle size',
      impact: 'medium',
      effort: 'low',
      status: 'completed'
    }
  ]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Suggestions</h3>
      
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                  {suggestion.impact} impact
                </Badge>
                <Badge variant="outline" className={getEffortColor(suggestion.effort)}>
                  {suggestion.effort} effort
                </Badge>
                <Badge variant="outline" className={getStatusColor(suggestion.status)}>
                  {suggestion.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{suggestion.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
