import React from 'react';

const CRITERIA = [
  { key: 'chemical_safety', label: 'Chemical Safety', icon: '🧪' },
  { key: 'water_source', label: 'Water Source', icon: '💧' },
  { key: 'soil_treatment', label: 'Soil Treatment', icon: '🌱' },
  { key: 'farming_method', label: 'Farming Method', icon: '🚜' },
  { key: 'animal_byproducts', label: 'Animal By-products', icon: '🐄' },
  { key: 'documentation', label: 'Documentation', icon: '📄' },
];

export default function CriteriaBreakdown({ scores }) {
  if (!scores) return null;

  return (
    <div className="space-y-2">
      {CRITERIA.map(({ key, label, icon }) => {
        const score = scores[key] ?? null;
        const pct = score !== null ? score : 0;
        const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 flex items-center gap-1">
                {icon} {label}
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