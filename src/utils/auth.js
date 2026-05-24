import { api } from '@/api/client';

export function loginWithGoogle(nextUrl = '/Dashboard') {
  return api.auth.loginWithProvider('google', nextUrl);
}

/** @deprecated Use loginWithGoogle */
export const redirectToAppLogin = loginWithGoogle;

export function loginWithEmail(email, password, nextUrl = '/Dashboard') {
  return api.auth.loginWithEmailPassword(email, password, nextUrl);
}

export function registerWithEmail(email, password, displayName, nextUrl = '/Dashboard') {
  return api.auth.registerWithEmailPassword(email, password, displayName, nextUrl);
}
