import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Animated, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { ParchmentBackground } from "@/components/ParchmentBackground";
import { AppIcon } from "@/components/AppIcon";
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { fetchMeditationsByCategory, fixStorageUrl } from "@/services/firebase";

interface BreathingData {
  audioUrl: string;
  imageUrl: string;
}

export default function BreathingScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"breathe-in" | "hold" | "breathe-out">("breathe-in");
  const [duration, setDuration] = useState(1);
  const [breathingData, setBreathingData] = useState<BreathingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  const durations = [1, 3, 5, 10];

  useEffect(() => {
    loadBreathingData();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadBreathingData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchMeditationsByCategory("Breathing");
      if (data.length > 0) {
        const breathing = data[0];
        setBreathingData({
          audioUrl: fixStorageUrl(breathing.audioUrl),
          imageUrl: fixStorageUrl(breathing.imageUrl),
        });
        console.log("Breathing data loaded:", {
          audioUrl: fixStorageUrl(breathing.audioUrl),
          imageUrl: fixStorageUrl(breathing.imageUrl),
        });
      }
    } catch (error) {
      console.log("Error loading breathing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupAndPlayAudio = async () => {
    if (!breathingData?.audioUrl) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: breathingData.audioUrl },
        { shouldPlay: true, isLooping: true, volume: 0.5 }
      );
      soundRef.current = sound;
    } catch (error) {
      console.log("Error loading breathing audio:", error);
    }
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  useEffect(() => {
    if (isActive) {
      setupAndPlayAudio();
    } else {
      stopAudio();
    }
  }, [isActive]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isMounted = true;
    
    if (!isActive) {
      // Stop all animations and reset
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
      setPhase("breathe-in");
      return;
    }

    const breathingCycle = () => {
      if (!isMounted) return;
      
      // Inhale 3 seconds
      setPhase("breathe-in");
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 3000,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || !isMounted) return;
        
        // Hold 1 second
        setPhase("hold");
        timeout = setTimeout(() => {
          if (!isMounted) return;
          
          // Exhale 7 seconds
          setPhase("breathe-out");
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 7000,
            useNativeDriver: true,
          }).start(({ finished: finished2 }) => {
            if (!finished2 || !isMounted) return;
            timeout = setTimeout(breathingCycle, 300);
          });
        }, 1000);
      });
    };

    breathingCycle();

    return () => {
      isMounted = false;
      if (timeout) clearTimeout(timeout);
      scaleAnim.stopAnimation();
    };
  }, [isActive]);

  const getInstruction = () => {
    switch (phase) {
      case "breathe-in":
        return "Breathe In...";
      case "hold":
        return "Hold...";
      case "breathe-out":
        return "Breathe Out...";
    }
  };

  if (isLoading) {
    return (
      <ParchmentBackground centered>
        <ActivityIndicator size="large" color={theme.primary} />
      </ParchmentBackground>
    );
  }

  return (
    <ParchmentBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
        {breathingData?.imageUrl ? (
          <Image
            source={{ uri: breathingData.imageUrl }}
            style={styles.backgroundImage}
            contentFit="cover"
          />
        ) : null}
        <View style={styles.overlay} />
      
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            android_disableSound={true}
            android_ripple={null}
            focusable={false}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <AppIcon name="x" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <ThemedText style={[Typography.h2, styles.title, { color: '#FFFFFF' }]}>
            Breathing Exercise
          </ThemedText>

          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  backgroundColor: theme.primary,
                  opacity: 0.2,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  backgroundColor: theme.primary,
                  opacity: 0.4,
                  transform: [{ scale: scaleAnim.interpolate({
                    inputRange: [1, 1.5],
                    outputRange: [0.8, 1.3],
                  }) }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  backgroundColor: theme.primary,
                  transform: [{ scale: scaleAnim.interpolate({
                    inputRange: [1, 1.5],
                    outputRange: [0.6, 1.1],
                  }) }],
                },
              ]}
            />
          </View>

          {isActive ? (
            <ThemedText style={[Typography.h2, styles.instruction, { color: '#FFFFFF' }]}>
              {getInstruction()}
            </ThemedText>
          ) : (
            <ThemedText style={[Typography.body, { color: 'rgba(255,255,255,0.8)' }]}>
              Find a comfortable position
            </ThemedText>
          )}

          <View style={styles.durationSelector}>
            <ThemedText style={[Typography.small, { color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.md }]}>
              Duration
            </ThemedText>
            <View style={styles.durationButtons}>
              {durations.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDuration(d)}
                  android_disableSound={true}
                  android_ripple={null}
                  focusable={false}
                  style={({ pressed }) => [
                    styles.durationButton,
                    {
                      backgroundColor: duration === d ? theme.primary : 'rgba(255,255,255,0.2)',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      Typography.small,
                      styles.durationButtonText,
                      { color: '#FFFFFF' },
                    ]}
                  >
                    {d} min
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <Pressable
            onPress={() => setIsActive(!isActive)}
            android_disableSound={true}
            android_ripple={null}
            focusable={false}
            style={({ pressed }) => [
              styles.playButton,
              {
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (pressed ? '#6B4EAF' : theme.primary),
                transform: [{ scale: pressed ? 0.9 : 1 }],
                shadowColor: isActive ? 'transparent' : theme.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.45,
                shadowRadius: 16,
                elevation: isActive ? 0 : 12,
                borderWidth: 3,
                borderColor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
              },
            ]}
          >
            <AppIcon
              name={isActive ? "pause" : "play"}
              size={44}
              color="#FFFFFF"
            />
          </Pressable>
          <ThemedText
            style={[
              Typography.caption,
              { color: 'rgba(255,255,255,0.7)', marginTop: Spacing.md },
            ]}
          >
            {isActive ? "Tap to stop" : "Tap to start"}
          </ThemedText>
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
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  header: {
    marginBottom: Spacing.xl,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  title: {
    marginBottom: Spacing.xxl,
  },
  circleContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xxl,
  },
  breathingCircle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  instruction: {
    marginBottom: Spacing.xxl,
  },
  durationSelector: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  durationButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.xs,
    width: "100%",
  },
  durationButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    minWidth: 55,
    alignItems: "center",
    justifyContent: "center",
    flexBasis: "20%",
    maxWidth: 70,
  },
  durationButtonText: {
    textAlign: "center",
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    zIndex: 1,
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
