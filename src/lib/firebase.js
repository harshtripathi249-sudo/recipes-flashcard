/**
 * Savoria Recipe Book - Firebase Client Initialization
 * 
 * Safely initializes Firebase using public VITE_ prefixed environment variables.
 * If variables are not yet provided or are placeholders, the app gracefully
 * falls back to local storage and guest mode without throwing runtime errors.
 * 
 * DO NOT store private service account keys or secret admin credentials here.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCkqMAdX0hhz-0AiBowQ-ykU6WpzLVhU38",
  authDomain: "skillspring-5892d.firebaseapp.com",
  projectId: "skillspring-5892d",
  storageBucket: "skillspring-5892d.firebasestorage.app",
  messagingSenderId: "556699112924",
  appId: "1:556699112924:web:f444b97e0f5d27e73ceb19",
  measurementId: "G-MBQ9GQLG47"
};

// Check if valid configuration is provided (not empty and not the default placeholder)
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_firebase_api_key_here' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id'
);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn('[Firebase] Initialization error. Falling back to local guest storage:', err);
  }
}

export { app, auth, db, googleProvider };
