import React from 'react';
import GamificationDashboard from '../components/gamification/GamificationDashboard';
import '../styles/gamification.css';

const GamificationPage: React.FC = () => {
  // In a real app, this would come from authentication context
  const userId = 'demo-user-123';

  return (
    <div className="gamification-page">
      <div className="page-header">
        <h1>Gamification Dashboard</h1>
        <p>Track your progress, earn achievements, and stay motivated on your health journey!</p>
      </div>
      
      <GamificationDashboard userId={userId} />
    </div>
  );
};

export default GamificationPage;