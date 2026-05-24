import React from 'react';
import { ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';

const COLOR_CLASSES = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent-foreground',
  info: 'bg-info/10 text-info',
  muted: 'bg-muted text-muted-foreground',
};

/**
 * @param {{
 *   title?: string,
 *   value?: string | number,
 *   icon?: React.ComponentType<{ className?: string }>,
 *   trend?: 'up' | 'down',
 *   trendValue?: string,
 *   color?: keyof typeof COLOR_CLASSES,
 * }} props
 */
export default function StatsCard({
  title = '',
  value = '—',
  icon: Icon = BarChart3,
  trend,
  trendValue,
  color = 'primary',
}) {
  const palette = COLOR_CLASSES[color] || COLOR_CLASSES.primary;
  const displayValue = value == null || value === '' ? '—' : value;

  return (
    <div className="surface-card p-6 hover:shadow-elevated transition-shadow duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{displayValue}</p>
          {trend && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {trend === 'up' ? (
                <ArrowUp className="w-4 h-4 text-success" />
              ) : (
                <ArrowDown className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                {trendValue}
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${palette}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
