// Firebase service layer following docs/architecture/data-flow.md
// Level 202: Integration & Testing

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, DocumentData } from 'firebase/firestore';
import { UserProgress, UserProfile } from '../types';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// App ID for Firestore paths
const APP_ID = 'diet-planner-demo';

/**
 * Authentication service
 * Following data-flow.md sequence #1
 */
export class AuthService {
  static async signInAnonymously(): Promise<User> {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      throw new Error('Authentication failed');
    }
  }

  static async signInWithToken(token: string): Promise<User> {
    try {
      const result = await signInWithCustomToken(auth, token);
      return result.user;
    } catch (error) {
      console.error('Token sign-in failed:', error);
      throw new Error('Authentication failed');
    }
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

/**
 * Firestore service for user data
 * Following data-flow.md sequence #2
 */
export class FirestoreService {
  private static getUserDocPath(userId: string, collection: string) {
    return `artifacts/${APP_ID}/users/${userId}/data/${collection}`;
  }

  /**
   * Get user progress data
   */
  static async getUserProgress(userId: string): Promise<UserProgress> {
    try {
      const docRef = doc(db, this.getUserDocPath(userId, 'progress'));
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProgress;
      } else {
        // Return default progress for new users
        return {
          score: 10,
          coins: 2000,
          recipesUnlocked: 10,
          hasClaimedGift: false,
          level: 1,
          currentXP: 0,
        };
      }
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw new Error('Failed to load user progress');
    }
  }

  /**
   * Get user profile data
   */
  static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const docRef = doc(db, this.getUserDocPath(userId, 'profile'));
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        // Return default profile for new users
        return {
          userName: 'Yasser',
          dietType: 'Keto Diet',
          bodyType: 'Mesomorph',
          weight: '175 lbs'
        };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to load user profile');
    }
  }

  /**
   * Update user progress with retry logic
   */
  static async updateUserProgress(
    userId: string, 
    updates: Partial<UserProgress>,
    retries: number = 3
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const docRef = doc(db, this.getUserDocPath(userId, 'progress'));
        await setDoc(docRef, updates, { merge: true });
        return;
      } catch (error) {
        console.warn(`Update attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          throw new Error('Failed to update user progress after retries');
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Real-time progress listener
   */
  static subscribeToUserProgress(
    userId: string,
    callback: (progress: UserProgress) => void,
    onError?: (error: Error) => void
  ) {
    const docRef = doc(db, this.getUserDocPath(userId, 'progress'));
    
    return onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as UserProgress);
        }
      },
      (error) => {
        console.error('Progress listener error:', error);
        onError?.(new Error('Failed to sync progress'));
      }
    );
  }

  /**
   * Real-time profile listener
   */
  static subscribeToUserProfile(
    userId: string,
    callback: (profile: UserProfile) => void,
    onError?: (error: Error) => void
  ) {
    const docRef = doc(db, this.getUserDocPath(userId, 'profile'));
    
    return onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as UserProfile);
        }
      },
      (error) => {
        console.error('Profile listener error:', error);
        onError?.(new Error('Failed to sync profile'));
      }
    );
  }
}

/**
 * Task completion service
 * Following data-flow.md sequence #2
 */
export class TaskService {
  /**
   * Complete a task and update progress
   */
  static async completeTask(
    userId: string,
    taskId: number,
    scoreReward: number,
    coinReward: number,
    xpReward: number
  ): Promise<void> {
    try {
      // Get current progress
      const currentProgress = await FirestoreService.getUserProgress(userId);
      
      // Calculate new progress
      const newProgress: Partial<UserProgress> = {
        score: currentProgress.score + scoreReward,
        coins: currentProgress.coins + coinReward,
        currentXP: currentProgress.currentXP + xpReward,
      };

      // Update in Firestore
      await FirestoreService.updateUserProgress(userId, newProgress);
    } catch (error) {
      console.error('Error completing task:', error);
      throw new Error('Failed to complete task');
    }
  }
}

/**
 * Error handling utilities
 */
export class ErrorHandler {
  static handleFirebaseError(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          return 'Permission denied. Please check your authentication.';
        case 'unavailable':
          return 'Service temporarily unavailable. Please try again.';
        case 'deadline-exceeded':
          return 'Request timeout. Please check your connection.';
        default:
          return `Firebase error: ${error.message}`;
      }
    }
    return error.message || 'An unexpected error occurred';
  }

  static isRetryableError(error: any): boolean {
    const retryableCodes = ['unavailable', 'deadline-exceeded', 'internal'];
    return retryableCodes.includes(error.code);
  }
}
