import React from 'react';

export default function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div className="min-w-0">
        {title && <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{title}</h1>}
        {subtitle && <p className="mt-1.5 text-muted-foreground max-w-3xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
