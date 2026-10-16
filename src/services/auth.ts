import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

export interface Profile {
  uid: string;
  name: string;
  email: string;
}

function toProfile(user: User): Profile {
  return {
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Player',
    email: user.email || '',
  };
}

export function subscribeAuth(callback: (profile: Profile | null) => void) {
  return onAuthStateChanged(auth, (user) => callback(user ? toProfile(user) : null));
}

export async function register(email: string, password: string, name: string): Promise<Profile> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, { displayName: name.trim() || email.split('@')[0] });
  return toProfile(cred.user);
}

export async function login(email: string, password: string): Promise<Profile> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return toProfile(cred.user);
}

export function logout() {
  return signOut(auth);
}

/** Converts Firebase error codes into short messages for the UI. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
