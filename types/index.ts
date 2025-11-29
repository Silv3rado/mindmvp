export interface MeditationSession {
  id: string;
  title: string;
  duration: number;
  category: 'Sleep' | 'Stress' | 'Focus' | 'Short' | 'Deep';
  coverImage: any;
  description: string;
  audioUrl?: string;
  voiceUrl?: string;
}

export interface UserProfile {
  goal: 'Sleep' | 'Stress' | 'Focus' | 'Balance';
  dailyTime: '3-5 min' | '10-15 min' | '20+ min';
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export type AuthProvider = 'guest' | 'email' | 'google' | 'apple' | 'phone';

export interface User {
  id: string;
  email: string;
  name: string;
  profile: UserProfile;
  createdAt: number;
  isGuest?: boolean;
  authProvider?: AuthProvider;
  photoUrl?: string;
  phoneNumber?: string;
}

export interface HabitEntry {
  date: string; // YYYY-MM-DD
  sessionId: string;
  sessionTitle: string;
  duration: number;
  completedAt: number;
  listenedMinutes: number;
}

export interface UserData {
  user: User | null;
  habits: HabitEntry[];
  completedSessions: Set<string>;
  currentStreak: number;
  longestStreak: number;
}

export interface SessionCompletion {
  sessionId: string;
  completedAt: number;
}
