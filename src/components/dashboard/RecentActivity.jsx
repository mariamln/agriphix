import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrencyPerUnit } from '@/utils/currency';
import { formatDisplayDate, toValidDate } from '@/utils/dates';

function asList(value) {
  return Array.isArray(value) ? value : [];
}

const STATUS_CONFIG = {
  planted: { color: 'bg-blue-100 text-blue-700', icon: Clock },
  growing: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  harvesting: { color: 'bg-amber-100 text-amber-700', icon: Clock },
  open: { color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
  filled: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const DEFAULT_STATUS = STATUS_CONFIG.planted;

/**
 * @param {{ crops?: unknown[], marketDemands?: unknown[] }} props
 */
export default function RecentActivity({ crops = [], marketDemands = [] }) {
  const cropList = asList(crops);
  const demandList = asList(marketDemands);
  const activities = [];

  cropList.slice(0, 3).forEach((crop) => {
    const name = crop?.crop_name || 'Crop';
    const variety = crop?.variety || 'Standard';
    const landArea =
      crop?.land_area != null && crop.land_area !== '' ? `${crop.land_area} ha` : null;

    activities.push({
      type: 'crop',
      title: `${name} - ${variety}`,
      status: crop?.status,
      date: crop?.updated_date,
      area: landArea,
    });
  });

  demandList.slice(0, 2).forEach((demand) => {
    const cropType = demand?.crop_type || 'Unknown crop';
    const quantity =
      demand?.quantity_needed != null && demand?.quantity_needed !== ''
        ? `${demand.quantity_needed} kg`
        : null;

    activities.push({
      type: 'demand',
      title: `Market demand for ${cropType}`,
      status: demand?.status,
      date: demand?.updated_date,
      quantity,
      price: formatCurrencyPerUnit(demand?.price_per_kg, 'kg'),
    });
  });

  activities.sort((a, b) => {
    const bd = toValidDate(b.date)?.getTime() ?? 0;
    const ad = toValidDate(a.date)?.getTime() ?? 0;
    return bd - ad;
  });

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          ) : (
            activities.map((activity, index) => {
              const config = STATUS_CONFIG[activity.status] || DEFAULT_STATUS;
              const StatusIcon = config.icon;

              return (
                <div
                  key={`${activity.type}-${activity.title}-${index}`}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {String(activity.status || 'unknown').replace(/_/g, ' ')}
                      </Badge>
                      {activity.area && (
                        <span className="text-xs text-gray-500">{activity.area}</span>
                      )}
                      {activity.quantity && (
                        <span className="text-xs text-gray-500">{activity.quantity}</span>
                      )}
                      {activity.price && activity.price !== '— / kg' && (
                        <span className="text-xs font-medium text-emerald-600">{activity.price}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDisplayDate(activity.date, 'MMM d, yyyy • h:mm a', 'Date unavailable')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
