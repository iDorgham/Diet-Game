// Advanced task management component following Level 303 requirements
// Drag & drop, real-time updates, and intelligent task prioritization

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useCompleteTask, useDailyTasks } from '../../hooks/useNutriQueries';
import { useNutriStore, useNutriActions } from '../../store/nutriStore';
import { CheckCircle, Clock, Star, Zap, Target, Flame } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  type: 'MEAL' | 'SHOPPING' | 'COOKING' | 'EXERCISE' | 'WATER' | 'DAILY_CHECKIN' | 'AI_CHAT';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  rewards: {
    score: number;
    coins: number;
    xp: number;
  };
  streak: number;
  isCompleted: boolean;
  scheduledTime?: string;
  category: string;
  tags: string[];
}

interface AdvancedTaskManagerProps {
  userId: string;
  onTaskComplete?: (task: Task) => void;
  onTaskReorder?: (tasks: Task[]) => void;
}

const taskTypeIcons = {
  MEAL: '🍽️',
  SHOPPING: '🛒',
  COOKING: '👨‍🍳',
  EXERCISE: '💪',
  WATER: '💧',
  DAILY_CHECKIN: '✅',
  AI_CHAT: '🤖',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-600',
  medium: 'bg-yellow-100 text-yellow-600',
  hard: 'bg-red-100 text-red-600',
};

const AdvancedTaskManager: React.FC<AdvancedTaskManagerProps> = ({
  userId,
  onTaskComplete,
  onTaskReorder,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'high-priority'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'difficulty' | 'rewards'>('priority');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  
  const { completeTask } = useNutriActions();
  const completeTaskMutation = useCompleteTask(userId);
  const { data: dailyTasks, isLoading } = useDailyTasks(userId);
  
  // Transform API data to our Task interface
  const transformedTasks = useMemo(() => {
    if (!dailyTasks) return [];
    
    return dailyTasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      type: task.type,
      priority: task.priority || 'medium',
      estimatedTime: task.estimatedTime || 30,
      difficulty: task.difficulty || 'medium',
      rewards: {
        score: task.rewards?.score || 0,
        coins: task.rewards?.coins || 0,
        xp: task.rewards?.xp || 0,
      },
      streak: task.streak || 0,
      isCompleted: task.isCompleted || false,
      scheduledTime: task.scheduledTime,
      category: task.category || 'General',
      tags: task.tags || [],
    }));
  }, [dailyTasks]);
  
  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = transformedTasks;
    
    // Apply filter
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(task => !task.isCompleted);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.isCompleted);
        break;
      case 'high-priority':
        filtered = filtered.filter(task => task.priority === 'high' || task.priority === 'urgent');
        break;
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'time':
          return a.estimatedTime - b.estimatedTime;
        case 'difficulty':
          const difficultyOrder = { hard: 3, medium: 2, easy: 1 };
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        case 'rewards':
          return b.rewards.xp - a.rewards.xp;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [transformedTasks, filter, sortBy]);
  
  const handleTaskComplete = useCallback(async (task: Task) => {
    if (task.isCompleted) return;
    
    try {
      await completeTaskMutation.mutateAsync({
        taskId: task.id,
        taskType: task.type,
        streak: task.streak,
        timestamp: Date.now(),
      });
      
      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, isCompleted: true } : t
      ));
      
      onTaskComplete?.(task);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  }, [completeTaskMutation, onTaskComplete]);
  
  const handleTaskReorder = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    onTaskReorder?.(newTasks);
  }, [onTaskReorder]);
  
  const getTaskPriorityScore = (task: Task) => {
    let score = 0;
    
    // Priority weight
    const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
    score += priorityWeights[task.priority] * 10;
    
    // Streak bonus
    score += task.streak * 2;
    
    // Time urgency (shorter tasks get higher priority)
    score += Math.max(0, 60 - task.estimatedTime) / 10;
    
    // Reward value
    score += (task.rewards.xp + task.rewards.score + task.rewards.coins) / 10;
    
    return score;
  };
  
  const TaskCard: React.FC<{ task: Task; index: number }> = ({ task, index }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-xl shadow-lg border-l-4 p-4 transition-all duration-200 hover:shadow-xl ${
        task.isCompleted 
          ? 'opacity-60 border-l-gray-400' 
          : `border-l-${task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'orange' : task.priority === 'medium' ? 'blue' : 'gray'}-500`
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{taskTypeIcons[task.type]}</span>
            <h3 className={`font-semibold ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs"
              >
                <Flame className="w-3 h-3" />
                <span>{task.streak}</span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[task.difficulty]}`}>
              {task.difficulty}
            </span>
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{task.estimatedTime}m</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-green-600">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">+{task.rewards.score}</span>
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">+{task.rewards.xp} XP</span>
            </div>
            <div className="flex items-center space-x-1 text-yellow-600">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">+{task.rewards.coins}</span>
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTaskComplete(task)}
          disabled={task.isCompleted || completeTaskMutation.isPending}
          className={`ml-4 p-2 rounded-full transition-colors ${
            task.isCompleted
              ? 'bg-green-100 text-green-600'
              : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="high-priority">High Priority</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="priority">Sort by Priority</option>
            <option value="time">Sort by Time</option>
            <option value="difficulty">Sort by Difficulty</option>
            <option value="rewards">Sort by Rewards</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
          >
            📋
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
          >
            ⊞
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
          >
            📊
          </button>
        </div>
      </div>
      
      {/* Task List */}
      <Reorder.Group
        axis="y"
        values={filteredAndSortedTasks}
        onReorder={handleTaskReorder}
        className="space-y-4"
      >
        <AnimatePresence>
          {filteredAndSortedTasks.map((task, index) => (
            <Reorder.Item
              key={task.id}
              value={task}
              className="cursor-move"
            >
              <TaskCard task={task} index={index} />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
      
      {filteredAndSortedTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No tasks found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later for new tasks.</p>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedTaskManager;
