import React from 'react';
import {
  Sprout,
  MapPin,
  ShoppingBag,
  Package,
  Layers,
  Factory,
  Store,
  User,
  Wrench,
  Tractor,
  Beef,
  Wheat,
  LayoutGrid,
  Globe,
  Lightbulb,
  Warehouse,
  Truck,
  ScanSearch,
  Globe2,
  Scale,
  FlaskConical,
  Droplets,
  FileText,
  Tag,
  Key,
  Handshake,
  Briefcase,
  Building2,
  Shield,
  BarChart3,
  Gift,
  Banknote,
  Coins,
  TrendingUp,
  CreditCard,
  Receipt,
  PawPrint,
  Milk,
  Moon,
  ClipboardList,
  FolderOpen,
  BookOpen,
  Camera,
  CheckCircle,
  MessageSquare,
  Rocket,
  Bot,
  Save,
} from 'lucide-react';
import { ROLES } from '@/constants/profile';

/** @type {Record<string, React.ComponentType<{ className?: string }>>} */
export const ROLE_ICONS = {
  farmer: Sprout,
  landowner: MapPin,
  buyer: ShoppingBag,
  supplier: Package,
  aggregator: Layers,
  processor: Factory,
  retailer: Store,
  consumer: User,
  service_provider: Wrench,
};

/** @type {Record<string, React.ComponentType<{ className?: string }>>} */
export const CATEGORY_ICONS = {
  produce: Sprout,
  equipment: Tractor,
  livestock: Beef,
  seeds: Wheat,
  other: Package,
};

/** @type {Record<string, React.ComponentType<{ className?: string }>>} */
export const PRODUCTION_TYPE_ICONS = {
  crop: Wheat,
  livestock: Beef,
  all: LayoutGrid,
};

/** @type {Record<string, React.ComponentType<{ className?: string }>>} */
export const VALUE_CHAIN_SEGMENT_ICONS = {
  land: Globe,
  farming_inputs: Sprout,
  machinery: Tractor,
  advisory: Lightbulb,
  logistics: Warehouse,
  delivery: Truck,
  suppliers: Factory,
  traceability: ScanSearch,
  export: Globe2,
  shariah_compliance: Scale,
  salam: Wheat,
  mudaraba: Handshake,
};

/** @type {Record<string, React.ComponentType<{ className?: string }>>} */
export const HALAL_CRITERIA_ICONS = {
  chemical_safety: FlaskConical,
  water_source: Droplets,
  soil_treatment: Sprout,
  farming_method: Tractor,
  animal_byproducts: Beef,
  documentation: FileText,
};

/** @type {Record<string, React.ComponentType<{ className?: string }>>} */
export const FINANCE_INSTRUMENT_ICONS = {
  Murabaha: Tag,
  Ijara: Key,
  Musharaka: Handshake,
  Mudaraba: Briefcase,
  Salam: Package,
  Istisna: Building2,
  Takaful: Shield,
  Sukuk: BarChart3,
  'Qard Hasan': Gift,
};

/** @type {Record<string, React.ComponentType<{ className?: string }>>} */
export const ZAKAT_ASSET_ICONS = {
  cash: Banknote,
  crops: Wheat,
  livestock: Beef,
  gold_silver: Coins,
  business: Store,
  investments: TrendingUp,
  receivables: Handshake,
};

/** @type {Record<string, React.ComponentType<{ className?: string }>>} */
export const ZAKAT_DEDUCTION_ICONS = {
  debts: CreditCard,
  expenses: Receipt,
};

/**
 * @param {{ user_role?: string, user_roles?: string[] } | null | undefined} profile
 * @returns {string | null}
 */
export function getProfilePrimaryRole(profile) {
  if (!profile) return null;
  if (Array.isArray(profile.user_roles) && profile.user_roles.length > 0) {
    return profile.user_roles[0];
  }
  return profile.user_role || null;
}

/**
 * @param {{ user_role?: string, user_roles?: string[] } | null | undefined} profile
 * @param {string} role
 */
export function profileHasRole(profile, role) {
  if (!profile || role === 'all') return role === 'all';
  if (profile.user_role === role) return true;
  return Array.isArray(profile.user_roles) && profile.user_roles.includes(role);
}

/**
 * @param {{ className?: string, role?: string | null }} props
 */
export function RoleIcon({ role, className = 'w-4 h-4' }) {
  if (!role || role === 'all') {
    return <LayoutGrid className={className} aria-hidden="true" />;
  }
  const Icon = ROLE_ICONS[role] || LayoutGrid;
  return <Icon className={className} aria-hidden="true" />;
}

/**
 * @param {{ className?: string, category?: string | null, fallback?: 'grid' | 'package' }} props
 */
export function CategoryIcon({ category, className = 'w-4 h-4', fallback = 'package' }) {
  if (!category || category === 'all') {
    const Fallback = fallback === 'grid' ? LayoutGrid : Package;
    return <Fallback className={className} aria-hidden="true" />;
  }
  const Icon = CATEGORY_ICONS[category] || Package;
  return <Icon className={className} aria-hidden="true" />;
}

/**
 * @param {{ className?: string, type?: string | null }} props
 */
export function ProductionTypeIcon({ type, className = 'w-4 h-4' }) {
  if (!type || type === 'all') {
    return <LayoutGrid className={className} aria-hidden="true" />;
  }
  const Icon = PRODUCTION_TYPE_ICONS[type] || Wheat;
  return <Icon className={className} aria-hidden="true" />;
}

/**
 * @param {{ className?: string, segment?: string | null }} props
 */
export function ValueChainSegmentIcon({ segment, className = 'w-4 h-4' }) {
  if (!segment) {
    return <LayoutGrid className={className} aria-hidden="true" />;
  }
  const Icon = VALUE_CHAIN_SEGMENT_ICONS[segment] || Package;
  return <Icon className={className} aria-hidden="true" />;
}

/**
 * @param {{ className?: string, criterion?: string | null }} props
 */
export function HalalCriteriaIcon({ criterion, className = 'w-4 h-4' }) {
  const Icon = (criterion && HALAL_CRITERIA_ICONS[criterion]) || FileText;
  return <Icon className={className} aria-hidden="true" />;
}

/**
 * @param {{ className?: string, instrument?: string | null }} props
 */
export function FinanceInstrumentIcon({ instrument, className = 'w-4 h-4' }) {
  const Icon = (instrument && FINANCE_INSTRUMENT_ICONS[instrument]) || Tag;
  return <Icon className={className} aria-hidden="true" />;
}

/**
 * @param {{ className?: string, asset?: string | null, deduction?: string | null }} props
 */
export function ZakatCategoryIcon({ asset, deduction, className = 'w-4 h-4' }) {
  const Icon =
    (asset && ZAKAT_ASSET_ICONS[asset]) ||
    (deduction && ZAKAT_DEDUCTION_ICONS[deduction]) ||
    Coins;
  return <Icon className={className} aria-hidden="true" />;
}

export const MARKETPLACE_ROLE_FILTERS = ['all', ...ROLES.filter((r) => r !== 'consumer')];

export function formatRoleLabel(role) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export {
  Moon,
  Scale,
  Wheat,
  ClipboardList,
  FolderOpen,
  BookOpen,
  Camera,
  CheckCircle,
  MessageSquare,
  Rocket,
  Bot,
  Save,
  PawPrint,
  Milk,
  Handshake,
  Shield,
};
