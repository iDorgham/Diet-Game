// Profile Page - User settings, preferences, and account management
// Following the overall Diet Game specifications

import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  Activity,
  Heart,
  Brain,
  Zap,
  Star,
  Trophy,
  Award,
  Flame,
  Coins,
  BarChart3,
  TrendingUp,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useNutriStore, useProgress, useUserProfile } from '../store/nutriStore';
import AnimatedProgressBar from '../components/animations/AnimatedProgressBar';

// Mock user data
const mockUserData = {
  personalInfo: {
    firstName: 'Yasser',
    lastName: 'Ahmed',
    email: 'yasser@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    location: 'New York, NY',
    timezone: 'EST (UTC-5)'
  },
  healthInfo: {
    height: '5\'10"',
    weight: '175 lbs',
    bodyType: 'Mesomorph',
    activityLevel: 'Moderately Active',
    dietType: 'Keto Diet',
    healthGoals: ['Weight Loss', 'Muscle Gain', 'Better Energy'],
    medicalConditions: [],
    allergies: ['Nuts', 'Shellfish'],
    medications: []
  },
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
      mealReminders: true,
      workoutReminders: true,
      achievementAlerts: true,
      socialUpdates: true,
      weeklyReports: true
    },
    privacy: {
      profileVisibility: 'Friends',
      activitySharing: true,
      leaderboardParticipation: true,
      dataSharing: false,
      analyticsOptIn: true
    },
    app: {
      theme: 'Light',
      language: 'English',
      units: 'Imperial',
      timeFormat: '12-hour',
      autoSync: true,
      offlineMode: true
    }
  },
  stats: {
    joinDate: '2024-01-01',
    totalDaysActive: 25,
    totalMealsLogged: 67,
    totalWorkoutsCompleted: 23,
    totalXP: 150,
    currentLevel: 3,
    longestStreak: 7,
    currentStreak: 3,
    achievements: 8,
    coins: 2000
  }
};

// Personal Information Component
const PersonalInformation: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockUserData.personalInfo);

  const handleSave = () => {
    // Save logic here
    console.log('Saving personal info:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(mockUserData.personalInfo);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            <p className="text-sm text-gray-600">Manage your personal details</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Enter your first name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800">{formData.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Enter your last name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800">{formData.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800">{formData.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800">{formData.phone}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                placeholder="Select your date of birth"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800">{formData.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            {isEditing ? (
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Select gender"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <p className="text-gray-800">{formData.gender}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Enter your location"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800">{formData.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <p className="text-gray-800">{formData.timezone}</p>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Health Information Component
const HealthInformation: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockUserData.healthInfo);

  const handleSave = () => {
    console.log('Saving health info:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(mockUserData.healthInfo);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Heart className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Health Information</h3>
            <p className="text-sm text-gray-600">Your health profile and goals</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                placeholder="Enter your height"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800">{formData.height}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                placeholder="Enter your weight"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800">{formData.weight}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Type</label>
            {isEditing ? (
              <select
                value={formData.bodyType}
                onChange={(e) => setFormData({...formData, bodyType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-label="Select body type"
              >
                <option value="Ectomorph">Ectomorph</option>
                <option value="Mesomorph">Mesomorph</option>
                <option value="Endomorph">Endomorph</option>
              </select>
            ) : (
              <p className="text-gray-800">{formData.bodyType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
            {isEditing ? (
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({...formData, activityLevel: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-label="Select activity level"
              >
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Moderately Active">Moderately Active</option>
                <option value="Very Active">Very Active</option>
                <option value="Extremely Active">Extremely Active</option>
              </select>
            ) : (
              <p className="text-gray-800">{formData.activityLevel}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diet Type</label>
            {isEditing ? (
              <select
                value={formData.dietType}
                onChange={(e) => setFormData({...formData, dietType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                aria-label="Select diet type"
              >
                <option value="Keto Diet">Keto Diet</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Paleo">Paleo</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Balanced">Balanced</option>
              </select>
            ) : (
              <p className="text-gray-800">{formData.dietType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Health Goals</label>
            {isEditing ? (
              <div className="space-y-2">
                {['Weight Loss', 'Muscle Gain', 'Better Energy', 'Improved Sleep', 'Stress Reduction'].map((goal) => (
                  <label key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.healthGoals.includes(goal)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, healthGoals: [...formData.healthGoals, goal]});
                        } else {
                          setFormData({...formData, healthGoals: formData.healthGoals.filter(g => g !== goal)});
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.healthGoals.map((goal, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {goal}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.allergies.join(', ')}
                onChange={(e) => setFormData({...formData, allergies: e.target.value.split(', ').filter(a => a.trim())})}
                placeholder="Enter allergies separated by commas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                    {allergy}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Preferences Component
const Preferences: React.FC = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [preferences, setPreferences] = useState(mockUserData.preferences);

  const handlePreferenceChange = (category: string, key: string, value: boolean) => {
    setPreferences({
      ...preferences,
      [category]: {
        ...preferences[category as keyof typeof preferences],
        [key]: value
      }
    });
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'app', label: 'App Settings', icon: Settings }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Settings className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Preferences</h3>
          <p className="text-sm text-gray-600">Customize your experience</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Notification Preferences</h4>
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handlePreferenceChange('notifications', key, e.target.checked)}
                    className="sr-only peer"
                    aria-label={`Toggle ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Privacy Settings</h4>
            {Object.entries(preferences.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                {typeof value === 'boolean' ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handlePreferenceChange('privacy', key, e.target.checked)}
                      className="sr-only peer"
                      aria-label={`Toggle ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                ) : (
                  <select
                    value={value}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, [key]: e.target.value }
                    })}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label={`Select ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                  >
                    <option value="Public">Public</option>
                    <option value="Friends">Friends</option>
                    <option value="Private">Private</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'app' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">App Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select
                  value={preferences.app.theme}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    app: { ...preferences.app, theme: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select theme"
                >
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                  <option value="Auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={preferences.app.language}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    app: { ...preferences.app, language: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select language"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                <select
                  value={preferences.app.units}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    app: { ...preferences.app, units: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select units"
                >
                  <option value="Imperial">Imperial</option>
                  <option value="Metric">Metric</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                <select
                  value={preferences.app.timeFormat}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    app: { ...preferences.app, timeFormat: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select time format"
                >
                  <option value="12-hour">12-hour</option>
                  <option value="24-hour">24-hour</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(preferences.app).filter(([key]) => typeof preferences.app[key as keyof typeof preferences.app] === 'boolean').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        app: { ...preferences.app, [key]: e.target.checked }
                      })}
                      className="sr-only peer"
                      aria-label={`Toggle ${key.replace(/([A-Z])/g, ' $1').trim()}`}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Statistics Component
const Statistics: React.FC = () => {
  const [stats] = useState(mockUserData.stats);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-lg">
          <BarChart3 className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Your Statistics</h3>
          <p className="text-sm text-gray-600">Track your progress and achievements</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.totalDaysActive}</div>
          <div className="text-sm text-gray-600">Days Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.totalMealsLogged}</div>
          <div className="text-sm text-gray-600">Meals Logged</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.totalWorkoutsCompleted}</div>
          <div className="text-sm text-gray-600">Workouts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.achievements}</div>
          <div className="text-sm text-gray-600">Achievements</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Current Level</span>
            <span className="text-lg font-bold text-blue-600">Level {stats.currentLevel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total XP</span>
            <span className="text-lg font-bold text-green-600">{stats.totalXP}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Current Streak</span>
            <span className="text-lg font-bold text-orange-600">{stats.currentStreak} days</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Longest Streak</span>
            <span className="text-lg font-bold text-red-600">{stats.longestStreak} days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Coins Earned</span>
            <span className="text-lg font-bold text-yellow-600">{stats.coins}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Member Since</span>
            <span className="text-lg font-bold text-gray-600">{stats.joinDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Data Management Component
const DataManagement: React.FC = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = () => {
    console.log('Exporting user data...');
    // Export logic here
  };

  const handleImportData = () => {
    console.log('Importing user data...');
    // Import logic here
  };

  const handleDeleteAccount = () => {
    console.log('Deleting account...');
    setShowDeleteConfirm(false);
    // Delete logic here
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-red-100 rounded-lg">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Data Management</h3>
          <p className="text-sm text-gray-600">Manage your data and account</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">Export Data</h4>
            <p className="text-sm text-gray-600">Download a copy of your data</p>
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-800">Import Data</h4>
            <p className="text-sm text-gray-600">Import data from another app</p>
          </div>
          <button
            onClick={handleImportData}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
          <div>
            <h4 className="font-medium text-red-800">Delete Account</h4>
            <p className="text-sm text-red-600">Permanently delete your account and all data</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Delete Account</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, progress, and achievements.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Profile Page
const ProfilePage: React.FC = () => {
  const progress = useProgress();
  const userProfile = useUserProfile();
  const { isLoading, error } = useNutriStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
              <h1 className="text-2xl font-bold">Profile & Settings</h1>
              <p className="text-blue-200 text-sm">
                Manage your personal information, preferences, and account settings
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
        {/* Personal Information */}
        <PersonalInformation />

        {/* Health Information */}
        <HealthInformation />

        {/* Preferences */}
        <Preferences />

        {/* Statistics */}
        <Statistics />

        {/* Data Management */}
        <DataManagement />
      </div>
    </div>
  );
};

export default ProfilePage;
