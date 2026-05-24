import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Plus, ChevronDown, ChevronUp, RefreshCw, Sprout } from 'lucide-react';
import HalalScoreBadge from '../components/halal/HalalScoreBadge';
import CriteriaBreakdown from '../components/halal/CriteriaBreakdown';

const EMPTY_FORM = {
  crop_name: '',
  farmer_name: '',
  farm_location: '',
  farming_method: 'organic',
  chemicals_used: '',
  water_source: '',
  soil_treatment: '',
  additional_notes: '',
};

const SHARI_AH_CRITERIA_PROMPT = `You are a Shari'ah-compliant agriculture auditor. Analyze the following crop information and produce a detailed Halal Compliance Report.

SHARI'AH COMPLIANCE CRITERIA:
1. Chemical Safety (25 pts): No prohibited chemicals — avoid synthetic pesticides with haram animal derivatives, alcohol-based compounds, or chemicals banned under Islamic law. Organic and natural inputs score highest.
2. Water Source (15 pts): Water must be clean (tahir) and not contaminated. Treated wastewater from haram sources scores low.
3. Soil Treatment (15 pts): No soil amendments containing haram animal by-products (e.g., blood meal from non-halal slaughter, pork-based fertilizers).
4. Farming Method (20 pts): Organic > Precision > Conventional. Hydroponic and greenhouse acceptable. Methods must avoid cruelty and waste (fasad fil ard).
5. Animal By-products (15 pts): Any animal-derived inputs must be from halal-slaughtered animals or plant-based.
6. Documentation (10 pts): Certification documents, transparency, and traceability increase score.

CROP SUBMISSION DATA:
Crop Name: {crop_name}
Farmer: {farmer_name}
Location: {farm_location}
Farming Method: {farming_method}
Chemicals/Inputs Used: {chemicals_used}
Water Source: {water_source}
Soil Treatment: {soil_treatment}
Additional Notes: {additional_notes}
Has Certification Document: {has_cert}
Has Crop Photo: {has_photo}

Respond ONLY with a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "halal_score": <number 0-100>,
  "compliance_status": "<compliant|non_compliant|needs_review>",
  "summary": "<2-3 sentence overall summary>",
  "violations": ["<violation 1>", "<violation 2>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "criteria_scores": {
    "chemical_safety": <0-100>,
    "water_source": <0-100>,
    "soil_treatment": <0-100>,
    "farming_method": <0-100>,
    "animal_byproducts": <0-100>,
    "documentation": <0-100>
  }
}`;

export default function HalalCertification() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [cropPhotoFile, setCropPhotoFile] = useState(null);
  const [certDocFile, setCertDocFile] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['halalCertifications'],
    queryFn: () => api.entities.HalalCertification.list('-created_date', 50),
  });

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) setter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let cropPhotoUrl = null;
      let certDocUrl = null;

      if (cropPhotoFile) {
        const res = await api.integrations.Core.UploadFile({ file: cropPhotoFile });
        cropPhotoUrl = res.file_url;
      }
      if (certDocFile) {
        const res = await api.integrations.Core.UploadFile({ file: certDocFile });
        certDocUrl = res.file_url;
      }

      // Build AI prompt
      const prompt = SHARI_AH_CRITERIA_PROMPT
        .replace('{crop_name}', form.crop_name)
        .replace('{farmer_name}', form.farmer_name || 'Not provided')
        .replace('{farm_location}', form.farm_location || 'Not provided')
        .replace('{farming_method}', form.farming_method)
        .replace('{chemicals_used}', form.chemicals_used || 'None specified')
        .replace('{water_source}', form.water_source || 'Not specified')
        .replace('{soil_treatment}', form.soil_treatment || 'Not specified')
        .replace('{additional_notes}', form.additional_notes || 'None')
        .replace('{has_cert}', certDocUrl ? 'Yes' : 'No')
        .replace('{has_photo}', cropPhotoUrl ? 'Yes' : 'No');

      const aiResponse = await api.integrations.Core.InvokeLLM({
        prompt,
        file_urls: cropPhotoUrl ? [cropPhotoUrl] : undefined,
        response_json_schema: {
          type: 'object',
          properties: {
            halal_score: { type: 'number' },
            compliance_status: { type: 'string' },
            summary: { type: 'string' },
            violations: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            criteria_scores: { type: 'object' },
          },
        },
      });

      await api.entities.HalalCertification.create({
        ...form,
        crop_photo_url: cropPhotoUrl,
        certification_doc_url: certDocUrl,
        halal_score: aiResponse.halal_score,
        compliance_status: aiResponse.compliance_status,
        ai_analysis: aiResponse.summary,
        violations: aiResponse.violations || [],
        recommendations: aiResponse.recommendations || [],
        criteria_scores: aiResponse.criteria_scores || {},
        assessed_at: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ['halalCertifications'] });
      setForm(EMPTY_FORM);
      setCropPhotoFile(null);
      setCertDocFile(null);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const avgScore = certifications.length
    ? Math.round(certifications.filter(c => c.halal_score).reduce((s, c) => s + c.halal_score, 0) / certifications.filter(c => c.halal_score).length)
    : null;

  const compliantCount = certifications.filter(c => c.compliance_status === 'compliant').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-amber-300 text-base font-arabic mb-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <h1 className="text-2xl font-bold flex items-center gap-2">☪️ Halal Certification</h1>
            <p className="text-emerald-200 text-sm mt-1">
              AI-powered Shari'ah compliance analysis for your crops
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-400 hover:bg-amber-500 text-emerald-900 font-semibold shadow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit Crop for Certification
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{certifications.length}</p>
            <p className="text-emerald-200 text-xs mt-0.5">Total Submissions</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-300">{avgScore ?? '—'}</p>
            <p className="text-emerald-200 text-xs mt-0.5">Avg Halal Score</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-300">{compliantCount}</p>
            <p className="text-emerald-200 text-xs mt-0.5">Halal Certified</p>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      {showForm && (
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Sprout className="w-5 h-5" /> New Halal Certification Request
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name *</label>
                  <input
                    required
                    value={form.crop_name}
                    onChange={e => setForm({ ...form, crop_name: e.target.value })}
                    placeholder="e.g., Maize, Tomatoes, Rice"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name</label>
                  <input
                    value={form.farmer_name}
                    onChange={e => setForm({ ...form, farmer_name: e.target.value })}
                    placeholder="Full name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location</label>
                  <input
                    value={form.farm_location}
                    onChange={e => setForm({ ...form, farm_location: e.target.value })}
                    placeholder="District, Region"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farming Method *</label>
                  <select
                    value={form.farming_method}
                    onChange={e => setForm({ ...form, farming_method: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                  >
                    <option value="organic">Organic</option>
                    <option value="conventional">Conventional</option>
                    <option value="precision">Precision Farming</option>
                    <option value="hydroponic">Hydroponic</option>
                    <option value="greenhouse">Greenhouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Water Source</label>
                  <input
                    value={form.water_source}
                    onChange={e => setForm({ ...form, water_source: e.target.value })}
                    placeholder="e.g., Rainwater, River, Borehole"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soil Treatment</label>
                  <input
                    value={form.soil_treatment}
                    onChange={e => setForm({ ...form, soil_treatment: e.target.value })}
                    placeholder="e.g., Compost, NPK, Blood meal"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chemicals / Pesticides / Fertilizers Used</label>
                <textarea
                  value={form.chemicals_used}
                  onChange={e => setForm({ ...form, chemicals_used: e.target.value })}
                  placeholder="List all chemicals, pesticides, herbicides, fertilizers used. Type 'None' if organic."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={form.additional_notes}
                  onChange={e => setForm({ ...form, additional_notes: e.target.value })}
                  placeholder="Any other relevant information about your farming practices..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none"
                  rows={2}
                />
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📸 Crop Photo (optional)</label>
                  <label className="flex items-center gap-2 border-2 border-dashed border-emerald-200 rounded-lg px-4 py-3 cursor-pointer hover:border-emerald-400 transition-colors">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-500">
                      {cropPhotoFile ? cropPhotoFile.name : 'Upload photo (JPG, PNG)'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, setCropPhotoFile)} />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📄 Certification Document (optional)</label>
                  <label className="flex items-center gap-2 border-2 border-dashed border-emerald-200 rounded-lg px-4 py-3 cursor-pointer hover:border-emerald-400 transition-colors">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-500">
                      {certDocFile ? certDocFile.name : 'Upload PDF, JPG, PNG'}
                    </span>
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => handleFileChange(e, setCertDocFile)} />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analysing with AI...</>
                  ) : (
                    '☪️ Submit for Halal Analysis'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Certifications List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : certifications.length === 0 ? (
        <Card className="border-dashed border-2 border-emerald-200">
          <CardContent className="py-16 text-center">
            <p className="text-4xl mb-3">☪️</p>
            <p className="text-gray-500 font-medium">No certifications yet</p>
            <p className="text-gray-400 text-sm mt-1">Submit your first crop for Halal compliance analysis</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => (
            <Card key={cert.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-center gap-3">
                    {cert.crop_photo_url && (
                      <img src={cert.crop_photo_url} alt={cert.crop_name} className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{cert.crop_name}</h3>
                      <p className="text-sm text-gray-500">{cert.farmer_name} · {cert.farm_location}</p>
                      <p className="text-xs text-gray-400 capitalize">{cert.farming_method} farming</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HalalScoreBadge score={cert.halal_score} status={cert.compliance_status} size="lg" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === cert.id ? null : cert.id)}
                    >
                      {expandedId === cert.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {expandedId === cert.id && (
                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-5">
                    {cert.ai_analysis && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">AI Analysis</p>
                        <p className="text-sm text-gray-700">{cert.ai_analysis}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Criteria Breakdown */}
                      <div className="md:col-span-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Criteria Scores</p>
                        <CriteriaBreakdown scores={cert.criteria_scores} />
                      </div>

                      {/* Violations */}
                      <div>
                        <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">⚠️ Violations</p>
                        {cert.violations?.length > 0 ? (
                          <ul className="space-y-1">
                            {cert.violations.map((v, i) => (
                              <li key={i} className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-1.5 border border-red-100">
                                {v}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No violations found — Alhamdulillah!</p>
                        )}
                      </div>

                      {/* Recommendations */}
                      <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">✅ Recommendations</p>
                        {cert.recommendations?.length > 0 ? (
                          <ul className="space-y-1">
                            {cert.recommendations.map((r, i) => (
                              <li key={i} className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5 border border-emerald-100">
                                {r}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No recommendations</p>
                        )}
                      </div>
                    </div>

                    {cert.certification_doc_url && (
                      <a
                        href={cert.certification_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-700 underline hover:text-emerald-900"
                      >
                        📄 View Certification Document
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}