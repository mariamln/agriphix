import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Plus, X, MapPin, Calendar, Package, CheckCircle2, Clock, Navigation, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import { generateBatchId } from '@/utils/traceability';
import { createShipmentTraceLog } from '@/utils/traceabilityLogs';
import { useTranslation } from '@/i18n/LanguageContext';

export default function Logistics() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    crop_type: '',
    quantity: '',
    origin_location: '',
    destination: '',
    pickup_date: '',
    expected_delivery_date: '',
    transporter: '',
    vehicle_number: '',
    buyer_name: '',
    farmer_name: '',
    batch_id: '',
    status: 'pending'
  });

  const queryClient = useQueryClient();

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => api.entities.Shipment.list('-updated_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Shipment.create(data),
    onSuccess: async (created) => {
      queryClient.invalidateQueries(['shipments']);
      await createShipmentTraceLog(created, 'pending');
      queryClient.invalidateQueries(['traceabilityLogs']);
      setShowForm(false);
      setFormData({
        crop_type: '',
        quantity: '',
        origin_location: '',
        destination: '',
        pickup_date: '',
        expected_delivery_date: '',
        transporter: '',
        vehicle_number: '',
        buyer_name: '',
        farmer_name: '',
        batch_id: '',
        status: 'pending'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Shipment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['shipments'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const batchId = formData.batch_id || generateBatchId(formData.crop_type);
    createMutation.mutate({
      ...formData,
      quantity: parseFloat(formData.quantity),
      batch_id: batchId
    });
  };

  const handleStatusUpdate = async (shipment, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'delivered') {
      updates.actual_delivery_date = new Date().toISOString().split('T')[0];
    }
    await updateMutation.mutateAsync({ id: shipment.id, data: updates });
    await createShipmentTraceLog({ ...shipment, ...updates }, newStatus);
    queryClient.invalidateQueries(['traceabilityLogs']);
  };

  const filteredShipments = filterStatus === 'all' 
    ? shipments 
    : shipments.filter(s => s.status === filterStatus);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_transit: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const statusIcons = {
    pending: Clock,
    in_transit: Truck,
    delivered: CheckCircle2,
    cancelled: X
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('logistics.title')}</h1>
          <p className="text-gray-600">{t('logistics.subtitle')}</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? t('common.cancel') : t('logistics.newShipment')}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="shadow-lg border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b">
            <CardTitle className="text-lg">Create Shipment</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type *</label>
                  <Input
                    value={formData.crop_type}
                    onChange={(e) => setFormData({...formData, crop_type: e.target.value})}
                    placeholder="e.g., Maize, Coffee"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg) *</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
                  <Input
                    value={formData.batch_id}
                    onChange={(e) => setFormData({...formData, batch_id: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin *</label>
                  <Input
                    value={formData.origin_location}
                    onChange={(e) => setFormData({...formData, origin_location: e.target.value})}
                    placeholder="Farm or collection point"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                  <Input
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="Delivery destination"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transporter</label>
                  <Input
                    value={formData.transporter}
                    onChange={(e) => setFormData({...formData, transporter: e.target.value})}
                    placeholder="Transport company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <Input
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                    placeholder="e.g., UAX 123A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                  <Input
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                  <Input
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name</label>
                  <Input
                    value={formData.farmer_name}
                    onChange={(e) => setFormData({...formData, farmer_name: e.target.value})}
                    placeholder="Source farmer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
                  <Input
                    value={formData.buyer_name}
                    onChange={(e) => setFormData({...formData, buyer_name: e.target.value})}
                    placeholder="Destination buyer"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Create Shipment
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'in_transit', 'delivered', 'cancelled'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            size="sm"
            className={filterStatus === status ? 'bg-emerald-600' : ''}
          >
            {status === 'all' ? 'All' : status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}
          </Button>
        ))}
      </div>

      {/* Shipments Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {isLoading ? (
          <p className="text-gray-500 col-span-2 text-center py-12">Loading shipments...</p>
        ) : filteredShipments.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-12">No shipments found</p>
        ) : (
          filteredShipments.map(shipment => {
            const StatusIcon = statusIcons[shipment.status];
            return (
              <Card key={shipment.id} className="shadow-md hover:shadow-xl transition-all border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          {shipment.batch_id}
                        </Badge>
                        <Link to={`${createPageUrl('Traceability')}?batch=${encodeURIComponent(shipment.batch_id)}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                            <QrCode className="w-3.5 h-3.5" /> QR Trace
                          </Button>
                        </Link>
                        <Badge className={statusColors[shipment.status]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {shipment.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {shipment.crop_type}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{shipment.quantity}</p>
                      <p className="text-xs text-gray-500">kg</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Route */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">From</p>
                      <p className="font-medium text-gray-900">{shipment.origin_location}</p>
                      {shipment.farmer_name && <p className="text-xs text-gray-500">{shipment.farmer_name}</p>}
                    </div>
                    <Navigation className="w-5 h-5 text-blue-500" />
                    <div className="flex-1 text-right">
                      <p className="text-xs text-gray-500">To</p>
                      <p className="font-medium text-gray-900">{shipment.destination}</p>
                      {shipment.buyer_name && <p className="text-xs text-gray-500">{shipment.buyer_name}</p>}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {shipment.pickup_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        Pickup: {format(new Date(shipment.pickup_date), 'MMM d')}
                      </div>
                    )}
                    {shipment.expected_delivery_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        ETA: {format(new Date(shipment.expected_delivery_date), 'MMM d')}
                      </div>
                    )}
                  </div>

                  {/* Transport info */}
                  {(shipment.transporter || shipment.vehicle_number) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Truck className="w-4 h-4 mr-2 text-gray-400" />
                      {shipment.transporter} {shipment.vehicle_number && `• ${shipment.vehicle_number}`}
                    </div>
                  )}

                  {/* Current location */}
                  {shipment.current_location && (
                    <div className="flex items-center text-sm text-blue-600 font-medium">
                      <MapPin className="w-4 h-4 mr-2" />
                      Current: {shipment.current_location}
                    </div>
                  )}

                  {/* Status Update */}
                  {shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (
                    <div className="pt-3 border-t">
                      <Select 
                        value={shipment.status} 
                        onValueChange={(val) => handleStatusUpdate(shipment, val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {shipment.actual_delivery_date && (
                    <div className="flex items-center text-sm text-green-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Delivered: {format(new Date(shipment.actual_delivery_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}