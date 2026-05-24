import React from 'react';

export default function HalalScoreBadge({ score, status, size = 'md' }) {
  const getColor = () => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-500 border-gray-200';
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getLabel = () => {
    if (score === null || score === undefined || status === 'pending') return '⏳ Pending';
    if (score >= 80) return '✅ Halal';
    if (score >= 60) return '⚠️ Review';
    return '❌ Non-Compliant';
  };

  const sizeClass = size === 'lg'
    ? 'text-base px-4 py-2 font-bold'
    : size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${getColor()} ${sizeClass}`}>
      {score !== null && score !== undefined && status !== 'pending' && (
        <span>{score}/100</span>
      )}
      <span>{getLabel()}</span>
    </span>
  );
}