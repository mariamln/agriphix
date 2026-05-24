import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sprout, Plus, X, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { ProductionTypeIcon, PawPrint, Milk } from '@/constants/valueChainIcons';
import { formatDisplayDate } from '@/utils/dates';
import ContentGrid from '@/components/layout/ContentGrid';
import { useTranslation } from '@/i18n/LanguageContext';

export default function Production() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    production_type: 'crop',
    crop_name: '',
    variety: '',
    planted_date: '',
    expected_harvest_date: '',
    land_area: '',
    location: '',
    status: 'planning',
    expected_yield: '',
    head_count: '',
    livestock_product: '',
    farming_method: 'conventional',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: crops = [], isLoading, isError, error } = useQuery({
    queryKey: ['crops'],
    queryFn: () => api.entities.Crop.list('-updated_date', 100),
    retry: 1,
  });

  const cropList = Array.isArray(crops) ? crops : [];

  const createMutation = useMutation({
    mutationFn: (/** @type {Record<string, unknown>} */ data) => api.entities.Crop.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      setShowForm(false);
      setFormData({
        production_type: 'crop',
        crop_name: '',
        variety: '',
        planted_date: '',
        expected_harvest_date: '',
        land_area: '',
        location: '',
        status: 'planning',
        expected_yield: '',
        head_count: '',
        livestock_product: '',
        farming_method: 'conventional',
        notes: ''
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (/** @type {{ id: string, data: Record<string, unknown> }} */ { id, data }) =>
      api.entities.Crop.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      land_area: parseFloat(formData.land_area),
      expected_yield: formData.expected_yield ? parseFloat(formData.expected_yield) : null,
      head_count: formData.head_count ? parseFloat(formData.head_count) : null,
    });
  };

  const handleStatusChange = (cropId, newStatus) => {
    updateMutation.mutate({
      id: cropId,
      data: { status: newStatus }
    });
  };

  const byType =
    filterType === 'all'
      ? cropList
      : cropList.filter((c) => (c.production_type || 'crop') === filterType);
  const filteredCrops =
    filterStatus === 'all'
      ? byType
      : byType.filter((c) => (c.status || 'planning') === filterStatus);

  const statusLabel = (status) => {
    const s = status || 'planning';
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
  };

  const statusColors = {
    planning: 'bg-gray-100 text-gray-700',
    planted: 'bg-blue-100 text-blue-700',
    growing: 'bg-green-100 text-green-700',
    harvesting: 'bg-amber-100 text-amber-700',
    harvested: 'bg-purple-100 text-purple-700',
    sold: 'bg-emerald-100 text-emerald-700'
  };

  return (
    <div className="space-y-6 min-h-[40vh]">
      {isError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load production records. Check your connection or sign in again, then refresh.
          {error?.message ? ` (${error.message})` : ''}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('production.title')}</h1>
          <p className="text-gray-600">{t('production.subtitle')}</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? t('common.cancel') : t('production.add')}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="shadow-lg border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b">
            <CardTitle className="text-lg">Add New {formData.production_type === 'livestock' ? 'Livestock' : 'Crop'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="flex gap-3">
                <Button type="button" size="sm"
                  onClick={() => setFormData({...formData, production_type: 'crop'})}
                  className={`gap-1.5 ${formData.production_type === 'crop' ? 'bg-emerald-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <ProductionTypeIcon type="crop" className="w-4 h-4" /> Crop
                </Button>
                <Button type="button" size="sm"
                  onClick={() => setFormData({...formData, production_type: 'livestock'})}
                  className={`gap-1.5 ${formData.production_type === 'livestock' ? 'bg-amber-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <ProductionTypeIcon type="livestock" className="w-4 h-4" /> Livestock
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.production_type === 'livestock' ? 'Animal Type *' : 'Crop Name *'}
                  </label>
                  <Input
                    value={formData.crop_name}
                    onChange={(e) => setFormData({...formData, crop_name: e.target.value})}
                    placeholder={formData.production_type === 'livestock' ? 'e.g., Cattle, Goats, Chickens' : 'e.g., Maize, Coffee'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.production_type === 'livestock' ? 'Breed' : 'Variety'}
                  </label>
                  <Input
                    value={formData.variety}
                    onChange={(e) => setFormData({...formData, variety: e.target.value})}
                    placeholder={formData.production_type === 'livestock' ? 'e.g., Ankole, Saanen Cross' : 'Specific variety'}
                  />
                </div>
                {formData.production_type === 'livestock' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Head Count</label>
                      <Input type="number" value={formData.head_count} onChange={(e) => setFormData({...formData, head_count: e.target.value})} placeholder="Number of animals" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Product</label>
                      <Input value={formData.livestock_product} onChange={(e) => setFormData({...formData, livestock_product: e.target.value})} placeholder="e.g., milk, meat, eggs" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{formData.production_type === 'livestock' ? 'Acquisition Date *' : 'Planted Date *'}</label>
                  <Input type="date" value={formData.planted_date} onChange={(e) => setFormData({...formData, planted_date: e.target.value})} required />
                </div>
                {formData.production_type === 'crop' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest</label>
                    <Input type="date" value={formData.expected_harvest_date} onChange={(e) => setFormData({...formData, expected_harvest_date: e.target.value})} />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land / Grazing Area (ha) *</label>
                  <Input type="number" step="0.01" value={formData.land_area} onChange={(e) => setFormData({...formData, land_area: e.target.value})} placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Farm / district location" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{formData.production_type === 'livestock' ? 'Expected Output (kg)' : 'Expected Yield (kg)'}</label>
                  <Input type="number" value={formData.expected_yield} onChange={(e) => setFormData({...formData, expected_yield: e.target.value})} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farming Method</label>
                  <Select value={formData.farming_method} onValueChange={(val) => setFormData({...formData, farming_method: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="precision">Precision Agriculture</SelectItem>
                      <SelectItem value="hydroponic">Hydroponic</SelectItem>
                      <SelectItem value="greenhouse">Greenhouse</SelectItem>
                      <SelectItem value="free_range">Free Range</SelectItem>
                      <SelectItem value="zero_grazing">Zero Grazing</SelectItem>
                      <SelectItem value="semi_intensive">Semi-Intensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional notes..." rows={3} />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Add {formData.production_type === 'livestock' ? 'Livestock' : 'Crop'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Type Filter */}
      <div className="flex gap-2 mb-1">
        {[{id:'all',label:'All',type:null},{id:'crop',label:'Crops',type:'crop'},{id:'livestock',label:'Livestock',type:'livestock'}].map((tab) => (
          <Button key={tab.id} size="sm" variant={filterType === tab.id ? 'default' : 'outline'}
            onClick={() => setFilterType(tab.id)}
            className={`gap-1.5 ${filterType === tab.id ? 'bg-emerald-600' : ''}`}>
            {tab.type && <ProductionTypeIcon type={tab.type} className="w-4 h-4" />}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'planning', 'planted', 'growing', 'harvesting', 'harvested', 'sold'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            size="sm"
            className={filterStatus === status ? 'bg-emerald-600' : ''}
          >
            {status === 'all' ? 'All' : statusLabel(status)}
          </Button>
        ))}
      </div>

      {/* Crops Grid */}
      <ContentGrid cols="threeCol">
        {isLoading ? (
          <p className="text-gray-500 col-span-2 text-center py-12">Loading...</p>
        ) : filteredCrops.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-12">No records found</p>
        ) : (
          filteredCrops.map(crop => (
            <Card key={crop.id} className={`shadow-md hover:shadow-xl transition-all border-l-4 ${crop.production_type === 'livestock' ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ProductionTypeIcon type={crop.production_type} className="w-5 h-5 text-primary" />
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {crop.crop_name} {crop.variety && `- ${crop.variety}`}
                      </CardTitle>
                    </div>
                    <Badge className={statusColors[crop.status] || statusColors.planning}>
                      {statusLabel(crop.status)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{crop.land_area}</p>
                    <p className="text-xs text-gray-500">hectares</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Planted: {formatDisplayDate(crop.planted_date, 'MMM d, yyyy', 'Not set')}
                </div>
                {crop.expected_harvest_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                    Expected harvest: {formatDisplayDate(crop.expected_harvest_date)}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {crop.location}
                </div>
                {crop.head_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PawPrint className="w-4 h-4 text-gray-400" />
                    Head count: <span className="font-semibold">{crop.head_count} animals</span>
                  </div>
                )}
                {crop.livestock_product && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Milk className="w-4 h-4 text-gray-400" />
                    Product: <span className="font-semibold">{crop.livestock_product}</span>
                  </div>
                )}
                {crop.expected_yield > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Expected output: <span className="font-semibold text-gray-900">{crop.expected_yield} kg</span>
                    </p>
                  </div>
                )}
                {crop.farming_method && (
                  <Badge variant="outline" className="text-xs">
                    {crop.farming_method}
                  </Badge>
                )}
                <div className="pt-3 flex flex-wrap gap-2">
                  <Select value={crop.status || 'planning'} onValueChange={(val) => handleStatusChange(crop.id, val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="planted">Planted</SelectItem>
                      <SelectItem value="growing">Growing</SelectItem>
                      <SelectItem value="harvesting">Harvesting</SelectItem>
                      <SelectItem value="harvested">Harvested</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </ContentGrid>
    </div>
  );
}