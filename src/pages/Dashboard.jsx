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
      <div className="surface-card p-10 text-center text-muted-foreground">
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
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <UserCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Complete your profile</p>
              <p className="text-sm text-muted-foreground">
                Set up your role and farm details to unlock personalised market matches.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkipOnboarding}
            >
              Skip for now
            </Button>
            <Button
              type="button"
              onClick={() => setOnboardingOpen(true)}
            >
              Set up profile
            </Button>
          </div>
        </div>
      )}
      {dataError && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
          Some dashboard data could not be loaded. Check your connection or Firestore rules, then refresh.
        </div>
      )}
      <div className="hero-panel p-8 md:p-10">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              {t('dashboard.welcome')}{user?.full_name ? `, ${user.full_name}` : ''}
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={createPageUrl('Production')}>
              <Button className="bg-card text-primary hover:bg-card/90 shadow-elevated">
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard.newCrop')}
              </Button>
            </Link>
            <Link to={createPageUrl('MarketInsights')}>
              <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                {t('dashboard.viewMarkets')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ContentGrid cols="stats">
        <ErrorBoundary>
          <StatsCard title="Active Crops" value={activeCrops} icon={Sprout} color="primary" />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatsCard title="Open Market Demands" value={openDemands} icon={TrendingUp} color="info" />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatsCard title="Total Land Area" value={`${totalLandArea.toFixed(1)} ha`} icon={MapPin} color="accent" />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatsCard title="Finance Requests" value={pendingFinance} icon={DollarSign} color="muted" />
        </ErrorBoundary>
      </ContentGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <RecentActivity crops={crops} marketDemands={marketDemands} />
          </ErrorBoundary>
        </div>

        <Card>
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            <Link to={createPageUrl('Production')}>
              <Button variant="outline" className="w-full justify-start hover:bg-muted">
                <Sprout className="w-4 h-4 mr-3 text-primary" />
                Add New Crop
              </Button>
            </Link>
            <Link to={createPageUrl('MarketInsights')}>
              <Button variant="outline" className="w-full justify-start hover:bg-muted">
                <TrendingUp className="w-4 h-4 mr-3 text-info" />
                Browse Market Demand
              </Button>
            </Link>
            <Link to={createPageUrl('Marketplace')}>
              <Button variant="outline" className="w-full justify-start hover:bg-muted">
                <TrendingUp className="w-4 h-4 mr-3 text-accent" />
                Farmer Marketplace
              </Button>
            </Link>
            <Link to={createPageUrl('Financing')}>
              <Button variant="outline" className="w-full justify-start hover:bg-muted">
                <DollarSign className="w-4 h-4 mr-3 text-primary" />
                Apply for Finance
              </Button>
            </Link>
            <Link to={createPageUrl('IslamicFinanceChat')}>
              <Button variant="outline" className="w-full justify-start hover:bg-muted">
                <Star className="w-4 h-4 mr-3 text-accent" />
                Islamic Finance Advisor
              </Button>
            </Link>
            <Link to={createPageUrl('HalalCertification')}>
              <Button variant="outline" className="w-full justify-start hover:bg-muted">
                <Shield className="w-4 h-4 mr-3 text-primary" />
                Halal Certification
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <ErrorBoundary>
        <SuggestedOpportunities crops={crops} marketDemands={marketDemands} profile={profile} />
      </ErrorBoundary>

      <Card>
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Top Market Opportunities</CardTitle>
            <Link to={createPageUrl('MarketInsights')}>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {marketDemands.filter(d => d.status === 'open').slice(0, 3).map(demand => (
              <div key={demand.id} className="surface-card p-4 hover:shadow-elevated transition-all">
                <h4 className="font-semibold text-foreground mb-2">{demand.crop_type}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Quantity: <span className="font-medium text-foreground">{demand.quantity_needed} kg</span></p>
                  <p>Price: <span className="font-medium text-primary">{formatCurrencyPerUnit(demand.price_per_kg, 'kg')}</span></p>
                  <p className="text-xs">{demand.market_segment} market</p>
                </div>
              </div>
            ))}
            {marketDemands.filter(d => d.status === 'open').length === 0 && (
              <p className="text-muted-foreground col-span-3 text-center py-8">No open market demands yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
