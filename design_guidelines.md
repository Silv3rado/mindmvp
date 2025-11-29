# Meditation App MVP - Design Guidelines

## Authentication & Account

**Authentication Required**: The app requires user accounts for syncing meditation history, tracking habits across devices, and managing subscriptions.

**Implementation**:
- Use Firebase Authentication with Apple Sign-In (iOS) and Google Sign-In
- Include email/password as fallback option
- Onboarding flow with 3 personalization questions (goal, daily time commitment, experience level)
- Profile screen includes:
  - User avatar (generated meditation-themed avatar options: zen stones, lotus, meditation pose silhouettes)
  - Display name
  - Subscription status
  - App preferences (theme, notification time, session reminders)
  - Log out (with confirmation)
  - Delete account (nested under Settings > Account > Delete, double confirmation required)

---

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs) + Floating Action Button

**Tab Structure**:
1. **Home** - Recommended sessions and meditation categories
2. **Library** - Full catalog of meditations organized by theme
3. **Habit** - Calendar tracker and streak visualization
4. **Profile** - Account, subscription, and settings

**Floating Action Button**: Positioned center-bottom above tab bar for "Start Session" (quick access to breathing exercise or last played meditation)

---

## Screen Specifications

### 1. Onboarding Flow (Stack-Only, Modal)
**Purpose**: Collect user preferences for personalized recommendations

**Screens**:
- **Welcome Screen**
  - Header: Transparent, no navigation buttons
  - Content: App logo, tagline, "Get Started" CTA button
  - Safe area: top inset.top + Spacing.xl, bottom inset.bottom + Spacing.xl

- **Question Screens (3 total)**
  - Header: Transparent, back button (left), progress indicator (1/3, 2/3, 3/3)
  - Content: Single question with multiple choice options as large cards
  - Questions: 1) "What's your meditation goal?" (Sleep, Stress, Focus, Balance), 2) "How much time daily?" (3-5 min, 10-15 min, 20+ min), 3) "Experience level?" (Beginner, Intermediate, Advanced)
  - Bottom: "Continue" button (disabled until selection made)
  - Safe area: top headerHeight + Spacing.xl, bottom inset.bottom + Spacing.xl

### 2. Home Screen (Home Tab)
**Purpose**: Discover recommended meditations and browse categories

**Layout**:
- Header: Transparent, greeting text (e.g., "Good Morning, [Name]"), bell icon (right) for reminders
- Content: Scrollable vertical layout
  - AI Recommendations section (3 session cards)
  - Categories section (Sleep, Stress, Focus, Short Sessions, Deep Sessions) as horizontal scrolling cards
  - Featured/New section
- Safe area: top headerHeight + Spacing.xl, bottom tabBarHeight + Spacing.xl

**Components**: Horizontal scrolling card lists, category chips, session cards with cover art, duration, and difficulty badge

### 3. Library Screen (Library Tab)
**Purpose**: Browse full meditation catalog with filtering

**Layout**:
- Header: Default navigation header with search bar
- Content: Filterable list of all meditations
  - Filter chips at top (All, Sleep, Stress, Focus, Duration, Difficulty)
  - Vertical scrolling list of session cards
- Safe area: top Spacing.xl (non-transparent header), bottom tabBarHeight + Spacing.xl

**Components**: Search bar, filter chips, list items with thumbnail, title, duration, category tag

### 4. Player Screen (Modal, Full Screen)
**Purpose**: Play meditation audio with controls

**Layout**:
- Header: Transparent, close button (top-left), favorite button (top-right)
- Content: Non-scrollable, centered layout
  - Session cover art (large, centered)
  - Session title and narrator name
  - Progress bar with time elapsed/remaining
  - Play/pause button (large, centered)
  - Skip back 15s / forward 15s buttons
  - Sleep timer button (bottom-left)
  - Speed control button (bottom-right, 1x, 1.25x, 1.5x)
- Safe area: top inset.top + Spacing.xl, bottom inset.bottom + Spacing.xl

**Components**: Large circular play/pause button with visual feedback, minimal seekbar, icon buttons for secondary controls

### 5. Habit Tracker Screen (Habit Tab)
**Purpose**: View practice history and maintain streak

**Layout**:
- Header: Default navigation header, title "My Practice"
- Content: Scrollable
  - Streak counter card at top (bold number + "day streak" with flame icon)
  - Calendar view (current month, dots/checkmarks on practice days)
  - Weekly summary stats (sessions completed, total minutes)
- Safe area: top Spacing.xl, bottom tabBarHeight + Spacing.xl

**Components**: Calendar grid with marked days, stat cards, progress rings

### 6. Breathing Exercise Screen (Accessed via FAB)
**Purpose**: Guided breathing visualization

**Layout**:
- Header: Transparent, close button (top-left)
- Content: Non-scrollable, centered
  - Animated breathing circle (expands/contracts)
  - Breathing instruction text ("Breathe in..." / "Hold..." / "Breathe out...")
  - Duration selector (1, 3, 5, 10 minutes)
  - Start/stop button
- Safe area: top inset.top + Spacing.xl, bottom inset.bottom + Spacing.xl

**Components**: Animated SVG/Canvas circle with smooth scaling, timer display, simple controls

### 7. Profile Screen (Profile Tab)
**Purpose**: Manage account, subscription, and settings

**Layout**:
- Header: Default navigation header, title "Profile"
- Content: Scrollable form-like layout
  - Avatar and display name section (tappable to edit)
  - Subscription card (current plan, upgrade/manage CTA)
  - Settings sections (Notifications, Appearance, Language, Help & Feedback)
  - Account actions (Log out, Delete account)
- Safe area: top Spacing.xl, bottom tabBarHeight + Spacing.xl

**Components**: Avatar picker, settings list items, subscription card with upgrade button

### 8. Subscription Screen (Modal from Profile)
**Purpose**: Display subscription options and payment

**Layout**:
- Header: Default, close button (right), title "Premium"
- Content: Scrollable
  - Benefits list (checkmarks)
  - Pricing card: "7-day free trial, then $9.99/month"
  - "Start Free Trial" button
  - Terms and privacy policy links (small text)
- Safe area: top Spacing.xl, bottom inset.bottom + Spacing.xl
- Submit button: Below pricing card (not in header)

---

## Design System

### Color Palette (Minimalist Neutral)
**Light Theme**:
- Background: #FAFAFA
- Surface: #FFFFFF
- Primary: #6B5B95 (calming purple)
- Text Primary: #1A1A1A
- Text Secondary: #6B6B6B
- Border: #E0E0E0
- Success (streak): #4CAF50
- Accent: #9575CD (lighter purple)

**Dark Theme**:
- Background: #121212
- Surface: #1E1E1E
- Primary: #9575CD
- Text Primary: #FFFFFF
- Text Secondary: #B0B0B0
- Border: #2C2C2C
- Success: #66BB6A
- Accent: #6B5B95

### Typography
- **Headings**: SF Pro Display (iOS) / Roboto (Android)
  - H1: 32px, Bold
  - H2: 24px, Semibold
  - H3: 20px, Medium
- **Body**: SF Pro Text / Roboto
  - Body: 16px, Regular
  - Small: 14px, Regular
  - Caption: 12px, Regular
- Line height: 1.5 for body text
- Large tappable targets: minimum 48x48 points

### Visual Feedback
- All touchable elements: Slight scale down (0.95) or opacity (0.7) on press
- Floating Action Button: Subtle shadow
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
- No heavy drop shadows on cards or buttons
- Border radius: 12px for cards, 8px for buttons, 24px for pill-shaped elements

### Icons
- Use Feather icons from @expo/vector-icons for UI actions
- No emojis - use abstract/minimalist meditation symbols

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Required Assets
Generate these meditation-themed assets:
1. **User Avatars (4 options)**: Minimalist illustrations - zen stones stack, lotus flower, meditation pose silhouette, yin-yang symbol (simple line art, monochrome with primary color accent)
2. **Session Cover Art (6 samples)**: Abstract gradients matching meditation themes - soft purples/blues for sleep, warm oranges for focus, cool teals for stress relief
3. **Breathing Exercise Animation**: Circular shape asset for inhale/exhale visualization (can be SVG)
4. **Category Icons**: Simple line icons for each category (moon for sleep, brain for focus, heart for stress, clock for short sessions, tree for deep sessions)

### Animations
- Screen transitions: Smooth fade + slight scale (300ms)
- Audio player: Gentle fade-in for controls
- Breathing circle: Smooth 4-second in, 4-second out cycle
- Streak counter: Subtle celebration animation on new milestone
- No heavy or distracting animations during meditation playback

---

## Accessibility Requirements
- VoiceOver/TalkBack labels on all interactive elements
- Minimum contrast ratio 4.5:1 for text
- Audio playback controllable via headphone controls
- Haptic feedback on key actions (start session, complete breathing cycle)
- Support for system font scaling
- Focus indicators for keyboard navigation