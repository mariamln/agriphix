import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/api/client';
import { bootstrapGoogleRedirectSignIn } from '@/lib/googleRedirectBootstrap';

const AuthContext = createContext();

function mapFirebaseUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    photo_url: firebaseUser.photoURL,
  };
}

function syncFromFirebase(setUser, setIsAuthenticated) {
  const firebaseUser = auth.currentUser;
  setUser(mapFirebaseUser(firebaseUser));
  setIsAuthenticated(Boolean(firebaseUser));
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => mapFirebaseUser(auth.currentUser));
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(auth.currentUser));
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    let alive = true;

    (async () => {
      try {
        await auth.authStateReady();
      } catch (err) {
        console.warn('[Agriphix] authStateReady failed:', err);
      }

      if (!alive) return;

      syncFromFirebase(setUser, setIsAuthenticated);
      setIsLoadingAuth(false);

      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        setUser(mapFirebaseUser(nextUser));
        setIsAuthenticated(Boolean(nextUser));
      });

      bootstrapGoogleRedirectSignIn().catch((err) => {
        console.warn('[Agriphix] Google redirect bootstrap failed:', err);
      });
    })();

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    await api.auth.logout(shouldRedirect ? `${window.location.origin}/` : undefined);
  };

  const navigateToLogin = () => {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/Login?returnTo=${returnTo}`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      logout,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
