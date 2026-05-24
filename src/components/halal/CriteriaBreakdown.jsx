import React from 'react';
import { HalalCriteriaIcon } from '@/constants/valueChainIcons';

const CRITERIA = [
  { key: 'chemical_safety', label: 'Chemical Safety' },
  { key: 'water_source', label: 'Water Source' },
  { key: 'soil_treatment', label: 'Soil Treatment' },
  { key: 'farming_method', label: 'Farming Method' },
  { key: 'animal_byproducts', label: 'Animal By-products' },
  { key: 'documentation', label: 'Documentation' },
];

export default function CriteriaBreakdown({ scores }) {
  if (!scores) return null;

  return (
    <div className="space-y-2">
      {CRITERIA.map(({ key, label }) => {
        const score = scores[key] ?? null;
        const pct = score !== null ? score : 0;
        const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 flex items-center gap-1.5">
                <HalalCriteriaIcon criterion={key} className="w-3.5 h-3.5 text-primary" />
                {label}
              </span>
              <span className="text-xs font-semibold text-gray-800">
                {score !== null ? `${score}/100` : 'N/A'}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
