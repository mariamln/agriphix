import './App.css'
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import { isIframe } from '@/lib/utils'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { getSafeReturnTo } from '@/utils/routes';
import PageNotFound from './lib/PageNotFound';
import ErrorBoundary from '@/components/ErrorBoundary';
import RequireAuth from '@/components/RequireAuth';
import Login from './pages/Login';
import Landing from './pages/Landing';
import PublicTrace from './pages/PublicTrace';
import OAuthLoginRedirect from './pages/OAuthLoginRedirect';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import GoogleAuthRedirectHandler from '@/components/auth/GoogleAuthRedirectHandler';
import SiteShell from '@/components/layout/SiteShell';
import AuthLoadingPanel from '@/components/auth/AuthLoadingPanel';
import { hasFirebaseSession } from '@/lib/authSession';

const { Pages, Layout } = pagesConfig;

const PUBLIC_PAGES = new Set(['Landing']);

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;


function LoginRedirect() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const authed = hasFirebaseSession(isAuthenticated);

  useEffect(() => {
    if (authed && !isLoadingAuth) {
      const target = getSafeReturnTo(searchParams) || '/Dashboard';
      navigate(target, { replace: true });
    }
  }, [authed, isLoadingAuth, navigate, searchParams]);

  if (isLoadingAuth && !authed) {
    return (
      <SiteShell>
        <AuthLoadingPanel />
      </SiteShell>
    );
  }

  if (authed) {
    return (
      <SiteShell>
        <AuthLoadingPanel />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Login />
    </SiteShell>
  );
}

function PublicRoot() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const authed = hasFirebaseSession(isAuthenticated);

  useEffect(() => {
    if (authed && !isLoadingAuth) {
      navigate('/Dashboard', { replace: true });
    }
  }, [authed, isLoadingAuth, navigate]);

  if (isLoadingAuth && !authed) {
    return (
      <SiteShell>
        <AuthLoadingPanel />
      </SiteShell>
    );
  }

  if (authed) {
    return (
      <SiteShell>
        <AuthLoadingPanel />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Landing />
    </SiteShell>
  );
}

function LandingRedirect() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const authed = hasFirebaseSession(isAuthenticated);

  useEffect(() => {
    if (authed && !isLoadingAuth) {
      navigate('/Dashboard', { replace: true });
    }
  }, [authed, isLoadingAuth, navigate]);

  if (isLoadingAuth && !authed) {
    return (
      <SiteShell>
        <AuthLoadingPanel />
      </SiteShell>
    );
  }

  if (authed) {
    return (
      <SiteShell>
        <AuthLoadingPanel />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Landing />
    </SiteShell>
  );
}

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoot />} />
      <Route path="/Login" element={<LoginRedirect />} />
      <Route path="/login" element={<OAuthLoginRedirect />} />
      <Route path="/sign-in" element={<Navigate to="/Login" replace />} />
      <Route path="/signin" element={<Navigate to="/Login" replace />} />
      <Route path="/Landing" element={<LandingRedirect />} />
      <Route path="/landing" element={<Navigate to="/Landing" replace />} />
      <Route path="/trace" element={<SiteShell><PublicTrace /></SiteShell>} />

      {Object.entries(Pages)
        .filter(([path]) => !PUBLIC_PAGES.has(path))
        .map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <RequireAuth currentPageName={path}>
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              </RequireAuth>
            }
          />
        ))}

      <Route path="*" element={<SiteShell><PageNotFound /></SiteShell>} />
    </Routes>
  );
};


function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <GoogleAuthRedirectHandler />
              <NavigationTracker />
              <AuthenticatedApp />
            </Router>
            <Toaster />
            {isIframe ? <VisualEditAgent /> : null}
          </QueryClientProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App
