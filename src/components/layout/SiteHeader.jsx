import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, LogOut, Menu, X } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { createPageUrl } from '@/utils';
import { primaryNav } from '@/constants/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/i18n/LanguageContext';
import LanguageToggle from '@/components/i18n/LanguageToggle';
import { Button } from '@/components/ui/button';

const PUBLIC_LINKS = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'landing.nav.features', href: '/#features' },
  { labelKey: 'landing.nav.preview', href: '/#preview' },
  { labelKey: 'landing.nav.halal', href: '/#halal' },
  { labelKey: 'nav.verifyBatch', href: '/trace' },
];

function DesktopNavLink({ href, label, isActive }) {
  const className = `text-sm font-medium transition-colors ${
    isActive ? 'text-emerald-700' : 'text-slate-600 hover:text-emerald-700'
  }`;

  if (href.startsWith('/#')) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, isActive, onClick }) {
  const className = `block px-3 py-2.5 rounded-lg text-sm font-medium ${
    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
  }`;

  if (href.startsWith('/#')) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link to={href} onClick={onClick} className={className}>
      {label}
    </Link>
  );
}

export default function SiteHeader({ currentPageName }) {
  const { isAuthenticated, user, logout, isLoadingAuth } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasUser = isAuthenticated || Boolean(auth.currentUser);
  const homeTo = hasUser ? createPageUrl('Dashboard') : '/';
  const navLinks = hasUser
    ? primaryNav.map((item) => ({
        label: t(item.nameKey),
        href: item.href,
        page: item.page,
      }))
    : PUBLIC_LINKS.map((item) => ({
        label: t(item.labelKey),
        href: item.href,
        page: null,
      }));

  const linkIsActive = (href, page) => {
    if (page) return currentPageName === page;
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.slice(1);
    }
    return location.pathname === href || location.pathname.toLowerCase() === href.toLowerCase();
  };

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    closeMobile();
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="app-main">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to={homeTo} className="flex items-center gap-3 min-w-0 shrink-0" onClick={closeMobile}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-700 to-teal-700 rounded-lg flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent block truncate">
                Agriphix
              </span>
              <span className="text-[10px] text-amber-600 font-medium truncate block">{t('landing.tagline')}</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map((item) => (
              <DesktopNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={linkIsActive(item.href, item.page)}
              />
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle />

            {!isLoadingAuth && (
              hasUser ? (
                <div className="hidden sm:flex items-center gap-3">
                  {user?.full_name && (
                    <span className="text-sm text-slate-600 max-w-[120px] truncate hidden md:inline">
                      {user.full_name}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <LogOut className="w-4 h-4 mr-1.5" />
                    {t('nav.logOut')}
                  </Button>
                </div>
              ) : (
                <Link to="/Login" className="hidden sm:block">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    {t('landing.cta.signIn')}
                  </Button>
                </Link>
              )
            )}

            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden border-t border-slate-100 py-4 space-y-1">
            {navLinks.map((item) => (
              <div key={item.href} className="px-1">
                <MobileNavLink
                  href={item.href}
                  label={item.label}
                  isActive={linkIsActive(item.href, item.page)}
                  onClick={closeMobile}
                />
              </div>
            ))}

            <div className="pt-3 mt-3 border-t border-slate-100 px-1">
              {hasUser ? (
                <Button
                  variant="outline"
                  className="w-full justify-start border-emerald-200 text-emerald-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logOut')}
                </Button>
              ) : (
                <Link to="/Login" onClick={closeMobile} className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {t('landing.cta.signIn')}
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
