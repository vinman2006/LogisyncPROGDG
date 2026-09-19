import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'logisyncgdg.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'logisyncgdg',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'logisyncgdg.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Safety check to verify if configuration values are set
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey.trim() !== '' && 
    firebaseConfig.appId && 
    firebaseConfig.appId.trim() !== ''
  );
};

// Initialize Firebase App singleton
let app = null;
let auth = null;
let analytics = null;
let googleProvider = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });

  // Initialize Analytics in browser if supported
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }
} catch (error) {
  console.warn('[Firebase] Initialization notice:', error.message);
}

export { app, auth, analytics, googleProvider, firebaseConfig };
