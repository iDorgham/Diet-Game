// Firebase service tests following Level 202 integration requirements
// Testing data-flow.md sequences and error handling

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  AuthService, 
  FirestoreService, 
  TaskService, 
  ErrorHandler 
} from '../services/firebase';
import { UserProgress, UserProfile } from '../types';

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(),
  signInWithCustomToken: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));

describe('Firebase Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AuthService', () => {
    it('should sign in anonymously successfully', async () => {
      const mockUser = { uid: 'test-uid', email: null };
      const { signInAnonymously } = await import('firebase/auth');
      vi.mocked(signInAnonymously).mockResolvedValue({ user: mockUser } as any);

      const result = await AuthService.signInAnonymously();
      expect(result).toBe(mockUser);
      expect(signInAnonymously).toHaveBeenCalled();
    });

    it('should handle anonymous sign-in errors', async () => {
      const { signInAnonymously } = await import('firebase/auth');
      vi.mocked(signInAnonymously).mockRejectedValue(new Error('Auth failed'));

      await expect(AuthService.signInAnonymously()).rejects.toThrow('Authentication failed');
    });

    it('should sign in with custom token successfully', async () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      const { signInWithCustomToken } = await import('firebase/auth');
      vi.mocked(signInWithCustomToken).mockResolvedValue({ user: mockUser } as any);

      const result = await AuthService.signInWithToken('test-token');
      expect(result).toBe(mockUser);
      expect(signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'test-token');
    });

    it('should handle token sign-in errors', async () => {
      const { signInWithCustomToken } = await import('firebase/auth');
      vi.mocked(signInWithCustomToken).mockRejectedValue(new Error('Invalid token'));

      await expect(AuthService.signInWithToken('invalid-token')).rejects.toThrow('Authentication failed');
    });
  });

  describe('FirestoreService', () => {
    const mockUserId = 'test-user-id';
    const mockProgress: UserProgress = {
      score: 1000,
      coins: 500,
      recipesUnlocked: 5,
      hasClaimedGift: false,
      level: 2,
      currentXP: 50,
    };

    const mockProfile: UserProfile = {
      userName: 'Test User',
      dietType: 'Keto',
      bodyType: 'Mesomorph',
      weight: '170 lbs',
    };

    it('should get user progress successfully', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockDoc = {
        exists: () => true,
        data: () => mockProgress,
      };
      vi.mocked(getDoc).mockResolvedValue(mockDoc as any);

      const result = await FirestoreService.getUserProgress(mockUserId);
      expect(result).toEqual(mockProgress);
    });

    it('should return default progress for new users', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockDoc = {
        exists: () => false,
      };
      vi.mocked(getDoc).mockResolvedValue(mockDoc as any);

      const result = await FirestoreService.getUserProgress(mockUserId);
      expect(result).toEqual({
        score: 10,
        coins: 2000,
        recipesUnlocked: 10,
        hasClaimedGift: false,
        level: 1,
        currentXP: 0,
      });
    });

    it('should handle progress fetch errors', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockRejectedValue(new Error('Network error'));

      await expect(FirestoreService.getUserProgress(mockUserId)).rejects.toThrow('Failed to load user progress');
    });

    it('should get user profile successfully', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockDoc = {
        exists: () => true,
        data: () => mockProfile,
      };
      vi.mocked(getDoc).mockResolvedValue(mockDoc as any);

      const result = await FirestoreService.getUserProfile(mockUserId);
      expect(result).toEqual(mockProfile);
    });

    it('should return default profile for new users', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockDoc = {
        exists: () => false,
      };
      vi.mocked(getDoc).mockResolvedValue(mockDoc as any);

      const result = await FirestoreService.getUserProfile(mockUserId);
      expect(result).toEqual({
        userName: 'Yasser',
        dietType: 'Keto Diet',
        bodyType: 'Mesomorph',
        weight: '175 lbs',
      });
    });

    it('should update user progress with retry logic', async () => {
      const { setDoc } = await import('firebase/firestore');
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const updates = { score: 1100, coins: 600 };
      await FirestoreService.updateUserProgress(mockUserId, updates);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        updates,
        { merge: true }
      );
    });

    it('should retry on failure and eventually succeed', async () => {
      const { setDoc } = await import('firebase/firestore');
      vi.mocked(setDoc)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce(undefined);

      const updates = { score: 1100 };
      await expect(FirestoreService.updateUserProgress(mockUserId, updates, 3)).resolves.toBeUndefined();
      expect(setDoc).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const { setDoc } = await import('firebase/firestore');
      vi.mocked(setDoc).mockRejectedValue(new Error('Persistent error'));

      const updates = { score: 1100 };
      await expect(FirestoreService.updateUserProgress(mockUserId, updates, 2)).rejects.toThrow('Failed to update user progress after retries');
      expect(setDoc).toHaveBeenCalledTimes(2);
    });

    it('should set up real-time progress listener', () => {
      const { onSnapshot } = await import('firebase/firestore');
      const mockUnsubscribe = vi.fn();
      vi.mocked(onSnapshot).mockReturnValue(mockUnsubscribe);

      const callback = vi.fn();
      const onError = vi.fn();
      const unsubscribe = FirestoreService.subscribeToUserProgress(mockUserId, callback, onError);

      expect(onSnapshot).toHaveBeenCalled();
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should handle real-time listener errors', () => {
      const { onSnapshot } = await import('firebase/firestore');
      const mockUnsubscribe = vi.fn();
      vi.mocked(onSnapshot).mockImplementation((docRef, onNext, onError) => {
        onError(new Error('Listener error'));
        return mockUnsubscribe;
      });

      const callback = vi.fn();
      const onError = vi.fn();
      FirestoreService.subscribeToUserProgress(mockUserId, callback, onError);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('TaskService', () => {
    const mockUserId = 'test-user-id';

    it('should complete task and update progress', async () => {
      const { getDoc, setDoc } = await import('firebase/firestore');
      
      // Mock getDoc to return current progress
      const mockDoc = {
        exists: () => true,
        data: () => ({
          score: 1000,
          coins: 500,
          currentXP: 50,
        }),
      };
      vi.mocked(getDoc).mockResolvedValue(mockDoc as any);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await TaskService.completeTask(mockUserId, 1, 10, 5, 20);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          score: 1010,
          coins: 505,
          currentXP: 70,
        },
        { merge: true }
      );
    });

    it('should handle task completion errors', async () => {
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockRejectedValue(new Error('Network error'));

      await expect(TaskService.completeTask(mockUserId, 1, 10, 5, 20)).rejects.toThrow('Failed to complete task');
    });
  });

  describe('ErrorHandler', () => {
    it('should handle Firebase permission errors', () => {
      const error = { code: 'permission-denied', message: 'Access denied' };
      const result = ErrorHandler.handleFirebaseError(error);
      expect(result).toBe('Permission denied. Please check your authentication.');
    });

    it('should handle Firebase unavailable errors', () => {
      const error = { code: 'unavailable', message: 'Service down' };
      const result = ErrorHandler.handleFirebaseError(error);
      expect(result).toBe('Service temporarily unavailable. Please try again.');
    });

    it('should handle Firebase timeout errors', () => {
      const error = { code: 'deadline-exceeded', message: 'Request timeout' };
      const result = ErrorHandler.handleFirebaseError(error);
      expect(result).toBe('Request timeout. Please check your connection.');
    });

    it('should handle unknown Firebase errors', () => {
      const error = { code: 'unknown-error', message: 'Something went wrong' };
      const result = ErrorHandler.handleFirebaseError(error);
      expect(result).toBe('Firebase error: Something went wrong');
    });

    it('should handle errors without code', () => {
      const error = { message: 'Generic error' };
      const result = ErrorHandler.handleFirebaseError(error);
      expect(result).toBe('Generic error');
    });

    it('should handle errors without message', () => {
      const error = {};
      const result = ErrorHandler.handleFirebaseError(error);
      expect(result).toBe('An unexpected error occurred');
    });

    it('should identify retryable errors', () => {
      expect(ErrorHandler.isRetryableError({ code: 'unavailable' })).toBe(true);
      expect(ErrorHandler.isRetryableError({ code: 'deadline-exceeded' })).toBe(true);
      expect(ErrorHandler.isRetryableError({ code: 'internal' })).toBe(true);
      expect(ErrorHandler.isRetryableError({ code: 'permission-denied' })).toBe(false);
      expect(ErrorHandler.isRetryableError({ code: 'unknown' })).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user flow', async () => {
      const { signInAnonymously, getDoc, setDoc } = await import('firebase/auth');
      const { getDoc: getDocFirestore } = await import('firebase/firestore');
      
      // Mock authentication
      const mockUser = { uid: 'test-uid' };
      vi.mocked(signInAnonymously).mockResolvedValue({ user: mockUser } as any);

      // Mock profile fetch
      const mockProfileDoc = {
        exists: () => true,
        data: () => ({
          userName: 'Test User',
          dietType: 'Keto',
          bodyType: 'Mesomorph',
          weight: '170 lbs',
        }),
      };
      vi.mocked(getDocFirestore).mockResolvedValue(mockProfileDoc as any);

      // Mock progress fetch
      const mockProgressDoc = {
        exists: () => true,
        data: () => ({
          score: 1000,
          coins: 500,
          recipesUnlocked: 5,
          hasClaimedGift: false,
          level: 2,
          currentXP: 50,
        }),
      };
      vi.mocked(getDocFirestore).mockResolvedValue(mockProgressDoc as any);

      // Mock progress update
      vi.mocked(setDoc).mockResolvedValue(undefined);

      // Execute flow
      const user = await AuthService.signInAnonymously();
      const profile = await FirestoreService.getUserProfile(user.uid);
      const progress = await FirestoreService.getUserProgress(user.uid);
      await TaskService.completeTask(user.uid, 1, 10, 5, 20);

      expect(user).toBe(mockUser);
      expect(profile.userName).toBe('Test User');
      expect(progress.score).toBe(1000);
      expect(setDoc).toHaveBeenCalled();
    });
  });
});
