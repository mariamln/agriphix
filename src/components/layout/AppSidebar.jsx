import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, User, X } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { navGroups } from '@/constants/navigation';
import { useTranslation } from '@/i18n/LanguageContext';

function SidebarLink({ item, label, isActive, onNavigate }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-emerald-100/90 hover:bg-emerald-800 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function AppSidebar({ currentPageName, user, mobileOpen, onMobileClose }) {
  const { t } = useTranslation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 p-4 border-b border-emerald-800">
        <Link to={createPageUrl('Dashboard')} onClick={onMobileClose} className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-white block truncate">Agriphix</span>
            <span className="text-xs text-emerald-200 truncate block">{t('landing.tagline')}</span>
          </div>
        </Link>
        <button
          type="button"
          className="lg:hidden p-2 text-emerald-200 hover:text-white"
          onClick={onMobileClose}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.id}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
              {t(group.labelKey)}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarLink
                  key={item.page}
                  item={item}
                  label={t(item.nameKey)}
                  isActive={currentPageName === item.page}
                  onNavigate={onMobileClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="p-4 border-t border-emerald-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-emerald-900/50">
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-emerald-100" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-emerald-300 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 shrink-0 bg-gradient-to-b from-emerald-900 to-teal-950 text-white min-h-full">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-label="Close overlay"
          />
          <aside className="relative w-[min(100%,280px)] bg-gradient-to-b from-emerald-900 to-teal-950 shadow-xl h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
