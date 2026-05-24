import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Building2, CheckCircle, Search } from 'lucide-react';
import MyProfileForm from '../components/network/MyProfileForm';
import SellerRoleBadge from '../components/marketplace/SellerRoleBadge';
import { RoleIcon, formatRoleLabel, MARKETPLACE_ROLE_FILTERS } from '@/constants/valueChainIcons';
import ContentGrid from '@/components/layout/ContentGrid';
import { useTranslation } from '@/i18n/LanguageContext';

export default function Network() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['userProfiles'],
    queryFn: () => api.entities.UserProfile.list('-updated_date', 100)
  });

  const filteredProfiles = profiles
    .filter(p => filterRole === 'all' || p.user_role === filterRole || p.user_roles?.includes(filterRole))
    .filter(p => 
      searchQuery === '' || 
      p.organization_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('network.title')}</h1>
        <p className="text-gray-600">{t('network.subtitle')}</p>
      </div>

      {/* My Profile / Registration */}
      <MyProfileForm autoStartIfEmpty />

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('network.search')}
            className="pl-10"
          />
        </div>
      </div>

      {/* Role Filters */}
      <div className="flex flex-wrap gap-2">
        {MARKETPLACE_ROLE_FILTERS.map((role) => (
          <Button
            key={role}
            variant={filterRole === role ? 'default' : 'outline'}
            onClick={() => setFilterRole(role)}
            size="sm"
            className={`gap-1.5 capitalize ${filterRole === role ? 'bg-emerald-600' : ''}`}
          >
            <RoleIcon role={role === 'all' ? null : role} className="w-4 h-4" />
            {role === 'all' ? 'All' : formatRoleLabel(role)}
          </Button>
        ))}
      </div>

      {/* Network Grid */}
      <ContentGrid>
        {isLoading ? (
          <p className="text-gray-500 col-span-3 text-center py-12">Loading network...</p>
        ) : filteredProfiles.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center py-12">No stakeholders found</p>
        ) : (
          filteredProfiles.map(profile => (
            <Card key={profile.id} className="shadow-md hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <RoleIcon role={profile.user_role} className="w-6 h-6 text-white" />
                    </div>
                    {profile.verified && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <SellerRoleBadge profile={profile} size="md" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  {profile.organization_name || 'Unknown Organization'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.specialization && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Specialization:</span> {profile.specialization}
                  </p>
                )}
                {profile.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {profile.location}
                  </div>
                )}
                {profile.land_size && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                    {profile.land_size} hectares
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {profile.phone}
                  </div>
                )}

                {profile.certification && profile.certification.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Certifications:</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.certification.map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-3 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300">
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </ContentGrid>
    </div>
  );
}