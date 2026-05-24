import React, { useState } from 'react';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { VALUE_CHAIN_SEGMENTS } from './ValueChainSelector';

const EMPTY = {
  crop_type: '',
  amount_requested: '',
  purpose: '',
  land_area: '',
  expected_yield: '',
  expected_revenue: '',
  repayment_period: '',
  collateral: '',
  farm_location: '',
  notes: '',
  islamic_instrument: '',
  value_chain_segment: '',
  status: 'pending',
};

/**
 * @typedef {Object} FinanceApplicationPayload
 * @property {string} [value_chain_segment]
 * @property {string} [crop_type]
 * @property {number} [amount_requested]
 * @property {string} [purpose]
 * @property {number} [land_area]
 * @property {number|null} [expected_yield]
 * @property {number|null} [expected_revenue]
 * @property {number|null} [repayment_period]
 * @property {string} [collateral]
 * @property {string} [farm_location]
 * @property {string} [notes]
 * @property {string} [islamic_instrument]
 * @property {string} [status]
 * @property {string} [application_date]
 */

/**
 * @param {{ preselectedSegment?: string, onSuccess?: () => void }} props
 */
export default function ApplicationForm({ preselectedSegment, onSuccess }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ ...EMPTY, value_chain_segment: preselectedSegment || '' });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const seg = VALUE_CHAIN_SEGMENTS.find(s => s.id === form.value_chain_segment);

  const createMutation = useMutation({
    mutationFn: (/** @type {FinanceApplicationPayload} */ data) =>
      api.entities.FinanceRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeRequests'] });
      onSuccess?.();
      setForm(EMPTY);
      setAiSuggestion(null);
    },
  });

  const getAISuggestion = async () => {
    if (!form.purpose || !form.amount_requested || !form.value_chain_segment) return;
    setLoadingAI(true);
    try {
      const resp = await api.integrations.Core.InvokeLLM({
        prompt: `You are an Islamic agricultural finance expert. A farmer needs financing for:
- Value Chain Segment: ${seg?.label || form.value_chain_segment}
- Purpose: ${form.purpose}
- Amount: UGX ${form.amount_requested}
- Crop: ${form.crop_type || 'Not specified'}
- Location: ${form.farm_location || 'Uganda'}
- Collateral: ${form.collateral || 'None mentioned'}

Recommend the most suitable Islamic finance instrument and structure. Respond as JSON only.`,
        response_json_schema: {
          type: 'object',
          properties: {
            instrument: { type: 'string' },
            structure: { type: 'string' },
            profit_rate_range: { type: 'string' },
            steps: { type: 'array', items: { type: 'string' } },
            shari_ah_notes: { type: 'string' },
          },
        },
      });
      setAiSuggestion(resp);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    createMutation.mutate({
      ...form,
      amount_requested: parseFloat(form.amount_requested),
      land_area: parseFloat(form.land_area) || 0,
      expected_yield: form.expected_yield ? parseFloat(form.expected_yield) : null,
      expected_revenue: form.expected_revenue ? parseFloat(form.expected_revenue) : null,
      repayment_period: form.repayment_period ? parseInt(form.repayment_period) : null,
      application_date: today,
    });
  };

  const F = (key, props) => (
    <input
      value={form[key]}
      onChange={e => setForm({ ...form, [key]: e.target.value })}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
      {...props}
    />
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value Chain Segment *</label>
          <select
            required
            value={form.value_chain_segment}
            onChange={e => setForm({ ...form, value_chain_segment: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
          >
            <option value="">Select segment...</option>
            {VALUE_CHAIN_SEGMENTS.map(s => (
              <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Islamic Instrument</label>
          <select
            value={form.islamic_instrument}
            onChange={e => setForm({ ...form, islamic_instrument: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
          >
            <option value="">Select or use AI suggestion...</option>
            {(seg?.instruments || ['Murabaha', 'Ijara', 'Musharaka', 'Mudaraba', 'Salam', 'Istisna', 'Takaful', 'Sukuk', 'Qard Hasan']).map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop / Activity *</label>
          {F('crop_type', { placeholder: 'e.g., Maize, Cold Storage, Tractor', required: true })}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount Requested (UGX) *</label>
          {F('amount_requested', { type: 'number', step: '0.01', placeholder: '0.00', required: true })}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Location</label>
          {F('farm_location', { placeholder: 'District, Region' })}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Land Area (hectares)</label>
          {F('land_area', { type: 'number', step: '0.01', placeholder: '0.00' })}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Revenue (UGX)</label>
          {F('expected_revenue', { type: 'number', step: '0.01', placeholder: '0.00' })}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Repayment Period (months)</label>
          {F('repayment_period', { type: 'number', placeholder: '12' })}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Collateral Offered</label>
          {F('collateral', { placeholder: 'Land title, assets, guarantor...' })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / How Funds Will Be Used *</label>
        <textarea
          required
          value={form.purpose}
          onChange={e => setForm({ ...form, purpose: e.target.value })}
          placeholder="Describe exactly how the financing will be used..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="Any other relevant information..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none"
          rows={2}
        />
      </div>

      {/* AI Suggestion Panel */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={getAISuggestion}
          disabled={loadingAI || !form.purpose || !form.amount_requested}
          className="border-amber-300 text-amber-700 hover:bg-amber-50 w-full"
        >
          {loadingAI ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          ✨ Get AI Islamic Finance Structure Recommendation
        </Button>

        {aiSuggestion && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <p className="font-bold text-amber-800">AI Recommendation: {aiSuggestion.instrument}</p>
            </div>
            <p className="text-sm text-gray-700">{aiSuggestion.structure}</p>
            {aiSuggestion.profit_rate_range && (
              <p className="text-xs text-amber-700 font-medium">📊 Estimated profit rate: {aiSuggestion.profit_rate_range}</p>
            )}
            {aiSuggestion.steps?.length > 0 && (
              <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                {aiSuggestion.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            )}
            {aiSuggestion.shari_ah_notes && (
              <div className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                ⚖️ <strong>Shari'ah:</strong> {aiSuggestion.shari_ah_notes}
              </div>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-amber-400 text-amber-700"
              onClick={() => setForm(f => ({ ...f, islamic_instrument: aiSuggestion.instrument }))}
            >
              Apply this instrument to my application
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-emerald-700 hover:bg-emerald-800 flex-1"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : '☪️ '}
          Submit Islamic Finance Application
        </Button>
      </div>
    </form>
  );
}