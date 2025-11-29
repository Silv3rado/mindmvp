import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, Text, View } from "react-native";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import LibraryStackNavigator from "@/navigation/LibraryStackNavigator";
import HabitStackNavigator from "@/navigation/HabitStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { useTheme } from "@/hooks/useTheme";

export type MainTabParamList = {
  HomeTab: undefined;
  LibraryTab: { screen?: string; params?: { category?: string } } | undefined;
  HabitTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TextIcon({ symbol, size, color }: { symbol: string; size: number; color: string }) {
  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: size * 0.85, color, textAlign: "center" }}>{symbol}</Text>
    </View>
  );
}

function TabBarIcon({ name, size, color }: { name: keyof typeof Feather.glyphMap; size: number; color: string }) {
  if (Platform.OS === "android") {
    const symbols: Record<string, string> = {
      "home": "⌂",
      "book-open": "☰",
      "calendar": "▦",
      "user": "◉",
    };
    return <TextIcon symbol={symbols[name] || "●"} size={size} color={color} />;
  }
  return <Feather name={name} size={size} color={color} />;
}

export default function MainTabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryStackNavigator}
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HabitTab"
        component={HabitStackNavigator}
        options={{
          title: "Habit",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
