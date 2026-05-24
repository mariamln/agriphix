import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ContentGrid from '@/components/layout/ContentGrid';
import { Package, Plus, X, DollarSign, MapPin, CheckCircle } from 'lucide-react';

export default function Resources() {
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    resource_type: 'seed',
    name: '',
    description: '',
    supplier: '',
    price: '',
    unit: '',
    availability: 'in_stock',
    location: '',
    certified: false,
    contact: ''
  });

  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => api.entities.Resource.list('-updated_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (/** @type {Record<string, unknown>} */ data) => api.entities.Resource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      setShowForm(false);
      setFormData({
        resource_type: 'seed',
        name: '',
        description: '',
        supplier: '',
        price: '',
        unit: '',
        availability: 'in_stock',
        location: '',
        certified: false,
        contact: ''
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      price: parseFloat(formData.price)
    });
  };

  const filteredResources = filterType === 'all' 
    ? resources 
    : resources.filter(r => r.resource_type === filterType);

  const typeColors = {
    seed: 'bg-green-100 text-green-700',
    fertilizer: 'bg-amber-100 text-amber-700',
    pesticide: 'bg-red-100 text-red-700',
    machinery: 'bg-blue-100 text-blue-700',
    equipment: 'bg-purple-100 text-purple-700',
    service: 'bg-indigo-100 text-indigo-700',
    technology: 'bg-pink-100 text-pink-700'
  };

  const availabilityColors = {
    in_stock: 'bg-green-100 text-green-700',
    limited: 'bg-yellow-100 text-yellow-700',
    pre_order: 'bg-blue-100 text-blue-700',
    out_of_stock: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Resources</h1>
          <p className="text-gray-600">Access certified inputs, machinery, and services</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'List Resource'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="shadow-lg border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b">
            <CardTitle className="text-lg">List New Resource</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
                  <Select value={formData.resource_type} onValueChange={(val) => setFormData({...formData, resource_type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="fertilizer">Fertilizer</SelectItem>
                      <SelectItem value="pesticide">Pesticide</SelectItem>
                      <SelectItem value="machinery">Machinery</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Resource name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="Supplier name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (UGX) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="kg, liters, hour, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <Select value={formData.availability} onValueChange={(val) => setFormData({...formData, availability: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="pre_order">Pre-Order</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <Input
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    placeholder="Phone or email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the resource..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="certified"
                  checked={formData.certified}
                  onChange={(e) => setFormData({...formData, certified: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="certified" className="text-sm font-medium text-gray-700">
                  Certified product/service
                </label>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                List Resource
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'seed', 'fertilizer', 'pesticide', 'machinery', 'equipment', 'service', 'technology'].map(type => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            onClick={() => setFilterType(type)}
            size="sm"
            className={filterType === type ? 'bg-emerald-600' : ''}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Resources Grid */}
      <ContentGrid>
        {isLoading ? (
          <p className="text-gray-500 col-span-3 text-center py-12">Loading resources...</p>
        ) : filteredResources.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center py-12">No resources found</p>
        ) : (
          filteredResources.map(resource => (
            <Card key={resource.id} className="shadow-md hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={typeColors[resource.resource_type]}>
                    {resource.resource_type}
                  </Badge>
                  {resource.certified && (
                    <div className="flex items-center text-xs text-blue-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Certified
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  {resource.name}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">by {resource.supplier}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {resource.description && (
                  <p className="text-sm text-gray-700">{resource.description}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center text-lg font-bold text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                    {resource.price}
                    {resource.unit && <span className="text-sm text-gray-500 ml-1">/ {resource.unit}</span>}
                  </div>
                  <Badge className={availabilityColors[resource.availability]}>
                    {resource.availability.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {resource.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {resource.location}
                  </div>
                )}
                {resource.contact && (
                  <p className="text-xs text-gray-500">Contact: {resource.contact}</p>
                )}
                <Button variant="outline" className="w-full mt-3 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300">
                  <Package className="w-4 h-4 mr-2" />
                  Order Now
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </ContentGrid>
    </div>
  );
}