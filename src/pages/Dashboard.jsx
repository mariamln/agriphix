import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Sprout, TrendingUp, MapPin, DollarSign, Plus, ArrowRight, Star, Shield, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatCurrencyPerUnit } from '../utils/currency';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebase';
import { useMyProfile } from '@/hooks/useMyProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContentGrid from '@/components/layout/ContentGrid';
import ErrorBoundary from '@/components/ErrorBoundary';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import SuggestedOpportunities from '../components/dashboard/SuggestedOpportunities';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useTranslation } from '@/i18n/LanguageContext';

const ONBOARDING_DISMISS_KEY = 'agriphix_onboarding_dismissed';

export default function Dashboard() {
  const { user, isLoadingAuth } = useAuth();
  const { profile, needsOnboarding } = useMyProfile();
  const { t } = useTranslation();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem(ONBOARDING_DISMISS_KEY) === '1'
  );

  const email = user?.email || auth.currentUser?.email;
  const canFetch = Boolean(email);

  const { data: cropsData, isError: cropsError } = useQuery({
    queryKey: ['crops'],
    queryFn: () => api.entities.Crop.list('-updated_date', 100),
    enabled: canFetch,
  });

  const { data: marketDemandsData, isError: demandsError } = useQuery({
    queryKey: ['marketDemands'],
    queryFn: () => api.entities.MarketDemand.list('-updated_date', 100),
    enabled: canFetch,
  });

  const { data: financeRequestsData } = useQuery({
    queryKey: ['financeRequests'],
    queryFn: () => api.entities.FinanceRequest.list('-updated_date', 50),
    enabled: canFetch,
  });

  const crops = Array.isArray(cropsData) ? cropsData : [];
  const marketDemands = Array.isArray(marketDemandsData) ? marketDemandsData : [];
  const financeRequests = Array.isArray(financeRequestsData) ? financeRequestsData : [];

  const activeCrops = crops.filter(c => ['planted', 'growing', 'harvesting'].includes(c.status)).length;
  const openDemands = marketDemands.filter(d => d.status === 'open').length;
  const totalLandArea = crops.reduce((sum, c) => sum + (Number(c.land_area) || 0), 0);
  const pendingFinance = financeRequests.filter(f => f.status === 'pending').length;
  const dataError = cropsError || demandsError;

  const showProfileBanner = needsOnboarding && !onboardingDismissed;

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_DISMISS_KEY, '1');
    setOnboardingDismissed(true);
    setOnboardingOpen(false);
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem(ONBOARDING_DISMISS_KEY, '1');
    setOnboardingDismissed(true);
    setOnboardingOpen(false);
  };

  if (isLoadingAuth && !email) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600">
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OnboardingWizard
        open={onboardingOpen}
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
      />

      {showProfileBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <UserCircle className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-900">Complete your profile</p>
              <p className="text-sm text-emerald-800/90">
                Set up your role and farm details to unlock personalised market matches.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              className="border-emerald-300 text-emerald-800"
              onClick={handleSkipOnboarding}
            >
              Skip for now
            </Button>
            <Button
              type="button"
              className="bg-emerald-700 hover:bg-emerald-800"
              onClick={() => setOnboardingOpen(true)}
            >
              Set up profile
            </Button>
          </div>
        </div>
      )}
      {dataError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Some dashboard data could not be loaded. Check your connection or Firestore rules, then refresh.
        </div>
      )}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {t('dashboard.welcome')}{user?.full_name ? `, ${user.full_name}` : ''}
            </h1>
            <p className="text-emerald-100 text-lg">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to={createPageUrl('Production')}>
              <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard.newCrop')}
              </Button>
            </Link>
            <Link to={createPageUrl('MarketInsights')}>
              <Button variant="outline" className="border-white text-white hover:bg-emerald-600">
                {t('dashboard.viewMarkets')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ContentGrid cols="stats">
        <ErrorBoundary>
          <StatsCard title="Active Crops" value={activeCrops} icon={Sprout} color="emerald" />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatsCard title="Open Market Demands" value={openDemands} icon={TrendingUp} color="blue" />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatsCard title="Total Land Area" value={`${totalLandArea.toFixed(1)} ha`} icon={MapPin} color="amber" />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatsCard title="Finance Requests" value={pendingFinance} icon={DollarSign} color="purple" />
        </ErrorBoundary>
      </ContentGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <RecentActivity crops={crops} marketDemands={marketDemands} />
          </ErrorBoundary>
        </div>

        <Card className="shadow-md">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <Link to={createPageUrl('Production')}>
              <Button variant="outline" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                <Sprout className="w-4 h-4 mr-3" />
                Add New Crop
              </Button>
            </Link>
            <Link to={createPageUrl('MarketInsights')}>
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200">
                <TrendingUp className="w-4 h-4 mr-3" />
                Browse Market Demand
              </Button>
            </Link>
            <Link to={createPageUrl('Marketplace')}>
              <Button variant="outline" className="w-full justify-start hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">
                <TrendingUp className="w-4 h-4 mr-3" />
                Farmer Marketplace
              </Button>
            </Link>
            <Link to={createPageUrl('Financing')}>
              <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200">
                <DollarSign className="w-4 h-4 mr-3" />
                Apply for Finance
              </Button>
            </Link>
            <Link to={createPageUrl('IslamicFinanceChat')}>
              <Button variant="outline" className="w-full justify-start hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200">
                <Star className="w-4 h-4 mr-3" />
                Islamic Finance Advisor
              </Button>
            </Link>
            <Link to={createPageUrl('HalalCertification')}>
              <Button variant="outline" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                <Shield className="w-4 h-4 mr-3" />
                Halal Certification
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <ErrorBoundary>
        <SuggestedOpportunities crops={crops} marketDemands={marketDemands} profile={profile} />
      </ErrorBoundary>

      <Card className="shadow-md">
        <CardHeader className="border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-900">Top Market Opportunities</CardTitle>
            <Link to={createPageUrl('MarketInsights')}>
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {marketDemands.filter(d => d.status === 'open').slice(0, 3).map(demand => (
              <div key={demand.id} className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all">
                <h4 className="font-semibold text-gray-900 mb-2">{demand.crop_type}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Quantity: <span className="font-medium text-gray-900">{demand.quantity_needed} kg</span></p>
                  <p>Price: <span className="font-medium text-emerald-600">{formatCurrencyPerUnit(demand.price_per_kg, 'kg')}</span></p>
                  <p className="text-xs text-gray-500">{demand.market_segment} market</p>
                </div>
              </div>
            ))}
            {marketDemands.filter(d => d.status === 'open').length === 0 && (
              <p className="text-gray-500 col-span-3 text-center py-8">No open market demands yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
