import React from 'react';
import { formatCurrency } from '@/utils/currency';
import { MapPin, MessageSquare, Tag, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const categoryEmoji = { produce: '🌽', equipment: '🚜', livestock: '🐄', seeds: '🌱', other: '📦' };
const typeColors = { sale: 'bg-emerald-100 text-emerald-700', rent: 'bg-blue-100 text-blue-700', exchange: 'bg-amber-100 text-amber-700' };
const gradeColors = { premium: 'bg-purple-100 text-purple-700', grade_a: 'bg-green-100 text-green-700', grade_b: 'bg-yellow-100 text-yellow-700', standard: 'bg-gray-100 text-gray-600' };

import SellerBadge from './SellerBadge';

export default function ListingCard({ listing, sellerProfile, messageCount, onClick }) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-xl transition-all duration-200 border hover:border-emerald-300 group overflow-hidden">
      {/* Image or emoji placeholder */}
      <div className="h-40 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center overflow-hidden relative">
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-7xl opacity-60">{categoryEmoji[listing.category]}</span>
        )}
        <div className="absolute top-2 left-2">
          <Badge className={typeColors[listing.listing_type]}>{listing.listing_type}</Badge>
        </div>
        {listing.negotiable && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-100 text-amber-700 text-xs">Negotiable</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
          {listing.title}
        </h3>
        <SellerBadge profile={sellerProfile} listing={listing} />

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-emerald-600">{formatCurrency(listing.price)}</span>
          {listing.price_unit && <span className="text-sm text-gray-500">/ {listing.price_unit}</span>}
        </div>

        {listing.quantity > 0 && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">{listing.quantity}</span> {listing.quantity_unit || 'units'} available
          </p>
        )}

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{listing.location}</span>
        </div>

        {listing.quality_grade && (
          <Badge className={gradeColors[listing.quality_grade]} variant="secondary">
            {listing.quality_grade.replace('_', ' ')}
          </Badge>
        )}

        <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-500">{listing.seller_name}</p>
          {messageCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MessageSquare className="w-3.5 h-3.5" />
              {messageCount}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}