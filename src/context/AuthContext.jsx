import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import { checkUserExistsInNeon, saveUserProfileToNeon } from '../services/neonService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(auth));
  const [checkingNeonProfile, setCheckingNeonProfile] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [onboardingProfile, setOnboardingProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('logisync_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Set persistence and listen to auth state changes
  useEffect(() => {
    if (!auth) return;

    // Ensure local storage persistence so refresh doesn't log the user out
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('[Auth] Persistence setup notice:', err.message);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setCheckingNeonProfile(true);
        try {
          // Check NeonDB for existing user profile
          const neonRes = await checkUserExistsInNeon(currentUser.uid);
          if (neonRes.exists && neonRes.user) {
            setOnboardingProfile(neonRes.user);
          } else {
            // Check local fallback
            const userKey = `logisync_onboarding_${currentUser.uid}`;
            const savedUser = localStorage.getItem(userKey);
            if (savedUser) {
              setOnboardingProfile(JSON.parse(savedUser));
            } else {
              setOnboardingProfile(null);
            }
          }
        } catch (e) {
          console.error('[Auth] Error querying NeonDB profile:', e);
        } finally {
          setCheckingNeonProfile(false);
        }
      } else {
        setOnboardingProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setAuthError(null);

  // Complete Onboarding and save profile to NeonDB
  const completeOnboarding = async (profileData) => {
    if (!user) {
      throw new Error('Cannot save profile without an authenticated user');
    }

    try {
      const payload = {
        firebase_uid: user.uid,
        email: user.email,
        name: profileData.name || profileData.fullName || user.displayName,
        photo_url: profileData.photo_url || profileData.avatarUrl || user.photoURL,
        country: profileData.country || null,
        state: profileData.state || null,
        city: profileData.city || null,
        role: profileData.role || null,
      };

      // 1. Save to primary database: NeonDB
      const savedInNeon = await saveUserProfileToNeon(payload);
      setOnboardingProfile(savedInNeon);

      // 2. Cache in localStorage for immediate client-side performance
      localStorage.setItem('logisync_user_profile', JSON.stringify(savedInNeon));
      localStorage.setItem(`logisync_onboarding_${user.uid}`, JSON.stringify(savedInNeon));
      localStorage.setItem('logisync_onboarding_completed', 'true');

      return savedInNeon;
    } catch (e) {
      console.error('[Auth] Error saving onboarding profile to NeonDB:', e);
      throw e;
    }
  };

  // Dynamically update profile (e.g. edited name) and sync to NeonDB
  const updateUserProfile = async (updates) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const existing = onboardingProfile || {};
      const payload = {
        firebase_uid: user.uid,
        email: user.email,
        name: updates.name !== undefined ? updates.name.trim() : (existing.name || user.displayName || 'User'),
        photo_url: updates.photo_url || existing.photo_url || user.photoURL,
        country: updates.country || existing.country || 'India',
        state: updates.state || existing.state || 'Maharashtra',
        city: updates.city || existing.city || 'Nagpur',
        role: updates.role || existing.role || 'REQUESTER',
      };

      const savedInNeon = await saveUserProfileToNeon(payload);
      setOnboardingProfile(savedInNeon);

      localStorage.setItem('logisync_user_profile', JSON.stringify(savedInNeon));
      localStorage.setItem(`logisync_onboarding_${user.uid}`, JSON.stringify(savedInNeon));

      return savedInNeon;
    } catch (e) {
      console.error('[Auth] Error updating profile in NeonDB:', e);
      throw e;
    }
  };

  // Reset Onboarding so user or developer can re-run the wizard
  const resetOnboarding = () => {
    setOnboardingProfile(null);
    try {
      localStorage.removeItem('logisync_user_profile');
      localStorage.removeItem('logisync_onboarding_completed');
      if (user?.uid) {
        localStorage.removeItem(`logisync_onboarding_${user.uid}`);
        localStorage.removeItem(`logisync_neondb_${user.uid}`);
      }
    } catch (e) {
      console.error('[Auth] Error resetting onboarding:', e);
    }
  };

  // Google Sign-In with popup
  const signInWithGoogle = async () => {
    setAuthError(null);

    if (!isFirebaseConfigured()) {
      const missingConfigMsg = 'Firebase configuration is missing. Please add your VITE_FIREBASE_API_KEY and credentials in your .env file.';
      setAuthError(missingConfigMsg);
      throw new Error(missingConfigMsg);
    }

    if (!auth || !googleProvider) {
      const notInitMsg = 'Firebase Authentication service is not initialized.';
      setAuthError(notInitMsg);
      throw new Error(notInitMsg);
    }

    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);

      // Check NeonDB for existing user profile
      try {
        const neonCheck = await checkUserExistsInNeon(result.user.uid);
        if (neonCheck.exists && neonCheck.user) {
          setOnboardingProfile(neonCheck.user);
        } else {
          setOnboardingProfile(null);
        }
      } catch (err) {
        console.warn('[Auth] Post-login NeonDB lookup notice:', err);
      }

      setLoading(false);
      return result.user;
    } catch (error) {
      setLoading(false);
      let friendlyMessage = error.message;

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          friendlyMessage = 'Sign-in cancelled. The Google popup was closed before completing.';
          break;
        case 'auth/cancelled-popup-request':
          friendlyMessage = 'Sign-in was cancelled by another action.';
          break;
        case 'auth/popup-blocked':
          friendlyMessage = 'Popup was blocked by your browser. Please allow popups for localhost to sign in.';
          break;
        case 'auth/unauthorized-domain':
          friendlyMessage = 'This domain is not authorized in Firebase Console. Add "localhost" under Firebase > Authentication > Settings > Authorized Domains.';
          break;
        case 'auth/network-request-failed':
          friendlyMessage = 'Network connection failed. Please verify your internet connection and try again.';
          break;
        case 'auth/invalid-api-key':
          friendlyMessage = 'The provided Firebase API key is invalid. Please verify VITE_FIREBASE_API_KEY in your .env file.';
          break;
        default:
          friendlyMessage = error.message || 'An error occurred during Google sign-in. Please try again.';
      }

      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  // Sign out / Logout
  const logout = async () => {
    setAuthError(null);
    if (!auth) {
      setUser(null);
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('[Auth] Sign-out error:', error);
      setAuthError(error.message);
    }
  };

  const hasCompletedOnboarding = Boolean(onboardingProfile);

  const value = {
    user,
    loading,
    authError,
    clearError,
    signInWithGoogle,
    logout,
    onboardingProfile,
    hasCompletedOnboarding,
    completeOnboarding,
    updateUserProfile,
    resetOnboarding,
    isConfigured: isFirebaseConfigured(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
