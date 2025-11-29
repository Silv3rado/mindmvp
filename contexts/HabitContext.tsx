import React, { createContext, useState, useEffect } from 'react';
import { HabitEntry } from '@/types/index';
import { StorageService } from '@/services/storageService';

interface HabitContextType {
  habits: HabitEntry[];
  completedSessions: Set<string>;
  currentStreak: number;
  longestStreak: number;
  totalListenedMinutes: number;
  addHabitEntry: (sessionId: string, sessionTitle: string, duration: number, listenedMinutes: number) => Promise<void>;
  getHabitsByDate: (date: string) => HabitEntry[];
  getMonthlyStats: (year: number, month: number) => { sessions: number; minutes: number };
  markSessionComplete: (sessionId: string) => Promise<void>;
  isSessionCompleted: (sessionId: string) => boolean;
  updateStreaks: (current: number, longest: number) => Promise<void>;
  clearAllHabits: () => Promise<void>;
}

export const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<HabitEntry[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Set<string>>(new Set());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedHabits = await StorageService.getHabits();
        const completed = await StorageService.getCompletedSessions();
        const streaks = await StorageService.getStreaks();

        setHabits(loadedHabits);
        setCompletedSessions(new Set(completed));
        setCurrentStreak(streaks.currentStreak);
        setLongestStreak(streaks.longestStreak);
      } catch (error) {
        console.error('Failed to load habits:', error);
      }
    };

    loadData();
  }, []);

  const totalListenedMinutes = habits.reduce((sum, h) => sum + (h.listenedMinutes || h.duration), 0);

  const addHabitEntry = async (sessionId: string, sessionTitle: string, duration: number, listenedMinutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    const entry: HabitEntry = {
      date: today,
      sessionId,
      sessionTitle,
      duration,
      completedAt: Date.now(),
      listenedMinutes,
    };

    const updated = [...habits, entry];
    setHabits(updated);
    await StorageService.saveHabits(updated);
  };

  const getHabitsByDate = (date: string) => {
    return habits.filter((h) => h.date === date);
  };

  const getMonthlyStats = (year: number, month: number) => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthHabits = habits.filter(h => h.date.startsWith(monthStr));
    const uniqueDays = new Set(monthHabits.map(h => h.date));
    const totalMinutes = monthHabits.reduce((sum, h) => sum + (h.listenedMinutes || h.duration), 0);
    return { sessions: uniqueDays.size, minutes: totalMinutes };
  };

  const markSessionComplete = async (sessionId: string) => {
    const updated = new Set(completedSessions);
    updated.add(sessionId);
    setCompletedSessions(updated);
    await StorageService.saveCompletedSessions(Array.from(updated));
  };

  const isSessionCompleted = (sessionId: string) => {
    return completedSessions.has(sessionId);
  };

  const updateStreaks = async (current: number, longest: number) => {
    setCurrentStreak(current);
    setLongestStreak(longest);
    await StorageService.saveStreaks(current, longest);
  };

  const clearAllHabits = async () => {
    setHabits([]);
    setCurrentStreak(0);
    await StorageService.saveHabits([]);
    await StorageService.saveStreaks(0, longestStreak);
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        completedSessions,
        currentStreak,
        longestStreak,
        totalListenedMinutes,
        addHabitEntry,
        getHabitsByDate,
        getMonthlyStats,
        markSessionComplete,
        isSessionCompleted,
        updateStreaks,
        clearAllHabits,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}
