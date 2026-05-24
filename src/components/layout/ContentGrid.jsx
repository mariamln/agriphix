import React from 'react';
import { cn } from '@/lib/utils';

/**
 * @param {{
 *   children?: React.ReactNode,
 *   className?: string,
 *   cols?: 'default' | 'stats' | 'bento' | 'twoCol' | 'threeCol' | string,
 * }} props
 */
export default function ContentGrid({ children, className, cols = 'default' }) {
  const colClass = {
    default: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
    stats: 'grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6',
    bento: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 auto-rows-fr',
    twoCol: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
    threeCol: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6',
  }[cols] || cols;

  return <div className={cn(colClass, className)}>{children}</div>;
}
