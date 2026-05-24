import React from 'react';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LanguageToggle({ variant = 'ghost' }) {
  const { t, toggleLang } = useTranslation();

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={toggleLang}
      className="gap-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4" />
      <span className="text-xs font-medium">{t('lang.toggle')}</span>
    </Button>
  );
}
