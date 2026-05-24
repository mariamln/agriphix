import { auth } from '@/lib/firebase';

/** True when Firebase has a signed-in user, even if React auth context is still catching up. */
export function hasFirebaseSession(isAuthenticated = false) {
  return isAuthenticated || Boolean(auth.currentUser);
}
