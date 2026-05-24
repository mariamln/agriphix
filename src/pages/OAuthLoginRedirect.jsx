import { Navigate, useSearchParams } from 'react-router-dom';
import { getSafeReturnTo } from '@/utils/routes';

/** Legacy /login?from_url=... → role picker at /Login with returnTo preserved. */
export default function OAuthLoginRedirect() {
  const [searchParams] = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams);
  const qs = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
  return <Navigate to={`/Login${qs}`} replace />;
}
