import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Award } from 'lucide-react';

export default function SellerBadge({ profile, listing, size = 'sm' }) {
  const isVerified = profile?.verified === true;
  const hasHalal = profile?.certification?.includes('Halal') ||
    listing?.certifications?.includes('Halal');

  if (!isVerified && !hasHalal) return null;

  const sizeClass = size === 'lg' ? 'text-xs px-2 py-1' : 'text-[10px] px-1.5 py-0.5';

  return (
    <div className="flex flex-wrap gap-1">
      {isVerified && (
        <Badge className={`bg-blue-100 text-blue-700 border-blue-200 gap-1 ${sizeClass}`}>
          <CheckCircle className="w-3 h-3" />
          Verified Seller
        </Badge>
      )}
      {hasHalal && (
        <Badge className={`bg-teal-100 text-teal-700 border-teal-200 gap-1 ${sizeClass}`}>
          <Shield className="w-3 h-3" />
          Halal
        </Badge>
      )}
      {profile?.certification?.includes('Organic') && (
        <Badge className={`bg-green-100 text-green-700 border-green-200 gap-1 ${sizeClass}`}>
          <Award className="w-3 h-3" />
          Organic
        </Badge>
      )}
    </div>
  );
}
