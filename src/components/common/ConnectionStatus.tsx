/**
 * Connection Status Component
 * Displays real-time connection status, health metrics, and reconnection controls
 */

import React from 'react';
import { useRealtimeUpdates, ConnectionState } from '../../services/realtimeService';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  MessageSquare
} from 'lucide-react';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { 
    connectionState, 
    connectionHealth, 
    connectionStats, 
    isConnected, 
    isReconnecting, 
    isFailed, 
    isOffline,
    realtimeService 
  } = useRealtimeUpdates();

  const getStatusIcon = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case ConnectionState.FAILED:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case ConnectionState.OFFLINE:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return 'Connected';
      case ConnectionState.CONNECTING:
        return 'Connecting...';
      case ConnectionState.RECONNECTING:
        return `Reconnecting... (${connectionStats.reconnectAttempts}/${connectionStats.maxReconnectAttempts})`;
      case ConnectionState.FAILED:
        return 'Connection Failed';
      case ConnectionState.OFFLINE:
        return 'Offline';
      default:
        return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return 'text-green-600';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return 'text-yellow-600';
      case ConnectionState.FAILED:
        return 'text-red-600';
      case ConnectionState.OFFLINE:
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  const getConnectionQualityColor = () => {
    switch (connectionHealth.connectionQuality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'poor':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatUptime = (ms: number) => {
    if (ms < 1000) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const handleForceReconnect = () => {
    realtimeService.forceReconnect();
  };

  const handleClearQueue = () => {
    realtimeService.clearQueuedMessages();
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>

      {showDetails && (
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {/* Connection Quality */}
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span className={getConnectionQualityColor()}>
              {connectionHealth.connectionQuality}
            </span>
          </div>

          {/* Latency */}
          {connectionHealth.latency > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{connectionHealth.latency}ms</span>
            </div>
          )}

          {/* Queued Messages */}
          {connectionStats.queuedMessages > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{connectionStats.queuedMessages}</span>
            </div>
          )}

          {/* Uptime */}
          {connectionStats.connectionUptime > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatUptime(connectionStats.connectionUptime)}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {showDetails && (
        <div className="flex items-center space-x-2">
          {(isFailed || isOffline) && (
            <button
              onClick={handleForceReconnect}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reconnect
            </button>
          )}
          
          {connectionStats.queuedMessages > 0 && (
            <button
              onClick={handleClearQueue}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear Queue
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
