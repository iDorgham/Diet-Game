// Header component for application header with navigation and user controls
// Part of HIGH Priority Layout Components implementation

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    level?: number;
    xp?: number;
  };
  notifications?: {
    count: number;
    items: Array<{
      id: string;
      title: string;
      message: string;
      timestamp: Date;
      read: boolean;
    }>;
  };
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
  onNotificationClick?: (notificationId: string) => void;
  onUserMenuAction?: (action: string) => void;
  className?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  language?: string;
  onLanguageChange?: (language: string) => void;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(
  (
    {
      title = "Diet Game",
      subtitle,
      logo,
      user,
      notifications,
      onMenuClick,
      onSearch,
      onNotificationClick,
      onUserMenuAction,
      className,
      showSearch = true,
      showNotifications = true,
      showUserMenu = true,
      theme = 'light',
      onThemeToggle,
      language = 'en',
      onLanguageChange
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        onSearch?.(searchQuery.trim());
        setSearchQuery('');
        setShowSearchBar(false);
      }
    };

    const handleNotificationClick = (notificationId: string) => {
      onNotificationClick?.(notificationId);
      setShowNotificationsDropdown(false);
    };

    const handleUserMenuAction = (action: string) => {
      onUserMenuAction?.(action);
      setShowUserDropdown(false);
    };

    const formatTimestamp = (timestamp: Date) => {
      const now = new Date();
      const diff = now.getTime() - timestamp.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    };

    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm',
          className
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Menu Button */}
              <button
                onClick={onMenuClick}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo/Title */}
              <div className="flex items-center space-x-3">
                {logo ? (
                  <div className="flex-shrink-0">{logo}</div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">DG</span>
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-gray-600">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Center Section - Search */}
            {showSearch && (
              <div className="flex-1 max-w-lg mx-4">
                <AnimatePresence>
                  {showSearchBar ? (
                    <motion.form
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onSubmit={handleSearch}
                      className="relative"
                    >
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowSearchBar(false)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </motion.form>
                  ) : (
                    <button
                      onClick={() => setShowSearchBar(true)}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search...</span>
                    </button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              {onThemeToggle && (
                <button
                  onClick={onThemeToggle}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Language Selector */}
              {onLanguageChange && (
                <div className="relative">
                  <button
                    onClick={() => {/* Toggle language dropdown */}}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Change language"
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Notifications */}
              {showNotifications && notifications && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                    className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.count > 9 ? '9+' : notifications.count}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotificationsDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      >
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.items.length > 0 ? (
                            notifications.items.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id)}
                                className={cn(
                                  'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
                                  !notification.read && 'bg-blue-50'
                                )}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={cn(
                                    'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                                    !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                                  )} />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatTimestamp(notification.timestamp)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              No notifications
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* User Menu */}
              {showUserMenu && user && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      {user.level && (
                        <div className="text-xs text-gray-500">Level {user.level}</div>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.level && user.xp && (
                                <div className="text-xs text-gray-500">
                                  Level {user.level} • {user.xp.toLocaleString()} XP
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={() => handleUserMenuAction('profile')}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={() => handleUserMenuAction('settings')}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={() => handleUserMenuAction('logout')}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';

export default Header;
