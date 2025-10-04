// Main App Component with all generated pages
// Integrates navigation and page routing

import React, { useState } from 'react';
import MainNavigation from './components/MainNavigation';
import HomePage from './pages/HomePage';
import NutritionTrackingPage from './pages/NutritionTrackingPage';
import AICoachPage from './pages/AICoachPage';
import GamificationPage from './pages/GamificationPage';
import SocialCommunityPage from './pages/SocialCommunityPage';
import ProfilePage from './pages/ProfilePage';

const AppWithPages: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'nutrition':
        return <NutritionTrackingPage />;
      case 'ai-coach':
        return <AICoachPage />;
      case 'gamification':
        return <GamificationPage />;
      case 'community':
        return <SocialCommunityPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {renderPage()}
      </div>
    </div>
  );
};

export default AppWithPages;
