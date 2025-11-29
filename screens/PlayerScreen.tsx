import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { ParchmentBackground } from "@/components/ParchmentBackground";
import { AppIcon } from "@/components/AppIcon";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useHabit } from "@/hooks/useHabit";
import { useMeditation } from "@/contexts/MeditationContext";
import { meditationSessions } from "@/data/sessions";
import { RootStackParamList } from "@/navigation/RootNavigator";

type PlayerScreenRouteProp = RouteProp<RootStackParamList, "Player">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Player">;

export default function PlayerScreen() {
  const route = useRoute<PlayerScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addHabitEntry, markSessionComplete } = useHabit();
  const { getSessionById } = useMeditation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const musicVolume = 0.5;
  const voiceVolume = 0.85;
  const soundRef = useRef<Audio.Sound | null>(null);
  const voiceRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  
  const session = getSessionById(route.params.sessionId) || meditationSessions.find((s) => s.id === route.params.sessionId);

  if (!session) {
    return null;
  }

  const totalSeconds = session.duration * 60;

  const stopAllAudio = useCallback(async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.stopAsync();
        }
      } catch (err) {
        console.log("Stop music error:", err);
      }
    }
    if (voiceRef.current) {
      try {
        const status = await voiceRef.current.getStatusAsync();
        if (status.isLoaded) {
          await voiceRef.current.stopAsync();
        }
      } catch (err) {
        console.log("Stop voice error:", err);
      }
    }
  }, []);

  const finishSession = useCallback(async () => {
    if (isCompleted) return;
    setIsCompleted(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    await stopAllAudio();
    setIsPlaying(false);
    setProgress(100);
    setElapsedSeconds(totalSeconds);
    
    const listenedMinutes = Math.round(elapsedRef.current / 60);
    await addHabitEntry(session.id, session.title, session.duration, listenedMinutes);
    await markSessionComplete(session.id);
    
    Alert.alert(
      "Session Complete",
      "Great work! Your meditation has been saved.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  }, [isCompleted, totalSeconds, session, addHabitEntry, markSessionComplete, navigation, stopAllAudio]);

  // Set up audio mode and load both audio tracks on mount
  useEffect(() => {
    if (!session) return;
    
    let isMounted = true;

    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        setIsLoading(true);
        
        // Load background music (looping while session is active)
        if (session?.audioUrl && isMounted) {
          try {
            const { sound: musicSound } = await Audio.Sound.createAsync(
              { uri: session.audioUrl },
              { shouldPlay: false, isLooping: true, volume: musicVolume }
            );
            if (isMounted) {
              soundRef.current = musicSound;
            }
          } catch (err) {
            console.log("Music load error:", err);
          }
        }

        // Load voice guidance (not looping, slower speed)
        if (session?.voiceUrl && isMounted) {
          try {
            const { sound: voiceSound } = await Audio.Sound.createAsync(
              { uri: session.voiceUrl },
              { shouldPlay: false, isLooping: false, volume: voiceVolume, rate: 0.75, shouldCorrectPitch: true }
            );
            if (isMounted) {
              voiceRef.current = voiceSound;
            }
          } catch (err) {
            console.log("Voice load error:", err);
          }
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.log("Audio setup error:", error);
        if (isMounted) {
          setIsLoading(false);
          setAudioError("Unable to load audio. Check network connection.");
        }
      }
    }

    setupAudio();

    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Cleanup music
      if (soundRef.current) {
        soundRef.current.getStatusAsync().then(status => {
          if (status.isLoaded) {
            soundRef.current?.unloadAsync();
          }
        }).catch(() => {});
      }
      // Cleanup voice
      if (voiceRef.current) {
        voiceRef.current.getStatusAsync().then(status => {
          if (status.isLoaded) {
            voiceRef.current?.unloadAsync();
          }
        }).catch(() => {});
      }
    };
  }, [session?.audioUrl, session?.voiceUrl]);

  // Session timer - runs independently of audio position
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        const newElapsed = elapsedRef.current;
        const newProgress = (newElapsed / totalSeconds) * 100;
        
        setElapsedSeconds(newElapsed);
        setProgress(Math.min(newProgress, 100));
        
        if (newElapsed >= totalSeconds) {
          finishSession();
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, isCompleted, totalSeconds, finishSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const togglePlay = async () => {
    if (isCompleted) return;
    
    const hasMusic = soundRef.current && session.audioUrl;
    const hasVoice = voiceRef.current && session.voiceUrl;
    
    if (hasMusic || hasVoice) {
      try {
        if (isPlaying) {
          // Pause both tracks
          if (hasMusic) {
            const status = await soundRef.current!.getStatusAsync();
            if (status.isLoaded) await soundRef.current!.pauseAsync();
          }
          if (hasVoice) {
            const status = await voiceRef.current!.getStatusAsync();
            if (status.isLoaded) await voiceRef.current!.pauseAsync();
          }
          setIsPlaying(false);
        } else {
          // Play both tracks simultaneously
          if (hasMusic) {
            const status = await soundRef.current!.getStatusAsync();
            if (status.isLoaded) await soundRef.current!.playAsync();
          }
          if (hasVoice) {
            const status = await voiceRef.current!.getStatusAsync();
            if (status.isLoaded) await voiceRef.current!.playAsync();
          }
          setIsPlaying(true);
        }
      } catch (error) {
        console.log("Playback error:", error);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const seekBackward = async () => {
    const seekSeconds = 15;
    const newElapsed = Math.max(0, elapsedRef.current - seekSeconds);
    elapsedRef.current = newElapsed;
    setElapsedSeconds(newElapsed);
    setProgress((newElapsed / totalSeconds) * 100);
    
    const seekAmount = 15000;
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.max(0, status.positionMillis - seekAmount);
          await soundRef.current.setPositionAsync(newPosition);
        }
      }
      if (voiceRef.current) {
        const status = await voiceRef.current.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.max(0, status.positionMillis - seekAmount);
          await voiceRef.current.setPositionAsync(newPosition);
        }
      }
    } catch (error) {
      console.log("Seek backward error:", error);
    }
  };

  const seekForward = async () => {
    const seekSeconds = 15;
    const newElapsed = Math.min(totalSeconds - 1, elapsedRef.current + seekSeconds);
    elapsedRef.current = newElapsed;
    setElapsedSeconds(newElapsed);
    setProgress((newElapsed / totalSeconds) * 100);
    
    const seekAmount = 15000;
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          const newPosition = Math.min(status.durationMillis, status.positionMillis + seekAmount);
          await soundRef.current.setPositionAsync(newPosition);
        }
      }
      if (voiceRef.current) {
        const status = await voiceRef.current.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          const newPosition = Math.min(status.durationMillis, status.positionMillis + seekAmount);
          await voiceRef.current.setPositionAsync(newPosition);
        }
      }
    } catch (error) {
      console.log("Seek forward error:", error);
    }
  };

  const handleClose = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    await stopAllAudio();
    
    if (progress > 50 && !isCompleted) {
      const listenedMinutes = Math.round(elapsedRef.current / 60);
      await addHabitEntry(session.id, session.title, session.duration, listenedMinutes);
      await markSessionComplete(session.id);
      Alert.alert("Session Saved", "Great work! Your meditation has been saved to your habit tracker.");
    }
    navigation.goBack();
  };

  return (
    <ParchmentBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.header}>
          <Pressable
            onPress={handleClose}
            android_disableSound={true}
            android_ripple={null}
            focusable={false}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <AppIcon name="x" size={28} color={theme.text} />
          </Pressable>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText style={[Typography.small, { color: theme.textSecondary, marginTop: Spacing.md }]}>
                Loading audio...
              </ThemedText>
            </View>
          ) : null}
          
          {audioError ? (
            <ThemedText style={[Typography.small, { color: '#FF6B6B', marginBottom: Spacing.md, textAlign: 'center' }]}>
              {audioError}
            </ThemedText>
          ) : null}
          
          {session.coverImage ? (
            <Image 
              source={session.coverImage} 
              style={styles.coverArt} 
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.coverArt, { backgroundColor: theme.backgroundSecondary, alignItems: 'center', justifyContent: 'center' }]}>
              <AppIcon name="music" size={80} color={theme.textSecondary} />
            </View>
          )}

          <ThemedText style={[Typography.h2, styles.title]}>
            {session.title}
          </ThemedText>
          <ThemedText style={[Typography.body, { color: theme.textSecondary }]}>
            {session.description}
          </ThemedText>
          
          <View style={styles.headphoneHint}>
            <AppIcon name="headphones" size={16} color={theme.textSecondary} />
            <ThemedText style={[Typography.caption, { color: theme.textSecondary, marginLeft: Spacing.xs }]}>
              For the best experience, use headphones
            </ThemedText>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
            <View style={styles.timeLabels}>
              <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>
                {formatTime(elapsedSeconds)}
              </ThemedText>
              <ThemedText style={[Typography.caption, { color: theme.textSecondary }]}>
                {session.duration}:00
              </ThemedText>
            </View>
          </View>

          <View style={styles.controls}>
            <View style={styles.skipButtonWrapper}>
              <Pressable 
                onPress={seekBackward}
                android_disableSound={true}
                android_ripple={null}
                focusable={false}
                style={({ pressed }) => [
                  styles.skipButton,
                  {
                    backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundDefault,
                    transform: [{ scale: pressed ? 0.88 : 1 }],
                    borderWidth: 2,
                    borderColor: pressed ? theme.primary : theme.border,
                  },
                ]}
              >
                <AppIcon name="skip-back" size={22} color={theme.text} />
              </Pressable>
              <ThemedText style={[Typography.caption, styles.skipLabel, { color: theme.textSecondary }]}>
                -15s
              </ThemedText>
            </View>

            <Pressable
              onPress={togglePlay}
              android_disableSound={true}
              android_ripple={null}
              focusable={false}
              style={({ pressed }) => [
                styles.playButton,
                {
                  backgroundColor: pressed ? '#6B4EAF' : theme.primary,
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 12,
                  borderWidth: 3,
                  borderColor: 'rgba(255,255,255,0.2)',
                },
              ]}
            >
              <AppIcon
                name={isPlaying ? "pause" : "play"}
                size={44}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.skipButtonWrapper}>
              <Pressable 
                onPress={seekForward}
                android_disableSound={true}
                android_ripple={null}
                focusable={false}
                style={({ pressed }) => [
                  styles.skipButton,
                  {
                    backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundDefault,
                    transform: [{ scale: pressed ? 0.88 : 1 }],
                    borderWidth: 2,
                    borderColor: pressed ? theme.primary : theme.border,
                  },
                ]}
              >
                <AppIcon name="skip-forward" size={22} color={theme.text} />
              </Pressable>
              <ThemedText style={[Typography.caption, styles.skipLabel, { color: theme.textSecondary }]}>
                +15s
              </ThemedText>
            </View>
          </View>

          <View style={styles.secondaryControls}>
            <Pressable 
              android_disableSound={true}
              android_ripple={null}
              focusable={false}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <AppIcon name="clock" size={24} color={theme.textSecondary} />
            </Pressable>
            <Pressable 
              android_disableSound={true}
              android_ripple={null}
              focusable={false}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <ThemedText style={[Typography.small, { color: theme.textSecondary }]}>
                1x
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </ParchmentBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: Spacing.xl,
    zIndex: 10,
  },
  coverArt: {
    width: 280,
    height: 280,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  headphoneHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  progressContainer: {
    width: "100%",
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  skipButtonWrapper: {
    alignItems: "center",
  },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  skipLabel: {
    marginTop: Spacing.xs,
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  secondaryControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
  },
});
