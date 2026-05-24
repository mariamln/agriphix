import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Plus, X, Droplets, Zap, TreePine, Award } from 'lucide-react';
import { formatDisplayDate } from '@/utils/dates';

/** @typedef {Object} SustainabilityFormState
 * @property {string} crop_name
 * @property {string} location
 * @property {string} carbon_footprint_kg
 * @property {string} water_usage_liters
 * @property {string} pesticide_usage_kg
 * @property {string} fertilizer_usage_kg
 * @property {boolean} organic_certified
 * @property {boolean} renewable_energy_used
 * @property {string} soil_health_score
 * @property {string} biodiversity_score
 * @property {string} measurement_date
 * @property {string} notes
 */

const EMPTY_FORM = {
  crop_name: '',
  location: '',
  carbon_footprint_kg: '',
  water_usage_liters: '',
  pesticide_usage_kg: '',
  fertilizer_usage_kg: '',
  organic_certified: false,
  renewable_energy_used: false,
  soil_health_score: '',
  biodiversity_score: '',
  measurement_date: new Date().toISOString().split('T')[0],
  notes: '',
};

export default function Sustainability() {
  const [showForm, setShowForm] = useState(false);
  const [filterGrade, setFilterGrade] = useState('all');
  const [formData, setFormData] = useState(
    /** @type {SustainabilityFormState} */ ({ ...EMPTY_FORM })
  );

  const queryClient = useQueryClient();

  const { data: metricsData = [], isLoading } = useQuery({
    queryKey: ['sustainabilityMetrics'],
    queryFn: () => api.entities.SustainabilityMetric.list('-measurement_date', 100),
  });

  const metrics = Array.isArray(metricsData) ? metricsData : [];

  const createMutation = useMutation({
    mutationFn: (/** @type {Record<string, unknown>} */ data) =>
      api.entities.SustainabilityMetric.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sustainabilityMetrics'] });
      setShowForm(false);
      setFormData({ ...EMPTY_FORM, measurement_date: new Date().toISOString().split('T')[0] });
    },
  });

  const calculateGrade = (data) => {
    let score = 50;
    if (data.organic_certified) score += 20;
    if (data.renewable_energy_used) score += 15;
    if (Number(data.soil_health_score) > 70) score += 10;
    if (Number(data.biodiversity_score) > 70) score += 10;
    if (Number(data.carbon_footprint_kg) < 100) score += 10;
    if (Number(data.water_usage_liters) < 5000) score += 5;
    if (Number(data.pesticide_usage_kg) === 0) score += 10;

    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 45) return 'D';
    return 'F';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericData = {
      ...formData,
      carbon_footprint_kg: formData.carbon_footprint_kg ? parseFloat(formData.carbon_footprint_kg) : null,
      water_usage_liters: formData.water_usage_liters ? parseFloat(formData.water_usage_liters) : null,
      pesticide_usage_kg: formData.pesticide_usage_kg ? parseFloat(formData.pesticide_usage_kg) : null,
      fertilizer_usage_kg: formData.fertilizer_usage_kg ? parseFloat(formData.fertilizer_usage_kg) : null,
      soil_health_score: formData.soil_health_score ? parseFloat(formData.soil_health_score) : null,
      biodiversity_score: formData.biodiversity_score ? parseFloat(formData.biodiversity_score) : null,
    };
    const processedData = {
      ...numericData,
      sustainability_grade: calculateGrade(numericData),
    };
    createMutation.mutate(processedData);
  };

  const filteredMetrics = filterGrade === 'all' 
    ? metrics 
    : metrics.filter(m => m.sustainability_grade === filterGrade);

  const gradeColors = {
    'A': 'bg-green-500 text-white',
    'B': 'bg-green-300 text-green-900',
    'C': 'bg-yellow-400 text-yellow-900',
    'D': 'bg-orange-400 text-orange-900',
    'F': 'bg-red-500 text-white'
  };

  // Calculate summary stats
  const avgCarbon = metrics.length > 0 
    ? (metrics.reduce((sum, m) => sum + (m.carbon_footprint_kg || 0), 0) / metrics.length).toFixed(1)
    : 0;
  const avgWater = metrics.length > 0 
    ? (metrics.reduce((sum, m) => sum + (m.water_usage_liters || 0), 0) / metrics.length).toFixed(0)
    : 0;
  const organicCount = metrics.filter(m => m.organic_certified).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sustainability Tracking</h1>
          <p className="text-gray-600">Monitor environmental impact and sustainability metrics</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700"
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'Add Metrics'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700">Avg Carbon Footprint</p>
              <p className="text-2xl font-bold text-green-800">{avgCarbon} kg</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Avg Water Usage</p>
              <p className="text-2xl font-bold text-blue-800">{avgWater} L</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-yellow-700">Organic Certified</p>
              <p className="text-2xl font-bold text-yellow-800">{organicCount} farms</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-700">Total Records</p>
              <p className="text-2xl font-bold text-purple-800">{metrics.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="shadow-lg border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
            <CardTitle className="text-lg">Record Sustainability Metrics</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name *</label>
                  <Input
                    value={formData.crop_name}
                    onChange={(e) => setFormData({...formData, crop_name: e.target.value})}
                    placeholder="e.g., Maize, Coffee"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Farm location"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Date *</label>
                  <Input
                    type="date"
                    value={formData.measurement_date}
                    onChange={(e) => setFormData({...formData, measurement_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbon Footprint (kg CO2)</label>
                  <Input
                    type="number"
                    value={formData.carbon_footprint_kg}
                    onChange={(e) => setFormData({...formData, carbon_footprint_kg: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Water Usage (liters)</label>
                  <Input
                    type="number"
                    value={formData.water_usage_liters}
                    onChange={(e) => setFormData({...formData, water_usage_liters: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pesticide Usage (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.pesticide_usage_kg}
                    onChange={(e) => setFormData({...formData, pesticide_usage_kg: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Usage (kg)</label>
                  <Input
                    type="number"
                    value={formData.fertilizer_usage_kg}
                    onChange={(e) => setFormData({...formData, fertilizer_usage_kg: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soil Health Score (1-100)</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.soil_health_score}
                    onChange={(e) => setFormData({...formData, soil_health_score: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biodiversity Score (1-100)</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.biodiversity_score}
                    onChange={(e) => setFormData({...formData, biodiversity_score: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.organic_certified}
                    onChange={(e) => setFormData({...formData, organic_certified: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Organic Certified</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.renewable_energy_used}
                    onChange={(e) => setFormData({...formData, renewable_energy_used: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Uses Renewable Energy</span>
                </label>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Save Metrics
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterGrade === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterGrade('all')}
          size="sm"
          className={filterGrade === 'all' ? 'bg-green-600' : ''}
        >
          All Grades
        </Button>
        {['A', 'B', 'C', 'D', 'F'].map(grade => (
          <Button
            key={grade}
            variant={filterGrade === grade ? 'default' : 'outline'}
            onClick={() => setFilterGrade(grade)}
            size="sm"
            className={filterGrade === grade ? 'bg-green-600' : ''}
          >
            Grade {grade}
          </Button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <p className="text-gray-500 col-span-3 text-center py-12">Loading metrics...</p>
        ) : filteredMetrics.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center py-12">No sustainability metrics found</p>
        ) : (
          filteredMetrics.map(metric => (
            <Card key={metric.id} className="shadow-md hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">{metric.crop_name}</CardTitle>
                    <p className="text-sm text-gray-500">{metric.location}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${gradeColors[metric.sustainability_grade] || 'bg-gray-200'}`}>
                    {metric.sustainability_grade || '?'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {metric.carbon_footprint_kg && (
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-500" />
                      <span>{metric.carbon_footprint_kg} kg CO2</span>
                    </div>
                  )}
                  {metric.water_usage_liters && (
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>{metric.water_usage_liters} L</span>
                    </div>
                  )}
                  {metric.soil_health_score && (
                    <div className="flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-amber-600" />
                      <span>Soil: {metric.soil_health_score}/100</span>
                    </div>
                  )}
                  {metric.biodiversity_score && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span>Bio: {metric.biodiversity_score}/100</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {metric.organic_certified && (
                    <Badge className="bg-green-100 text-green-700">Organic</Badge>
                  )}
                  {metric.renewable_energy_used && (
                    <Badge className="bg-yellow-100 text-yellow-700">Renewable Energy</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Measured: {formatDisplayDate(metric.measurement_date, 'MMM d, yyyy', 'Date unknown')}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}