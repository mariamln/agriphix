import React from 'react';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/agriphix-logo.png';
const ICON_SRC = '/agriphix-icon.png';

const SIZE_MAP = {
  sm: { logo: 'h-8', icon: 28, tagline: 'text-[10px]' },
  md: { logo: 'h-10', icon: 36, tagline: 'text-[10px]' },
  lg: { logo: 'h-12', icon: 48, tagline: 'text-sm' },
  xl: { logo: 'h-16', icon: 64, tagline: 'text-sm' },
};

/**
 * Leaf icon only (from official brand assets).
 * @param {{ size?: number, className?: string, title?: string }} props
 */
export function AgriphixMark({ size = 40, className, title = 'Agriphix' }) {
  return (
    <img
      src={ICON_SRC}
      alt={title}
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      draggable={false}
    />
  );
}

/**
 * Official Agriphix wordmark lockup.
 * @param {{
 *   variant?: 'lockup' | 'mark',
 *   size?: 'sm' | 'md' | 'lg' | 'xl',
 *   className?: string,
 *   showTagline?: boolean,
 *   tagline?: string,
 * }} props
 */
export default function AgriphixLogo({
  variant = 'lockup',
  size = 'md',
  className,
  showTagline = false,
  tagline,
}) {
  const scale = SIZE_MAP[size] || SIZE_MAP.md;

  if (variant === 'mark') {
    return <AgriphixMark size={scale.icon} className={className} />;
  }

  return (
    <div className={cn('flex flex-col min-w-0', showTagline ? 'gap-1' : '', className)}>
      <img
        src={LOGO_SRC}
        alt="Agriphix"
        className={cn('w-auto object-contain object-left', scale.logo)}
        draggable={false}
      />
      {showTagline && tagline && (
        <span className={cn('text-muted-foreground truncate', scale.tagline)}>
          {tagline}
        </span>
      )}
    </div>
  );
}
