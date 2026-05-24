import React from 'react';

const INSTRUMENTS = {
  Murabaha: {
    icon: '🏷️',
    meaning: 'Cost-plus sale',
    description: 'The financier buys the asset and sells it to the farmer at a disclosed mark-up payable in instalments. No interest — profit is from trade.',
    best_for: 'Seeds, fertilizers, equipment, inputs',
    shariah_note: 'Asset must exist at time of sale. Mark-up must be agreed upfront.',
  },
  Ijara: {
    icon: '🔑',
    meaning: 'Lease financing',
    description: 'The financier owns the asset and leases it to the farmer. Ownership may transfer at end of lease (Ijara wa Iqtina).',
    best_for: 'Land, tractors, cold storage, warehouses',
    shariah_note: 'Risk of asset remains with the owner during lease period.',
  },
  Musharaka: {
    icon: '🤝',
    meaning: 'Partnership',
    description: 'Both parties contribute capital and share profits/losses proportionally. Ideal for joint ventures.',
    best_for: 'Farming operations, processing, export ventures',
    shariah_note: 'Losses shared in proportion to capital. Profits by agreement.',
  },
  Mudaraba: {
    icon: '💼',
    meaning: 'Profit-sharing',
    description: 'One party provides capital (Rab al-Mal), the other provides expertise and labour (Mudarib). Profits shared, capital loss borne by investor.',
    best_for: 'Advisory, agri-business management, trading',
    shariah_note: 'Mudarib receives no salary — only profit share.',
  },
  Salam: {
    icon: '📦',
    meaning: 'Forward sale',
    description: 'Buyer pays full price in advance for goods to be delivered at a future date. Provides pre-harvest financing to farmers.',
    best_for: 'Crop financing, grain, export contracts',
    shariah_note: 'Full payment must be made upfront. Quantity, quality, date must be specified.',
  },
  Istisna: {
    icon: '🏗️',
    meaning: 'Manufacturing contract',
    description: 'Financier commissions construction or manufacture of an asset. Payments can be staged. Used for processing plants and infrastructure.',
    best_for: 'Cold storage construction, processing facilities',
    shariah_note: 'Subject matter must be manufacturable. Price fixed at start.',
  },
  Takaful: {
    icon: '🛡️',
    meaning: 'Islamic insurance',
    description: 'Mutual protection fund where participants contribute to cover each other against crop failure, drought, or loss.',
    best_for: 'Crop protection, livestock, logistics',
    shariah_note: 'Based on mutual donation (Tabarru), not commercial insurance.',
  },
  Sukuk: {
    icon: '📊',
    meaning: 'Islamic bonds',
    description: 'Asset-backed investment certificates representing ownership in tangible assets. Used for large-scale agri-infrastructure funding.',
    best_for: 'Irrigation systems, export infrastructure, cold chains',
    shariah_note: 'Must be backed by real tangible assets, not pure debt.',
  },
  'Qard Hasan': {
    icon: '🎁',
    meaning: 'Benevolent loan',
    description: 'Interest-free loan given out of goodwill. Borrower repays only the principal. Used for smallholder and subsistence farmers.',
    best_for: 'Smallholder farmers, emergency inputs, Zakat recipients',
    shariah_note: 'No stipulated benefit to lender. Repayment encouraged, not obligatory if borrower is unable.',
  },
};

export default function InstrumentGuide({ instruments }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Recommended Islamic Finance Instruments</p>
      {instruments.map((name) => {
        const inst = INSTRUMENTS[name];
        if (!inst) return null;
        return (
          <div key={name} className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{inst.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-emerald-800">{name}</h4>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{inst.meaning}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{inst.description}</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="text-gray-500">✅ Best for: <span className="text-gray-700 font-medium">{inst.best_for}</span></span>
                </div>
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-800">
                  ⚖️ <strong>Shari'ah note:</strong> {inst.shariah_note}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}