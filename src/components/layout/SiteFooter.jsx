import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
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
    <footer className="shrink-0 border-t border-slate-200 bg-white mt-auto">
      <div className="app-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block">Agriphix</span>
              <span className="text-xs text-gray-500">{t('landing.tagline')}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            © 2026 Agriphix — Halal Agriculture Platform
            <span className="block text-xs text-emerald-700 italic mt-1">
              Riba-free · Shari&apos;ah-compliant · Transparent
            </span>
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:justify-end">
            <Link to={homeTo} className="text-emerald-700 hover:underline">
              {hasUser ? t('nav.dashboard') : t('nav.home')}
            </Link>
            <Link to="/trace" className="text-emerald-700 hover:underline">
              {t('nav.verifyBatch')}
            </Link>
            <a href="mailto:support@agriphix.com" className="text-emerald-700 hover:underline">
              {t('nav.support')}
            </a>
            {!hasUser && (
              <Link to="/Login" className="text-emerald-700 hover:underline">
                {t('landing.cta.signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
