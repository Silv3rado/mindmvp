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
