import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ParchmentBackground } from "@/components/ParchmentBackground";
import { AppIcon } from "@/components/AppIcon";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootNavigator";

type OnboardingQuestionRouteProp = RouteProp<RootStackParamList, "OnboardingQuestion">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "OnboardingQuestion">;

const questions = [
  {
    question: "What's your meditation goal?",
    options: ["Sleep Better", "Reduce Stress", "Improve Focus", "Find Balance"],
  },
  {
    question: "How much time can you dedicate daily?",
    options: ["3-5 minutes", "10-15 minutes", "20+ minutes"],
  },
  {
    question: "What's your experience level?",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
];

const textColor = "#3D2914";
const subtextColor = "rgba(61,41,20,0.6)";
const cardBg = "rgba(255,255,255,0.7)";

export default function OnboardingQuestionScreen() {
  const route = useRoute<OnboardingQuestionRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const step = route.params.step;
  const currentQuestion = questions[step - 1];

  const handleContinue = () => {
    if (step < 3) {
      navigation.navigate("OnboardingQuestion", { step: step + 1 });
      setSelectedOption(null);
    } else {
      navigation.navigate("MainTabs");
    }
  };

  return (
    <ParchmentBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.header}>
          {step > 1 ? (
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <AppIcon name="chevron-left" size={24} color={textColor} />
            </Pressable>
          ) : (
            <View />
          )}
          <ThemedText style={[Typography.small, { color: subtextColor }]}>
            {step}/3
          </ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText style={[Typography.h2, styles.question, { color: textColor }]}>
            {currentQuestion.question}
          </ThemedText>

          <View style={styles.options}>
            {currentQuestion.options.map((option) => (
              <Pressable
                key={option}
                onPress={() => setSelectedOption(option)}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: selectedOption === option
                      ? theme.primary
                      : cardBg,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    Typography.body,
                    {
                      color: selectedOption === option ? "#FFFFFF" : textColor,
                    },
                  ]}
                >
                  {option}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!selectedOption}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: selectedOption ? theme.primary : "rgba(61,41,20,0.2)",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <ThemedText
            style={[
              Typography.body,
              { color: selectedOption ? "#FFFFFF" : subtextColor },
            ]}
          >
            {step < 3 ? "Continue" : "Get Started"}
          </ThemedText>
        </Pressable>
      </View>
    </ParchmentBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  content: {
    flex: 1,
  },
  question: {
    marginBottom: Spacing.xl,
  },
  options: {
    gap: Spacing.md,
  },
  optionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
});
