import React from 'react';
import { cn } from '@/lib/utils';

/** Full-bleed section with optional background; inner content uses wide marketing gutters. */
export default function MarketingSection({
  children,
  className = '',
  innerClassName = '',
  id,
  bleed = true,
}) {
  return (
    <section id={id} className={cn(bleed && 'w-full', className)}>
      <div className={cn('marketing-inner', innerClassName)}>{children}</div>
    </section>
  );
}
