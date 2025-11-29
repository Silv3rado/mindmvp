import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "./MainTabNavigator";
import OnboardingWelcomeScreen from "@/screens/OnboardingWelcomeScreen";
import OnboardingQuestionScreen from "@/screens/OnboardingQuestionScreen";
import PlayerScreen from "@/screens/PlayerScreen";
import BreathingScreen from "@/screens/BreathingScreen";
import SubscriptionScreen from "@/screens/SubscriptionScreen";
import LoginScreen from "@/screens/LoginScreen";
import AuthGateScreen from "@/screens/AuthGateScreen";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  AuthGate: undefined;
  MainTabs: undefined;
  OnboardingWelcome: undefined;
  OnboardingQuestion: { step: number };
  Player: { sessionId: string };
  Breathing: undefined;
  Subscription: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, authResolved, loading } = useAuth();
  const { theme } = useTheme();

  if (!authResolved || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.backgroundRoot }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="AuthGate" component={AuthGateScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Group screenOptions={{ presentation: "modal" }}>
            <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
            <Stack.Screen name="OnboardingQuestion" component={OnboardingQuestionScreen} />
            <Stack.Screen name="Player" component={PlayerScreen} />
            <Stack.Screen name="Breathing" component={BreathingScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
}
