import React from "react";
import { View, StyleSheet, Pressable, Platform, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface CategoryCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  onPress: () => void;
}

function CategoryIcon({ name, size, color }: { name: string; size: number; color: string }) {
  if (Platform.OS === "android") {
    const symbols: Record<string, string> = {
      "moon": "☾",
      "zap": "⚡",
      "cpu": "◎",
      "clock": "⏱",
      "feather": "✧",
    };
    return (
      <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: size * 0.85, color, textAlign: "center" }}>{symbols[name] || "●"}</Text>
      </View>
    );
  }
  return <Feather name={name as keyof typeof Feather.glyphMap} size={size} color={color} />;
}

export function CategoryCard({ icon, title, onPress }: CategoryCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      android_disableSound={true}
      android_ripple={null}
      focusable={false}
      style={({ pressed }) => [
        styles.container,
        { transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
    >
      <ThemedView style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <CategoryIcon name={icon} size={28} color={theme.primary} />
        <ThemedText style={[styles.title, Typography.small]}>{title}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    marginRight: Spacing.md,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  title: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
