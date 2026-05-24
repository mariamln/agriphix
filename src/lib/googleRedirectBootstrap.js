import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { normalizeAppPath } from '@/utils/routes';

export const AUTH_RETURN_KEY = 'agriphix_auth_return';

/** @type {Promise<{ returnPath: string | null, completed: boolean }> | null} */
let bootstrapPromise = null;

/**
 * Must run once per page load, before auth state is read.
 * Completes signInWithRedirect when the user returns from Google.
 */
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}

export function bootstrapGoogleRedirectSignIn() {
  if (typeof window === 'undefined') {
    return Promise.resolve({ returnPath: null, completed: false });
  }

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const storedPath = sessionStorage.getItem(AUTH_RETURN_KEY);

      try {
        const result = await withTimeout(getRedirectResult(auth), 8000);
        if (result?.user) {
          await auth.authStateReady();
          const path = normalizeAppPath(storedPath || '/Dashboard');
          sessionStorage.removeItem(AUTH_RETURN_KEY);
          return { returnPath: path, completed: true };
        }
      } catch (err) {
        console.warn('[Agriphix] Google redirect sign-in failed:', err);
      }

      if (storedPath) {
        sessionStorage.removeItem(AUTH_RETURN_KEY);
      }

      return { returnPath: null, completed: false };
    })();
  }

  return bootstrapPromise;
}

export function storeGoogleAuthReturnPath(fromUrl) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(AUTH_RETURN_KEY, normalizeAppPath(fromUrl));
  }
}

export function hasPendingGoogleAuthReturn() {
  if (typeof sessionStorage === 'undefined') return false;
  return Boolean(sessionStorage.getItem(AUTH_RETURN_KEY));
}

export function clearGoogleAuthReturnPath() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(AUTH_RETURN_KEY);
  }
}
