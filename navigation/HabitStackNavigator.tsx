import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HabitScreen from "@/screens/HabitScreen";
import { getCommonScreenOptions } from "./screenOptions";
import { useTheme } from "@/hooks/useTheme";

export type HabitStackParamList = {
  Habit: undefined;
};

const Stack = createNativeStackNavigator<HabitStackParamList>();

export default function HabitStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark: false, transparent: false }),
      }}
    >
      <Stack.Screen
        name="Habit"
        component={HabitScreen}
        options={{ title: "My Practice" }}
      />
    </Stack.Navigator>
  );
}
