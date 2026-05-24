import React from 'react';
import { Link } from 'react-router-dom';
import { User, X } from 'lucide-react';
import { navGroups } from '@/constants/navigation';
import { useTranslation } from '@/i18n/LanguageContext';

function SidebarLink({ item, label, isActive, onNavigate }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-soft'
          : 'text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
      <span className="truncate">{label}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
      )}
    </Link>
  );
}

export default function AppSidebar({ currentPageName, user, mobileOpen, onMobileClose }) {
  const { t } = useTranslation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="lg:hidden flex items-center justify-between gap-2 px-4 py-3 border-b border-sidebar-border">
        <span className="text-sm font-medium text-foreground">Menu</span>
        <button
          type="button"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={onMobileClose}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 pt-4 lg:pt-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.id}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/60">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 shrink-0 bg-sidebar border-r border-sidebar-border min-h-full">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-label="Close overlay"
          />
          <aside className="relative w-[min(100%,280px)] bg-sidebar border-r border-sidebar-border shadow-float h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
