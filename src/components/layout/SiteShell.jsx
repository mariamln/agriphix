import React from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import OfflineBanner from '@/components/pwa/OfflineBanner';
import InstallPrompt from '@/components/pwa/InstallPrompt';

export default function SiteShell({ children, currentPageName }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader currentPageName={currentPageName} />
      <OfflineBanner />
      <InstallPrompt />
      <main className="flex-1 w-full min-w-0">{children}</main>
      <SiteFooter />
    </div>
  );
}
