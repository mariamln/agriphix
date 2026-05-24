import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { normalizeAppPath } from '@/utils/routes';
import {
  bootstrapGoogleRedirectSignIn,
  clearGoogleAuthReturnPath,
  storeGoogleAuthReturnPath,
} from '@/lib/googleRedirectBootstrap';

function mapUser(user) {
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email,
    full_name: user.displayName || user.email?.split('@')[0] || 'User',
    photo_url: user.photoURL,
  };
}

async function waitForSignedInUser() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw new Error('Authentication did not complete');
  }
}

export { hasPendingGoogleAuthReturn } from '@/lib/googleRedirectBootstrap';

export const firebaseAuthApi = {
  async me() {
    const user = auth.currentUser;
    if (!user) {
      const err = new Error('Not authenticated');
      err.status = 401;
      throw err;
    }
    return mapUser(user);
  },

  async logout(redirectUrl) {
    await signOut(auth);
    if (redirectUrl && typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  },

  async loginWithEmailPassword(email, password, fromUrl = '/Dashboard') {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    await waitForSignedInUser();
    return normalizeAppPath(fromUrl);
  },

  async registerWithEmailPassword(email, password, displayName, fromUrl = '/Dashboard') {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const name = displayName?.trim();
    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }
    await waitForSignedInUser();
    return normalizeAppPath(fromUrl);
  },

  /**
   * Google sign-in: popup first (reliable on localhost), redirect if popup blocked.
   */
  async loginWithProvider(provider = 'google', fromUrl = '/Dashboard') {
    if (provider !== 'google') {
      throw new Error(`Unsupported auth provider: ${provider}`);
    }

    const returnPath = normalizeAppPath(fromUrl);
    storeGoogleAuthReturnPath(returnPath);

    try {
      await signInWithPopup(auth, googleProvider);
      await waitForSignedInUser();
      clearGoogleAuthReturnPath();
      return returnPath;
    } catch (err) {
      const useRedirect =
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/operation-not-supported-in-this-environment';

      if (!useRedirect) {
        clearGoogleAuthReturnPath();
        throw err;
      }

      await signInWithRedirect(auth, googleProvider);
      return null;
    }
  },

  /** Delegates to the one-time bootstrap (see main.jsx). */
  async completeGoogleRedirectSignIn() {
    const { returnPath, completed } = await bootstrapGoogleRedirectSignIn();
    return completed ? returnPath : null;
  },
};
