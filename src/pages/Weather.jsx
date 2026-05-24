import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Sun, CloudRain, CloudLightning, Thermometer, Droplets, Wind, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fetchUgandaForecasts, UGANDA_LOCATIONS } from '@/utils/weather';
import { useTranslation } from '@/i18n/LanguageContext';

export default function Weather() {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState('all');

  const { data: forecasts = [], isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['weatherForecasts', 'open-meteo'],
    queryFn: fetchUgandaForecasts,
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  const conditionIcons = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    stormy: CloudLightning,
    dry: Sun,
  };

  const conditionColors = {
    sunny: 'text-yellow-500',
    cloudy: 'text-gray-500',
    rainy: 'text-blue-500',
    stormy: 'text-purple-500',
    dry: 'text-orange-500',
  };

  const riskColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  const filteredForecasts = selectedLocation === 'all'
    ? forecasts
    : forecasts.filter((f) => f.location === selectedLocation);

  const groupedByDate = filteredForecasts.reduce((acc, f) => {
    if (!acc[f.forecast_date]) acc[f.forecast_date] = [];
    acc[f.forecast_date].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('weather.title')}</h1>
          <p className="text-gray-600">{t('weather.subtitle')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('weather.source')}</p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isFetching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('weather.refreshing')}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('weather.refresh')}
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedLocation === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedLocation('all')}
          size="sm"
          className={selectedLocation === 'all' ? 'bg-blue-600' : ''}
        >
          {t('weather.allRegions')}
        </Button>
        {UGANDA_LOCATIONS.map((loc) => (
          <Button
            key={loc.name}
            variant={selectedLocation === loc.name ? 'default' : 'outline'}
            onClick={() => setSelectedLocation(loc.name)}
            size="sm"
            className={selectedLocation === loc.name ? 'bg-blue-600' : ''}
          >
            {loc.name}
          </Button>
        ))}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-red-700 text-sm">
            {t('weather.error')}
          </p>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-500">{t('weather.loading')}</p>
        </div>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <Card className="p-12 text-center">
          <Cloud className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">{t('weather.noData')}</p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            {t('weather.load')}
          </Button>
        </Card>
      ) : (
        Object.entries(groupedByDate)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, dayForecasts]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {dayForecasts.map((forecast) => {
                  const ConditionIcon = conditionIcons[forecast.conditions] || Cloud;
                  return (
                    <Card key={forecast.id} className="shadow-md hover:shadow-lg transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-bold text-gray-900">
                            {forecast.location}
                          </CardTitle>
                          <ConditionIcon className={`w-8 h-8 ${conditionColors[forecast.conditions]}`} />
                        </div>
                        <p className="text-sm text-gray-500 capitalize">{forecast.conditions}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600">
                            <Thermometer className="w-4 h-4 mr-2 text-red-400" />
                            {t('weather.temperature')}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">{forecast.temperature_high}°</span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="text-gray-600">{forecast.temperature_low}°C</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600">
                            <Droplets className="w-4 h-4 mr-2 text-blue-400" />
                            {t('weather.rainfall')}
                          </div>
                          <span className="font-medium text-blue-600">{forecast.rainfall_mm} mm</span>
                        </div>

                        {forecast.humidity_percent > 0 && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-600">
                              <Wind className="w-4 h-4 mr-2 text-gray-400" />
                              {t('weather.humidity')}
                            </div>
                            <span className="text-gray-700">{forecast.humidity_percent}%</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-gray-500">{t('weather.cropRisk')}</span>
                          <Badge className={riskColors[forecast.risk_level]}>
                            {forecast.risk_level === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {forecast.risk_level}
                          </Badge>
                        </div>

                        {forecast.farming_advisory && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-500 font-medium mb-1">{t('weather.advisory')}</p>
                            <p className="text-sm text-gray-700">{forecast.farming_advisory}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
