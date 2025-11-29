import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  PhoneAuthProvider,
  linkWithCredential,
  User as FirebaseUser,
  AuthCredential
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCwrWGKZwW_klKonW1a80soliDLSdxQhuk',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mindmvp-431e2.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'mindmvp-431e2',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mindmvp-431e2.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '523827057048',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:523827057048:android:3d5d0b62f96cc6eaeedbed',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export interface FirebaseAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  phoneNumber: string | null;
}

export function onAuthChange(callback: (user: FirebaseAuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
        phoneNumber: user.phoneNumber,
      });
    } else {
      callback(null);
    }
  });
}

export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<FirebaseAuthUser> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  
  await setDoc(doc(db, 'users', credential.user.uid), {
    email,
    displayName,
    createdAt: Date.now(),
    isPremium: false,
  });
  
  return {
    uid: credential.user.uid,
    email: credential.user.email,
    displayName,
    photoURL: credential.user.photoURL,
    isAnonymous: false,
    phoneNumber: credential.user.phoneNumber,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseAuthUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return {
    uid: credential.user.uid,
    email: credential.user.email,
    displayName: credential.user.displayName,
    photoURL: credential.user.photoURL,
    isAnonymous: false,
    phoneNumber: credential.user.phoneNumber,
  };
}

export async function signInAsGuest(): Promise<FirebaseAuthUser> {
  const credential = await signInAnonymously(auth);
  return {
    uid: credential.user.uid,
    email: null,
    displayName: 'Guest',
    photoURL: null,
    isAnonymous: true,
    phoneNumber: null,
  };
}

export async function signInWithGoogleCredential(idToken: string): Promise<FirebaseAuthUser> {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, googleCredential);
  
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      displayName: result.user.displayName,
      createdAt: Date.now(),
      isPremium: false,
    });
  }
  
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    isAnonymous: false,
    phoneNumber: result.user.phoneNumber,
  };
}

export async function signInWithAppleCredential(identityToken: string, nonce?: string): Promise<FirebaseAuthUser> {
  const appleProvider = new OAuthProvider('apple.com');
  const appleCredential = appleProvider.credential({
    idToken: identityToken,
    rawNonce: nonce,
  });
  const result = await signInWithCredential(auth, appleCredential);
  
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      displayName: result.user.displayName || 'Apple User',
      createdAt: Date.now(),
      isPremium: false,
    });
  }
  
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    isAnonymous: false,
    phoneNumber: result.user.phoneNumber,
  };
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getUserPremiumStatus(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data()?.isPremium === true;
    }
    return false;
  } catch (error) {
    console.log('Error checking premium status:', error);
    return false;
  }
}

export async function linkGuestToCredential(credential: AuthCredential): Promise<FirebaseAuthUser | null> {
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.isAnonymous) {
    try {
      const result = await linkWithCredential(currentUser, credential);
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isAnonymous: false,
        phoneNumber: result.user.phoneNumber,
      };
    } catch (error) {
      console.log('Error linking credential:', error);
      return null;
    }
  }
  return null;
}

export async function getStorageUrl(gsUrl: string): Promise<string> {
  if (!gsUrl) return '';
  if (gsUrl.startsWith('https://')) return gsUrl;
  if (gsUrl.startsWith('gs://')) {
    try {
      const path = gsUrl.replace(/^gs:\/\/[^\/]+\//, '');
      const storageRef = ref(storage, path);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.log('Error getting download URL for:', gsUrl, error);
      return '';
    }
  }
  return gsUrl;
}

export function fixStorageUrl(url: string): string {
  if (!url) return '';
  // Remove leading/trailing whitespace
  let cleaned = url.trim();
  // Remove leading/trailing single quotes
  cleaned = cleaned.replace(/^'+|'+$/g, '');
  // Remove leading/trailing double quotes
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  // Remove newlines and carriage returns
  cleaned = cleaned.replace(/[\n\r]/g, '');
  // Remove any remaining leading/trailing whitespace
  cleaned = cleaned.trim();
  return cleaned;
}

export interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  audioUrl: string;
  voiceUrl: string;
  imageUrl: string;
  difficulty: string;
}

export async function fetchMeditations(): Promise<Meditation[]> {
  try {
    const col = collection(db, 'Meditation');
    const snapshot = await getDocs(col);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        duration: data.duration || 0,
        category: data.category || '',
        audioUrl: data.audio_url || data.audioUrl || '',
        voiceUrl: data.voice_url || data.voiceUrl || '',
        imageUrl: data.image_url || data.imageUrl || '',
        difficulty: data.difficulty || 'All',
      } as Meditation;
    });
  } catch (error) {
    console.log('Using mock meditations', error);
    return [];
  }
}

export async function fetchMeditationsByCategory(category: string): Promise<Meditation[]> {
  try {
    const col = collection(db, 'Meditation');
    const q = query(col, where('category', '==', category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        duration: data.duration || 0,
        category: data.category || '',
        audioUrl: data.audio_url || data.audioUrl || '',
        voiceUrl: data.voice_url || data.voiceUrl || '',
        imageUrl: data.image_url || data.imageUrl || '',
        difficulty: data.difficulty || 'All',
      } as Meditation;
    });
  } catch (error) {
    console.log('Firestore query failed', error);
    return [];
  }
}
