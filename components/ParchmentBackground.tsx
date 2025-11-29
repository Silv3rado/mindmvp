import React from "react";
import { View, StyleSheet, ImageBackground, ViewStyle } from "react-native";
import { useThemeContext } from "@/contexts/ThemeContext";

interface ParchmentBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
}

export function ParchmentBackground({ children, style, centered }: ParchmentBackgroundProps) {
  const { effectiveTheme } = useThemeContext();
  const isDark = effectiveTheme === "dark";

  return (
    <ImageBackground
      source={require("@/assets/images/parchment-light.png")}
      style={[styles.backgroundImage, centered && styles.centered, style]}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.35)" }]} />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
