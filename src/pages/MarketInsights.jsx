import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Plus, X, MapPin, Calendar, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatCurrencyPerUnit } from '@/utils/currency';

export default function MarketInsights() {
  const [showForm, setShowForm] = useState(false);
  const [filterSegment, setFilterSegment] = useState('all');
  const [formData, setFormData] = useState({
    crop_type: '',
    market_segment: 'local',
    quantity_needed: '',
    price_per_kg: '',
    quality_requirements: '',
    delivery_date: '',
    location: '',
    certifications_required: [],
    contact_info: '',
    status: 'open'
  });

  const queryClient = useQueryClient();

  const { data: demands = [], isLoading } = useQuery({
    queryKey: ['marketDemands'],
    queryFn: () => api.entities.MarketDemand.list('-updated_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.MarketDemand.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['marketDemands']);
      setShowForm(false);
      setFormData({
        crop_type: '',
        market_segment: 'local',
        quantity_needed: '',
        price_per_kg: '',
        quality_requirements: '',
        delivery_date: '',
        location: '',
        certifications_required: [],
        contact_info: '',
        status: 'open'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      quantity_needed: parseFloat(formData.quantity_needed),
      price_per_kg: parseFloat(formData.price_per_kg)
    });
  };

  const filteredDemands = filterSegment === 'all' 
    ? demands 
    : demands.filter(d => d.market_segment === filterSegment);

  const segmentColors = {
    local: 'bg-green-100 text-green-700 border-green-200',
    regional: 'bg-blue-100 text-blue-700 border-blue-200',
    national: 'bg-purple-100 text-purple-700 border-purple-200',
    export: 'bg-amber-100 text-amber-700 border-amber-200'
  };

  const statusColors = {
    open: 'bg-green-100 text-green-700',
    partially_filled: 'bg-yellow-100 text-yellow-700',
    filled: 'bg-gray-100 text-gray-700',
    closed: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Insights</h1>
          <p className="text-gray-600">Real-time demand from buyers across all market segments</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'Post Demand'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="shadow-lg border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b">
            <CardTitle className="text-lg">Post Market Demand</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type *</label>
                  <Input
                    value={formData.crop_type}
                    onChange={(e) => setFormData({...formData, crop_type: e.target.value})}
                    placeholder="e.g., Tomatoes, Maize, Coffee"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Market Segment *</label>
                  <Select value={formData.market_segment} onValueChange={(val) => setFormData({...formData, market_segment: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed (kg) *</label>
                  <Input
                    type="number"
                    value={formData.quantity_needed}
                    onChange={(e) => setFormData({...formData, quantity_needed: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per kg (UGX) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({...formData, price_per_kg: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Delivery location"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Requirements</label>
                <Textarea
                  value={formData.quality_requirements}
                  onChange={(e) => setFormData({...formData, quality_requirements: e.target.value})}
                  placeholder="Describe quality standards, grades, specifications..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <Input
                  value={formData.contact_info}
                  onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                  placeholder="Phone or email"
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Post Market Demand
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex space-x-2">
        <Button
          variant={filterSegment === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterSegment('all')}
          size="sm"
          className={filterSegment === 'all' ? 'bg-emerald-600' : ''}
        >
          All Markets
        </Button>
        <Button
          variant={filterSegment === 'local' ? 'default' : 'outline'}
          onClick={() => setFilterSegment('local')}
          size="sm"
          className={filterSegment === 'local' ? 'bg-emerald-600' : ''}
        >
          Local
        </Button>
        <Button
          variant={filterSegment === 'regional' ? 'default' : 'outline'}
          onClick={() => setFilterSegment('regional')}
          size="sm"
          className={filterSegment === 'regional' ? 'bg-emerald-600' : ''}
        >
          Regional
        </Button>
        <Button
          variant={filterSegment === 'national' ? 'default' : 'outline'}
          onClick={() => setFilterSegment('national')}
          size="sm"
          className={filterSegment === 'national' ? 'bg-emerald-600' : ''}
        >
          National
        </Button>
        <Button
          variant={filterSegment === 'export' ? 'default' : 'outline'}
          onClick={() => setFilterSegment('export')}
          size="sm"
          className={filterSegment === 'export' ? 'bg-emerald-600' : ''}
        >
          Export
        </Button>
      </div>

      {/* Demands Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {isLoading ? (
          <p className="text-gray-500 col-span-2 text-center py-12">Loading market demands...</p>
        ) : filteredDemands.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-12">No market demands found</p>
        ) : (
          filteredDemands.map(demand => (
            <Card key={demand.id} className="shadow-md hover:shadow-xl transition-all border-l-4 border-l-emerald-500">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                      {demand.crop_type}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`border ${segmentColors[demand.market_segment]}`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {demand.market_segment}
                      </Badge>
                      <Badge className={statusColors[demand.status]}>
                        {demand.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(demand.price_per_kg)}</p>
                    <p className="text-xs text-gray-500">per kg</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium">{demand.quantity_needed} kg</span>
                  <span className="mx-2">•</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(demand.quantity_needed * demand.price_per_kg)} total
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Delivery by {format(new Date(demand.delivery_date), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {demand.location}
                </div>
                {demand.quality_requirements && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">Quality Requirements:</p>
                    <p className="text-sm text-gray-700">{demand.quality_requirements}</p>
                  </div>
                )}
                {demand.contact_info && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500">Contact: <span className="text-gray-900">{demand.contact_info}</span></p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}