/**
 * Real-time Indicator Component
 * Shows connection status and real-time update indicators
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  BellOff,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useRealtimeUpdates, useRealtimeNotifications } from '../../../hooks/useRealtimeRecommendations';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Tooltip } from '../../ui/Tooltip';

interface RealtimeIndicatorProps {
  showNotifications?: boolean;
  showConnectionStatus?: boolean;
  compact?: boolean;
  onNotificationClick?: () => void;
}

export function RealtimeIndicator({
  showNotifications = true,
  showConnectionStatus = true,
  compact = false,
  onNotificationClick
}: RealtimeIndicatorProps) {
  const { isConnected, connectionStatus } = useRealtimeUpdates();
  const { unreadCount } = useRealtimeNotifications();
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Animate when connection status changes
  useEffect(() => {
    if (isConnected) {
      setIsAnimating(true);
      setLastUpdate(new Date());
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const getConnectionColor = () => {
    if (isConnected) return 'text-green-600 bg-green-100';
    if (connectionStatus.reconnectAttempts > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConnectionIcon = () => {
    if (isConnected) return Wifi;
    if (connectionStatus.reconnectAttempts > 0) return RefreshCw;
    return WifiOff;
  };

  const getConnectionText = () => {
    if (isConnected) return 'Live';
    if (connectionStatus.reconnectAttempts > 0) return 'Reconnecting...';
    return 'Offline';
  };

  const ConnectionIcon = getConnectionIcon();

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {/* Connection Status */}
        {showConnectionStatus && (
          <Tooltip content={getConnectionText()}>
            <div className={`p-1 rounded-full ${getConnectionColor()}`}>
              <motion.div
                animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <ConnectionIcon className="h-3 w-3" />
              </motion.div>
            </div>
          </Tooltip>
        )}

        {/* Notifications */}
        {showNotifications && (
          <Tooltip content={`${unreadCount} new notifications`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="relative p-1"
            >
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge 
                      variant="destructive" 
                      className="h-4 w-4 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
              <Bell className="h-3 w-3" />
            </Button>
          </Tooltip>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {/* Connection Status */}
      {showConnectionStatus && (
        <div className="flex items-center space-x-2">
          <motion.div
            animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
            className={`p-2 rounded-full ${getConnectionColor()}`}
          >
            <ConnectionIcon className="h-4 w-4" />
          </motion.div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {getConnectionText()}
            </p>
            {lastUpdate && (
              <p className="text-xs text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {showNotifications && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNotificationClick}
            className="relative"
          >
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge 
                    variant="destructive" 
                    className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      )}

      {/* Activity Indicator */}
      {isConnected && (
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-1 rounded-full bg-green-100"
          >
            <Activity className="h-3 w-3 text-green-600" />
          </motion.div>
          <span className="text-xs text-gray-600">Live updates</span>
        </div>
      )}

      {/* Connection Issues */}
      {!isConnected && connectionStatus.reconnectAttempts > 0 && (
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            Reconnecting... ({connectionStatus.reconnectAttempts}/5)
          </span>
        </div>
      )}
    </div>
  );
}

// Real-time update notification component
export function RealtimeUpdateNotification() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const handleUpdate = (event: any) => {
      setNotifications(prev => [event, ...prev.slice(0, 4)]); // Keep last 5
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== event.id));
      }, 5000);
    };

    // This would be connected to the real-time service
    // realtimeService.subscribe('notification', handleUpdate);

    return () => {
      // realtimeService.unsubscribe('notification', handleUpdate);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-sm"
          >
            <div className="flex items-start space-x-2">
              <div className="p-1 rounded-full bg-blue-100">
                <Activity className="h-3 w-3 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-600">
                  {notification.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
