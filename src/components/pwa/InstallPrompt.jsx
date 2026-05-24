import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/LanguageContext';

const DISMISS_KEY = 'agriphix_pwa_install_dismissed';

export default function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
    setDeferredPrompt(null);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-white border border-emerald-200 rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-start gap-2 mb-2">
        <p className="font-semibold text-gray-900 text-sm">{t('pwa.installTitle')}</p>
        <button type="button" onClick={dismiss} className="text-gray-400 hover:text-gray-600" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-600 mb-3">{t('pwa.installHint')}</p>
      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={install}>
        <Download className="w-4 h-4 mr-2" />
        {t('pwa.install')}
      </Button>
    </div>
  );
}
