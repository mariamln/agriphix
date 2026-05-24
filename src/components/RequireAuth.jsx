import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { normalizeAppPath } from '@/utils/routes';
import { hasFirebaseSession } from '@/lib/authSession';
import SiteShell from '@/components/layout/SiteShell';
import AuthLoadingPanel from '@/components/auth/AuthLoadingPanel';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function RequireAuth({ children, currentPageName }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();
  const authed = hasFirebaseSession(isAuthenticated);

  if (isLoadingAuth && !authed) {
    return (
      <SiteShell currentPageName={currentPageName}>
        <AuthLoadingPanel />
      </SiteShell>
    );
  }

  if (!authed) {
    const returnTo = encodeURIComponent(
      normalizeAppPath(location.pathname + location.search)
    );

    return (
      <SiteShell currentPageName={currentPageName}>
        <Navigate to={`/Login?returnTo=${returnTo}`} replace />
      </SiteShell>
    );
  }

  return (
    <SiteShell currentPageName={currentPageName}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </SiteShell>
  );
}
