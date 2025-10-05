/**
 * Level 5: Predictive Analytics Component
 * Advanced predictive analytics with real-time forecasting and proactive insights
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Brain,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PredictionData {
  modelName: string;
  prediction: {
    value: number;
    confidence: number;
    timestamp: number;
    horizon: number;
  };
  historicalData: Array<{
    timestamp: number;
    value: number;
    predicted?: boolean;
  }>;
  trend: 'up' | 'down' | 'stable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

interface PredictiveAnalyticsData {
  models: string[];
  averageConfidence: number;
  lastPrediction: number;
  predictions: PredictionData[];
  systemInsights: {
    performanceForecast: number;
    userEngagementForecast: number;
    systemLoadForecast: number;
    riskAssessment: number;
  };
}

export const PredictiveAnalytics: React.FC = () => {
  const [data, setData] = useState<PredictiveAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('performance');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    fetchPredictiveAnalyticsData();
    const interval = setInterval(fetchPredictiveAnalyticsData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchPredictiveAnalyticsData = async () => {
    try {
      const response = await fetch('/api/continuous-improvement/predictive-analytics/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictive analytics data');
      }

      const result = await response.json();
      
      // Generate mock prediction data for demonstration
      const mockData: PredictiveAnalyticsData = {
        models: result.data.models,
        averageConfidence: result.data.averageConfidence,
        lastPrediction: result.data.lastPrediction,
        predictions: generateMockPredictions(result.data.models),
        systemInsights: {
          performanceForecast: 0.85,
          userEngagementForecast: 0.72,
          systemLoadForecast: 0.68,
          riskAssessment: 0.15
        }
      };
      
      setData(mockData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPredictions = (models: string[]): PredictionData[] => {
    return models.map(model => {
      const baseValue = Math.random() * 100;
      const trend = Math.random() > 0.5 ? 'up' : 'down';
      const confidence = 0.7 + Math.random() * 0.3;
      
      return {
        modelName: model,
        prediction: {
          value: baseValue,
          confidence,
          timestamp: Date.now(),
          horizon: 24
        },
        historicalData: generateHistoricalData(baseValue, trend),
        trend,
        severity: confidence > 0.9 ? 'high' : confidence > 0.7 ? 'medium' : 'low',
        recommendations: generateRecommendations(model, trend, confidence)
      };
    });
  };

  const generateHistoricalData = (baseValue: number, trend: 'up' | 'down'): Array<{timestamp: number, value: number, predicted?: boolean}> => {
    const data = [];
    const now = Date.now();
    const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = now - (i * 3600000);
      const trendFactor = trend === 'up' ? 1 + (hours - i) * 0.01 : 1 - (hours - i) * 0.01;
      const noise = (Math.random() - 0.5) * 10;
      const value = Math.max(0, baseValue * trendFactor + noise);
      
      data.push({
        timestamp,
        value,
        predicted: i < 6 // Last 6 hours are predictions
      });
    }
    
    return data;
  };

  const generateRecommendations = (model: string, trend: 'up' | 'down', confidence: number): string[] => {
    const recommendations = [];
    
    if (model === 'performance') {
      if (trend === 'down' && confidence > 0.8) {
        recommendations.push('Consider scaling up resources');
        recommendations.push('Optimize database queries');
      } else if (trend === 'up' && confidence > 0.8) {
        recommendations.push('Performance is improving');
        recommendations.push('Monitor for sustained improvement');
      }
    } else if (model === 'userBehavior') {
      if (trend === 'down' && confidence > 0.8) {
        recommendations.push('Launch engagement campaign');
        recommendations.push('Send personalized notifications');
      } else if (trend === 'up' && confidence > 0.8) {
        recommendations.push('User engagement is increasing');
        recommendations.push('Consider new feature releases');
      }
    } else if (model === 'systemLoad') {
      if (trend === 'up' && confidence > 0.8) {
        recommendations.push('Prepare for high load');
        recommendations.push('Scale resources proactively');
      } else if (trend === 'down' && confidence > 0.8) {
        recommendations.push('System load is decreasing');
        recommendations.push('Consider cost optimization');
      }
    }
    
    return recommendations;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const selectedPrediction = data?.predictions.find(p => p.modelName === selectedModel);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No predictive analytics data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
          <p className="text-gray-600 mt-1">
            AI-powered forecasting and proactive system insights
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            aria-label="Select time range for analytics"
            title="Select time range for analytics"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* System Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Forecast</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(data.systemInsights.performanceForecast * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Forecast</p>
                <p className="text-2xl font-bold text-green-600">
                  {(data.systemInsights.userEngagementForecast * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">System Load Forecast</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(data.systemInsights.systemLoadForecast * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Assessment</p>
                <p className="text-2xl font-bold text-red-600">
                  {(data.systemInsights.riskAssessment * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Prediction Models</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.models.map((model) => (
              <Button
                key={model}
                variant={selectedModel === model ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedModel(model)}
              >
                {model.charAt(0).toUpperCase() + model.slice(1)}
              </Button>
            ))}
          </div>

          {selectedPrediction && (
            <div className="space-y-4">
              {/* Prediction Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  {getTrendIcon(selectedPrediction.trend)}
                  <div>
                    <p className="text-sm font-medium">Predicted Value</p>
                    <p className="text-lg font-bold">{selectedPrediction.prediction.value.toFixed(1)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Confidence</p>
                    <p className="text-lg font-bold">
                      {(selectedPrediction.prediction.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Horizon</p>
                    <p className="text-lg font-bold">{selectedPrediction.prediction.horizon}h</p>
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trend Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedPrediction.historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                          formatter={(value: number, name: string) => [value.toFixed(1), name]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {selectedPrediction.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedPrediction.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 rounded-lg bg-blue-50">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm text-blue-800">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Models Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>All Models Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.predictions.map((prediction) => (
              <div key={prediction.modelName} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getTrendIcon(prediction.trend)}
                  <div>
                    <p className="font-medium capitalize">{prediction.modelName}</p>
                    <p className="text-sm text-gray-600">
                      Value: {prediction.prediction.value.toFixed(1)} | 
                      Confidence: {(prediction.prediction.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSeverityColor(prediction.severity)}>
                    {prediction.severity}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedModel(prediction.modelName)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveAnalytics;
