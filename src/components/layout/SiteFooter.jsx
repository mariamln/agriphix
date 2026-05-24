import React from 'react';
import { Link } from 'react-router-dom';
import AgriphixLogo from '@/components/brand/AgriphixLogo';
import { auth } from '@/lib/firebase';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/i18n/LanguageContext';

export default function SiteFooter() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const hasUser = isAuthenticated || Boolean(auth.currentUser);
  const homeTo = hasUser ? createPageUrl('Dashboard') : '/';

  return (
    <footer className="shrink-0 border-t border-border bg-card mt-auto">
      <div className="app-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <AgriphixLogo
            size="sm"
            showTagline
            tagline={t('landing.tagline')}
          />

          <p className="text-sm text-muted-foreground leading-relaxed">
            © 2026 Agriphix — Halal Agriculture Platform
            <span className="block text-xs text-primary italic mt-1">
              Riba-free · Shari&apos;ah-compliant · Transparent
            </span>
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:justify-end">
            <Link to={homeTo} className="text-primary hover:underline">
              {hasUser ? t('nav.dashboard') : t('nav.home')}
            </Link>
            <Link to="/trace" className="text-primary hover:underline">
              {t('nav.verifyBatch')}
            </Link>
            <a href="mailto:support@agriphix.com" className="text-primary hover:underline">
              {t('nav.support')}
            </a>
            {!hasUser && (
              <Link to="/Login" className="text-primary hover:underline">
                {t('landing.cta.signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
