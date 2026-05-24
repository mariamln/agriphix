import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export function useMyProfile() {
  const { user, isAuthenticated } = useAuth();
  const email = user?.email || auth.currentUser?.email;

  const query = useQuery({
    queryKey: ['myProfile', email],
    queryFn: () => api.entities.UserProfile.filter({ created_by: email }),
    enabled: (isAuthenticated || Boolean(auth.currentUser)) && !!email,
    select: (data) => data[0] ?? null,
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    hasProfile: !!query.data,
    needsOnboarding: (isAuthenticated || Boolean(auth.currentUser)) && query.isSuccess && !query.data,
    refetch: query.refetch,
  };
}
