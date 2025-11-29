import { User, UserProfile, AuthProvider } from '@/types/index';
import { StorageService } from './storageService';

const DEFAULT_GUEST_PROFILE: UserProfile = {
  goal: 'Balance',
  dailyTime: '10-15 min',
  experienceLevel: 'Beginner',
};

export class AuthService {
  static async createGuestUser(): Promise<User> {
    const guestUser: User = {
      id: `guest_${Date.now()}`,
      email: '',
      name: 'Guest',
      profile: DEFAULT_GUEST_PROFILE,
      createdAt: Date.now(),
      isGuest: true,
      authProvider: 'guest',
    };

    await StorageService.saveUser(guestUser);
    return guestUser;
  }

  static async signUp(email: string, name: string, profile: UserProfile, password?: string): Promise<User> {
    const emailExists = await StorageService.emailExists(email);
    if (emailExists) {
      throw new Error('An account with this email already exists');
    }

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      profile,
      createdAt: Date.now(),
      isGuest: false,
      authProvider: 'email',
    };

    await StorageService.saveUser(user);
    
    if (password) {
      await StorageService.saveCredentials(email, password, user.id, name);
    }
    
    return user;
  }

  static async signInWithEmail(email: string, password: string): Promise<User> {
    const validatedUser = await StorageService.validateCredentials(email, password);
    
    if (!validatedUser) {
      throw new Error('Invalid email or password');
    }

    const user: User = {
      id: validatedUser.userId,
      email,
      name: validatedUser.name,
      profile: DEFAULT_GUEST_PROFILE,
      createdAt: Date.now(),
      isGuest: false,
      authProvider: 'email',
    };

    await StorageService.saveUser(user);
    return user;
  }

  static async signInWithGoogle(idToken: string, accessToken: string): Promise<User> {
    const user: User = {
      id: `google_${Math.random().toString(36).substr(2, 9)}`,
      email: 'google@user.com',
      name: 'Google User',
      profile: DEFAULT_GUEST_PROFILE,
      createdAt: Date.now(),
      isGuest: false,
      authProvider: 'google',
    };

    await StorageService.saveUser(user);
    return user;
  }

  static async signInWithApple(identityToken: string, user?: { email?: string; fullName?: { givenName?: string; familyName?: string } }): Promise<User> {
    const name = user?.fullName?.givenName 
      ? `${user.fullName.givenName}${user.fullName.familyName ? ' ' + user.fullName.familyName : ''}`
      : 'Apple User';

    const appleUser: User = {
      id: `apple_${Math.random().toString(36).substr(2, 9)}`,
      email: user?.email || '',
      name,
      profile: DEFAULT_GUEST_PROFILE,
      createdAt: Date.now(),
      isGuest: false,
      authProvider: 'apple',
    };

    await StorageService.saveUser(appleUser);
    return appleUser;
  }

  static async signInWithPhone(phoneNumber: string, verificationCode: string): Promise<User> {
    const user: User = {
      id: `phone_${Math.random().toString(36).substr(2, 9)}`,
      email: '',
      name: 'Phone User',
      phoneNumber,
      profile: DEFAULT_GUEST_PROFILE,
      createdAt: Date.now(),
      isGuest: false,
      authProvider: 'phone',
    };

    await StorageService.saveUser(user);
    return user;
  }

  static async getCurrentUser(): Promise<User | null> {
    return StorageService.getUser();
  }

  static async signOut(): Promise<void> {
    await StorageService.clearUser();
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<User | null> {
    const user = await StorageService.getUser();
    if (user) {
      user.profile = { ...user.profile, ...updates };
      await StorageService.saveUser(user);
      return user;
    }
    return null;
  }

  static async convertGuestToUser(
    email: string, 
    name: string, 
    authProvider: AuthProvider
  ): Promise<User | null> {
    const currentUser = await StorageService.getUser();
    if (currentUser && currentUser.isGuest) {
      const updatedUser: User = {
        ...currentUser,
        email,
        name,
        isGuest: false,
        authProvider,
      };
      await StorageService.saveUser(updatedUser);
      return updatedUser;
    }
    return null;
  }
}
