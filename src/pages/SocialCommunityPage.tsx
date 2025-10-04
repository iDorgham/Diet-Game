// Social Community Page - Following docs/specs/social-community/requirements.md
// EARS-SOC-001 through EARS-SOC-006 implementation

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Trophy,
  Crown,
  Medal,
  Award,
  Star,
  Flame,
  Target,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Settings,
  Bell,
  Camera,
  Image,
  Send,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Shield,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  Zap,
  Gift,
  Coffee,
  Utensils,
  Dumbbell,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { useNutriStore, useProgress, useUserProfile } from '../store/nutriStore';
import AnimatedProgressBar from '../components/animations/AnimatedProgressBar';

// Mock user profile data
const mockUserProfile = {
  id: 1,
  name: 'Yasser',
  username: '@yasser_health',
  avatar: '🎯',
  level: 3,
  xp: 150,
  streak: 3,
  dietType: 'Keto Diet',
  bodyType: 'Mesomorph',
  joinDate: '2024-01-01',
  bio: 'Health enthusiast on a keto journey. Love sharing recipes and tips!',
  stats: {
    mealsLogged: 67,
    workoutsCompleted: 23,
    achievements: 8,
    friends: 12
  },
  badges: [
    { name: 'First Steps', icon: Target, color: 'bg-green-500' },
    { name: 'Keto Master', icon: Utensils, color: 'bg-blue-500' },
    { name: 'Streak Keeper', icon: Flame, color: 'bg-orange-500' }
  ],
  isOnline: true,
  lastActive: '2 minutes ago'
};

// Mock friends data
const mockFriends = [
  {
    id: 2,
    name: 'Sarah K.',
    username: '@sarah_keto',
    avatar: '👑',
    level: 12,
    streak: 15,
    isOnline: true,
    lastActive: 'Online now',
    mutualFriends: 3,
    relationship: 'friend'
  },
  {
    id: 3,
    name: 'Mike T.',
    username: '@mike_fitness',
    avatar: '💪',
    level: 11,
    streak: 12,
    isOnline: false,
    lastActive: '2 hours ago',
    mutualFriends: 1,
    relationship: 'friend'
  },
  {
    id: 4,
    name: 'Emma L.',
    username: '@emma_wellness',
    avatar: '🌟',
    level: 10,
    streak: 8,
    isOnline: true,
    lastActive: 'Online now',
    mutualFriends: 5,
    relationship: 'pending'
  }
];

// Mock social feed posts
const mockFeedPosts = [
  {
    id: 1,
    user: {
      id: 2,
      name: 'Sarah K.',
      username: '@sarah_keto',
      avatar: '👑',
      level: 12
    },
    content: 'Just completed my 15-day streak! 🎉 The keto lifestyle has been amazing for my energy levels. Here\'s my favorite breakfast recipe:',
    image: '/images/keto-breakfast.jpg',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
    type: 'achievement',
    tags: ['#keto', '#streak', '#breakfast']
  },
  {
    id: 2,
    user: {
      id: 3,
      name: 'Mike T.',
      username: '@mike_fitness',
      avatar: '💪',
      level: 11
    },
    content: 'New personal record in the gym today! 💪 45 minutes of strength training followed by a protein-rich meal. Consistency is key!',
    image: '/images/workout.jpg',
    timestamp: '4 hours ago',
    likes: 18,
    comments: 5,
    shares: 2,
    isLiked: true,
    type: 'workout',
    tags: ['#fitness', '#strength', '#protein']
  },
  {
    id: 3,
    user: {
      id: 4,
      name: 'Emma L.',
      username: '@emma_wellness',
      avatar: '🌟',
      level: 10
    },
    content: 'Sharing my meal prep for the week! 🥗 Batch cooking saves so much time and helps me stay on track with my nutrition goals.',
    image: '/images/meal-prep.jpg',
    timestamp: '6 hours ago',
    likes: 31,
    comments: 12,
    shares: 7,
    isLiked: false,
    type: 'meal',
    tags: ['#mealprep', '#nutrition', '#planning']
  }
];

// Mock team challenges
const mockTeamChallenges = [
  {
    id: 1,
    name: 'Keto Warriors',
    description: 'A team of keto enthusiasts supporting each other',
    members: 8,
    maxMembers: 12,
    level: 5,
    currentChallenge: {
      name: '30-Day Keto Challenge',
      description: 'Complete 30 days of strict keto diet',
      progress: 67,
      endDate: '2024-02-15',
      rewards: ['500 XP', '100 coins', 'Keto Master badge']
    },
    isJoined: true
  },
  {
    id: 2,
    name: 'Fitness Fanatics',
    description: 'Building strength and endurance together',
    members: 15,
    maxMembers: 20,
    level: 8,
    currentChallenge: {
      name: 'Weekly Workout Challenge',
      description: 'Complete 5 workouts this week',
      progress: 80,
      endDate: '2024-01-28',
      rewards: ['300 XP', '75 coins', 'Workout Warrior badge']
    },
    isJoined: false
  }
];

// Mock leaderboard data
const mockLeaderboard = [
  {
    rank: 1,
    name: 'Sarah K.',
    level: 12,
    xp: 2450,
    streak: 15,
    avatar: '👑',
    isCurrentUser: false,
    category: 'weekly'
  },
  {
    rank: 2,
    name: 'Mike T.',
    level: 11,
    xp: 2200,
    streak: 12,
    avatar: '💪',
    isCurrentUser: false,
    category: 'weekly'
  },
  {
    rank: 3,
    name: 'Yasser',
    level: 3,
    xp: 150,
    streak: 3,
    avatar: '🎯',
    isCurrentUser: true,
    category: 'weekly'
  }
];

// User Profile Component
const UserProfile: React.FC = () => {
  const [profile] = useState(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-start space-x-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
            {profile.avatar}
          </div>
          {profile.isOnline && (
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h2 className="text-xl font-semibold text-gray-800">{profile.name}</h2>
            <span className="text-sm text-gray-500">{profile.username}</span>
          </div>
          <p className="text-gray-600 mb-2">{profile.bio}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Level {profile.level}</span>
            <span>{profile.xp} XP</span>
            <span className="flex items-center space-x-1">
              <Flame className="w-3 h-3" />
              <span>{profile.streak} days</span>
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-gray-400 hover:text-gray-600"
          title="Edit profile"
          aria-label="Edit profile"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{profile.stats.mealsLogged}</div>
          <div className="text-sm text-gray-600">Meals Logged</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{profile.stats.workoutsCompleted}</div>
          <div className="text-sm text-gray-600">Workouts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{profile.stats.achievements}</div>
          <div className="text-sm text-gray-600">Achievements</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{profile.stats.friends}</div>
          <div className="text-sm text-gray-600">Friends</div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Recent Badges</h3>
        <div className="flex space-x-2">
          {profile.badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={index} className={`p-2 ${badge.color} rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Friends List Component
const FriendsList: React.FC = () => {
  const [friends] = useState(mockFriends);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFriendAction = (friendId: number, action: string) => {
    console.log(`${action} friend ${friendId}`);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Friends</h3>
        <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlus className="w-4 h-4" />
          <span>Add Friend</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        {filteredFriends.map((friend) => (
          <div key={friend.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="relative">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                {friend.avatar}
              </div>
              {friend.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-800">{friend.name}</h4>
                <span className="text-sm text-gray-500">{friend.username}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>Level {friend.level}</span>
                <span className="flex items-center space-x-1">
                  <Flame className="w-3 h-3" />
                  <span>{friend.streak} days</span>
                </span>
                <span className={friend.isOnline ? 'text-green-600' : 'text-gray-500'}>
                  {friend.lastActive}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {friend.relationship === 'friend' && (
                <button
                  onClick={() => handleFriendAction(friend.id, 'message')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
              {friend.relationship === 'pending' && (
                <button
                  onClick={() => handleFriendAction(friend.id, 'accept')}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Accept
                </button>
              )}
              <button 
                className="p-2 text-gray-400 hover:text-gray-600"
                title="More options"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Social Feed Component
const SocialFeed: React.FC = () => {
  const [posts] = useState(mockFeedPosts);
  const [newPost, setNewPost] = useState('');

  const handleLike = (postId: number) => {
    console.log(`Liked post ${postId}`);
  };

  const handleComment = (postId: number) => {
    console.log(`Comment on post ${postId}`);
  };

  const handleShare = (postId: number) => {
    console.log(`Shared post ${postId}`);
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      console.log('Creating new post:', newPost);
      setNewPost('');
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'workout': return <Dumbbell className="w-4 h-4 text-blue-500" />;
      case 'meal': return <Utensils className="w-4 h-4 text-green-500" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
            🎯
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind? Share your health journey..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-2">
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Add image"
                  aria-label="Add image"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Take photo"
                  aria-label="Take photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
              {post.user.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-800">{post.user.name}</h4>
                <span className="text-sm text-gray-500">{post.user.username}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{post.timestamp}</span>
                {getPostTypeIcon(post.type)}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Level {post.user.level}</span>
              </div>
            </div>
            <button 
              className="p-2 text-gray-400 hover:text-gray-600"
              title="More options"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <p className="text-gray-800 mb-4">{post.content}</p>

          {post.image && (
            <div className="mb-4">
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          )}

          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-2 ${
                  post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                } transition-colors`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes}</span>
              </button>
              <button
                onClick={() => handleComment(post.id)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{post.comments}</span>
              </button>
              <button
                onClick={() => handleShare(post.id)}
                className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">{post.shares}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Team Challenges Component
const TeamChallenges: React.FC = () => {
  const [challenges] = useState(mockTeamChallenges);

  const handleJoinTeam = (teamId: number) => {
    console.log(`Joining team ${teamId}`);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Team Challenges</h3>
        <button className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Users className="w-4 h-4" />
          <span>Create Team</span>
        </button>
      </div>

      <div className="space-y-4">
        {challenges.map((team) => (
          <div key={team.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-800">{team.name}</h4>
                <p className="text-sm text-gray-600">{team.description}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Level {team.level}</span>
                <div className="text-sm text-gray-600">
                  {team.members}/{team.maxMembers} members
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Current Challenge: {team.currentChallenge.name}
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                {team.currentChallenge.description}
              </p>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Progress</span>
                <span>{team.currentChallenge.progress}%</span>
              </div>
              <AnimatedProgressBar
                progress={team.currentChallenge.progress}
                maxValue={100}
                currentValue={team.currentChallenge.progress}
                color="#10B981"
                height={6}
                showLabel={false}
                showPercentage={false}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Ends: {team.currentChallenge.endDate}
              </div>
              {!team.isJoined ? (
                <button
                  onClick={() => handleJoinTeam(team.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Join Team
                </button>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                  Joined
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Leaderboard Component
const Leaderboard: React.FC = () => {
  const [leaderboard] = useState(mockLeaderboard);
  const [selectedCategory, setSelectedCategory] = useState('weekly');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="w-5 h-5 text-gray-500 text-sm font-bold">{rank}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Trophy className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Leaderboard</h3>
            <p className="text-sm text-gray-600">Community rankings</p>
          </div>
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Select category"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="space-y-3">
        {leaderboard.map((player) => (
          <div
            key={player.rank}
            className={`flex items-center space-x-4 p-3 rounded-lg ${
              player.isCurrentUser 
                ? 'bg-blue-50 border-2 border-blue-200' 
                : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center w-8">
              {getRankIcon(player.rank)}
            </div>
            
            <div className="text-2xl">{player.avatar}</div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className={`font-medium ${
                  player.isCurrentUser ? 'text-blue-800' : 'text-gray-800'
                }`}>
                  {player.name}
                </h4>
                {player.isCurrentUser && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Level {player.level}</span>
                <span>{player.xp} XP</span>
                <span className="flex items-center space-x-1">
                  <Flame className="w-3 h-3" />
                  <span>{player.streak} days</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Social Community Page
const SocialCommunityPage: React.FC = () => {
  const progress = useProgress();
  const userProfile = useUserProfile();
  const { isLoading, error } = useNutriStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Social Community</h1>
              <p className="text-blue-200 text-sm">
                Connect, compete, and grow together with your health community
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">Welcome, {userProfile.userName}</p>
              <p className="text-sm">Level {progress.level} • {progress.coins} coins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top Row - Profile and Friends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserProfile />
          <FriendsList />
        </div>

        {/* Social Feed */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <SocialFeed />
        </div>

        {/* Bottom Row - Team Challenges and Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamChallenges />
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default SocialCommunityPage;
