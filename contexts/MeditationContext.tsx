import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMeditations, Meditation, getStorageUrl, fixStorageUrl } from '@/services/firebase';
import { meditationSessions } from '@/data/sessions';
import { MeditationSession } from '@/types/meditation';

interface MeditationContextType {
  meditations: Meditation[];
  sessions: MeditationSession[];
  loading: boolean;
  error: string | null;
  getSessionById: (id: string) => MeditationSession | undefined;
}

const MeditationContext = createContext<MeditationContextType>({
  meditations: [],
  sessions: [],
  loading: false,
  error: null,
  getSessionById: () => undefined,
});

export function MeditationProvider({ children }: { children: React.ReactNode }) {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [sessions, setSessions] = useState<MeditationSession[]>(meditationSessions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMeditations = async () => {
      setLoading(true);
      try {
        const data = await fetchMeditations();
        if (data.length === 0) {
          console.log('No Firestore data, using local sessions');
          setSessions(meditationSessions);
          const mockData: Meditation[] = meditationSessions.map(session => ({
            id: session.id,
            title: session.title,
            description: session.description,
            duration: session.duration,
            category: session.category,
            audioUrl: session.audioUrl || '',
            voiceUrl: session.voiceUrl || '',
            imageUrl: '',
            difficulty: 'Beginner',
          }));
          setMeditations(mockData);
        } else {
          console.log('Loaded from Firestore:', data.length, 'sessions');
          setMeditations(data);
          const mappedSessions: MeditationSession[] = await Promise.all(
            data.map(async (fs) => {
              const imageUrl = fixStorageUrl(fs.imageUrl || '');
              const audioUrl = fixStorageUrl(fs.audioUrl || '');
              const voiceUrl = fixStorageUrl(fs.voiceUrl || '');
              console.log('Processing session:', fs.title, 'audioUrl:', audioUrl, 'voiceUrl:', voiceUrl);
              return {
                id: fs.id,
                title: fs.title,
                duration: fs.duration > 100 ? Math.floor(fs.duration / 60) : fs.duration,
                category: fs.category as any,
                coverImage: imageUrl ? { uri: imageUrl } : meditationSessions[0]?.coverImage,
                description: fs.description,
                audioUrl: audioUrl,
                voiceUrl: voiceUrl,
              };
            })
          );
          setSessions(mappedSessions);
        }
        setError(null);
      } catch (err) {
        console.log('Firebase load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load meditations');
        setSessions(meditationSessions);
        const mockData: Meditation[] = meditationSessions.map(session => ({
          id: session.id,
          title: session.title,
          description: session.description,
          duration: session.duration,
          category: session.category,
          audioUrl: session.audioUrl || '',
          voiceUrl: session.voiceUrl || '',
          imageUrl: '',
          difficulty: 'Beginner',
        }));
        setMeditations(mockData);
      } finally {
        setLoading(false);
      }
    };

    loadMeditations();
  }, []);

  const getSessionById = (id: string) => sessions.find(s => s.id === id);

  return (
    <MeditationContext.Provider value={{ meditations, sessions, loading, error, getSessionById }}>
      {children}
    </MeditationContext.Provider>
  );
}

export function useMeditation() {
  const context = useContext(MeditationContext);
  if (!context) {
    throw new Error('useMeditation must be used within MeditationProvider');
  }
  return context;
}
