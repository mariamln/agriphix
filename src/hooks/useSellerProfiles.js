import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export function useSellerProfiles() {
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['userProfiles'],
    queryFn: () => api.entities.UserProfile.list('-updated_date', 200),
    staleTime: 1000 * 60 * 5,
  });

  const profileByEmail = profiles.reduce((acc, profile) => {
    if (profile.created_by) acc[profile.created_by] = profile;
    return acc;
  }, {});

  const getProfileForSeller = (listing) => {
    if (!listing?.seller_email) return null;
    return profileByEmail[listing.seller_email] ?? null;
  };

  const isVerifiedSeller = (listing) => {
    const profile = getProfileForSeller(listing);
    return profile?.verified === true;
  };

  return { profiles, profileByEmail, getProfileForSeller, isVerifiedSeller, isLoading };
}
