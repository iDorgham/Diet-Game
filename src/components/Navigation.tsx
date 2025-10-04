// Navigation component for SDD workflow
// Includes routing to all pages including new AR Recipes page

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  Camera, 
  Target, 
  BarChart3,
  Settings,
  ChefHat
} from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home', level: '101' },
    { path: '/ai-coach', icon: Brain, label: 'AI Coach', level: '202' },
    { path: '/ar-recipes', icon: Camera, label: 'AR Recipes', level: '303' },
    { path: '/nutrition-tracking', icon: Target, label: 'Nutrition', level: '202' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', level: '303' },
    { path: '/settings', icon: Settings, label: 'Settings', level: '101' }
  ];

  return (
    <nav className="bg-white shadow-lg border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-3 px-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-t-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
                <span className={`text-xs px-1 rounded ${
                  item.level === '303' 
                    ? 'bg-purple-100 text-purple-600' 
                    : item.level === '202'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  L{item.level}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;