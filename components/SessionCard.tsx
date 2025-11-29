import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { AppIcon } from "./AppIcon";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface SessionCardProps {
  id: string;
  title: string;
  duration: number;
  category: string;
  coverImage: any;
  onPress: () => void;
  locked?: boolean;
}

export function SessionCard({ title, duration, category, coverImage, onPress, locked = false }: SessionCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      android_disableSound={true}
      android_ripple={null}
      focusable={false}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <ThemedView style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.coverContainer}>
          <Image source={coverImage} style={styles.cover} resizeMode="cover" />
          {locked && (
            <View style={[styles.lockOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
              <View style={[styles.lockBadge, { backgroundColor: theme.backgroundDefault }]}>
                <AppIcon name="lock" size={16} color={theme.primary} />
              </View>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText style={[styles.title, Typography.body]} numberOfLines={2}>
              {title}
            </ThemedText>
            {locked && (
              <View style={[styles.premiumBadge, { backgroundColor: theme.primary + '20' }]}>
                <ThemedText style={[Typography.caption, { color: theme.primary }]}>
                  Premium
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.meta}>
            <ThemedText style={[styles.metaText, Typography.small, { color: theme.textSecondary }]}>
              {duration} min
            </ThemedText>
            <ThemedText style={[styles.dot, { color: theme.textSecondary }]}>•</ThemedText>
            <ThemedText style={[styles.metaText, Typography.small, { color: theme.textSecondary }]}>
              {category}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  coverContainer: {
    position: "relative",
  },
  cover: {
    width: "100%",
    height: 120,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  lockBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  title: {
    flex: 1,
  },
  premiumBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
  },
  dot: {
    marginHorizontal: Spacing.xs,
  },
});
