/**
 * Connection Health Monitor Component
 * Advanced connection monitoring with detailed metrics and diagnostics
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeUpdates, ConnectionState } from '../../services/realtimeService';
import { 
  Activity, 
  Wifi, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface HealthMetric {
  timestamp: number;
  latency: number;
  packetLoss: number;
  quality: string;
}

interface ConnectionHealthMonitorProps {
  className?: string;
  showHistory?: boolean;
  maxHistoryItems?: number;
}

export const ConnectionHealthMonitor: React.FC<ConnectionHealthMonitorProps> = ({
  className = '',
  showHistory = true,
  maxHistoryItems = 20
}) => {
  const { 
    connectionState, 
    connectionHealth, 
    connectionStats, 
    isConnected 
  } = useRealtimeUpdates();

  const [healthHistory, setHealthHistory] = useState<HealthMetric[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update health history
  useEffect(() => {
    if (isConnected && connectionHealth.lastPing > 0) {
      const newMetric: HealthMetric = {
        timestamp: Date.now(),
        latency: connectionHealth.latency,
        packetLoss: connectionHealth.packetLoss,
        quality: connectionHealth.connectionQuality
      };

      setHealthHistory(prev => {
        const updated = [newMetric, ...prev];
        return updated.slice(0, maxHistoryItems);
      });
    }
  }, [connectionHealth.lastPing, connectionHealth.latency, connectionHealth.packetLoss, connectionHealth.connectionQuality, isConnected, maxHistoryItems]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500 bg-green-50';
      case 'good': return 'text-blue-500 bg-blue-50';
      case 'poor': return 'text-yellow-500 bg-yellow-50';
      case 'critical': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getLatencyTrend = () => {
    if (healthHistory.length < 2) return 'stable';
    
    const recent = healthHistory.slice(0, 3);
    const older = healthHistory.slice(3, 6);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, h) => sum + h.latency, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.latency, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    if (diff > 50) return 'increasing';
    if (diff < -50) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = () => {
    const trend = getLatencyTrend();
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return 'border-green-200 bg-green-50';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return 'border-yellow-200 bg-yellow-50';
      case ConnectionState.FAILED:
        return 'border-red-200 bg-red-50';
      case ConnectionState.OFFLINE:
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg border ${getConnectionStatusColor()} ${className}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Connection Health
              </h3>
              <p className="text-xs text-gray-500">
                {isConnected ? 'Real-time monitoring active' : 'Connection monitoring paused'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected && (
              <>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(connectionHealth.connectionQuality)}`}>
                  {connectionHealth.connectionQuality}
                </div>
                {getTrendIcon()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {/* Current Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-600">Latency</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {connectionHealth.latency > 0 ? `${connectionHealth.latency}ms` : 'N/A'}
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center space-x-2 mb-1">
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-gray-600">Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                {getQualityIcon(connectionHealth.connectionQuality)}
                <span className="text-lg font-semibold text-gray-900 capitalize">
                  {connectionHealth.connectionQuality}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Stats */}
          <div className="bg-white rounded-lg p-3 border mb-4">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Connection Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Reconnect Attempts:</span>
                <span className="ml-1 font-medium">{connectionStats.reconnectAttempts}/{connectionStats.maxReconnectAttempts}</span>
              </div>
              <div>
                <span className="text-gray-500">Queued Messages:</span>
                <span className="ml-1 font-medium">{connectionStats.queuedMessages}</span>
              </div>
              <div>
                <span className="text-gray-500">Network Status:</span>
                <span className={`ml-1 font-medium ${connectionStats.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionStats.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Uptime:</span>
                <span className="ml-1 font-medium">
                  {connectionStats.connectionUptime > 0 
                    ? `${Math.floor(connectionStats.connectionUptime / 1000)}s`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Health History */}
          {showHistory && healthHistory.length > 0 && (
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Recent Health Metrics</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {healthHistory.slice(0, 10).map((metric, index) => (
                  <div key={metric.timestamp} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">{formatTimestamp(metric.timestamp)}</span>
                      <div className={`px-1 py-0.5 rounded text-xs ${getQualityColor(metric.quality)}`}>
                        {metric.quality}
                      </div>
                    </div>
                    <span className="text-gray-700">{metric.latency}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionHealthMonitor;
