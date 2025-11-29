import React from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { SessionCard } from "@/components/SessionCard";
import { CategoryCard } from "@/components/CategoryCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useMeditation } from "@/contexts/MeditationContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { RootStackParamList } from "@/navigation/RootNavigator";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { sessions, loading } = useMeditation();
  const { canAccessAllContent, status } = useSubscription();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.isGuest ? "" : user?.name;
    if (hour < 12) return `Good Morning${name ? ", " + name.split(" ")[0] : ""}`;
    if (hour < 18) return `Good Afternoon${name ? ", " + name.split(" ")[0] : ""}`;
    return `Good Evening${name ? ", " + name.split(" ")[0] : ""}`;
  };

  const recommendedSessions = React.useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    
    if (user?.profile?.goal && user.profile.goal !== 'Balance') {
      const filtered = sessions.filter((s) => 
        s.category === user.profile.goal || s.category === "Short"
      );
      if (filtered.length > 0) return filtered.slice(0, 3);
    }
    
    return sessions.filter(s => (s.category as string) !== 'Breathing').slice(0, 3);
  }, [sessions, user?.profile?.goal]);

  const categories = [
    { icon: "moon" as const, title: "Sleep" },
    { icon: "zap" as const, title: "Stress" },
    { icon: "cpu" as const, title: "Focus" },
    { icon: "clock" as const, title: "Short" },
    { icon: "feather" as const, title: "Deep" },
  ];

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

  return (
    <>
      <ScreenScrollView>
        <View style={styles.section}>
          <ThemedText style={[Typography.h2, styles.greeting]}>
            {getGreeting()}
          </ThemedText>
          <ThemedText style={[Typography.small, { color: theme.textSecondary }]}>
            Your personalized meditation journey
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>
            Recommended for You
          </ThemedText>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            recommendedSessions.map((session) => (
              <SessionCard
                key={session.id}
                {...session}
                locked={!canAccessAllContent}
                onPress={() => handleSessionPress(session.id)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>
            Browse by Category
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.title}
                icon={category.icon}
                title={category.title}
                onPress={() => {
                  navigation.navigate("LibraryTab", {
                    screen: "Library",
                    params: { category: category.title },
                  });
                }}
              />
            ))}
          </ScrollView>
        </View>
      </ScreenScrollView>

      <FloatingActionButton
        onPress={() => navigation.navigate("Breathing")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  categoriesContainer: {
    paddingRight: Spacing.lg,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
});
