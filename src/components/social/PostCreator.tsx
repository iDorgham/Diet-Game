/**
 * Post Creator Component
 * Allows users to create new posts with different types and media
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image, 
  MapPin, 
  Hash, 
  Send, 
  X, 
  Camera,
  Smile,
  BarChart3,
  Trophy,
  Utensils,
  Dumbbell,
  Users,
  MessageCircle
} from 'lucide-react';
import { useCreatePost } from '../../hooks/useSocialQueries';
import { PostType, PostPrivacy } from '../../types/social';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface PostCreatorProps {
  onPostCreated?: () => void;
  placeholder?: string;
  defaultType?: PostType;
  compact?: boolean;
}

const PostCreator: React.FC<PostCreatorProps> = ({ 
  onPostCreated,
  placeholder = "What's on your mind?",
  defaultType = 'general',
  compact = false
}) => {
  const createPostMutation = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>(defaultType);
  const [privacy, setPrivacy] = useState<PostPrivacy>('public');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [location, setLocation] = useState<{ name: string; coordinates: [number, number] } | null>(null);

  const postTypes = [
    { value: 'general', label: 'General', icon: MessageCircle, color: 'bg-blue-100 text-blue-800' },
    { value: 'achievement', label: 'Achievement', icon: Trophy, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'progress', label: 'Progress', icon: BarChart3, color: 'bg-green-100 text-green-800' },
    { value: 'meal', label: 'Meal', icon: Utensils, color: 'bg-orange-100 text-orange-800' },
    { value: 'workout', label: 'Workout', icon: Dumbbell, color: 'bg-purple-100 text-purple-800' },
    { value: 'challenge', label: 'Challenge', icon: Users, color: 'bg-red-100 text-red-800' },
  ] as const;

  const privacyOptions = [
    { value: 'public', label: 'Public', description: 'Everyone can see this' },
    { value: 'friends', label: 'Friends', description: 'Only your friends can see this' },
    { value: 'private', label: 'Private', description: 'Only you can see this' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    try {
      await createPostMutation.mutateAsync({
        content: content.trim(),
        postType,
        privacy,
        mediaUrls,
        tags,
        location,
      });

      // Reset form
      setContent('');
      setMediaUrls([]);
      setTags([]);
      setTagInput('');
      setLocation(null);
      setIsExpanded(false);
      
      onPostCreated?.();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setMediaUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag();
      } else {
        handleSubmit(e);
      }
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            name: 'Current Location',
            coordinates: [position.coords.latitude, position.coords.longitude]
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  if (compact && !isExpanded) {
    return (
      <Card className="p-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Smile className="h-4 w-4 text-gray-500" />
          </div>
          <span className="text-gray-500 flex-1">{placeholder}</span>
          <Button size="sm" variant="outline">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post Type Selection */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {postTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setPostType(type.value as PostType)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  postType === type.value
                    ? type.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Input */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={isExpanded ? 4 : 2}
            onFocus={() => setIsExpanded(true)}
          />
          <div className="absolute bottom-2 right-2 text-sm text-gray-400">
            {content.length}/2000
          </div>
        </div>

        {/* Media Preview */}
        <AnimatePresence>
          {mediaUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-2"
            >
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags..."
              className="flex-1"
              onKeyPress={handleKeyPress}
            />
            <Button type="button" size="sm" onClick={addTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                    title="Remove tag"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">{location.name}</span>
            <button
              type="button"
              onClick={() => setLocation(null)}
              className="text-blue-600 hover:text-blue-800"
              title="Remove location"
              aria-label="Remove location"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4 mr-1" />
              Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Location
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
              className="text-sm border border-gray-200 rounded px-2 py-1"
              title="Post privacy setting"
              aria-label="Post privacy setting"
            >
              {privacyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              disabled={!content.trim() || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                'Posting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default PostCreator;
