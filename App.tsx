import React, { useEffect } from "react";
import { StyleSheet, LogBox, Platform, UIManager } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";

LogBox.ignoreAllLogs(true);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import RootNavigator from "@/navigation/RootNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { HabitProvider } from "@/contexts/HabitContext";
import { MeditationProvider } from "@/contexts/MeditationContext";
import { ThemeProvider, useThemeContext } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { effectiveTheme } = useThemeContext();
  
  return (
    <>
      <RootNavigator />
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Feather': require('./assets/fonts/Feather.ttf'),
    'Ionicons': require('./assets/fonts/Ionicons.ttf'),
    'feather': require('./assets/fonts/Feather.ttf'),
    'ionicons': require('./assets/fonts/Ionicons.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <HabitProvider>
                <MeditationProvider>
                  <NotificationProvider>
                    <GestureHandlerRootView style={styles.root}>
                      <KeyboardProvider>
                        <NavigationContainer>
                          <AppContent />
                        </NavigationContainer>
                      </KeyboardProvider>
                    </GestureHandlerRootView>
                  </NotificationProvider>
                </MeditationProvider>
              </HabitProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
