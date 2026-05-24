import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="bg-amber-600 text-white text-center py-2 px-4 text-sm flex items-center justify-center gap-2"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{t('offline.banner')}</span>
    </div>
  );
}
