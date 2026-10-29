import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Rstudy Firebase Production Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCnaIlJeVHj3T1K7KXsms9-3imluoQXvLk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rstudy-1dd8e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rstudy-1dd8e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rstudy-1dd8e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "172336453270",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:172336453270:web:796460e43aeccc0e3614b7",
  measurementId: "G-W9ZVSCCV23",
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization notice:', error);
}

export { app, db, auth };
