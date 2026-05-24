import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, CheckCircle, MapPin, Clock, Thermometer, User, Package, Link2, QrCode, Sprout, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import BatchQrCode from '@/components/traceability/BatchQrCode';
import { generateDisplayHash } from '@/utils/traceability';
import { useTranslation } from '@/i18n/LanguageContext';

const eventIcons = {
  created: Package,
  picked_up: Package,
  location_update: MapPin,
  temperature_check: Thermometer,
  quality_check: CheckCircle,
  handler_change: User,
  delivered: CheckCircle,
  verified: Shield,
};

const eventColors = {
  created: 'bg-blue-100 text-blue-700 border-blue-300',
  picked_up: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  location_update: 'bg-purple-100 text-purple-700 border-purple-300',
  temperature_check: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  quality_check: 'bg-green-100 text-green-700 border-green-300',
  handler_change: 'bg-amber-100 text-amber-700 border-amber-300',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  verified: 'bg-green-100 text-green-700 border-green-300',
};

export function TraceabilityContent({ showQrActions = true, compactHeader = false }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchBatchId, setSearchBatchId] = useState(searchParams.get('batch') || '');
  const [selectedBatch, setSelectedBatch] = useState(null);

  const { data: shipments = [] } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => api.entities.Shipment.list('-updated_date', 100),
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ['traceabilityLogs'],
    queryFn: () => api.entities.TraceabilityLog.list('-created_date', 500),
  });

  const findBatch = useCallback((batchId) => {
    if (!batchId?.trim()) return null;
    return shipments.find(
      (s) => s.batch_id?.toLowerCase() === batchId.trim().toLowerCase()
    ) ?? null;
  }, [shipments]);

  const handleSearch = useCallback((id) => {
    const query = (id ?? searchBatchId).trim();
    const found = findBatch(query);
    setSelectedBatch(found);
    if (query) {
      setSearchParams({ batch: query }, { replace: true });
    }
  }, [searchBatchId, findBatch, setSearchParams]);

  useEffect(() => {
    const batchFromUrl = searchParams.get('batch');
    if (batchFromUrl && shipments.length > 0) {
      setSearchBatchId(batchFromUrl);
      setSelectedBatch(findBatch(batchFromUrl));
    }
  }, [searchParams, shipments, findBatch]);

  const batchLogs = selectedBatch
    ? allLogs
        .filter((log) => log.batch_id === selectedBatch.batch_id)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`font-bold text-gray-900 mb-2 ${compactHeader ? 'text-2xl' : 'text-3xl'}`}>
          {t('trace.title')}
        </h1>
        <p className="text-gray-600">{t('trace.subtitle')}</p>
      </div>

      <Card className="border-2 border-dashed border-emerald-300 bg-emerald-50/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchBatchId}
                  onChange={(e) => setSearchBatchId(e.target.value)}
                  placeholder={t('trace.placeholder')}
                  className="pl-10 text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Button onClick={() => handleSearch()} className="bg-emerald-600 hover:bg-emerald-700 px-8">
              <Search className="w-4 h-4 mr-2" />
              {t('trace.scan')}
            </Button>
          </div>

          {shipments.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">{t('trace.recentBatches')}</p>
              <div className="flex flex-wrap gap-2">
                {shipments.slice(0, 8).map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchBatchId(s.batch_id);
                      handleSearch(s.batch_id);
                    }}
                    className={selectedBatch?.id === s.id ? 'border-emerald-500 bg-emerald-50' : ''}
                  >
                    {s.batch_id}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBatch && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-lg border-t-4 border-t-emerald-500">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">{t('trace.verifiedProduct')}</span>
              </div>
              <CardTitle className="text-2xl">{selectedBatch.crop_type}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                <p className="text-xs text-gray-500 mb-1">Batch ID</p>
                <p className="font-bold">{selectedBatch.batch_id}</p>
              </div>

              {showQrActions && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-gray-600 mb-3 text-center">Scan to verify</p>
                  <BatchQrCode batchId={selectedBatch.batch_id} />
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="font-semibold">{selectedBatch.quantity} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Origin</p>
                  <p className="font-semibold">{selectedBatch.origin_location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Farmer/Producer</p>
                  <p className="font-semibold">{selectedBatch.farmer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="font-semibold">{selectedBatch.destination}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge className={selectedBatch.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                    {selectedBatch.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">Chain Integrity Hash</p>
                <div className="flex items-center gap-2 p-2 bg-gray-900 rounded text-green-400 font-mono text-xs">
                  <Link2 className="w-4 h-4 shrink-0" />
                  <span className="break-all">0x{generateDisplayHash(selectedBatch.batch_id + selectedBatch.id)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                {t('trace.auditTrail')}
              </CardTitle>
              <p className="text-sm text-gray-500">{t('trace.auditSubtitle')}</p>
            </CardHeader>
            <CardContent>
              {batchLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{t('trace.noLogs')}</p>
                  <p className="text-sm mt-2">{t('trace.noLogsHint')}</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {batchLogs.map((log, index) => {
                      const EventIcon = eventIcons[log.event_type] || Package;
                      return (
                        <div key={log.id} className="relative flex gap-4">
                          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 ${eventColors[log.event_type]}`}>
                            <EventIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="bg-white border rounded-lg p-4 shadow-sm">
                              <div className="flex justify-between items-start mb-2 gap-2">
                                <div>
                                  <Badge className={eventColors[log.event_type]}>
                                    {log.event_type.replace(/_/g, ' ')}
                                  </Badge>
                                  <p className="font-semibold mt-2">{log.description}</p>
                                </div>
                                <span className="text-xs text-gray-400 shrink-0">
                                  {format(new Date(log.created_date), 'MMM d, HH:mm')}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                                {log.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {log.location}
                                  </div>
                                )}
                                {log.handler && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {log.handler}
                                  </div>
                                )}
                                {log.temperature && (
                                  <div className="flex items-center gap-1">
                                    <Thermometer className="w-3 h-3" />
                                    {log.temperature}°C
                                  </div>
                                )}
                              </div>
                              <div className="mt-3 pt-2 border-t flex items-center gap-2 text-xs text-gray-400 font-mono">
                                <Link2 className="w-3 h-3" />
                                Block: 0x{generateDisplayHash(log.id + index)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {searchBatchId && !selectedBatch && shipments.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{t('trace.notFound')} {searchBatchId}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Traceability() {
  return <TraceabilityContent showQrActions />;
}
