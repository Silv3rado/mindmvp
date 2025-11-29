import React from "react";
import { StyleSheet, Pressable, Platform, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
}

function FABIcon({ name, size, color }: { name: string; size: number; color: string }) {
  if (Platform.OS === "android") {
    const symbols: Record<string, string> = {
      "wind": "🌬",
      "play": "▶",
      "pause": "⏸",
    };
    return (
      <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: size * 0.75, color, textAlign: "center" }}>{symbols[name] || "●"}</Text>
      </View>
    );
  }
  return <Feather name={name as keyof typeof Feather.glyphMap} size={size} color={color} />;
}

export function FloatingActionButton({ onPress, icon = "wind" }: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <Pressable
      onPress={onPress}
      android_disableSound={true}
      android_ripple={null}
      focusable={false}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: pressed ? '#6B4EAF' : theme.primary,
          bottom: tabBarHeight + Spacing.xl,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <FABIcon name={icon} size={28} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
