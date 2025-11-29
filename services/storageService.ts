import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: '@mindmvp_user',
  HABITS: '@mindmvp_habits',
  COMPLETED_SESSIONS: '@mindmvp_completed_sessions',
  STREAKS: '@mindmvp_streaks',
  USER_CREDENTIALS: '@mindmvp_credentials',
} as const;

interface UserCredentials {
  [email: string]: {
    passwordHash: string;
    userId: string;
    name: string;
  };
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export class StorageService {
  static async saveUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  }

  static async getUser(): Promise<any | null> {
    try {
      const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  static async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Failed to clear user:', error);
    }
  }

  static async saveHabits(habits: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (error) {
      console.error('Failed to save habits:', error);
      throw error;
    }
  }

  static async getHabits(): Promise<any[]> {
    try {
      const habits = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      return habits ? JSON.parse(habits) : [];
    } catch (error) {
      console.error('Failed to get habits:', error);
      return [];
    }
  }

  static async saveCompletedSessions(sessionIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_SESSIONS, JSON.stringify(sessionIds));
    } catch (error) {
      console.error('Failed to save completed sessions:', error);
      throw error;
    }
  }

  static async getCompletedSessions(): Promise<string[]> {
    try {
      const sessions = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_SESSIONS);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Failed to get completed sessions:', error);
      return [];
    }
  }

  static async saveStreaks(currentStreak: number, longestStreak: number): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.STREAKS,
        JSON.stringify({ currentStreak, longestStreak })
      );
    } catch (error) {
      console.error('Failed to save streaks:', error);
      throw error;
    }
  }

  static async getStreaks(): Promise<{ currentStreak: number; longestStreak: number }> {
    try {
      const streaks = await AsyncStorage.getItem(STORAGE_KEYS.STREAKS);
      return streaks
        ? JSON.parse(streaks)
        : { currentStreak: 0, longestStreak: 0 };
    } catch (error) {
      console.error('Failed to get streaks:', error);
      return { currentStreak: 0, longestStreak: 0 };
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Failed to clear all storage:', error);
    }
  }

  static async saveCredentials(email: string, password: string, userId: string, name: string): Promise<void> {
    try {
      const credentials = await this.getAllCredentials();
      const passwordHash = simpleHash(password);
      credentials[email.toLowerCase()] = { passwordHash, userId, name };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, JSON.stringify(credentials));
    } catch (error) {
      console.error('Failed to save credentials:', error);
      throw error;
    }
  }

  static async validateCredentials(email: string, password: string): Promise<{ userId: string; name: string } | null> {
    try {
      const credentials = await this.getAllCredentials();
      const userCredentials = credentials[email.toLowerCase()];
      
      if (!userCredentials) {
        return null;
      }
      
      const passwordHash = simpleHash(password);
      if (userCredentials.passwordHash === passwordHash) {
        return { userId: userCredentials.userId, name: userCredentials.name };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to validate credentials:', error);
      return null;
    }
  }

  static async emailExists(email: string): Promise<boolean> {
    try {
      const credentials = await this.getAllCredentials();
      return email.toLowerCase() in credentials;
    } catch (error) {
      console.error('Failed to check email:', error);
      return false;
    }
  }

  private static async getAllCredentials(): Promise<UserCredentials> {
    try {
      const credentials = await AsyncStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
      return credentials ? JSON.parse(credentials) : {};
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return {};
    }
  }
}
