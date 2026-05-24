import React from 'react';

export const VALUE_CHAIN_SEGMENTS = [
  {
    id: 'land',
    label: 'Land',
    icon: '🌍',
    description: 'Acquisition, leasing & development',
    instruments: ['Ijara', 'Musharaka', 'Murabaha'],
    color: 'emerald',
  },
  {
    id: 'farming_inputs',
    label: 'Farming Inputs',
    icon: '🌱',
    description: 'Seeds, fertilizers, pesticides',
    instruments: ['Murabaha', 'Salam', 'Qard Hasan'],
    color: 'green',
  },
  {
    id: 'machinery',
    label: 'Machinery',
    icon: '🚜',
    description: 'Tractors, irrigation, equipment',
    instruments: ['Ijara', 'Murabaha', 'Istisna'],
    color: 'teal',
  },
  {
    id: 'advisory',
    label: 'Advisory Services',
    icon: '🧠',
    description: 'Agronomists, consultants, tech',
    instruments: ['Mudaraba', 'Musharaka', 'Ijara'],
    color: 'cyan',
  },
  {
    id: 'logistics',
    label: 'Logistics & Storage',
    icon: '🏭',
    description: 'Warehouses, cold chain, silos',
    instruments: ['Ijara', 'Istisna', 'Musharaka'],
    color: 'blue',
  },
  {
    id: 'delivery',
    label: 'Delivery & Distribution',
    icon: '🚚',
    description: 'Transport, last-mile delivery',
    instruments: ['Ijara', 'Murabaha', 'Musharaka'],
    color: 'indigo',
  },
  {
    id: 'suppliers',
    label: 'Suppliers & Processors',
    icon: '🏭',
    description: 'Input suppliers, food processors',
    instruments: ['Murabaha', 'Istisna', 'Musharaka'],
    color: 'violet',
  },
  {
    id: 'traceability',
    label: 'Traceability Systems',
    icon: '🔍',
    description: 'Blockchain, QR, certification',
    instruments: ['Murabaha', 'Ijara', 'Sukuk'],
    color: 'purple',
  },
  {
    id: 'export',
    label: 'Export Markets',
    icon: '🌐',
    description: 'Export financing & trade',
    instruments: ['Murabaha', 'Salam', 'Sukuk'],
    color: 'amber',
  },
  {
    id: 'shariah_compliance',
    label: "Shari'ah Compliance",
    icon: '⚖️',
    description: 'Audits, certification, review',
    instruments: ['Qard Hasan', 'Musharaka', 'Takaful'],
    color: 'orange',
  },
];

const colorMap = {
  emerald: 'border-emerald-400 bg-emerald-50 text-emerald-800',
  green: 'border-green-400 bg-green-50 text-green-800',
  teal: 'border-teal-400 bg-teal-50 text-teal-800',
  cyan: 'border-cyan-400 bg-cyan-50 text-cyan-800',
  blue: 'border-blue-400 bg-blue-50 text-blue-800',
  indigo: 'border-indigo-400 bg-indigo-50 text-indigo-800',
  violet: 'border-violet-400 bg-violet-50 text-violet-800',
  purple: 'border-purple-400 bg-purple-50 text-purple-800',
  amber: 'border-amber-400 bg-amber-50 text-amber-800',
  orange: 'border-orange-400 bg-orange-50 text-orange-800',
};

const activeColorMap = {
  emerald: 'border-emerald-600 bg-emerald-600 text-white',
  green: 'border-green-600 bg-green-600 text-white',
  teal: 'border-teal-600 bg-teal-600 text-white',
  cyan: 'border-cyan-600 bg-cyan-600 text-white',
  blue: 'border-blue-600 bg-blue-600 text-white',
  indigo: 'border-indigo-600 bg-indigo-600 text-white',
  violet: 'border-violet-600 bg-violet-600 text-white',
  purple: 'border-purple-600 bg-purple-600 text-white',
  amber: 'border-amber-600 bg-amber-600 text-white',
  orange: 'border-orange-600 bg-orange-600 text-white',
};

export default function ValueChainSelector({ selected, onSelect }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Select Value Chain Segment</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {VALUE_CHAIN_SEGMENTS.map((seg) => {
          const isActive = selected === seg.id;
          const cls = isActive ? activeColorMap[seg.color] : colorMap[seg.color];
          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => onSelect(seg.id)}
              className={`border-2 rounded-xl p-3 text-left transition-all hover:shadow-md ${cls}`}
            >
              <span className="text-xl block mb-1">{seg.icon}</span>
              <p className="font-semibold text-xs leading-tight">{seg.label}</p>
              <p className={`text-xs mt-0.5 leading-tight ${isActive ? 'text-white/80' : 'text-gray-500'}`}>{seg.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}