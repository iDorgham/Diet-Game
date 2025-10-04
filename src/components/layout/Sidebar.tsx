// Sidebar component for navigation sidebar with menu items and user info
// Part of HIGH Priority Layout Components implementation

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Target, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle, 
  ChevronRight,
  ChevronDown,
  Star,
  Zap,
  Trophy,
  Calendar,
  ShoppingCart,
  MessageSquare,
  Camera,
  BookOpen
} from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string | number;
  children?: SidebarItem[];
  disabled?: boolean;
  external?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
    level?: number;
    xp?: number;
  };
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
  onUserClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const defaultIcons = {
  home: Home,
  target: Target,
  chart: BarChart3,
  users: Users,
  settings: Settings,
  help: HelpCircle,
  star: Star,
  zap: Zap,
  trophy: Trophy,
  calendar: Calendar,
  shopping: ShoppingCart,
  chat: MessageSquare,
  camera: Camera,
  book: BookOpen
};

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items,
      user,
      activeItem,
      onItemClick,
      onUserClick,
      className,
      variant = 'default',
      collapsible = false,
      collapsed = false,
      onToggleCollapse
    },
    ref
  ) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpanded = (itemId: string) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      setExpandedItems(newExpanded);
    };

    const handleItemClick = (item: SidebarItem) => {
      if (item.children && item.children.length > 0) {
        toggleExpanded(item.id);
      } else {
        onItemClick?.(item);
      }
    };

    const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
      const isActive = activeItem === item.id;
      const isExpanded = expandedItems.has(item.id);
      const hasChildren = item.children && item.children.length > 0;
      const Icon = item.icon || defaultIcons[item.id as keyof typeof defaultIcons];

      return (
        <div key={item.id}>
          <motion.div
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors',
                level > 0 && 'ml-4',
                isActive
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-100',
                item.disabled && 'opacity-50 cursor-not-allowed',
                variant === 'compact' && 'px-2 py-1',
                variant === 'expanded' && 'px-4 py-3'
              )}
            >
              <div className="flex items-center space-x-3">
                {Icon && (
                  <Icon className={cn(
                    'flex-shrink-0',
                    variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'
                  )} />
                )}
                {!collapsed && (
                  <span className={cn(
                    'font-medium',
                    variant === 'compact' ? 'text-sm' : 'text-base'
                  )}>
                    {item.label}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {item.badge && !collapsed && (
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    isActive
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-700'
                  )}>
                    {item.badge}
                  </span>
                )}
                {hasChildren && !collapsed && (
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                )}
              </div>
            </button>
          </motion.div>

          {/* Children */}
          <AnimatePresence>
            {hasChildren && isExpanded && !collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1 space-y-1">
                  {item.children!.map((child) => renderSidebarItem(child, level + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };

    return (
      <aside
        ref={ref}
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col',
          variant === 'compact' ? 'w-16' : variant === 'expanded' ? 'w-80' : 'w-64',
          collapsed && 'w-16',
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          {collapsible && (
            <button
              onClick={onToggleCollapse}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronRight className={cn(
                'w-5 h-5 transition-transform',
                collapsed && 'rotate-180'
              )} />
            </button>
          )}
          
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DG</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Diet Game</h2>
                <p className="text-sm text-gray-600">Nutrition Tracker</p>
              </div>
            </div>
          )}
        </div>

        {/* User Section */}
        {user && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={onUserClick}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  {user.level && user.xp && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-500">
                        Level {user.level} • {user.xp.toLocaleString()} XP
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {items.map((item) => renderSidebarItem(item))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>© 2024 Diet Game</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        )}
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
