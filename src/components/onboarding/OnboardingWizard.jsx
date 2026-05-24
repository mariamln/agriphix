import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ROLES,
  CERT_OPTIONS,
  ROLE_DESCRIPTIONS,
  roleColors,
  getSuggestedActions,
} from '@/constants/profile';
import { getIntendedRole, clearIntendedRole } from '@/utils/intendedRole';
import {
  Sprout,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Shield,
  Package,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

const ACTION_ICONS = {
  Sprout,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Shield,
  Package,
};

const EMPTY_FORM = {
  user_roles: [],
  organization_name: '',
  phone: '',
  location: '',
  specialization: '',
  certification: [],
  land_size: '',
};

export default function OnboardingWizard({ open, onComplete, onSkip }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [certInput, setCertInput] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    const intended = getIntendedRole();
    if (intended && ROLES.includes(intended)) {
      setForm((prev) => ({ ...prev, user_roles: [intended] }));
      setStep(2);
    }
  }, [open]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleRole = (role) => {
    set(
      'user_roles',
      form.user_roles.includes(role)
        ? form.user_roles.filter((r) => r !== role)
        : [...form.user_roles, role]
    );
  };

  const addCert = (cert) => {
    const value = cert || certInput.trim();
    if (value && !form.certification.includes(value)) {
      set('certification', [...form.certification, value]);
    }
    setCertInput('');
  };

  const removeCert = (cert) => {
    set('certification', form.certification.filter((c) => c !== cert));
  };

  const handleSave = async () => {
    if (form.user_roles.length === 0) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        user_role: form.user_roles[0],
        land_size: form.land_size ? parseFloat(form.land_size) : null,
      };
      await api.entities.UserProfile.create(data);
      await qc.invalidateQueries({ queryKey: ['myProfile'] });
      await qc.invalidateQueries({ queryKey: ['userProfiles'] });
      clearIntendedRole();
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    onComplete?.();
  };

  const suggestedActions = getSuggestedActions(form.user_roles);
  const showLandSize = form.user_roles.some((r) => ['farmer', 'landowner'].includes(r));
  const totalSteps = 4;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto z-[100]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 0 && 'Welcome to Agriphix'}
            {step === 1 && 'Choose your role'}
            {step === 2 && 'Set up your profile'}
            {step === 3 && "You're all set!"}
          </DialogTitle>
          <DialogDescription>
            {step === 0 && 'Let\'s get your halal agriculture profile ready in a few quick steps.'}
            {step === 1 && 'Select all roles that describe how you participate in the value chain.'}
            {step === 2 && 'Tell us about your farm or organisation so we can personalise your experience.'}
            {step === 3 && 'Your profile is saved. Here are some suggested first steps.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5 py-2">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-700">
                Assalamu Alaikum{user?.full_name ? `, ${user.full_name}` : ''}! Agriphix connects you to
                markets, riba-free financing, and halal certification across Uganda.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Personalised market matches</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Shari&apos;ah-compliant financing tools</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Halal certification & traceability</li>
            </ul>
            <Button onClick={() => setStep(1)} className="w-full bg-emerald-600 hover:bg-emerald-700 py-5">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {onSkip && (
              <Button type="button" variant="ghost" onClick={onSkip} className="w-full text-gray-500">
                Skip for now
              </Button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {ROLES.map((role) => {
                const selected = form.user_roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      selected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold capitalize ${selected ? 'text-emerald-700' : 'text-gray-800'}`}>
                        {role.replace(/_/g, ' ')}
                      </span>
                      {selected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[role]}</p>
                  </button>
                );
              })}
            </div>
            {form.user_roles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {form.user_roles.map((r) => (
                  <Badge key={r} className={roleColors[r]}>{r.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={form.user_roles.length === 0}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization / Farm Name</label>
                <Input value={form.organization_name} onChange={(e) => set('organization_name', e.target.value)} placeholder="e.g., Ssemakula Coffee Farm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+256 ..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / District</label>
                <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g., Mbale, Eastern" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <Input value={form.specialization} onChange={(e) => set('specialization', e.target.value)} placeholder="e.g., Coffee, Maize" />
              </div>
              {showLandSize && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (hectares)</label>
                  <Input type="number" step="0.1" value={form.land_size} onChange={(e) => set('land_size', e.target.value)} placeholder="0.0" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications (optional)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {CERT_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => (form.certification.includes(c) ? removeCert(c) : addCert(c))}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                      form.certification.includes(c)
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'border-gray-200 text-gray-500 hover:border-emerald-300'
                    }`}
                  >
                    {form.certification.includes(c) ? '✓ ' : ''}{c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {saving ? 'Saving...' : 'Save & Continue'}
              </Button>
            </div>
            {onSkip && (
              <Button type="button" variant="ghost" onClick={onSkip} className="w-full text-gray-500">
                Skip for now
              </Button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="text-center py-4">
              <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Your profile is ready. Start exploring Agriphix:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedActions.map((action) => {
                const Icon = ACTION_ICONS[action.icon] || Sprout;
                return (
                  <Link key={action.page} to={createPageUrl(action.page)} onClick={handleFinish}>
                    <div className="p-4 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{action.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Button onClick={handleFinish} className="w-full bg-emerald-600 hover:bg-emerald-700 py-5">
              Go to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
