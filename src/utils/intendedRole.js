const STORAGE_KEY = 'agriphix_intended_role';

export function setIntendedRole(role) {
  if (role) sessionStorage.setItem(STORAGE_KEY, role);
}

export function getIntendedRole() {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearIntendedRole() {
  sessionStorage.removeItem(STORAGE_KEY);
}
