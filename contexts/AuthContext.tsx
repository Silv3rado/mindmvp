import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { User, UserProfile, AuthProvider as AuthProviderType } from '@/types/index';
import { 
  onAuthChange, 
  signUpWithEmail as firebaseSignUp,
  signInWithEmail as firebaseSignIn,
  signInAsGuest as firebaseSignInAsGuest,
  signInWithAppleCredential,
  signOutUser,
  FirebaseAuthUser,
  getUserPremiumStatus
} from '@/services/firebase';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseAuthUser | null;
  loading: boolean;
  authResolved: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  isPremium: boolean;
  signUp: (email: string, name: string, password: string, profile?: UserProfile) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithPhone: (phoneNumber: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  goal: 'Balance',
  dailyTime: '10-15 min',
  experienceLevel: 'Beginner',
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        const premium = await getUserPremiumStatus(fbUser.uid);
        setIsPremium(premium);
        
        setUser({
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || (fbUser.isAnonymous ? 'Guest' : 'User'),
          profile: DEFAULT_PROFILE,
          createdAt: Date.now(),
          isGuest: fbUser.isAnonymous,
          authProvider: fbUser.isAnonymous ? 'guest' : 
                       fbUser.email ? 'email' : 
                       fbUser.phoneNumber ? 'phone' : 'guest',
        });
      } else {
        setUser(null);
        setIsPremium(false);
      }
      
      setAuthResolved(true);
    });

    return () => unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, name: string, password: string, profile?: UserProfile) => {
    setLoading(true);
    try {
      await firebaseSignUp(email, password, name);
    } catch (error: any) {
      if (error.code === 'auth/configuration-not-found' || 
          error.code === 'auth/operation-not-allowed') {
        throw new Error('Email authentication is not configured. Please continue as a guest or contact support.');
      }
      console.log('Sign-up error:', error.code);
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      const message = error.code === 'auth/email-already-in-use' 
        ? 'This email is already registered' 
        : error.message || 'Registration failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await firebaseSignIn(email, password);
    } catch (error: any) {
      if (error.code === 'auth/configuration-not-found' || 
          error.code === 'auth/operation-not-allowed') {
        throw new Error('Email authentication is not configured. Please continue as a guest or contact support.');
      }
      console.log('Sign-in error:', error.code);
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      const message = error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password' 
        : error.message || 'Sign in failed';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    Alert.alert(
      'Google Sign-In', 
      'Google Sign-In requires additional configuration. Please use email or continue as guest.'
    );
  }, []);

  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign-In is only available on iOS devices');
      return;
    }

    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        await signInWithAppleCredential(credential.identityToken);
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      console.log('Apple sign-in error:', error.code);
      Alert.alert('Error', 'Failed to sign in with Apple');
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithPhone = useCallback(async (phoneNumber: string, code: string) => {
    Alert.alert(
      'Phone Sign-In', 
      'Phone authentication requires additional Firebase configuration. Please use email or continue as guest.'
    );
  }, []);

  const continueAsGuest = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignInAsGuest();
    } catch (error: any) {
      // Handle various Firebase auth errors and fall back to demo mode
      const demoModeCodes = [
        'auth/configuration-not-found',
        'auth/operation-not-allowed',
        'auth/network-request-failed',
        'auth/admin-restricted-operation', // Anonymous auth not enabled in Firebase Console
      ];
      
      if (demoModeCodes.includes(error.code)) {
        const demoGuestId = `demo_guest_${Date.now()}`;
        const localGuestUser: User = {
          id: demoGuestId,
          email: '',
          name: 'Guest (Demo)',
          profile: DEFAULT_PROFILE,
          createdAt: Date.now(),
          isGuest: true,
          authProvider: 'guest',
        };
        setUser(localGuestUser);
        setFirebaseUser({
          uid: demoGuestId,
          email: null,
          displayName: 'Guest (Demo)',
          photoURL: null,
          isAnonymous: true,
          phoneNumber: null,
        });
        setAuthResolved(true);
        console.log('Running in demo mode - Firebase auth not configured');
      } else {
        console.log('Guest sign-in error:', error.code);
        Alert.alert('Error', 'Failed to continue as guest. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
      setFirebaseUser(null);
      setIsPremium(false);
    } catch (error) {
      console.log('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        authResolved,
        isAuthenticated: !!firebaseUser,
        isGuest: firebaseUser?.isAnonymous ?? true,
        isPremium,
        signUp,
        signInWithEmail,
        signInWithGoogle,
        signInWithApple,
        signInWithPhone,
        signOut,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
