import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';

const COLOR_CLASSES = {
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
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
  color = 'emerald',
}) {
  const palette = COLOR_CLASSES[color] || COLOR_CLASSES.emerald;
  const displayValue = value == null || value === '' ? '—' : value;

  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${palette} opacity-5 rounded-full transform translate-x-8 -translate-y-8`}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
            {trend && (
              <div className="flex items-center space-x-1">
                {trend === 'up' ? (
                  <ArrowUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {trendValue}
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 bg-gradient-to-br ${palette} rounded-xl shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
