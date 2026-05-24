import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bootstrapGoogleRedirectSignIn } from '@/lib/googleRedirectBootstrap';

/**
 * After a Google redirect sign-in, navigate to the stored post-login path.
 */
export default function GoogleAuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    bootstrapGoogleRedirectSignIn().then(({ returnPath, completed }) => {
      if (completed && returnPath) {
        navigate(returnPath, { replace: true });
      }
    });
  }, [navigate]);

  return null;
}
