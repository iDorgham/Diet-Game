// Advanced API service following Level 303 requirements
// React Query integration with caching, mutations, and real-time updates

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { UserProgress, UserProfile } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nutriquest-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('nutriquest-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskCompletionRequest {
  taskId: number;
  taskType: string;
  streak: number;
  timestamp: number;
}

export interface TaskCompletionResponse {
  rewards: {
    score: number;
    coins: number;
    xp: number;
  };
  levelUp?: {
    newLevel: number;
    bonusCoins: number;
  };
  achievements?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

// API Service Class
export class NutriQuestAPI {
  // User Progress
  static async getUserProgress(userId: string): Promise<UserProgress> {
    const response: AxiosResponse<ApiResponse<UserProgress>> = await apiClient.get(
      `/users/${userId}/progress`
    );
    return response.data.data;
  }

  static async updateUserProgress(
    userId: string, 
    updates: Partial<UserProgress>
  ): Promise<UserProgress> {
    const response: AxiosResponse<ApiResponse<UserProgress>> = await apiClient.patch(
      `/users/${userId}/progress`,
      updates
    );
    return response.data.data;
  }

  // User Profile
  static async getUserProfile(userId: string): Promise<UserProfile> {
    const response: AxiosResponse<ApiResponse<UserProfile>> = await apiClient.get(
      `/users/${userId}/profile`
    );
    return response.data.data;
  }

  static async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const response: AxiosResponse<ApiResponse<UserProfile>> = await apiClient.patch(
      `/users/${userId}/profile`,
      updates
    );
    return response.data.data;
  }

  // Task Management
  static async completeTask(
    userId: string, 
    request: TaskCompletionRequest
  ): Promise<TaskCompletionResponse> {
    const response: AxiosResponse<ApiResponse<TaskCompletionResponse>> = await apiClient.post(
      `/users/${userId}/tasks/complete`,
      request
    );
    return response.data.data;
  }

  static async getDailyTasks(userId: string): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await apiClient.get(
      `/users/${userId}/tasks/daily`
    );
    return response.data.data;
  }

  // Analytics
  static async getUserAnalytics(userId: string, period: 'week' | 'month' | 'year'): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get(
      `/users/${userId}/analytics?period=${period}`
    );
    return response.data.data;
  }

  // Leaderboard
  static async getLeaderboard(limit: number = 10): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await apiClient.get(
      `/leaderboard?limit=${limit}`
    );
    return response.data.data;
  }

  // Health Check
  static async healthCheck(): Promise<{ status: string; timestamp: number }> {
    const response: AxiosResponse<ApiResponse<{ status: string; timestamp: number }>> = 
      await apiClient.get('/health');
    return response.data.data;
  }
}

// React Query Keys
export const queryKeys = {
  userProgress: (userId: string) => ['userProgress', userId],
  userProfile: (userId: string) => ['userProfile', userId],
  dailyTasks: (userId: string) => ['dailyTasks', userId],
  userAnalytics: (userId: string, period: string) => ['userAnalytics', userId, period],
  leaderboard: (limit: number) => ['leaderboard', limit],
  health: () => ['health'],
} as const;

// Mutation Keys
export const mutationKeys = {
  updateProgress: (userId: string) => ['updateProgress', userId],
  updateProfile: (userId: string) => ['updateProfile', userId],
  completeTask: (userId: string) => ['completeTask', userId],
} as const;

// Error Handling Utilities
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: any): APIError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return new APIError(
      data.message || 'Server error occurred',
      status,
      data.code,
      data.details
    );
  } else if (error.request) {
    // Request was made but no response received
    return new APIError('Network error - please check your connection');
  } else {
    // Something else happened
    return new APIError(error.message || 'An unexpected error occurred');
  }
};

// Retry Logic
export const retryRequest = async <T>(
  request: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw handleAPIError(error);
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw handleAPIError(lastError);
};

// Batch Operations
export class BatchAPI {
  private static batchQueue: Array<{
    id: string;
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  private static batchTimeout: NodeJS.Timeout | null = null;
  
  static async addToBatch<T>(
    id: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ id, operation, resolve, reject });
      
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, 100); // 100ms batch window
    });
  }
  
  private static async processBatch() {
    const queue = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimeout = null;
    
    // Process all operations in parallel
    const promises = queue.map(async ({ id, operation, resolve, reject }) => {
      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    await Promise.allSettled(promises);
  }
}

export default NutriQuestAPI;
