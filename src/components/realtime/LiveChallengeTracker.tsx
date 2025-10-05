/**
 * LiveChallengeTracker Component
 * Real-time challenge tracking and progress updates
 * Phase 13-14: Real-time Features
 */

import React, { useState, useEffect } from 'react';
import { useRealtimeService } from '../../hooks/useRealtimeService';
import { toast } from 'react-hot-toast';

interface ChallengeParticipant {
  userId: string;
  username: string;
  progress: number;
  score: number;
  isCompleted: boolean;
  completionTime?: string;
}

interface ChallengeProgress {
  userId: string;
  username: string;
  challengeId: string;
  progress: number;
  score: number;
  timestamp: string;
}

interface ChallengeCompletion {
  userId: string;
  username: string;
  challengeId: string;
  finalScore: number;
  completionTime: number;
  timestamp: string;
}

interface LiveChallengeTrackerProps {
  challengeId: string;
  challengeName: string;
  challengeType: 'daily' | 'weekly' | 'team' | 'special';
  currentUserId: string;
  currentUsername: string;
  onProgressUpdate?: (progress: ChallengeProgress) => void;
  onChallengeComplete?: (completion: ChallengeCompletion) => void;
  className?: string;
}

export const LiveChallengeTracker: React.FC<LiveChallengeTrackerProps> = ({
  challengeId,
  challengeName,
  challengeType,
  currentUserId,
  currentUsername,
  onProgressUpdate,
  onChallengeComplete,
  className = ''
}) => {
  const [participants, setParticipants] = useState<Map<string, ChallengeParticipant>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ChallengeParticipant[]>([]);
  
  const realtimeService = useRealtimeService();

  // Join challenge on mount
  useEffect(() => {
    if (realtimeService && challengeId) {
      realtimeService.joinChallenge(challengeId);
      setIsConnected(true);
      setIsParticipating(true);
    }

    return () => {
      if (realtimeService) {
        realtimeService.leaveChallenge(challengeId);
      }
    };
  }, [realtimeService, challengeId]);

  // Set up event listeners
  useEffect(() => {
    if (!realtimeService) return;

    const handleParticipantJoined = (data: { userId: string; username: string; challengeId: string }) => {
      if (data.challengeId === challengeId) {
        setParticipants(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, {
            userId: data.userId,
            username: data.username,
            progress: 0,
            score: 0,
            isCompleted: false
          });
          return newMap;
        });

        if (data.userId !== currentUserId) {
          toast.info(`${data.username} joined the challenge`, {
            duration: 3000,
            position: 'top-right'
          });
        }
      }
    };

    const handleProgressUpdate = (data: ChallengeProgress) => {
      if (data.challengeId === challengeId) {
        setParticipants(prev => {
          const newMap = new Map(prev);
          const participant = newMap.get(data.userId);
          if (participant) {
            newMap.set(data.userId, {
              ...participant,
              progress: data.progress,
              score: data.score
            });
          }
          return newMap;
        });

        // Update current user's progress
        if (data.userId === currentUserId) {
          setCurrentProgress(data.progress);
          setCurrentScore(data.score);
          onProgressUpdate?.(data);
        }

        // Update leaderboard
        updateLeaderboard();
      }
    };

    const handleChallengeCompleted = (data: ChallengeCompletion) => {
      if (data.challengeId === challengeId) {
        setParticipants(prev => {
          const newMap = new Map(prev);
          const participant = newMap.get(data.userId);
          if (participant) {
            newMap.set(data.userId, {
              ...participant,
              progress: 100,
              score: data.finalScore,
              isCompleted: true,
              completionTime: data.timestamp
            });
          }
          return newMap;
        });

        if (data.userId === currentUserId) {
          setIsCompleted(true);
          setCurrentProgress(100);
          setCurrentScore(data.finalScore);
          onChallengeComplete?.(data);
        }

        toast.success(`${data.username} completed the challenge!`, {
          duration: 5000,
          position: 'top-right'
        });

        updateLeaderboard();
      }
    };

    const handleParticipantLeft = (data: { userId: string; username: string; challengeId: string }) => {
      if (data.challengeId === challengeId) {
        setParticipants(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });

        if (data.userId !== currentUserId) {
          toast.info(`${data.username} left the challenge`, {
            duration: 3000,
            position: 'top-right'
          });
        }
      }
    };

    const handleConnectionStatus = (status: boolean) => {
      setIsConnected(status);
      if (!status) {
        toast.error('Challenge connection lost. Attempting to reconnect...', {
          duration: 5000,
          position: 'top-center'
        });
      } else {
        toast.success('Challenge reconnected successfully', {
          duration: 2000,
          position: 'top-center'
        });
      }
    };

    // Subscribe to events
    realtimeService.subscribe('challenge:participant_joined', handleParticipantJoined);
    realtimeService.subscribe('challenge:progress_update', handleProgressUpdate);
    realtimeService.subscribe('challenge:completed', handleChallengeCompleted);
    realtimeService.subscribe('challenge:participant_left', handleParticipantLeft);
    realtimeService.subscribe('connection_status', handleConnectionStatus);

    return () => {
      realtimeService.unsubscribe('challenge:participant_joined', handleParticipantJoined);
      realtimeService.unsubscribe('challenge:progress_update', handleProgressUpdate);
      realtimeService.unsubscribe('challenge:completed', handleChallengeCompleted);
      realtimeService.unsubscribe('challenge:participant_left', handleParticipantLeft);
      realtimeService.unsubscribe('connection_status', handleConnectionStatus);
    };
  }, [realtimeService, challengeId, currentUserId, onProgressUpdate, onChallengeComplete]);

  const updateLeaderboard = () => {
    const participantsArray = Array.from(participants.values())
      .sort((a, b) => {
        // Sort by completion status first, then by score
        if (a.isCompleted && !b.isCompleted) return -1;
        if (!a.isCompleted && b.isCompleted) return 1;
        return b.score - a.score;
      });
    
    setLeaderboard(participantsArray);
  };

  const handleProgressSubmit = (progress: number, score: number) => {
    if (!realtimeService || !isConnected || isCompleted) return;

    realtimeService.updateChallengeProgress(challengeId, progress, score);
  };

  const handleChallengeComplete = (finalScore: number) => {
    if (!realtimeService || !isConnected || isCompleted) return;

    const completionTime = Date.now();
    realtimeService.completeChallenge(challengeId, finalScore, completionTime);
  };

  const getChallengeTypeIcon = () => {
    switch (challengeType) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'team': return '👥';
      case 'special': return '⭐';
      default: return '🏆';
    }
  };

  const getChallengeTypeColor = () => {
    switch (challengeType) {
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-purple-100 text-purple-800';
      case 'team': return 'bg-green-100 text-green-800';
      case 'special': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatCompletionTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Challenge Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getChallengeTypeIcon()}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{challengeName}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getChallengeTypeColor()}`}>
                  {challengeType}
                </span>
                <span className="text-sm text-gray-500">
                  {participants.size} participant{participants.size !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Progress */}
      {isParticipating && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{currentProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(currentProgress)}`}
                  style={{ width: `${Math.min(currentProgress, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Score</span>
                <span className="text-sm text-gray-500">{currentScore.toLocaleString()}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentScore.toLocaleString()}</div>
            </div>
          </div>

          {!isCompleted && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleProgressSubmit(Math.min(currentProgress + 10, 100), currentScore + 100)}
                disabled={!isConnected || isCompleted}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update Progress
              </button>
              
              {currentProgress >= 100 && (
                <button
                  onClick={() => handleChallengeComplete(currentScore)}
                  disabled={!isConnected || isCompleted}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Complete Challenge
                </button>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-green-800 font-medium">Challenge Completed!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Leaderboard */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Leaderboard</h3>
        
        {leaderboard.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p>No participants yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((participant, index) => (
              <div
                key={participant.userId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  participant.userId === currentUserId
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">
                      {participant.username}
                      {participant.userId === currentUserId && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    
                    {participant.isCompleted && participant.completionTime && (
                      <div className="text-xs text-gray-500">
                        Completed at {formatCompletionTime(participant.completionTime)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {participant.score.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {participant.progress}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChallengeTracker;
