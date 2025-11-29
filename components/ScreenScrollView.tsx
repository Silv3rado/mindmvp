import { ScrollView, ScrollViewProps, StyleSheet, ImageBackground, View } from "react-native";

import { useThemeContext } from "@/contexts/ThemeContext";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { Spacing } from "@/constants/theme";

export function ScreenScrollView({
  children,
  contentContainerStyle,
  style,
  ...scrollViewProps
}: ScrollViewProps) {
  const { effectiveTheme } = useThemeContext();
  const { paddingTop, paddingBottom, scrollInsetBottom } = useScreenInsets();
  const isDark = effectiveTheme === "dark";

  return (
    <ImageBackground
      source={require("@/assets/images/parchment-light.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.35)" }]} />
      <ScrollView
        style={[styles.container, style]}
        contentContainerStyle={[
          {
            paddingTop,
            paddingBottom,
          },
          styles.contentContainer,
          contentContainerStyle,
        ]}
        scrollIndicatorInsets={{ bottom: scrollInsetBottom }}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xl,
  },
});
