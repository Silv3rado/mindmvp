# MindMVP - Meditation App

## Overview

MindMVP is a React Native meditation application built with Expo, designed to provide users with guided meditation sessions, habit tracking, and breathing exercises. The app features a minimalist design with a light theme and parchment texture background, personalized recommendations based on user preferences, and a comprehensive library of meditation content organized by category (Sleep, Stress, Focus, Short, Deep).

The application follows a mobile-first approach with cross-platform support for iOS, Android, and web, utilizing React Native's component architecture and modern navigation patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Runtime**
- Built on React Native 0.81.5 with Expo SDK 54
- Uses React 19 with experimental React Compiler enabled
- Employs TypeScript for type safety across the codebase
- Implements the new React Native architecture (newArchEnabled: true)

**Navigation Structure**
- Root-level stack navigator managing authentication flow and modal screens
- Tab-based navigation for main app sections (Home, Library, Habit, Profile)
- Each tab contains its own stack navigator for nested screens
- Modal presentations for onboarding, player, breathing exercises, and subscription screens

**State Management**
- Context API for global state (AuthContext, HabitContext, MeditationContext, ThemeContext, NotificationContext)
- React hooks for local component state
- Custom hooks for shared logic (useAuth, useHabit, useTheme, useScreenInsets)

**Theme System** (Updated Nov 28, 2025)
- ThemeContext provides light theme only (dark theme support removed)
- App uses consistent light theme with parchment texture background
- StatusBar configured for light content
- No theme toggle in Profile screen - light theme is the only mode

**Notifications** (Updated Nov 27, 2025)
- NotificationContext manages push notification setup
- expo-notifications for push notification registration
- Notification preferences persisted to AsyncStorage
- Toggle UI in Profile screen for enabling/disabling
- Background notification handling configured

**UI/UX Patterns**
- Themed components (ThemedView, ThemedText) with consistent light theme styling
- Reanimated 2 for smooth animations and gestures
- Custom screen wrappers (ScreenScrollView, ScreenKeyboardAwareScrollView) handling safe areas and keyboard avoidance
- Floating Action Button for quick access to breathing exercises
- Glass morphism effects on iOS (BlurView for tab bar transparency)
- Category navigation from HomeScreen to LibraryScreen with filter selection

**Design System**
- Centralized theme constants (Colors, Spacing, Typography, BorderRadius)
- Elevation-based background colors (Root → Default → Secondary → Tertiary)
- Consistent spacing scale and typography hierarchy
- Platform-specific adaptations (iOS blur effects, Android material design patterns)

### Data Architecture

**Local Storage**
- AsyncStorage for persistent data (user profiles, habits, completed sessions, streaks)
- Service layer pattern (StorageService) abstracting storage operations
- Type-safe data models defined in `/types`

**Session Data** (Updated Nov 26, 2025)
- Meditation sessions stored in `/data/sessions.ts` as fallback
- Each session includes: title, duration, category, cover image, description, audioUrl
- Cover images stored as local assets in `/attached_assets/generated_images`
- LibraryScreen attempts to fetch sessions from Firestore first, falls back to local data
- Firestore integration ready - will use cloud data when Firebase credentials are configured

**User Data Model**
- User profile includes: goal, daily time commitment, experience level
- Habit tracking with calendar-based entries and streak calculations
- Session completion tracking via Set for O(1) lookup

### Authentication & Authorization (Updated Nov 28, 2025)

**Authentication Gate**
- AuthGateScreen is the mandatory entry point before accessing the main app
- Users must authenticate (or continue as guest) before seeing MainTabs
- All authentication methods integrated with Firebase Auth SDK

**Authentication Providers**
- Guest mode with Firebase Anonymous Authentication (demo mode fallback if Firebase not configured)
- Email/Password authentication via Firebase Auth
- Google Sign-In (placeholder - requires OAuth configuration)
- Apple Sign-In (iOS only) via expo-apple-authentication + Firebase
- Phone authentication (placeholder - requires Firebase Phone Auth configuration)

**Current Implementation** (Updated Nov 28, 2025)
- AuthContext provides auth state and methods throughout the app
- Firebase Auth state listener syncs user state automatically
- AuthGateScreen shows at app launch until user authenticates
- Email auth: signUp and signInWithEmail connect to Firebase
- Guest mode: Falls back to demo mode ("Guest (Demo)") if Firebase auth not configured
- Profile screen shows actual user name from context
- RootNavigator enforces auth gate before showing MainTabs

**Firebase Integration** (Updated Nov 28, 2025)
- Firebase SDK configured in `services/firebase.ts`
- Firebase Auth: signUp, signIn, signOut, signInAsGuest, signInWithApple functions
- Firestore methods: fetchMeditations(), fetchMeditationsByCategory()
- Environment variable support for Firebase config (EXPO_PUBLIC_FIREBASE_*)
- To fully activate: Enable Anonymous Auth and Email/Password in Firebase Console

**Demo Mode**
- When Firebase Auth is not configured, guest mode creates local "Guest (Demo)" user
- This allows app testing without Firebase credentials
- Email/Google/Phone auth show error messages directing users to guest mode
- Demo mode is indicated by "Guest (Demo)" name in Profile screen

**Subscription System** (Updated Nov 29, 2025)
- SubscriptionContext manages subscription state and trial logic
- PurchaseService handles RevenueCat integration for Google Play in-app purchases
- Automatic demo mode fallback when running in Expo Go (native SDK requires EAS build)
- 24-hour free trial starting from first app use (auto-starts for new users)
- Trial start time persisted in AsyncStorage per user
- Subscription status: trial, active, expired, free
- Content access control via canAccessAllContent and canAccessBreathing flags
- After trial expires: Only breathing exercises remain accessible
- Premium meditations show lock icons and redirect to subscription screen
- User-scoped purchase state prevents premium status leaking between accounts
- Demo packages: Monthly $9.99, Annual $59.99 (50% savings)
- "Clear Demo Purchase" button available in demo mode for testing

**Content Gating**
- SessionCard displays locked state for premium content when trial expired
- HomeScreen and LibraryScreen check canAccessAllContent before navigation
- Alert prompts users to subscribe when accessing locked content
- SubscriptionScreen shows trial status, remaining time, and payment options

### Audio Playback Architecture

**Current State** (Updated Nov 28, 2025)
- Player UI fully implemented with progress tracking
- **Dual audio playback: background music + voice guidance simultaneously**
- Background music (audioUrl) loops continuously during meditation
- Voice guidance (voiceUrl) plays instructions on top of music
- Background playback enabled (plays in silent mode on iOS, stays active in background)
- Proper cleanup on unmount to prevent memory leaks
- Fallback to timer-based progression when audioUrl is not available

**Implementation Details**
- Uses expo-av Audio.Sound with two separate refs: soundRef (music) and voiceRef (voice)
- Audio mode configured for: playsInSilentModeIOS, staysActiveInBackground, shouldDuckAndroid
- Music volume set to 0.5, voice volume set to 1.0 (voice is more prominent)
- Music loops (isLooping: true), voice plays once (isLooping: false)
- Both tracks play/pause simultaneously when user taps play button
- Playback status callback syncs UI state with music track position
- Graceful error handling if either audio fails to load

**Session Data**
- All sessions include audioUrl field for background music/sounds from Firebase Storage
- All sessions include voiceUrl field for voice guidance instructions from Firebase Storage
- Firestore field names: audio_url, voice_url, image_url (snake_case)
- URLs sanitized to remove extra quotes and newlines from Firestore data

### Platform-Specific Considerations

**iOS**
- Blur effects for tab bar and navigation headers
- Native stack navigation with platform-specific gestures
- Haptic feedback integration via expo-haptics

**Android**
- Edge-to-edge display enabled
- Material Design elevation system
- Predictive back gesture disabled for stability

**Web**
- Fallback components for keyboard-aware scrolling
- Single-page application output
- Static rendering support with client-side hydration

## External Dependencies

### Core Framework
- **Expo SDK 54** - Managed React Native workflow with native module access
- **React Native 0.81.5** - Cross-platform mobile framework
- **React 19** - UI library with experimental compiler

### Navigation & Routing
- **@react-navigation/native** - Navigation state management
- **@react-navigation/native-stack** - Native stack navigation
- **@react-navigation/bottom-tabs** - Tab-based navigation
- **react-native-screens** - Native navigation primitives

### UI & Animations
- **react-native-reanimated** - High-performance animations
- **react-native-gesture-handler** - Touch gesture system
- **expo-blur** - Blur effects for iOS
- **expo-symbols** - SF Symbols integration
- **@expo/vector-icons** - Icon library (Feather icons)

### Device Features
- **expo-haptics** - Haptic feedback
- **expo-status-bar** - Status bar styling
- **react-native-safe-area-context** - Safe area handling
- **react-native-keyboard-controller** - Keyboard management
- **expo-notifications** - Push notifications for meditation reminders
- **expo-mail-composer** - Email composition for help/feedback
- **expo-document-picker** - File attachment for feedback emails

### Media & Assets
- **expo-image** - Optimized image component
- **expo-av** - Audio/video playback (prepared)
- **expo-audio** - Audio playback API (prepared)
- **expo-font** - Custom font loading

### Backend Services (Prepared)
- **Firebase SDK 12.6.0** - Backend services platform
  - Firestore - Document database for meditation metadata
  - Auth - User authentication (email, Google Sign-In)
  - Storage - Audio file hosting (planned)
  
### Storage & Persistence
- **@react-native-async-storage/async-storage** - Key-value storage for offline data

### Development Tools
- **TypeScript** - Static type checking
- **Babel** - JavaScript transpilation with module resolution
- **ESLint** - Code linting with Prettier integration
- **Prettier** - Code formatting

### Configuration Notes
- Firebase integration is scaffolded but requires credentials in environment variables
- Audio URLs from Firebase Storage needed to activate playback
- Google Sign-In and Apple Sign-In prepared but not yet configured
- Subscription billing integration (Google Play, App Store) pending implementation