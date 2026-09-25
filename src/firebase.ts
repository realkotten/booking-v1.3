import { initializeApp } from 'firebase/app';
import { DEFAULT_CLIENT_AVATAR } from './data/avatars';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  initializeFirestore,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID and robust long-polling transport for web/iframe
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
}, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Apple Auth Provider
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Export Phone Auth helpers
export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };

/**
 * Safely clear any existing RecaptchaVerifier instance and DOM contents
 */
export function clearPhoneRecaptcha(containerId = 'phone-recaptcha-container'): void {
  if (typeof window === 'undefined') return;
  try {
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {}
      (window as any).recaptchaVerifier = null;
    }
  } catch (e) {
    (window as any).recaptchaVerifier = null;
  }

  // Ensure DOM container is emptied and reset cleanly to avoid "reCAPTCHA has already been rendered"
  try {
    const el = document.getElementById(containerId);
    if (el && el.parentNode) {
      const freshEl = document.createElement('div');
      freshEl.id = containerId;
      freshEl.className = el.className;
      el.parentNode.replaceChild(freshEl, el);
    }
  } catch (e) {}
}

/**
 * Initialize invisible RecaptchaVerifier for Phone Authentication
 */
export function getOrCreatePhoneRecaptcha(containerId = 'phone-recaptcha-container', isInvisible = true): RecaptchaVerifier {
  if (typeof window === 'undefined') return null as any;

  // Clear previous verifier and reset container DOM node
  clearPhoneRecaptcha(containerId);

  let containerEl = document.getElementById(containerId);
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.id = containerId;
    document.body.appendChild(containerEl);
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: isInvisible ? 'invisible' : 'normal',
    callback: () => {
      // reCAPTCHA solved silently
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired.');
      clearPhoneRecaptcha(containerId);
    }
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection passively
export async function testConnection() {
  try {
    const testDoc = await getDoc(doc(db, 'test', 'connection'));
    return testDoc.exists();
  } catch (error) {
    // Graceful offline fallback
    return false;
  }
}

// User profile helper to save/sync Firestore profile
export async function syncUserProfile(user: FirebaseUser, extraData?: { phoneNumber?: string; formulaNotes?: string; displayName?: string }) {
  if (!user || !user.uid) return null;
  
  const userRef = doc(db, 'users', user.uid);
  try {
    const existingSnap = await getDoc(userRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : null;

    const profileData = {
      id: user.uid,
      email: user.email || '',
      displayName: extraData?.displayName || user.displayName || existingData?.displayName || '',
      photoURL: user.photoURL || existingData?.photoURL || DEFAULT_CLIENT_AVATAR,
      phoneNumber: extraData?.phoneNumber || existingData?.phoneNumber || user.phoneNumber || '',
      formulaNotes: extraData?.formulaNotes || existingData?.formulaNotes || '',
      role: (user.email === 'speakerkot10@gmail.com' || existingData?.role === 'admin') ? 'admin' : 'client',
      updatedAt: new Date().toISOString(),
      ...(existingSnap.exists() ? {} : { createdAt: new Date().toISOString() })
    };

    await setDoc(userRef, profileData, { merge: true });
    return profileData;
  } catch (err) {
    console.warn('Could not sync user profile to Firestore (using local fallback):', err);
    return null;
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type FirebaseUser
};
