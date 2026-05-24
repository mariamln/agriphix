import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, MapPin, Package, DollarSign } from 'lucide-react';
import { formatCurrency, formatCurrencyPerUnit } from '@/utils/currency';

function asList(value) {
  return Array.isArray(value) ? value : [];
}

/** @typedef {Object} CropRecord
 * @property {string} [id]
 * @property {string} [crop_name]
 * @property {string} [status]
 */

/** @typedef {Object} MarketDemandRecord
 * @property {string} [id]
 * @property {string} [crop_type]
 * @property {string} [status]
 * @property {string} [location]
 * @property {number} [quantity_needed]
 * @property {number} [price_per_kg]
 * @property {string} [market_segment]
 * @property {string} [buyer_name]
 */

/** @typedef {Object} ProfileRecord
 * @property {string} [location]
 * @property {string} [specialization]
 */

/**
 * Scores a market demand against a farmer's profile and crops.
 * Returns a match score (0–100) and a list of match reasons.
 * @param {MarketDemandRecord} demand
 * @param {CropRecord[]} crops
 * @param {ProfileRecord | null | undefined} profile
 */
function scoreDemand(demand, crops, profile) {
  let score = 0;
  const reasons = [];

  const demandCrop = (demand.crop_type || '').toLowerCase();
  const demandLocation = (demand.location || '').toLowerCase();
  const profileLocation = (profile?.location || '').toLowerCase();
  const specialization = (profile?.specialization || '').toLowerCase();

  // 1. Crop name match against registered crops
  const cropMatch = crops.find((c) => {
    const cropName = (c.crop_name || '').toLowerCase();
    return (
      (demandCrop && cropName.includes(demandCrop)) ||
      (demandCrop && demandCrop.includes(cropName))
    );
  });
  if (cropMatch) {
    score += 50;
    reasons.push(`Matches your ${cropMatch.crop_name} crop`);
  }

  // 2. Specialization match
  if (specialization && demandCrop && (
    specialization.includes(demandCrop) || demandCrop.includes(specialization.split(',')[0].trim())
  )) {
    score += 20;
    if (!reasons.some(r => r.includes('crop'))) reasons.push(`Matches your specialization`);
  }

  // 3. Location proximity (simple string overlap)
  if (profileLocation && demandLocation) {
    const profileWords = profileLocation.split(/[\s,]+/);
    const demandWords = demandLocation.split(/[\s,]+/);
    const overlap = profileWords.some(w => w.length > 2 && demandWords.includes(w));
    if (overlap) {
      score += 20;
      reasons.push(`Near your location (${demand.location})`);
    }
  }

  // 4. Active crop status boost
  if (cropMatch && ['growing', 'planted', 'harvesting'].includes(cropMatch.status)) {
    score += 10;
    reasons.push(`Your ${cropMatch.crop_name} is actively ${cropMatch.status}`);
  }

  return { score, reasons };
}

/**
 * @param {{
 *   crops?: CropRecord[],
 *   marketDemands?: MarketDemandRecord[],
 *   profile?: ProfileRecord | null,
 * }} props
 */
export default function SuggestedOpportunities({ crops = [], marketDemands = [], profile }) {
  const cropList = asList(crops);
  const demandList = asList(marketDemands);
  const activeCrops = cropList.filter((c) =>
    ['planning', 'planted', 'growing', 'harvesting'].includes(c?.status)
  );
  const openDemands = demandList.filter((d) => d?.status === 'open');

  const matches = useMemo(() => {
    if (!openDemands.length) return [];

    return openDemands
      .map(demand => {
        const { score, reasons } = scoreDemand(demand, activeCrops, profile);
        return { demand, score, reasons };
      })
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [openDemands, activeCrops, profile]);

  const segmentColors = {
    local: 'bg-green-100 text-green-700',
    regional: 'bg-blue-100 text-blue-700',
    national: 'bg-purple-100 text-purple-700',
    export: 'bg-amber-100 text-amber-700',
  };

  const matchStrength = (score) => {
    if (score >= 70) return { label: 'Strong match', color: 'bg-emerald-500' };
    if (score >= 40) return { label: 'Good match', color: 'bg-blue-400' };
    return { label: 'Partial match', color: 'bg-amber-400' };
  };

  if (!activeCrops.length && !profile?.specialization) {
    return (
      <Card className="shadow-md border-dashed border-2 border-emerald-200">
        <CardContent className="p-8 text-center">
          <Zap className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 mb-1">No matches yet</p>
          <p className="text-sm text-gray-500 mb-4">Register your crops or complete your profile to see personalised opportunities.</p>
          <Link to={createPageUrl('Production')}>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Add Your First Crop</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!matches.length) {
    return (
      <Card className="shadow-md">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Suggested Opportunities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No matching market demands found right now. Check back soon!</p>
          <Link to={createPageUrl('MarketInsights')}>
            <Button variant="ghost" size="sm" className="mt-3 text-emerald-600">Browse all demands <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Suggested Opportunities</CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700 text-xs">{matches.length} matched</Badge>
          </div>
          <Link to={createPageUrl('MarketInsights')}>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-1">Personalised based on your crops, location & specialization</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map(({ demand, score, reasons }, index) => {
            const strength = matchStrength(score);
            const key = demand?.id || `demand-${index}`;
            return (
              <div key={key} className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all relative overflow-hidden">
                {/* Match strength bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                  <div className={`h-full ${strength.color} transition-all`} style={{ width: `${Math.min(score, 100)}%` }} />
                </div>

                <div className="flex items-start justify-between gap-2 mt-1 mb-2">
                  <h4 className="font-semibold text-gray-900">{demand.crop_type}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${strength.color === 'bg-emerald-500' ? 'bg-emerald-100 text-emerald-700' : strength.color === 'bg-blue-400' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {strength.label}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    <span>{demand.quantity_needed?.toLocaleString()} kg needed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-medium text-emerald-700">{formatCurrencyPerUnit(demand.price_per_kg, 'kg')}</span>
                    {demand.quantity_needed && demand.price_per_kg && (
                      <span className="text-gray-400">· {formatCurrency(demand.quantity_needed * demand.price_per_kg)} total</span>
                    )}
                  </div>
                  {demand.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{demand.location}</span>
                    </div>
                  )}
                </div>

                {/* Match reasons */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {reasons.map((r, i) => (
                    <span key={i} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">✓ {r}</span>
                  ))}
                  {demand.market_segment && (
                    <Badge className={`text-xs ${segmentColors[demand.market_segment] || 'bg-gray-100 text-gray-600'}`}>
                      {demand.market_segment}
                    </Badge>
                  )}
                </div>

                {demand.buyer_name && (
                  <p className="text-xs text-gray-500">Buyer: <span className="font-medium text-gray-700">{demand.buyer_name}</span></p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}