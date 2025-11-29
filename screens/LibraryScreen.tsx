import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ParchmentBackground } from "@/components/ParchmentBackground";
import { SessionCard } from "@/components/SessionCard";
import { AppIcon } from "@/components/AppIcon";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { meditationSessions } from "@/data/sessions";
import { fetchMeditations, getStorageUrl } from "@/services/firebase";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { RootStackParamList } from "@/navigation/RootNavigator";
import { LibraryStackParamList } from "@/navigation/LibraryStackNavigator";
import { MeditationSession } from "@/types/meditation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type LibraryRouteProp = RouteProp<LibraryStackParamList, 'Library'>;

const categories = ['All', 'Sleep', 'Stress', 'Focus', 'Short', 'Deep'];

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LibraryRouteProp>();
  const { theme } = useTheme();
  const { canAccessAllContent, status } = useSubscription();
  const initialCategory = route.params?.category || 'All';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sessions, setSessions] = useState<MeditationSession[]>(meditationSessions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params?.category]);

  useEffect(() => {
    let isMounted = true;

    async function loadSessions() {
      try {
        const firestoreSessions = await fetchMeditations();
        if (isMounted && firestoreSessions.length > 0) {
          const mappedSessions: MeditationSession[] = await Promise.all(
            firestoreSessions.map(async (fs) => {
              const imageUrl = await getStorageUrl(fs.imageUrl);
              const audioUrl = await getStorageUrl(fs.audioUrl);
              return {
                id: fs.id,
                title: fs.title,
                duration: fs.duration > 100 ? Math.floor(fs.duration / 60) : fs.duration,
                category: fs.category as any,
                coverImage: imageUrl ? { uri: imageUrl } : meditationSessions[0]?.coverImage,
                description: fs.description,
                audioUrl: audioUrl,
              };
            })
          );
          setSessions(mappedSessions);
        }
      } catch (error) {
        console.log("Using local meditation sessions:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSessions = selectedCategory === 'All'
    ? sessions
    : sessions.filter((s) => s.category === selectedCategory);

  const handleSessionPress = (sessionId: string) => {
    if (canAccessAllContent) {
      navigation.navigate("Player", { sessionId });
    } else {
      Alert.alert(
        "Premium Content",
        status === 'trial_expired' 
          ? "Your free trial has ended. Subscribe to unlock all meditations."
          : "Start your free trial to access all meditations.",
        [
          { text: "Cancel", style: "cancel" },
          { text: status === 'trial_expired' ? "Subscribe" : "Start Trial", onPress: () => navigation.navigate("Subscription") }
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <ParchmentBackground centered>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={[Typography.body, { color: theme.textSecondary, marginTop: Spacing.md }]}>
          Loading meditation library...
        </ThemedText>
      </ParchmentBackground>
    );
  }

  return (
    <ScreenScrollView>
      {!canAccessAllContent && (
        <Pressable 
          onPress={() => navigation.navigate("Subscription")}
          style={({ pressed }) => [
            styles.trialBanner, 
            { backgroundColor: theme.primary + '15', opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <AppIcon name="lock" size={16} color={theme.primary} />
          <ThemedText style={[Typography.small, { color: theme.primary, marginLeft: Spacing.sm, flex: 1 }]}>
            {status === 'trial_expired' 
              ? "Trial ended. Only breathing exercises are free."
              : "Start free trial to unlock all content"}
          </ThemedText>
          <AppIcon name="chevron-right" size={16} color={theme.primary} />
        </Pressable>
      )}

      <View style={styles.filterContainer}>
        {categories.map((category) => (
          <Pressable
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={({ pressed }) => [
              styles.filterChip,
              {
                backgroundColor: selectedCategory === category
                  ? theme.primary
                  : theme.backgroundSecondary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <ThemedText
              style={[
                Typography.small,
                {
                  color: selectedCategory === category
                    ? '#FFFFFF'
                    : theme.text,
                },
              ]}
            >
              {category}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.sessions}>
        {filteredSessions.map((session) => (
          <SessionCard
            key={session.id}
            id={session.id}
            title={session.title}
            duration={session.duration}
            category={session.category}
            coverImage={session.coverImage}
            locked={!canAccessAllContent}
            onPress={() => handleSessionPress(session.id)}
          />
        ))}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  sessions: {
    marginTop: Spacing.md,
  },
});
