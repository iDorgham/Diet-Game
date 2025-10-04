// Notification component following docs/ui-components/notifications.md
// EARS-UI-026 through EARS-UI-030 implementation

import React, { forwardRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Bell,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../../utils/helpers';

// Toast Notification Component
export interface ToastNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = no auto-dismiss
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  onClose?: () => void;
  persistent?: boolean;
  closable?: boolean;
  className?: string;
}

const toastTypes = {
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500'
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500'
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500'
  }
};

const notificationPositions = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
};

export const ToastNotification = forwardRef<HTMLDivElement, ToastNotificationProps>(
  (
    {
      id,
      type,
      title,
      message,
      duration = 5000,
      position = 'top-right',
      actions = [],
      onClose,
      persistent = false,
      closable = true,
      className
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isPaused, setIsPaused] = useState(false);

    const toastConfig = toastTypes[type];
    const Icon = toastConfig.icon;

    useEffect(() => {
      if (duration > 0 && !persistent && !isPaused) {
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 100) {
              setIsVisible(false);
              return 0;
            }
            return prev - 100;
          });
        }, 100);

        return () => clearInterval(timer);
      }
    }, [duration, persistent, isPaused]);

    useEffect(() => {
      if (!isVisible && onClose) {
        const timer = setTimeout(() => onClose(), 300);
        return () => clearTimeout(timer);
      }
    }, [isVisible, onClose]);

    const handleClose = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      if (duration > 0 && !persistent) {
        setIsPaused(true);
      }
    };

    const handleMouseLeave = () => {
      if (duration > 0 && !persistent) {
        setIsPaused(false);
      }
    };

    const progressPercentage = duration > 0 ? (timeLeft / duration) * 100 : 0;

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'fixed z-50 max-w-sm w-full',
              notificationPositions[position],
              className
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={cn(
                'rounded-lg border shadow-lg p-4',
                toastConfig.bgColor,
                toastConfig.borderColor
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Icon className={cn('w-5 h-5 mr-2', toastConfig.iconColor)} />
                  <h4 className={cn('text-sm font-semibold', toastConfig.color)}>
                    {title}
                  </h4>
                </div>
                {closable && (
                  <button
                    onClick={handleClose}
                    className={cn(
                      'ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors',
                      toastConfig.color
                    )}
                    aria-label="Close notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Message */}
              <p className={cn('text-sm mb-3', toastConfig.color)}>
                {message}
              </p>

              {/* Actions */}
              {actions.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                        action.variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                        action.variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
                        action.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
                        !action.variant && 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Progress bar */}
              {duration > 0 && !persistent && (
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <motion.div
                    className={cn('h-1 rounded-full', toastConfig.iconColor.replace('text-', 'bg-'))}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

ToastNotification.displayName = 'ToastNotification';

// In-App Notification Component
export interface InAppNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'task' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  onMarkAsRead?: () => void;
  onDismiss?: () => void;
  metadata?: Record<string, any>;
  className?: string;
}

const priorityLevels = {
  low: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  medium: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  high: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  urgent: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    pulse: true
  }
};

export const InAppNotification = forwardRef<HTMLDivElement, InAppNotificationProps>(
  (
    {
      id,
      type,
      title,
      message,
      timestamp,
      isRead,
      priority,
      actions = [],
      onMarkAsRead,
      onDismiss,
      metadata,
      className
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const priorityConfig = priorityLevels[priority];
    const typeConfig = toastTypes[type] || toastTypes.info;
    const Icon = typeConfig.icon;

    const formatTimeAgo = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    };

    const handleClick = () => {
      if (!isRead && onMarkAsRead) {
        onMarkAsRead();
      }
      setIsExpanded(!isExpanded);
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'border rounded-lg p-4 cursor-pointer transition-all duration-200',
          isRead ? 'bg-white' : priorityConfig.bgColor,
          priorityConfig.borderColor,
          !isRead && 'border-l-4',
          priority === 'urgent' && 'animate-pulse',
          className
        )}
        onClick={handleClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center flex-1">
            <Icon className={cn('w-5 h-5 mr-3', typeConfig.iconColor)} />
            <div className="flex-1">
              <h4 className={cn('text-sm font-semibold', priorityConfig.color)}>
                {title}
              </h4>
              <div className="flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(timestamp)}
                </span>
                {!isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {onDismiss && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors ml-1"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Message */}
        <p className={cn('text-sm mb-3', priorityConfig.color)}>
          {message}
        </p>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Actions */}
              {actions.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                        action.variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                        action.variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
                        action.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
                        !action.variant && 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Metadata */}
              {metadata && Object.keys(metadata).length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

InAppNotification.displayName = 'InAppNotification';

// Notification Badge Component
export interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  showZero?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  animated?: boolean;
  pulse?: boolean;
  className?: string;
}

export const NotificationBadge = forwardRef<HTMLDivElement, NotificationBadgeProps>(
  (
    {
      count,
      maxCount = 99,
      showZero = false,
      color = 'bg-red-500',
      size = 'md',
      position = 'top-right',
      animated = false,
      pulse = false,
      className
    },
    ref
  ) => {
    if (count === 0 && !showZero) {
      return null;
    }

    const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

    const sizeClasses = {
      sm: 'w-4 h-4 text-xs',
      md: 'w-5 h-5 text-xs',
      lg: 'w-6 h-6 text-sm'
    };

    const positionClasses = {
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0',
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0'
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'absolute flex items-center justify-center rounded-full text-white font-medium',
          color,
          sizeClasses[size],
          positionClasses[position],
          className
        )}
        initial={animated ? { scale: 0 } : undefined}
        animate={animated ? { scale: 1 } : undefined}
        whileHover={animated ? { scale: 1.1 } : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {pulse && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500"
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span className="relative z-10">{displayCount}</span>
      </motion.div>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';

// Notification Center Component
export interface NotificationCenterProps {
  notifications: InAppNotificationProps[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  filter?: 'all' | 'unread' | 'priority';
  groupBy?: 'type' | 'date' | 'priority';
  maxHeight?: string;
  className?: string;
}

export const NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>(
  (
    {
      notifications,
      onMarkAsRead,
      onMarkAllAsRead,
      onDismiss,
      onDismissAll,
      filter = 'all',
      groupBy = 'date',
      maxHeight = '400px',
      className
    },
    ref
  ) => {
    const [localFilter, setLocalFilter] = useState(filter);
    const [localGroupBy, setLocalGroupBy] = useState(groupBy);

    const filteredNotifications = notifications.filter((notification) => {
      switch (localFilter) {
        case 'unread':
          return !notification.isRead;
        case 'priority':
          return notification.priority === 'high' || notification.priority === 'urgent';
        default:
          return true;
      }
    });

    const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
      let key: string;
      
      switch (localGroupBy) {
        case 'type':
          key = notification.type;
          break;
        case 'priority':
          key = notification.priority;
          break;
        case 'date':
        default:
          const date = new Date(notification.timestamp);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (date.toDateString() === today.toDateString()) {
            key = 'Today';
          } else if (date.toDateString() === yesterday.toDateString()) {
            key = 'Yesterday';
          } else {
            key = date.toLocaleDateString();
          }
          break;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(notification);
      return groups;
    }, {} as Record<string, InAppNotificationProps[]>);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
      <div
        ref={ref}
        className={cn('bg-white border border-gray-200 rounded-lg shadow-lg', className)}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <NotificationBadge count={unreadCount} className="ml-2" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
              <button
                onClick={onDismissAll}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Dismiss all
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={localFilter}
              onChange={(e) => setLocalFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              aria-label="Filter notifications"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="priority">Priority</option>
            </select>
            <select
              value={localGroupBy}
              onChange={(e) => setLocalGroupBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              aria-label="Group notifications by"
            >
              <option value="date">Group by Date</option>
              <option value="type">Group by Type</option>
              <option value="priority">Group by Priority</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight }}
        >
          {Object.keys(groupedNotifications).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
              <div key={group} className="border-b border-gray-100 last:border-b-0">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700">
                    {group} ({groupNotifications.length})
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {groupNotifications.map((notification) => (
                    <div key={notification.id} className="p-4">
                      <InAppNotification
                        {...notification}
                        onMarkAsRead={() => onMarkAsRead(notification.id)}
                        onDismiss={() => onDismiss(notification.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
);

NotificationCenter.displayName = 'NotificationCenter';

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastNotificationProps[];
  onRemove: (id: string) => void;
  position?: ToastNotificationProps['position'];
  className?: string;
}

export const ToastContainer = forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ toasts, onRemove, position = 'top-right', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('fixed z-50 pointer-events-none', className)}
      >
        <div className={cn('space-y-2', notificationPositions[position])}>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastNotification
                {...toast}
                onClose={() => onRemove(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ToastContainer.displayName = 'ToastContainer';

export default ToastNotification;
