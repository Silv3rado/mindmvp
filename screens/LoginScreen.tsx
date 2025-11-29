import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Platform, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppIcon } from '@/components/AppIcon';
import { ParchmentBackground } from '@/components/ParchmentBackground';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { RootStackParamList } from '@/navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type AuthMode = 'login' | 'register';

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { signUp, signInWithEmail, signInWithGoogle, signInWithApple, signInWithPhone, continueAsGuest, loading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (mode === 'register' && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      if (mode === 'register') {
        await signUp(email, name, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleAppleSignIn = async () => {
    await signInWithApple();
  };

  const handlePhoneSignIn = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!showCodeInput) {
      setShowCodeInput(true);
      Alert.alert('Verification Code', 'A verification code has been sent to your phone. For demo, use code: 123456');
      return;
    }

    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      await signInWithPhone(phoneNumber, verificationCode);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Phone verification failed');
    }
  };

  const handleContinueAsGuest = async () => {
    await continueAsGuest();
    navigation.goBack();
  };

  if (loading) {
    return (
      <ParchmentBackground centered>
        <ActivityIndicator size="large" color={theme.primary} />
      </ParchmentBackground>
    );
  }

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          android_disableSound={true}
          android_ripple={null}
          focusable={false}
        >
          <AppIcon name="x" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <ThemedText style={[Typography.h1, styles.title]}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </ThemedText>
        <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginBottom: Spacing.xl }]}>
          {mode === 'login' 
            ? 'Sign in to access your meditation journey' 
            : 'Start your mindfulness journey today'}
        </ThemedText>

        {!showPhoneInput ? (
          <>
            {mode === 'register' && (
              <ThemedView style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault }]}>
                <AppIcon name="user" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Full Name"
                  placeholderTextColor={theme.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </ThemedView>
            )}

            <ThemedView style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault }]}>
              <AppIcon name="mail" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </ThemedView>

            <ThemedView style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault }]}>
              <AppIcon name="lock" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </ThemedView>

            <Pressable
              onPress={handleEmailAuth}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
              ]}
              android_disableSound={true}
              android_ripple={null}
              focusable={false}
            >
              <ThemedText style={[Typography.body, { color: '#FFFFFF' }]}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={({ pressed }) => [styles.switchButton, { opacity: pressed ? 0.7 : 1 }]}
              android_disableSound={true}
              android_ripple={null}
              focusable={false}
            >
              <ThemedText style={[Typography.small, { color: theme.primary }]}>
                {mode === 'login' 
                  ? "Don't have an account? Sign Up" 
                  : 'Already have an account? Sign In'}
              </ThemedText>
            </Pressable>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <ThemedText style={[Typography.small, { color: theme.textSecondary, marginHorizontal: Spacing.md }]}>
                or continue with
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.socialButtons}>
              <Pressable
                onPress={handleGoogleSignIn}
                style={({ pressed }) => [
                  styles.socialButton,
                  { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
                ]}
                android_disableSound={true}
                android_ripple={null}
                focusable={false}
              >
                <AppIcon name="mail" size={22} color={theme.text} />
                <ThemedText style={[Typography.small, styles.socialButtonText]}>Google</ThemedText>
              </Pressable>

              {Platform.OS === 'ios' && (
                <Pressable
                  onPress={handleAppleSignIn}
                  style={({ pressed }) => [
                    styles.socialButton,
                    { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
                  ]}
                  android_disableSound={true}
                  android_ripple={null}
                  focusable={false}
                >
                  <AppIcon name="smartphone" size={22} color={theme.text} />
                  <ThemedText style={[Typography.small, styles.socialButtonText]}>Apple</ThemedText>
                </Pressable>
              )}

              <Pressable
                onPress={() => setShowPhoneInput(true)}
                style={({ pressed }) => [
                  styles.socialButton,
                  { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
                ]}
                android_disableSound={true}
                android_ripple={null}
                focusable={false}
              >
                <AppIcon name="phone" size={22} color={theme.text} />
                <ThemedText style={[Typography.small, styles.socialButtonText]}>Phone</ThemedText>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <ThemedView style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault }]}>
              <AppIcon name="phone" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={theme.textSecondary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </ThemedView>

            {showCodeInput && (
              <ThemedView style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault }]}>
                <AppIcon name="key" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Verification Code"
                  placeholderTextColor={theme.textSecondary}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                />
              </ThemedView>
            )}

            <Pressable
              onPress={handlePhoneSignIn}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
              ]}
              android_disableSound={true}
              android_ripple={null}
              focusable={false}
            >
              <ThemedText style={[Typography.body, { color: '#FFFFFF' }]}>
                {showCodeInput ? 'Verify Code' : 'Send Code'}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => {
                setShowPhoneInput(false);
                setShowCodeInput(false);
                setPhoneNumber('');
                setVerificationCode('');
              }}
              style={({ pressed }) => [styles.switchButton, { opacity: pressed ? 0.7 : 1 }]}
              android_disableSound={true}
              android_ripple={null}
              focusable={false}
            >
              <ThemedText style={[Typography.small, { color: theme.primary }]}>
                Back to other options
              </ThemedText>
            </Pressable>
          </>
        )}

        <View style={styles.guestSection}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border, flex: 1 }]} />
        </View>

        <Pressable
          onPress={handleContinueAsGuest}
          style={({ pressed }) => [
            styles.guestButton,
            { borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
          ]}
          android_disableSound={true}
          android_ripple={null}
          focusable={false}
        >
          <ThemedText style={[Typography.body, { color: theme.textSecondary }]}>
            Continue as Guest
          </ThemedText>
        </Pressable>

        <ThemedText style={[Typography.caption, { color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.lg }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </ThemedText>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: Spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    width: '100%',
  },
  input: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 16,
  },
  primaryButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: Spacing.md,
  },
  switchButton: {
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flex: 1,
  },
  socialButtonText: {
    marginLeft: Spacing.sm,
  },
  guestSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  guestButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
  },
});
