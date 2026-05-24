import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { clearIntendedRole } from '@/utils/intendedRole';
import { useMyProfile } from '@/hooks/useMyProfile';
import AppSidebar from '@/components/layout/AppSidebar';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Layout({ children, currentPageName }) {
  const { user } = useAuth();
  const { hasProfile } = useMyProfile();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (hasProfile) clearIntendedRole();
  }, [hasProfile]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentPageName]);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="bg-primary/95 text-primary-foreground text-center py-2 shrink-0">
        <p className="text-accent text-xs sm:text-sm font-arabic tracking-widest">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
      </div>

      <div className="flex flex-1 w-full min-h-[60vh]">
        <AppSidebar
          currentPageName={currentPageName}
          user={user}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <div className="lg:hidden shrink-0 flex items-center px-4 h-14 bg-card border-b border-border">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="ml-2 text-sm font-medium text-foreground">Menu</span>
          </div>

          <div className="app-main flex-1 w-full min-w-0 py-6 lg:py-8">
            <div className="app-page space-y-6">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
