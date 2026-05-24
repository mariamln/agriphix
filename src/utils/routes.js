/** Canonical app page paths (must match keys in pages.config.js PAGES). */
export const PAGE_NAMES = [
  'Dashboard',
  'IslamicFinanceChat',
  'Financing',
  'Landing',
  'Logistics',
  'MarketInsights',
  'Messages',
  'Network',
  'Production',
  'Resources',
  'Sustainability',
  'Traceability',
  'Weather',
  'HalalCertification',
  'ZakatCalculator',
  'Marketplace',
];

const PAGE_BY_LOWER = Object.fromEntries(
  PAGE_NAMES.map((name) => [name.toLowerCase(), name])
);

const AUTH_PATHS = new Set(['/login', '/Login', '/Landing', '/landing']);

export function createPageUrl(pageName) {
  return `/${pageName}`;
}

/**
 * Maps lowercase or legacy paths to canonical routes (e.g. /dashboard → /Dashboard).
 */
export function normalizeAppPath(path) {
  if (!path || path === '/') return '/';

  const raw = path.startsWith('/') ? path : `/${path}`;
  let pathname;
  let search = '';

  try {
    const url = new URL(raw, 'http://agriphix.local');
    pathname = url.pathname;
    search = url.search;
  } catch {
    return raw;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return `/${search}`;

  const first = segments[0];
  const lower = first.toLowerCase();

  if (lower === 'login') {
    return `/Login${search}`;
  }
  if (lower === 'landing') {
    return `/Landing${search}`;
  }
  if (lower === 'trace') {
    return `/trace${search}`;
  }

  const canonical = PAGE_BY_LOWER[lower];
  if (canonical) {
    const rest = segments.slice(1).join('/');
    return `/${canonical}${rest ? `/${rest}` : ''}${search}`;
  }

  return `${pathname}${search}`;
}

/**
 * Resolves a safe in-app redirect from returnTo / from_url query params.
 */
export function getSafeReturnTo(searchParams) {
  const raw =
    (typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : searchParams
    ).get('returnTo') ||
    (typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : searchParams
    ).get('from_url');

  if (!raw) return null;

  let path = raw.trim();
  if (!path) return null;

  if (path.includes('://')) {
    try {
      const parsed = new URL(path);
      if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) {
        return '/Dashboard';
      }
      path = parsed.pathname + parsed.search;
    } catch {
      return '/Dashboard';
    }
  }

  path = normalizeAppPath(path);
  const base = path.split('?')[0];
  if (AUTH_PATHS.has(base) || base === '/') {
    return null;
  }

  const segment = base.replace(/^\//, '').split('/')[0];
  if (!PAGE_BY_LOWER[segment.toLowerCase()] && base !== '/trace') {
    return '/Dashboard';
  }

  return path;
}
