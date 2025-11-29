import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

type IconName = "home" | "book-open" | "calendar" | "user" | "play" | "moon" | "zap" | "sun" | "heart" | "wind" | "x" | "pause" | "lock" | "check" | "chevron-right" | "bell" | "log-out" | "settings" | "mail" | "info" | "credit-card";

interface TabIconProps {
  name: IconName;
  size: number;
  color: string;
}

const iconSymbols: Record<IconName, string> = {
  "home": "⌂",
  "book-open": "📖",
  "calendar": "📅",
  "user": "👤",
  "play": "▶",
  "moon": "🌙",
  "zap": "⚡",
  "sun": "☀",
  "heart": "♥",
  "wind": "🌬",
  "x": "✕",
  "pause": "⏸",
  "lock": "🔒",
  "check": "✓",
  "chevron-right": "›",
  "bell": "🔔",
  "log-out": "↪",
  "settings": "⚙",
  "mail": "✉",
  "info": "ℹ",
  "credit-card": "💳",
};

export function TabIcon({ name, size, color }: TabIconProps) {
  if (Platform.OS === "web") {
    return <Feather name={name} size={size} color={color} />;
  }

  return (
    <Feather name={name} size={size} color={color} />
  );
}

export function FallbackIcon({ name, size, color }: TabIconProps) {
  const symbol = iconSymbols[name] || "?";
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.icon, { fontSize: size * 0.7, color }]}>
        {symbol}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    textAlign: "center",
  },
});
