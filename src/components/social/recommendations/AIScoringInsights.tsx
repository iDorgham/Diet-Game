/**
 * AI Scoring Insights Component
 * Displays AI scoring details, algorithm performance, and accuracy metrics
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  BarChart3,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Award,
  Clock,
  Users,
  Star
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';
import { Tooltip } from '../../ui/Tooltip';

interface AIScoringInsightsProps {
  recommendation: any;
  showDetails?: boolean;
  compact?: boolean;
}

interface AlgorithmScore {
  name: string;
  score: number;
  confidence: number;
  weight: number;
  description: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
}

interface AccuracyMetrics {
  overall: number;
  byType: {
    friends: number;
    teams: number;
    content: number;
    mentorship: number;
  };
  byAlgorithm: {
    deepLearning: number;
    collaborativeFiltering: number;
    contentBased: number;
    socialGraph: number;
    temporal: number;
    behavioral: number;
  };
  lastUpdated: string;
  totalRecommendations: number;
  acceptedRecommendations: number;
}

export function AIScoringInsights({ 
  recommendation, 
  showDetails = true, 
  compact = false 
}: AIScoringInsightsProps) {
  const [expanded, setExpanded] = useState(false);
  const [accuracyMetrics, setAccuracyMetrics] = useState<AccuracyMetrics | null>(null);
  const [algorithmScores, setAlgorithmScores] = useState<AlgorithmScore[]>([]);

  useEffect(() => {
    // Load accuracy metrics and algorithm scores
    loadAccuracyData();
  }, [recommendation]);

  const loadAccuracyData = async () => {
    try {
      // Simulate API call to get accuracy metrics
      const mockAccuracyMetrics: AccuracyMetrics = {
        overall: 0.87,
        byType: {
          friends: 0.89,
          teams: 0.85,
          content: 0.88,
          mentorship: 0.84
        },
        byAlgorithm: {
          deepLearning: 0.91,
          collaborativeFiltering: 0.86,
          contentBased: 0.83,
          socialGraph: 0.88,
          temporal: 0.79,
          behavioral: 0.85
        },
        lastUpdated: new Date().toISOString(),
        totalRecommendations: 15420,
        acceptedRecommendations: 13415
      };

      const mockAlgorithmScores: AlgorithmScore[] = [
        {
          name: 'Deep Learning',
          score: recommendation.deepLearningScore || 0.85,
          confidence: 0.91,
          weight: 0.35,
          description: 'Neural network analysis of user patterns',
          trend: 'up',
          icon: Brain
        },
        {
          name: 'Collaborative Filtering',
          score: recommendation.collaborativeScore || 0.78,
          confidence: 0.86,
          weight: 0.25,
          description: 'Similar user behavior analysis',
          trend: 'stable',
          icon: Users
        },
        {
          name: 'Content-Based',
          score: recommendation.contentScore || 0.82,
          confidence: 0.83,
          weight: 0.20,
          description: 'Interest and goal alignment analysis',
          trend: 'up',
          icon: Target
        },
        {
          name: 'Social Graph',
          score: recommendation.socialGraphScore || 0.75,
          confidence: 0.88,
          weight: 0.10,
          description: 'Network position and influence analysis',
          trend: 'stable',
          icon: Activity
        },
        {
          name: 'Temporal',
          score: recommendation.temporalScore || 0.68,
          confidence: 0.79,
          weight: 0.05,
          description: 'Time-based pattern analysis',
          trend: 'down',
          icon: Clock
        },
        {
          name: 'Behavioral',
          score: recommendation.behavioralScore || 0.81,
          confidence: 0.85,
          weight: 0.05,
          description: 'Behavior pattern similarity analysis',
          trend: 'up',
          icon: Zap
        }
      ];

      setAccuracyMetrics(mockAccuracyMetrics);
      setAlgorithmScores(mockAlgorithmScores);
    } catch (error) {
      console.error('Error loading accuracy data:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.7) return 'Medium';
    if (confidence >= 0.6) return 'Low';
    return 'Very Low';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Tooltip content="AI Scoring Details">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="p-1"
          >
            <Brain className="h-4 w-4 text-blue-600" />
          </Button>
        </Tooltip>
        
        <div className="flex items-center space-x-1">
          <Badge className={getScoreColor(recommendation.finalScore || recommendation.confidence || 0.5)}>
            {Math.round((recommendation.finalScore || recommendation.confidence || 0.5) * 100)}%
          </Badge>
          {recommendation.algorithm && (
            <Badge variant="outline" className="text-xs">
              {recommendation.algorithm}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Scoring Insights</h3>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overall Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall AI Score</span>
          <Badge className={getScoreColor(recommendation.finalScore || recommendation.confidence || 0.5)}>
            {Math.round((recommendation.finalScore || recommendation.confidence || 0.5) * 100)}%
          </Badge>
        </div>
        <Progress 
          value={(recommendation.finalScore || recommendation.confidence || 0.5) * 100} 
          className="h-2"
        />
      </div>

      {/* Algorithm Breakdown */}
      <div className="space-y-3">
        {algorithmScores.map((algorithm, index) => {
          const IconComponent = algorithm.icon;
          return (
            <motion.div
              key={algorithm.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <IconComponent className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {algorithm.name}
                    </span>
                    {getTrendIcon(algorithm.trend)}
                  </div>
                  <p className="text-xs text-gray-600">{algorithm.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {Math.round(algorithm.score * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {getConfidenceLevel(algorithm.confidence)}
                  </div>
                </div>
                <div className="w-16">
                  <Progress value={algorithm.score * 100} className="h-1" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            {/* Accuracy Metrics */}
            {accuracyMetrics && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Algorithm Performance</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(accuracyMetrics.byAlgorithm).map(([algorithm, accuracy]) => (
                    <div key={algorithm} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-600 capitalize">
                        {algorithm.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge className={getScoreColor(accuracy)}>
                        {Math.round(accuracy * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Factors */}
            {recommendation.improvementFactors && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Improvement Factors</h4>
                <div className="space-y-2">
                  {Object.entries(recommendation.improvementFactors).map(([factor, score]) => (
                    <div key={factor} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 capitalize">
                        {factor.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress value={score * 100} className="w-20 h-1" />
                        <span className="text-xs text-gray-500 w-8">
                          {Math.round(score * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Predictions */}
            {recommendation.individualPredictions && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Model Predictions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(recommendation.individualPredictions).map(([model, prediction]) => (
                    <div key={model} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-600 capitalize">
                        {model.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-xs font-medium text-gray-900">
                        {Math.round(prediction * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning */}
            {recommendation.reasoning && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">AI Reasoning</h4>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  {recommendation.reasoning}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accuracy Confidence */}
      {recommendation.accuracyConfidence && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-gray-600">Accuracy Confidence</span>
            </div>
            <Badge className={getScoreColor(recommendation.accuracyConfidence)}>
              {Math.round(recommendation.accuracyConfidence * 100)}%
            </Badge>
          </div>
        </div>
      )}
    </Card>
  );
}

// Accuracy Dashboard Component
export function AccuracyDashboard() {
  const [metrics, setMetrics] = useState<AccuracyMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccuracyMetrics();
  }, []);

  const loadAccuracyMetrics = async () => {
    try {
      // Simulate API call
      const mockMetrics: AccuracyMetrics = {
        overall: 0.87,
        byType: {
          friends: 0.89,
          teams: 0.85,
          content: 0.88,
          mentorship: 0.84
        },
        byAlgorithm: {
          deepLearning: 0.91,
          collaborativeFiltering: 0.86,
          contentBased: 0.83,
          socialGraph: 0.88,
          temporal: 0.79,
          behavioral: 0.85
        },
        lastUpdated: new Date().toISOString(),
        totalRecommendations: 15420,
        acceptedRecommendations: 13415
      };

      setMetrics(mockMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading accuracy metrics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!metrics) return null;

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Overall Accuracy */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Accuracy</h3>
          <Badge className={getScoreColor(metrics.overall)}>
            {Math.round(metrics.overall * 100)}%
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {metrics.totalRecommendations.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.acceptedRecommendations.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((metrics.acceptedRecommendations / metrics.totalRecommendations) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Acceptance Rate</div>
          </div>
        </div>
      </Card>

      {/* Accuracy by Type */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accuracy by Recommendation Type</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(metrics.byType).map(([type, accuracy]) => (
            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
              </div>
              <Badge className={getScoreColor(accuracy)}>
                {Math.round(accuracy * 100)}%
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Accuracy by Algorithm */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accuracy by Algorithm</h3>
        <div className="space-y-3">
          {Object.entries(metrics.byAlgorithm).map(([algorithm, accuracy]) => (
            <div key={algorithm} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">
                {algorithm.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center space-x-2">
                <Progress value={accuracy * 100} className="w-32 h-2" />
                <span className="text-sm font-medium text-gray-900 w-12">
                  {Math.round(accuracy * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
