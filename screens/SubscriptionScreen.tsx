import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/AppIcon";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { 
    status, 
    trialHoursRemaining, 
    isPremium, 
    packages,
    startTrial, 
    purchasePackage, 
    restorePurchases,
    clearDemoPurchase,
    loading,
    isDemoMode,
  } = useSubscription();
  const { isGuest } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(
    packages.find(p => p.subscriptionPeriod === 'MONTHLY')?.identifier || packages[0]?.identifier || null
  );
  const [purchasing, setPurchasing] = useState(false);

  const benefits = [
    "Unlimited access to all meditations",
    "New content added weekly",
    "Offline listening",
    "Progress tracking & insights",
    "No ads or interruptions",
  ];

  const handleStartTrial = async () => {
    if (isGuest) {
      Alert.alert(
        'Account Required',
        'Please create an account or sign in to start your free trial.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login' as never) }
        ]
      );
      return;
    }

    await startTrial();
    Alert.alert(
      'Trial Started',
      'Your 24-hour free trial has started. Enjoy unlimited access to all meditations!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleSubscribe = async () => {
    if (isGuest) {
      Alert.alert(
        'Account Required',
        'Please create an account or sign in to subscribe.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login' as never) }
        ]
      );
      return;
    }

    if (!selectedPackage) {
      Alert.alert('Select a Plan', 'Please select a subscription plan.');
      return;
    }

    try {
      setPurchasing(true);
      const success = await purchasePackage(selectedPackage);
      
      if (success) {
        Alert.alert(
          'Welcome to Premium!',
          isDemoMode 
            ? 'Demo purchase successful! In the real app, this would be processed through Google Play.'
            : 'Thank you for subscribing! You now have unlimited access to all meditations.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Purchase Failed',
        'There was an error processing your purchase. Please try again.',
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      await restorePurchases();
      Alert.alert(
        'Restore Complete', 
        isPremium 
          ? 'Your premium access has been restored!'
          : 'No previous purchases found.'
      );
    } catch (error) {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    }
  };

  const handleClearDemo = async () => {
    Alert.alert(
      'Reset Demo',
      'This will remove your demo premium status. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await clearDemoPurchase();
            Alert.alert('Reset Complete', 'Demo premium status cleared.');
          }
        }
      ]
    );
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'premium':
        return { text: 'Premium Active', color: theme.success };
      case 'trial':
        return { text: `Trial: ${trialHoursRemaining}h left`, color: theme.primary };
      case 'trial_expired':
        return { text: 'Trial Expired', color: theme.error };
      default:
        return null;
    }
  };

  const statusBadge = getStatusBadge();

  if (loading && !purchasing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <AppIcon name="x" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <AppIcon name="star" size={48} color={theme.primary} style={styles.icon} />
        <ThemedText style={[Typography.h1, styles.title]}>
          {isPremium ? 'Premium Active' : 'Go Premium'}
        </ThemedText>
        
        {statusBadge ? (
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.color + '20' }]}>
            <ThemedText style={[Typography.small, { color: statusBadge.color }]}>
              {statusBadge.text}
            </ThemedText>
          </View>
        ) : null}

        {isDemoMode ? (
          <View style={[styles.demoBadge, { backgroundColor: theme.warning + '20' }]}>
            <ThemedText style={[Typography.caption, { color: theme.warning }]}>
              Demo Mode - Expo Go
            </ThemedText>
          </View>
        ) : null}

        <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md }]}>
          {isPremium 
            ? 'You have full access to all meditations'
            : status === 'trial_expired'
              ? 'Your trial has ended. Subscribe to continue your journey.'
              : 'Unlock your full potential with unlimited access'}
        </ThemedText>

        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <AppIcon 
                name="check-circle" 
                size={20} 
                color={isPremium || status === 'trial' ? theme.success : theme.textSecondary} 
              />
              <ThemedText style={[Typography.body, styles.benefitText]}>
                {benefit}
              </ThemedText>
            </View>
          ))}
        </View>

        {!isPremium ? (
          <>
            <ThemedText style={[Typography.h3, styles.sectionTitle]}>
              Choose Your Plan
            </ThemedText>

            <View style={styles.packagesContainer}>
              {packages.map((pkg) => {
                const isSelected = selectedPackage === pkg.identifier;
                const isAnnual = pkg.subscriptionPeriod === 'ANNUAL';
                
                return (
                  <Pressable
                    key={pkg.identifier}
                    onPress={() => setSelectedPackage(pkg.identifier)}
                    style={({ pressed }) => [
                      styles.packageCard,
                      { 
                        backgroundColor: theme.backgroundDefault,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                        opacity: pressed ? 0.9 : 1,
                      }
                    ]}
                  >
                    {isAnnual ? (
                      <View style={[styles.saveBadge, { backgroundColor: theme.success }]}>
                        <ThemedText style={[Typography.caption, { color: '#FFFFFF' }]}>
                          SAVE 50%
                        </ThemedText>
                      </View>
                    ) : null}
                    
                    <View style={styles.packageInfo}>
                      <ThemedText style={Typography.h3}>
                        {pkg.priceString}
                      </ThemedText>
                      <ThemedText style={[Typography.small, { color: theme.textSecondary }]}>
                        {isAnnual ? 'per year' : 'per month'}
                      </ThemedText>
                    </View>

                    <View style={[
                      styles.radioCircle,
                      { 
                        borderColor: isSelected ? theme.primary : theme.border,
                        backgroundColor: isSelected ? theme.primary : 'transparent',
                      }
                    ]}>
                      {isSelected ? (
                        <View style={styles.radioInner} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {status === 'none' ? (
              <Pressable
                onPress={handleStartTrial}
                disabled={purchasing}
                style={({ pressed }) => [
                  styles.button,
                  styles.outlineButton,
                  { 
                    borderColor: theme.primary,
                    opacity: pressed ? 0.8 : 1,
                  }
                ]}
              >
                <ThemedText style={[Typography.body, { color: theme.primary }]}>
                  Start 24h Free Trial
                </ThemedText>
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleSubscribe}
              disabled={purchasing}
              style={({ pressed }) => [
                styles.button,
                { 
                  backgroundColor: pressed || purchasing ? '#6B4EAF' : theme.primary,
                  opacity: purchasing ? 0.7 : 1,
                }
              ]}
            >
              {purchasing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={[Typography.body, { color: "#FFFFFF" }]}>
                  {isDemoMode ? 'Demo Purchase' : 'Subscribe Now'}
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              onPress={handleRestorePurchases}
              disabled={purchasing}
              style={({ pressed }) => [styles.restoreButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <ThemedText style={[Typography.small, { color: theme.primary }]}>
                Restore Purchases
              </ThemedText>
            </Pressable>
          </>
        ) : null}

        {isPremium ? (
          <ThemedView style={[styles.premiumCard, { backgroundColor: theme.success + '20' }]}>
            <AppIcon name="check-circle" size={24} color={theme.success} />
            <ThemedText style={[Typography.body, { color: theme.success, marginTop: Spacing.sm }]}>
              You're all set! Enjoy unlimited access.
            </ThemedText>
          </ThemedView>
        ) : null}

        {isDemoMode && isPremium ? (
          <Pressable
            onPress={handleClearDemo}
            style={({ pressed }) => [styles.restoreButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <ThemedText style={[Typography.small, { color: theme.error }]}>
              Reset Demo Purchase
            </ThemedText>
          </Pressable>
        ) : null}

        <View style={styles.footer}>
          <ThemedText style={[Typography.caption, { color: theme.textSecondary, textAlign: "center" }]}>
            {isDemoMode 
              ? 'Demo mode simulates purchases. Real payments require app build and Google Play.'
              : status === 'none' 
                ? 'Trial lasts 24 hours. After trial, only breathing exercises are available for free.'
                : 'Cancel anytime through Google Play. Auto-renews monthly/yearly.'}
          </ThemedText>
        </View>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  content: {
    alignItems: "center",
  },
  icon: {
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  demoBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  benefitsContainer: {
    width: "100%",
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  benefitText: {
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  packagesContainer: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  packageInfo: {
    flex: 1,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: Spacing.md,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  restoreButton: {
    padding: Spacing.md,
  },
  premiumCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    width: "100%",
    marginTop: Spacing.lg,
  },
  footer: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
});
