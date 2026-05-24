import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ListingCard from '../components/marketplace/ListingCard';
import CreateListingModal from '../components/marketplace/CreateListingModal';
import ListingDetailModal from '../components/marketplace/ListingDetailModal';
import { useSellerProfiles } from '@/hooks/useSellerProfiles';
import ContentGrid from '@/components/layout/ContentGrid';
import { useTranslation } from '@/i18n/LanguageContext';

import {
  CategoryIcon,
  RoleIcon,
  formatRoleLabel,
  profileHasRole,
  MARKETPLACE_ROLE_FILTERS,
} from '@/constants/valueChainIcons';

const CATEGORIES = ['all', 'produce', 'equipment', 'livestock', 'seeds', 'other'];
const TYPES = ['all', 'sale', 'rent', 'exchange'];

const categoryLabels = {
  all: 'All',
  produce: 'Produce',
  equipment: 'Equipment',
  livestock: 'Livestock',
  seeds: 'Seeds',
  other: 'Other',
};

export default function Marketplace() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const { getProfileForSeller, isVerifiedSeller } = useSellerProfiles();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['marketplace_listings'],
    queryFn: () => api.entities.MarketplaceListing.list('-created_date', 100)
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['marketplace_messages_all'],
    queryFn: () => api.entities.MarketplaceMessage.list('-created_date', 200)
  });

  const filtered = listings.filter(l => {
    if (l.status !== 'active') return false;
    if (filterCategory !== 'all' && l.category !== filterCategory) return false;
    if (filterType !== 'all' && l.listing_type !== filterType) return false;
    if (verifiedOnly && !isVerifiedSeller(l)) return false;
    if (filterRole !== 'all' && !profileHasRole(getProfileForSeller(l), filterRole)) return false;
    if (search) {
      const q = search.toLowerCase();
      const inTitle = l.title?.toLowerCase().includes(q);
      const inLocation = l.location?.toLowerCase().includes(q);
      const inDescription = l.description?.toLowerCase().includes(q);
      if (!inTitle && !inLocation && !inDescription) return false;
    }
    return true;
  });

  const verifiedCount = listings.filter(l => l.status === 'active' && isVerifiedSeller(l)).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t('marketplace.title')}</h1>
            <p className="text-emerald-100">{t('marketplace.subtitle')}</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-white text-emerald-700 hover:bg-emerald-50 shadow font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Post Listing
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{listings.filter(l => l.status === 'active').length}</p>
            <p className="text-xs text-emerald-100">Active Listings</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{verifiedCount}</p>
            <p className="text-xs text-emerald-100">Verified Sellers</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{messages.length}</p>
            <p className="text-xs text-emerald-100">Total Messages</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search listings, location..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white">
          <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
          <Label htmlFor="verified-only" className="text-sm text-gray-700 cursor-pointer whitespace-nowrap">
            {t('marketplace.verifiedOnly')}
          </Label>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Category</p>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={filterCategory === cat ? 'default' : 'outline'}
              onClick={() => setFilterCategory(cat)}
              className={filterCategory === cat ? 'bg-emerald-600 gap-1.5' : 'gap-1.5'}
            >
              <CategoryIcon category={cat} className="w-4 h-4" fallback="grid" />
              {categoryLabels[cat] || cat}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Value chain</p>
        <div className="flex gap-2 flex-wrap">
          {MARKETPLACE_ROLE_FILTERS.map((role) => (
            <Button
              key={role}
              size="sm"
              variant={filterRole === role ? 'default' : 'outline'}
              onClick={() => setFilterRole(role)}
              className={filterRole === role ? 'bg-emerald-600 gap-1.5 capitalize' : 'gap-1.5 capitalize'}
            >
              <RoleIcon role={role === 'all' ? null : role} className="w-4 h-4" />
              {role === 'all' ? 'All roles' : formatRoleLabel(role)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {TYPES.map(type => (
          <Button key={type} size="sm" variant={filterType === type ? 'default' : 'outline'}
            onClick={() => setFilterType(type)}
            className={filterType === type ? 'bg-teal-600' : ''}>
            {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading listings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No listings found</p>
          <p className="text-sm">Be the first to post a listing!</p>
        </div>
      ) : (
        <ContentGrid>
          {filtered.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              sellerProfile={getProfileForSeller(listing)}
              messageCount={messages.filter(m => m.listing_id === listing.id).length}
              onClick={() => setSelectedListing(listing)}
            />
          ))}
        </ContentGrid>
      )}

      {showCreate && <CreateListingModal onClose={() => setShowCreate(false)} />}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          sellerProfile={getProfileForSeller(selectedListing)}
          messages={messages.filter(m => m.listing_id === selectedListing.id)}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}
