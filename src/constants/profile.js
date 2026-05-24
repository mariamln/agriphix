export const ROLE_DESTINATIONS = {
  farmer: 'Production',
  landowner: 'Production',
  buyer: 'MarketInsights',
  supplier: 'Resources',
  aggregator: 'MarketInsights',
  processor: 'Logistics',
  retailer: 'Marketplace',
  consumer: 'Marketplace',
  service_provider: 'Network',
};

export const VALUE_CHAIN_GROUPS = [
  {
    id: 'production',
    labelKey: 'login.group.production',
    roles: ['farmer', 'landowner'],
  },
  {
    id: 'trade',
    labelKey: 'login.group.trade',
    roles: ['buyer', 'aggregator', 'retailer', 'consumer'],
  },
  {
    id: 'supply',
    labelKey: 'login.group.supply',
    roles: ['supplier', 'processor', 'service_provider'],
  },
];

export const ROLES = [
  'farmer', 'landowner', 'buyer', 'supplier', 'aggregator',
  'processor', 'retailer', 'consumer', 'service_provider',
];

export const VERIFICATION_REQUESTED = 'Verification Requested';

export const CERT_OPTIONS = [
  'Organic', 'GlobalGAP', 'FairTrade', 'ISTA', 'UNBS',
  'RainForest Alliance', 'Halal', 'ISO 22000',
];

export const ROLE_DESCRIPTIONS = {
  farmer: 'Grow and harvest crops or raise livestock',
  landowner: 'Own or lease agricultural land',
  buyer: 'Purchase produce from farmers',
  supplier: 'Supply seeds, inputs & equipment',
  aggregator: 'Collect & consolidate produce from multiple farms',
  processor: 'Process & add value to raw produce',
  retailer: 'Sell produce to end consumers',
  consumer: 'End consumer of agricultural products',
  service_provider: 'Offer advisory, logistics or tech services',
};

export const roleColors = {
  farmer: 'bg-green-100 text-green-700 border-green-200',
  landowner: 'bg-blue-100 text-blue-700 border-blue-200',
  buyer: 'bg-purple-100 text-purple-700 border-purple-200',
  supplier: 'bg-amber-100 text-amber-700 border-amber-200',
  aggregator: 'bg-pink-100 text-pink-700 border-pink-200',
  processor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  retailer: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  consumer: 'bg-gray-100 text-gray-700 border-gray-200',
  service_provider: 'bg-orange-100 text-orange-700 border-orange-200',
};

export const FIRST_ACTIONS = [
  { role: 'farmer', label: 'Add your first crop', page: 'Production', icon: 'Sprout' },
  { role: 'farmer', label: 'Browse market demand', page: 'MarketInsights', icon: 'TrendingUp' },
  { role: 'buyer', label: 'Post a market demand', page: 'MarketInsights', icon: 'TrendingUp' },
  { role: 'supplier', label: 'List resources & inputs', page: 'Resources', icon: 'Package' },
  { role: 'buyer', label: 'Explore the marketplace', page: 'Marketplace', icon: 'ShoppingCart' },
  { role: 'farmer', label: 'Apply for riba-free finance', page: 'Financing', icon: 'DollarSign' },
  { role: 'farmer', label: 'Start halal certification', page: 'HalalCertification', icon: 'Shield' },
];

export function getSuggestedActions(roles) {
  const seen = new Set();
  const actions = [];
  for (const role of roles) {
    for (const action of FIRST_ACTIONS) {
      if (action.role === role && !seen.has(action.page)) {
        seen.add(action.page);
        actions.push(action);
      }
    }
  }
  if (actions.length === 0) {
    return FIRST_ACTIONS.filter(a => a.role === 'farmer').slice(0, 3);
  }
  return actions.slice(0, 4);
}
