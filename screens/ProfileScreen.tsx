import React from "react";
import { View, StyleSheet, Pressable, Alert, Switch, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as MailComposer from "expo-mail-composer";
import * as DocumentPicker from "expo-document-picker";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/AppIcon";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { RootStackParamList } from "@/navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEVELOPER_EMAIL = "support@mindmvp.app";

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { notificationsEnabled, toggleNotifications, isSupported: notificationsSupported } = useNotifications();
  const { user, signOut, isGuest } = useAuth();
  const { status, trialHoursRemaining, isPremium } = useSubscription();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        onPress: async () => {
          await signOut();
          navigation.navigate("OnboardingWelcome");
        },
        style: "destructive",
      },
    ]);
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const getSubscriptionLabel = () => {
    if (isPremium) return "Premium";
    if (status === "trial") return `Trial (${trialHoursRemaining}h left)`;
    if (status === "trial_expired") return "Trial Expired";
    return "Free";
  };

  const getSubscriptionColor = () => {
    if (isPremium) return theme.success;
    if (status === "trial") return theme.primary;
    if (status === "trial_expired") return theme.error;
    return theme.textSecondary;
  };

  const handleHelpFeedback = async () => {
    const options = [
      {
        text: "Send Feedback",
        onPress: () => sendEmail(false),
      },
      {
        text: "Send with Attachment",
        onPress: () => sendEmailWithAttachment(),
      },
      { text: "Cancel", style: "cancel" as const },
    ];
    Alert.alert("Help & Feedback", "How would you like to contact us?", options);
  };

  const sendEmail = async (hasAttachment: boolean, attachmentUri?: string) => {
    const isAvailable = await MailComposer.isAvailableAsync();
    
    if (!isAvailable) {
      Alert.alert(
        "Email Not Available",
        `Please send your feedback to ${DEVELOPER_EMAIL}`,
        [{ text: "OK" }]
      );
      return;
    }

    const options: MailComposer.MailComposerOptions = {
      recipients: [DEVELOPER_EMAIL],
      subject: "MindMVP App Feedback",
      body: `
Hello MindMVP Team,

[Please describe your feedback or issue here]

---
App Version: 1.0.0
Platform: ${Platform.OS}
User: ${user?.email || "Anonymous"}
      `.trim(),
    };

    if (hasAttachment && attachmentUri) {
      options.attachments = [attachmentUri];
    }

    try {
      await MailComposer.composeAsync(options);
    } catch (error) {
      Alert.alert("Error", "Could not open email app");
    }
  };

  const sendEmailWithAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await sendEmail(true, result.assets[0].uri);
      } else {
        await sendEmail(false);
      }
    } catch (error) {
      await sendEmail(false);
    }
  };

  const userInitial = isGuest ? "G" : (user?.name?.charAt(0).toUpperCase() || "M");
  const userName = user?.name || (isGuest ? "Guest" : "Meditation User");
  const userEmail = isGuest ? "Not signed in" : (user?.email || "");

  return (
    <ScreenScrollView>
      <ThemedView style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatar, { backgroundColor: isGuest ? theme.textSecondary : theme.primary }]}>
          <ThemedText style={[Typography.h1, { color: "#FFFFFF" }]}>
            {userInitial}
          </ThemedText>
        </View>
        <ThemedText style={[Typography.h3, styles.userName]}>
          {userName}
        </ThemedText>
        <ThemedText style={[Typography.small, { color: theme.textSecondary }]}>
          {userEmail}
        </ThemedText>

        {isGuest && (
          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText style={[Typography.body, { color: "#FFFFFF" }]}>
              Sign In / Create Account
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>

      <View style={styles.section}>
        <ThemedText style={[Typography.small, styles.sectionTitle, { color: theme.textSecondary }]}>
          Subscription
        </ThemedText>
        <ThemedView style={[styles.settingsCard, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable
            onPress={() => navigation.navigate("Subscription")}
            style={({ pressed }) => [
              styles.settingsItem,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.settingsItemLeft}>
              <AppIcon name="star" size={20} color={theme.textSecondary} />
              <ThemedText style={[Typography.body, styles.settingsLabel]}>
                Premium
              </ThemedText>
            </View>
            <View style={styles.settingsItemRight}>
              <ThemedText style={[Typography.small, { color: getSubscriptionColor(), marginRight: Spacing.sm }]}>
                {getSubscriptionLabel()}
              </ThemedText>
              <AppIcon name="chevron-right" size={20} color={theme.textSecondary} />
            </View>
          </Pressable>
        </ThemedView>
      </View>

      <View style={styles.section}>
        <ThemedText style={[Typography.small, styles.sectionTitle, { color: theme.textSecondary }]}>
          Preferences
        </ThemedText>
        <ThemedView style={[styles.settingsCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <AppIcon name="bell" size={20} color={theme.textSecondary} />
              <View>
                <ThemedText style={[Typography.body, styles.settingsLabel]}>
                  Notifications
                </ThemedText>
                {!notificationsSupported ? (
                  <ThemedText style={[Typography.small, { color: theme.textSecondary, marginLeft: Spacing.md }]}>
                    Local only
                  </ThemedText>
                ) : null}
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.backgroundSecondary, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </ThemedView>
      </View>

      <View style={styles.section}>
        <ThemedText style={[Typography.small, styles.sectionTitle, { color: theme.textSecondary }]}>
          Support
        </ThemedText>
        <ThemedView style={[styles.settingsCard, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable
            onPress={handleHelpFeedback}
            style={({ pressed }) => [
              styles.settingsItem,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.settingsItemLeft}>
              <AppIcon name="help-circle" size={20} color={theme.textSecondary} />
              <ThemedText style={[Typography.body, styles.settingsLabel]}>
                Help & Feedback
              </ThemedText>
            </View>
            <View style={styles.settingsItemRight}>
              <AppIcon name="mail" size={18} color={theme.textSecondary} style={{ marginRight: Spacing.xs }} />
              <AppIcon name="chevron-right" size={20} color={theme.textSecondary} />
            </View>
          </Pressable>
        </ThemedView>
      </View>

      {!isGuest && (
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <ThemedText style={[Typography.body, { color: theme.error }]}>
            Sign Out
          </ThemedText>
        </Pressable>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  loginButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  settingsCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsLabel: {
    marginLeft: Spacing.md,
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  signOutButton: {
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
});
