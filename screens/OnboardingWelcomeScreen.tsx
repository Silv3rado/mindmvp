import React from "react";
import { View, StyleSheet, Image, Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ParchmentBackground } from "@/components/ParchmentBackground";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "OnboardingWelcome">;

const textColor = "#3D2914";
const subtextColor = "rgba(61,41,20,0.7)";

export default function OnboardingWelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ParchmentBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.content}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={[Typography.h1, styles.title, { color: textColor }]}>
            Welcome to MindMVP
          </ThemedText>
          <ThemedText style={[Typography.body, styles.subtitle, { color: subtextColor }]}>
            Your journey to mindfulness begins here
          </ThemedText>
          
          <View style={[styles.headphonesHint, { backgroundColor: "rgba(61,41,20,0.1)" }]}>
            <Text style={{ fontSize: 16, color: subtextColor }}>{"🎧"}</Text>
            <ThemedText style={[Typography.small, { color: subtextColor, marginLeft: Spacing.xs }]}>
              Use headphones for full immersion
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => navigation.navigate("OnboardingQuestion", { step: 1 })}
            android_disableSound={true}
            android_ripple={null}
            focusable={false}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? '#6B4EAF' : theme.primary, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <ThemedText style={[Typography.body, { color: "#FFFFFF" }]}>
              Get Started
            </ThemedText>
          </Pressable>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  headphonesHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  footer: {
    paddingBottom: Spacing.xl,
  },
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
