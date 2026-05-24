import React from 'react';
import { TraceabilityContent } from '@/components/traceability/TraceabilityContent';

export default function PublicTrace() {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="marketing-inner py-8">
        <TraceabilityContent showQrActions={false} compactHeader />
        <p className="text-center text-sm text-gray-500 mt-8">
          Powered by Agriphix — Uganda&apos;s Halal Agriculture Platform
        </p>
      </div>
    </div>
  );
}
