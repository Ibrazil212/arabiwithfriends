import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Public web configuration from the Firebase console (not a secret).
// Security is enforced by database.rules.json and Firebase Auth.
const firebaseConfig = {
  apiKey: 'AIzaSyDR1uTrwS-NRVEfAEUGRrkIxChHIQUdNMs',
  authDomain: 'buildarabicwords.firebaseapp.com',
  databaseURL: 'https://buildarabicwords-default-rtdb.firebaseio.com',
  projectId: 'buildarabicwords',
  storageBucket: 'buildarabicwords.firebasestorage.app',
  messagingSenderId: '597813954626',
  appId: '1:597813954626:web:23ad8e2ee452f26bee45db',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
