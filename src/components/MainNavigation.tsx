// Main Navigation Component - Navigation for the Diet Game app
// Provides navigation between all the generated pages

import React, { useState } from 'react';
import {
  Home,
  Utensils,
  Brain,
  Trophy,
  Users,
  User,
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useNutriStore, useProgress, useUserProfile } from '../store/nutriStore';

interface MainNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const progress = useProgress();
  const userProfile = useUserProfile();

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      description: 'Dashboard and overview'
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      icon: Utensils,
      path: '/nutrition',
      description: 'Track your meals and nutrition'
    },
    {
      id: 'ai-coach',
      label: 'AI Coach',
      icon: Brain,
      path: '/ai-coach',
      description: 'Get personalized recommendations'
    },
    {
      id: 'gamification',
      label: 'Gamification',
      icon: Trophy,
      path: '/gamification',
      description: 'Level up and earn achievements'
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      path: '/community',
      description: 'Connect with other users'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      description: 'Manage your account and settings'
    }
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Logout logic here
    console.log('Logging out...');
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-lg">
        {/* Logo */}
        <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">NQ</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">NutriQuest</h1>
            <p className="text-xs text-gray-500">Diet Game</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{userProfile.userName}</p>
              <p className="text-xs text-gray-500">Level {progress.level} • {progress.coins} coins</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Notifications</span>
          </button>
          <button 
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NQ</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">NutriQuest</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Toggle menu"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white border-b border-gray-200 shadow-lg">
            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{userProfile.userName}</p>
                  <p className="text-sm text-gray-500">Level {progress.level} • {progress.coins} coins</p>
                </div>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Toggle profile menu"
                  aria-label="Toggle profile menu"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {isProfileMenuOpen && (
                <div className="mt-3 space-y-2">
                  <button 
                    className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    title="Settings"
                    aria-label="Settings"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <div className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MainNavigation;
