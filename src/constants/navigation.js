import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  TrendingUp,
  Sprout,
  Users,
  Package,
  DollarSign,
  MessageSquare,
  Truck,
  Cloud,
  Leaf,
  Shield,
  Star,
  Moon,
  ShoppingCart,
} from 'lucide-react';

export const primaryNav = [
  { nameKey: 'nav.dashboard', href: createPageUrl('Dashboard'), icon: LayoutDashboard, page: 'Dashboard' },
  { nameKey: 'nav.production', href: createPageUrl('Production'), icon: Sprout, page: 'Production' },
  { nameKey: 'nav.markets', href: createPageUrl('MarketInsights'), icon: TrendingUp, page: 'MarketInsights' },
  { nameKey: 'nav.marketplace', href: createPageUrl('Marketplace'), icon: ShoppingCart, page: 'Marketplace' },
  { nameKey: 'nav.financing', href: createPageUrl('Financing'), icon: DollarSign, page: 'Financing' },
];

export const operationsNav = [
  { nameKey: 'nav.logistics', href: createPageUrl('Logistics'), icon: Truck, page: 'Logistics' },
  { nameKey: 'nav.traceability', href: createPageUrl('Traceability'), icon: Shield, page: 'Traceability' },
  { nameKey: 'nav.weather', href: createPageUrl('Weather'), icon: Cloud, page: 'Weather' },
  { nameKey: 'nav.sustainability', href: createPageUrl('Sustainability'), icon: Leaf, page: 'Sustainability' },
  { nameKey: 'nav.resources', href: createPageUrl('Resources'), icon: Package, page: 'Resources' },
];

export const islamicNav = [
  { nameKey: 'nav.islamicAdvisor', href: createPageUrl('IslamicFinanceChat'), icon: Star, page: 'IslamicFinanceChat' },
  { nameKey: 'nav.halalCert', href: createPageUrl('HalalCertification'), icon: Shield, page: 'HalalCertification' },
  { nameKey: 'nav.zakat', href: createPageUrl('ZakatCalculator'), icon: Moon, page: 'ZakatCalculator' },
];

export const connectNav = [
  { nameKey: 'nav.network', href: createPageUrl('Network'), icon: Users, page: 'Network' },
  { nameKey: 'nav.messages', href: createPageUrl('Messages'), icon: MessageSquare, page: 'Messages' },
];

export const navGroups = [
  { id: 'main', labelKey: 'nav.group.main', items: primaryNav },
  { id: 'operations', labelKey: 'nav.group.operations', items: operationsNav },
  { id: 'islamic', labelKey: 'nav.group.islamic', items: islamicNav },
  { id: 'connect', labelKey: 'nav.group.connect', items: connectNav },
];
