/**
 * Social Community Page
 * Main page integrating all social features including friends, feed, and community features
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Bell, 
  Search,
  Plus,
  Settings,
  Home,
  UserPlus,
  Inbox
} from 'lucide-react';
import { useSocialActivitySummary } from '../hooks/useSocialQueries';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';

// Import social components
import SocialFeed from '../components/social/SocialFeed';
import FriendList from '../components/social/FriendList';
import FriendSuggestions from '../components/social/FriendSuggestions';
import FriendRequests from '../components/social/FriendRequests';

interface SocialCommunityPageProps {
  className?: string;
}

const SocialCommunityPage: React.FC<SocialCommunityPageProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    friendsCount, 
    teamsCount, 
    unreadNotificationsCount,
    isLoading: summaryLoading 
  } = useSocialActivitySummary();

  const tabs = [
    { 
      id: 'feed', 
      label: 'Feed', 
      icon: Home, 
      badge: null 
    },
    { 
      id: 'friends', 
      label: 'Friends', 
      icon: Users, 
      badge: friendsCount > 0 ? friendsCount : null 
    },
    { 
      id: 'discover', 
      label: 'Discover', 
      icon: UserPlus, 
      badge: null 
    },
    { 
      id: 'requests', 
      label: 'Requests', 
      icon: Inbox, 
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null 
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
    console.log('Searching for:', query);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <SocialFeed showPostCreator={true} />;
      
      case 'friends':
        return (
          <div className="space-y-6">
            <FriendList showActions={true} />
            <FriendSuggestions limit={5} showReasons={true} />
          </div>
        );
      
      case 'discover':
        return (
          <div className="space-y-6">
            <FriendSuggestions limit={10} showReasons={true} />
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Discover Teams</h3>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Team discovery coming soon!</p>
              </div>
            </Card>
          </div>
        );
      
      case 'requests':
        return (
          <div className="space-y-6">
            <FriendRequests 
              incomingRequests={[]} // This would come from API
              outgoingRequests={[]} // This would come from API
            />
          </div>
        );
      
      default:
        return <SocialFeed showPostCreator={true} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Social Community</h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search friends, posts, teams..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
              
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                  {unreadNotificationsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                    >
                      {unreadNotificationsCount}
                    </Badge>
                  )}
                </Button>
              </div>
              
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Stats */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Friends</span>
                    <Badge variant="secondary">{friendsCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Teams</span>
                    <Badge variant="secondary">{teamsCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notifications</span>
                    <Badge variant={unreadNotificationsCount > 0 ? "destructive" : "secondary"}>
                      {unreadNotificationsCount}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Find Friends
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <Badge variant="destructive" size="sm">
                          {tab.badge}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value={activeTab} className="mt-0">
                    {renderTabContent()}
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialCommunityPage;