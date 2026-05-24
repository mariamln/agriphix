import React from 'react';
import { Sprout, TrendingUp, Shield, ShoppingCart, BarChart3, CheckCircle } from 'lucide-react';
import { CategoryIcon } from '@/constants/valueChainIcons';
import MarketingSection from '@/components/layout/MarketingSection';

function DashboardPreview() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden text-left h-full min-h-[220px]">
      <div className="bg-emerald-600 px-4 py-3">
        <p className="text-white text-sm font-semibold">Welcome back, Farmer</p>
        <p className="text-emerald-100 text-xs">Coordinating halal production with market demand</p>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2">
        {[
          { label: 'Active Crops', value: '3', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Open Demands', value: '12', color: 'bg-blue-50 text-blue-700' },
          { label: 'Land Area', value: '4.5 ha', color: 'bg-amber-50 text-amber-700' },
          { label: 'Finance', value: '1', color: 'bg-purple-50 text-purple-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-lg p-2.5 ${stat.color}`}>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplacePreview() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden text-left h-full min-h-[180px]">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3">
        <p className="text-white text-sm font-semibold">Farmer Marketplace</p>
      </div>
      <div className="p-3 space-y-2">
        {[
          { title: 'Fresh Matooke — 500kg', price: 'UGX 1,200/kg', category: 'produce' },
          { title: 'Ox-plough for rent', price: 'UGX 80,000/day', category: 'equipment' },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
            <CategoryIcon category={item.category} className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs font-semibold text-gray-900">{item.title}</p>
              <p className="text-xs text-emerald-600 font-medium">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HalalPreview() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden text-left h-full min-h-[180px]">
      <div className="bg-teal-700 px-4 py-3">
        <p className="text-white text-sm font-semibold">Halal Certification</p>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">Halal Score</span>
          <span className="text-2xl font-bold text-emerald-600">87/100</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-700">
          <CheckCircle className="w-3.5 h-3.5" />
          Shari&apos;ah-compliant practices verified
        </div>
      </div>
    </div>
  );
}

const bentoItems = [
  {
    title: 'Smart Dashboard',
    description: 'Track crops, market demands, and personalised opportunities at a glance.',
    icon: BarChart3,
    component: DashboardPreview,
    className: 'lg:col-span-7',
  },
  {
    title: 'Farmer Marketplace',
    description: 'Buy, sell, and rent produce and equipment peer-to-peer across Uganda.',
    icon: ShoppingCart,
    component: MarketplacePreview,
    className: 'lg:col-span-5',
  },
  {
    title: 'Halal Certification',
    description: 'Score and certify your farming practices against halal standards.',
    icon: Shield,
    component: HalalPreview,
    className: 'lg:col-span-12',
  },
];

export default function ProductPreviews() {
  return (
    <MarketingSection id="preview" className="py-16 md:py-24 bg-slate-50 scroll-mt-20">
      <div className="mb-12 max-w-3xl">
        <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wide mb-2">Platform Preview</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">See Agriphix in Action</h2>
        <p className="text-lg text-gray-600">
          From your dashboard to the marketplace and halal certification — everything in one platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {bentoItems.map(({ title, description, icon: Icon, component: Preview, className }) => (
          <div key={title} className={`space-y-4 ${className}`}>
            <Preview />
            <div className="flex items-start gap-2">
              <Icon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-6 text-sm text-gray-600">
        <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-500" /> Live market data in UGX</span>
        <span className="flex items-center gap-1.5"><Sprout className="w-4 h-4 text-emerald-500" /> Full production tracking</span>
        <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500" /> Halal & Shari&apos;ah tools</span>
      </div>
    </MarketingSection>
  );
}
