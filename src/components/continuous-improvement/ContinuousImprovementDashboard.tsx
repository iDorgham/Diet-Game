/**
 * Level 5: Continuous Improvement Dashboard
 * Advanced dashboard for monitoring and managing continuous improvement features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Shield, 
  Activity, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ContinuousImprovementData {
  isRunning: boolean;
  config: {
    federatedLearning: { enabled: boolean };
    automatedOptimization: { enabled: boolean };
    predictiveAnalytics: { enabled: boolean };
    adaptiveUI: { enabled: boolean };
    anomalyDetection: { enabled: boolean };
  };
  insights: {
    totalImprovements: number;
    recentImprovements: any[];
    federatedLearning: {
      models: string[];
      participants: number;
    };
    predictiveAnalytics: {
      models: string[];
      averageConfidence: number;
    };
    automatedOptimization: {
      strategies: string[];
      lastOptimization: number;
    };
  };
}

export const ContinuousImprovementDashboard: React.FC = () => {
  const [data, setData] = useState<ContinuousImprovementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchContinuousImprovementData();
    const interval = setInterval(fetchContinuousImprovementData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchContinuousImprovementData = async () => {
    try {
      const response = await fetch('/api/continuous-improvement/insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch continuous improvement data');
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = async (action: 'start' | 'stop') => {
    try {
      const response = await fetch(`/api/continuous-improvement/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} continuous improvement service`);
      }

      await fetchContinuousImprovementData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTriggerOptimization = async () => {
    try {
      const response = await fetch('/api/continuous-improvement/automated-optimization/trigger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to trigger optimization');
      }

      await fetchContinuousImprovementData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
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
        <AlertDescription>No continuous improvement data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Level 5: Continuous Improvement</h1>
          <p className="text-gray-600 mt-2">
            Advanced AI-powered continuous improvement with federated learning, automated optimization, and predictive analytics
          </p>
        </div>
        <div className="flex space-x-2">
          {data.isRunning ? (
            <Button
              variant="destructive"
              onClick={() => handleServiceToggle('stop')}
              className="flex items-center space-x-2"
            >
              <Pause className="h-4 w-4" />
              <span>Stop Service</span>
            </Button>
          ) : (
            <Button
              onClick={() => handleServiceToggle('start')}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Start Service</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleTriggerOptimization}
            className="flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Trigger Optimization</span>
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Federated Learning</p>
                <Badge variant={data.config.federatedLearning.enabled ? "default" : "secondary"}>
                  {data.config.federatedLearning.enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Auto Optimization</p>
                <Badge variant={data.config.automatedOptimization.enabled ? "default" : "secondary"}>
                  {data.config.automatedOptimization.enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Predictive Analytics</p>
                <Badge variant={data.config.predictiveAnalytics.enabled ? "default" : "secondary"}>
                  {data.config.predictiveAnalytics.enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Adaptive UI</p>
                <Badge variant={data.config.adaptiveUI.enabled ? "default" : "secondary"}>
                  {data.config.adaptiveUI.enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Anomaly Detection</p>
                <Badge variant={data.config.anomalyDetection.enabled ? "default" : "secondary"}>
                  {data.config.anomalyDetection.enabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="federated">Federated Learning</TabsTrigger>
          <TabsTrigger value="optimization">Auto Optimization</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="adaptive">Adaptive UI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Key Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Total Improvements</span>
                    <span className="font-medium">{data.insights.totalImprovements}</span>
                  </div>
                  <Progress value={Math.min(100, (data.insights.totalImprovements / 1000) * 100)} className="mt-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Federated Learning Participants</span>
                    <span className="font-medium">{data.insights.federatedLearning.participants}</span>
                  </div>
                  <Progress value={Math.min(100, (data.insights.federatedLearning.participants / 100) * 100)} className="mt-1" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Prediction Confidence</span>
                    <span className="font-medium">{(data.insights.predictiveAnalytics.averageConfidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={data.insights.predictiveAnalytics.averageConfidence * 100} className="mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Improvements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.insights.recentImprovements.slice(0, 5).map((improvement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{improvement.type}</p>
                        <p className="text-xs text-gray-600">{improvement.metric}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(improvement.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="federated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Federated Learning Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Active Models</h4>
                  <div className="space-y-2">
                    {data.insights.federatedLearning.models.map((model, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Participants</h4>
                  <p className="text-2xl font-bold text-blue-600">{data.insights.federatedLearning.participants}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Automated Optimization</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Active Strategies</h4>
                  <div className="space-y-2">
                    {data.insights.automatedOptimization.strategies.map((strategy, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Last Optimization</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(data.insights.automatedOptimization.lastOptimization).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Predictive Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Active Models</h4>
                  <div className="space-y-2">
                    {data.insights.predictiveAnalytics.models.map((model, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Average Confidence</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {(data.insights.predictiveAnalytics.averageConfidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adaptive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Adaptive UI</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Adaptive UI features are being learned from user behavior patterns</p>
                <p className="text-sm text-gray-500 mt-2">
                  The system automatically adapts UI elements based on user preferences and usage patterns
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContinuousImprovementDashboard;
