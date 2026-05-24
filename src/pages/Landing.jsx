import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductPreviews from '@/components/landing/ProductPreviews';
import MarketingSection from '@/components/layout/MarketingSection';
import { useTranslation } from '@/i18n/LanguageContext';
import AgriphixLogo from '@/components/brand/AgriphixLogo';
import { 
  Sprout,
  TrendingUp, 
  Users, 
  DollarSign, 
  Shield,
  Star,
  Moon,
  ShoppingCart,
  CheckCircle,
  ArrowRight,
  Scale
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const goToLogin = () => {
    navigate({ pathname: '/Login', search: location.search });
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPreview = () => {
    document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHalal = () => {
    document.getElementById('halal')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Real-time demand from local, regional, and export buyers across Uganda — priced in UGX.'
    },
    {
      icon: Sprout,
      title: 'Production Management',
      description: 'Track crops and livestock from planting to harvest with smart production planning tools.'
    },
    {
      icon: ShoppingCart,
      title: 'Farmer Marketplace',
      description: 'Buy, sell, and rent produce, equipment, and livestock peer-to-peer across districts.'
    },
    {
      icon: Users,
      title: 'Stakeholder Network',
      description: 'Connect with verified farmers, buyers, suppliers, and processors across the value chain.'
    },
    {
      icon: DollarSign,
      title: 'Riba-Free Financing',
      description: 'Apply for Shari\'ah-compliant crop financing via Murabaha, Salam, Mudaraba, and more.'
    },
    {
      icon: Shield,
      title: 'Traceability',
      description: 'Track batches from farm to buyer with transparent supply chain records.'
    }
  ];

  const halalFeatures = [
    {
      icon: Star,
      title: 'Islamic Finance Advisor',
      description: 'AI-powered guidance on riba-free financing structures for every stage of the value chain.'
    },
    {
      icon: CheckCircle,
      title: 'Halal Certification',
      description: 'Score and certify your farming practices against halal agricultural standards.'
    },
    {
      icon: Moon,
      title: 'Zakat Calculator',
      description: 'Calculate your annual Zakat obligation with Nisab thresholds in UGX.'
    },
    {
      icon: Scale,
      title: 'Shari\'ah Compliance',
      description: 'Transparent, riba-free, and fair — built on Islamic principles of justice in trade.'
    }
  ];

  const benefits = [
    'Connect directly with verified buyers across Uganda',
    'Access competitive market prices in UGX',
    'Secure riba-free, Shari\'ah-compliant financing',
    'Certify your produce as halal',
    'Track production and logistics end-to-end',
    'Get personalised market opportunity matches'
  ];

  const pillars = [
    { label: 'Full Value Chain', detail: 'Farm to market' },
    { label: 'Shari\'ah Compliant', detail: 'Riba-free finance' },
    { label: 'Built for Uganda', detail: 'UGX · Local markets' },
    { label: 'Halal Certified', detail: 'Transparent standards' },
  ];

  const galleryImages = [
    {
      src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&q=80',
      alt: 'Ugandan farmers in the field',
    },
    {
      src: '/images/landing/coffee-harvest.jpg',
      alt: 'Coffee harvest in East Africa',
    },
    {
      src: '/images/landing/market-produce.jpg',
      alt: 'Agricultural market produce',
    },
  ];

  const heroImage = galleryImages[0].src;

  return (
    <div className="bg-background">
      <section className="w-full py-16 md:py-24 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-accent/10 overflow-hidden">
        <div className="marketing-inner grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          <div className="text-left">
            <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-4">
              {t('landing.hero.badge')}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              {t('landing.hero.title1')}
              <span className="block text-gradient-brand">
                {t('landing.hero.title2')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={goToLogin}
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                {t('landing.cta.start')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                onClick={scrollToFeatures}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                {t('landing.cta.learn')}
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/15 to-accent/10 rounded-3xl blur-2xl" />
            <img
              src={heroImage}
              alt="Ugandan agriculture"
              className="relative rounded-2xl shadow-float w-full h-[320px] md:h-[420px] object-cover border border-border/60"
            />
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-elevated p-4 border border-border/60 hidden sm:block">
              <p className="text-xs text-muted-foreground">Trusted by farmers across</p>
              <p className="font-bold text-primary">30+ districts in Uganda</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-10 bg-card border-y border-border/60">
        <div className="marketing-inner grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {galleryImages.map((img) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className="rounded-xl h-48 md:h-56 w-full object-cover shadow-md hover:shadow-lg transition-shadow"
              loading="lazy"
            />
          ))}
        </div>
      </section>

      <section className="w-full py-12 md:py-14 bg-primary text-primary-foreground">
        <div className="marketing-inner grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
            {pillars.map((pillar) => (
              <div key={pillar.label}>
                <p className="text-xl md:text-2xl font-bold">{pillar.label}</p>
                <p className="text-emerald-200 text-sm mt-1">{pillar.detail}</p>
              </div>
            ))}
        </div>
      </section>

      <ProductPreviews />

      <MarketingSection id="features" className="py-16 md:py-24 bg-white scroll-mt-20">
        <div className="mb-12 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600">
            A complete platform for modern agricultural coordination and value chain management.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </MarketingSection>

      <MarketingSection id="halal" className="py-16 md:py-24 bg-gradient-to-br from-teal-50 to-emerald-50 scroll-mt-20">
        <div className="mb-12 max-w-3xl">
          <p className="text-amber-600 text-sm font-arabic tracking-widest mb-2">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Halal & Islamic Finance
          </h2>
          <p className="text-lg text-gray-600">
            The only agricultural platform in Uganda built on Shari&apos;ah-compliant principles from the ground up.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {halalFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-emerald-200 shadow-md hover:shadow-lg transition-shadow bg-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-teal-700" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </MarketingSection>

      <MarketingSection className="py-16 md:py-24 bg-white">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Agriphix?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Whether you are a farmer in Mbale, a buyer in Kampala, or a financier seeking halal investments — 
                Agriphix gives you the tools to grow with confidence and compliance.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-card p-8 shadow-elevated">
              <div>
                <AgriphixLogo size="xl" className="mb-6" />
                <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6">
                  Create your free account and join Uganda&apos;s halal agricultural community today.
                </p>
                <Button 
                  onClick={goToLogin}
                  size="lg"
                  className="w-full text-lg py-6 h-auto"
                >
                  Create Free Account
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Already have an account?{' '}
                  <button onClick={goToLogin} className="text-emerald-600 hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              </div>
            </div>
        </div>
      </MarketingSection>

      <section className="w-full py-16 md:py-20 bg-emerald-700">
        <div className="marketing-inner max-w-4xl text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Uganda&apos;s Halal Agriculture Platform
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Riba-free · Shari&apos;ah-compliant · Transparent — for farmers, buyers, suppliers, and financiers.
          </p>
          <Button 
            onClick={goToLogin}
            size="lg"
            className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-6"
          >
            Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

    </div>
  );
}
