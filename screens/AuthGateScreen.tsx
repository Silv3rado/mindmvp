import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppIcon } from '@/components/AppIcon';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

type AuthMode = 'choice' | 'login' | 'register' | 'phone';

export default function AuthGateScreen() {
  const { theme } = useTheme();
  const { signUp, signInWithEmail, signInWithGoogle, signInWithApple, signInWithPhone, continueAsGuest, loading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
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
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch (error) {
      console.error('Apple sign in error:', error);
    }
  };

  const handlePhoneSignIn = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!showCodeInput) {
      setShowCodeInput(true);
      Alert.alert('Verification Code', 'A verification code has been sent to your phone');
      return;
    }

    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      await signInWithPhone(phoneNumber, verificationCode);
    } catch (error) {
      Alert.alert('Error', 'Phone verification failed');
    }
  };

  const handleContinueAsGuest = async () => {
    try {
      await continueAsGuest();
    } catch (error) {
      console.error('Guest error:', error);
    }
  };

  const resetToChoice = () => {
    setMode('choice');
    setEmail('');
    setPassword('');
    setName('');
    setPhoneNumber('');
    setVerificationCode('');
    setShowCodeInput(false);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={[Typography.body, { marginTop: Spacing.md, color: theme.textSecondary }]}>
          Signing in...
        </ThemedText>
      </View>
    );
  }

  const renderChoiceScreen = () => (
    <>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText style={[Typography.h1, styles.appName]}>MindMVP</ThemedText>
        <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: 'center' }]}>
          Your journey to mindfulness begins here
        </ThemedText>
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={() => setMode('login')}
          android_disableSound={true}
          android_ripple={null}
          focusable={false}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: pressed ? '#6B4EAF' : theme.primary, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <AppIcon name="mail" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <ThemedText style={[Typography.body, { color: '#FFFFFF' }]}>
            Sign In with Email
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleGoogleSignIn}
          android_disableSound={true}
          android_ripple={null}
          focusable={false}
          style={({ pressed }) => [
            styles.socialButton,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <AppIcon name="mail" size={20} color={theme.text} style={styles.buttonIcon} />
          <ThemedText style={Typography.body}>Continue with Google</ThemedText>
        </Pressable>

        {Platform.OS === 'ios' && (
          <Pressable
            onPress={handleAppleSignIn}
            android_disableSound={true}
            android_ripple={null}
            focusable={false}
            style={({ pressed }) => [
              styles.socialButton,
              { backgroundColor: theme.text, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <AppIcon name="smartphone" size={20} color={theme.backgroundRoot} style={styles.buttonIcon} />
            <ThemedText style={[Typography.body, { color: theme.backgroundRoot }]}>
              Continue with Apple
            </ThemedText>
          </Pressable>
        )}

        <Pressable
          onPress={() => setMode('phone')}
          android_disableSound={true}
          android_ripple={null}
          focusable={false}
          style={({ pressed }) => [
            styles.socialButton,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <AppIcon name="phone" size={20} color={theme.text} style={styles.buttonIcon} />
          <ThemedText style={Typography.body}>Continue with Phone</ThemedText>
        </Pressable>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <ThemedText style={[Typography.small, { color: theme.textSecondary, marginHorizontal: Spacing.md }]}>
            or
          </ThemedText>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        <Pressable
          onPress={handleContinueAsGuest}
          android_disableSound={true}
          android_ripple={null}
          focusable={false}
          style={({ pressed }) => [
            styles.guestButton,
            { borderColor: theme.border, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <ThemedText style={[Typography.body, { color: theme.textSecondary }]}>
            Continue as Guest
          </ThemedText>
        </Pressable>

        <ThemedText style={[Typography.caption, { color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.lg }]}>
          Guest users have limited access. Sign up to unlock all features.
        </ThemedText>
      </View>
    </>
  );

  const renderEmailForm = () => (
    <>
      <View style={styles.header}>
        <Pressable onPress={resetToChoice} android_disableSound={true} android_ripple={null} focusable={false} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <AppIcon name="arrow-left" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ThemedText style={[Typography.h1, styles.title]}>
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </ThemedText>
      <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginBottom: Spacing.xl }]}>
        {mode === 'login' ? 'Sign in to continue your journey' : 'Start your mindfulness journey today'}
      </ThemedText>

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
        android_disableSound={true}
        android_ripple={null}
        focusable={false}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: pressed ? '#6B4EAF' : theme.primary, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <ThemedText style={[Typography.body, { color: '#FFFFFF' }]}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
        android_disableSound={true}
        android_ripple={null}
        focusable={false}
        style={({ pressed }) => [styles.switchButton, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
      >
        <ThemedText style={[Typography.small, { color: theme.primary }]}>
          {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </ThemedText>
      </Pressable>
    </>
  );

  const renderPhoneForm = () => (
    <>
      <View style={styles.header}>
        <Pressable onPress={resetToChoice} android_disableSound={true} android_ripple={null} focusable={false} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          <AppIcon name="arrow-left" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ThemedText style={[Typography.h1, styles.title]}>Phone Sign In</ThemedText>
      <ThemedText style={[Typography.body, { color: theme.textSecondary, textAlign: 'center', marginBottom: Spacing.xl }]}>
        Enter your phone number to receive a verification code
      </ThemedText>

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
        android_disableSound={true}
        android_ripple={null}
        focusable={false}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: pressed ? '#6B4EAF' : theme.primary, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <ThemedText style={[Typography.body, { color: '#FFFFFF' }]}>
          {showCodeInput ? 'Verify Code' : 'Send Code'}
        </ThemedText>
      </Pressable>
    </>
  );

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.content}>
        {mode === 'choice' && renderChoiceScreen()}
        {(mode === 'login' || mode === 'register') && renderEmailForm()}
        {mode === 'phone' && renderPhoneForm()}
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
  content: {
    flex: 1,
    paddingTop: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    paddingTop: Spacing.xxl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.md,
  },
  appName: {
    marginBottom: Spacing.sm,
  },
  buttonsContainer: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 16,
  },
  primaryButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  socialButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  guestButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  switchButton: {
    padding: Spacing.sm,
    alignItems: 'center',
  },
});
