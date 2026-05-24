import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useMyProfile } from '@/hooks/useMyProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Pencil, UserPlus, X, Plus, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import {
  ROLES,
  CERT_OPTIONS,
  ROLE_DESCRIPTIONS,
  roleColors,
  VERIFICATION_REQUESTED,
} from '@/constants/profile';
import { useTranslation } from '@/i18n/LanguageContext';

/** @typedef {{ onSaved?: () => void, autoStartIfEmpty?: boolean }} MyProfileFormProps */

/** @param {MyProfileFormProps} props */
export default function MyProfileForm({ onSaved, autoStartIfEmpty = false }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { profile: myProfile, refetch } = useMyProfile();
  const [step, setStep] = useState(null);
  const [saving, setSaving] = useState(false);
  const [certInput, setCertInput] = useState('');
  const [pendingRole, setPendingRole] = useState(null);
  const [form, setForm] = useState({
    user_roles: [], organization_name: '', phone: '',
    location: '', specialization: '', certification: [], land_size: ''
  });

  useEffect(() => {
    if (myProfile) {
      setForm({
        user_roles: myProfile.user_roles || (myProfile.user_role ? [myProfile.user_role] : []),
        organization_name: myProfile.organization_name || '',
        phone: myProfile.phone || '',
        location: myProfile.location || '',
        specialization: myProfile.specialization || '',
        certification: myProfile.certification || [],
        land_size: myProfile.land_size || ''
      });
    }
  }, [myProfile]);

  useEffect(() => {
    if (autoStartIfEmpty && !myProfile && step === null) {
      setStep(1);
    }
  }, [autoStartIfEmpty, myProfile, step]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addCert = (cert) => {
    const c = cert || certInput.trim();
    if (c && !form.certification.includes(c)) set('certification', [...form.certification, c]);
    setCertInput('');
  };

  const removeCert = (cert) => set('certification', form.certification.filter(c => c !== cert));

  const toggleRole = (role) => {
    if (form.user_roles.includes(role)) {
      // Deselect: just remove
      set('user_roles', form.user_roles.filter(r => r !== role));
    } else {
      // New role: save intent and send to registration (Step 1) first
      setPendingRole(role);
      setStep(1);
    }
  };

  const handleSave = async () => {
    if (form.user_roles.length === 0) return alert('Please select at least one role.');
    setSaving(true);
    const data = {
      ...form,
      user_role: form.user_roles[0],
      land_size: form.land_size ? parseFloat(form.land_size) : null
    };
    if (myProfile) {
      await api.entities.UserProfile.update(myProfile.id, data);
    } else {
      await api.entities.UserProfile.create(data);
    }
    await qc.invalidateQueries({ queryKey: ['myProfile'] });
    await qc.invalidateQueries({ queryKey: ['userProfiles'] });
    refetch();
    setSaving(false);
    setStep(null);
    if (onSaved) onSaved();
  };

  const hasVerificationRequest = myProfile?.certification?.includes(VERIFICATION_REQUESTED);

  const handleRequestVerification = async () => {
    if (!myProfile || myProfile.verified || hasVerificationRequest) return;
    setSaving(true);
    const certification = [...(myProfile.certification || []), VERIFICATION_REQUESTED];
    await api.entities.UserProfile.update(myProfile.id, { certification });
    await qc.invalidateQueries({ queryKey: ['myProfile'] });
    await qc.invalidateQueries({ queryKey: ['userProfiles'] });
    refetch();
    setSaving(false);
  };

  if (!user) return null;

  if (!myProfile && !autoStartIfEmpty && step === null) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        Your profile isn&apos;t set up yet.{' '}
        <button type="button" onClick={() => setStep(1)} className="font-semibold underline">
          Complete your profile
        </button>{' '}
        to appear in the network directory.
      </div>
    );
  }

  if (!myProfile && step === null) return null;

  // ── Profile summary ──────────────────────────────────────────────────────────
  if (myProfile && step === null) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900">{myProfile.organization_name || user.full_name}</p>
            {myProfile.verified && <CheckCircle className="w-4 h-4 text-blue-500" title={t('profile.verified')} />}
          </div>
          {myProfile.verified && (
            <p className="text-xs text-blue-600 font-medium">{t('profile.verified')}</p>
          )}
          {hasVerificationRequest && !myProfile.verified && (
            <p className="text-xs text-amber-600 font-medium">{t('profile.verificationPending')}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {(myProfile.user_roles?.length > 0 ? myProfile.user_roles : [myProfile.user_role]).filter(Boolean).map(role => (
              <Badge key={role} className={roleColors[role]}>{role.replace(/_/g, ' ')}</Badge>
            ))}
          </div>
          {myProfile.specialization && <p className="text-sm text-gray-600">🌾 {myProfile.specialization}</p>}
          {myProfile.location && <p className="text-sm text-gray-500">📍 {myProfile.location}</p>}
          {myProfile.certification?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {myProfile.certification.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {!myProfile.verified && !hasVerificationRequest && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestVerification}
              disabled={saving}
              className="text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              <Shield className="w-3.5 h-3.5 mr-1" />
              {t('profile.requestVerification')}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setStep(1)}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Details
          </Button>
          <Button size="sm" variant="outline" onClick={() => setStep(2)} className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
            Manage Roles
          </Button>
          {!myProfile.verified && (
            <p className="text-xs text-gray-500 max-w-[140px] text-right">{t('profile.verificationHint')}</p>
          )}
        </div>
      </div>
    );
  }

  // ── Step 1: Registration ─────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="bg-white border-2 border-emerald-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">Step 1 — Registration</h3>
          </div>
          {myProfile && <button onClick={() => setStep(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>}
        </div>
        <p className="text-sm text-gray-500 mb-5">
          {pendingRole
            ? <>To subscribe as <span className="font-semibold text-emerald-700 capitalize">{pendingRole.replace(/_/g, ' ')}</span>, please confirm your profile details first.</>
            : 'Fill in your profile details. You\'ll choose your value chain roles next.'}
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization / Farm Name</label>
              <Input value={form.organization_name} onChange={e => set('organization_name', e.target.value)} placeholder="e.g., Ssemakula Coffee Farm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+256 ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Region</label>
              <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="District, Region" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <Input value={form.specialization} onChange={e => set('specialization', e.target.value)} placeholder="e.g., Coffee, Maize, Dairy" />
            </div>
            {(form.user_roles.includes('farmer') || form.user_roles.includes('landowner')) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (hectares)</label>
                <Input type="number" step="0.1" value={form.land_size} onChange={e => set('land_size', e.target.value)} placeholder="0.0" />
              </div>
            )}
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Certifications <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CERT_OPTIONS.map(c => (
                <button key={c} type="button"
                  onClick={() => form.certification.includes(c) ? removeCert(c) : addCert(c)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                    form.certification.includes(c)
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : 'border-gray-200 text-gray-500 hover:border-emerald-300'
                  }`}>
                  {form.certification.includes(c) ? '✓ ' : ''}{c}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={certInput} onChange={e => setCertInput(e.target.value)} placeholder="Add custom certification..." className="flex-1" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())} />
              <Button type="button" size="sm" variant="outline" onClick={() => addCert()}><Plus className="w-4 h-4" /></Button>
            </div>
            {form.certification.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.certification.map(c => (
                  <Badge key={c} variant="outline" className="text-xs gap-1">
                    {c}
                    <button type="button" onClick={() => removeCert(c)} className="ml-0.5 hover:text-red-500">×</button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {myProfile && <Button type="button" variant="outline" onClick={() => setStep(null)} className="flex-1">Cancel</Button>}
            <Button onClick={() => {
              if (pendingRole && !form.user_roles.includes(pendingRole)) {
                set('user_roles', [...form.user_roles, pendingRole]);
              }
              setPendingRole(null);
              setStep(2);
            }} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Next: Choose Roles <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Subscription ─────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="bg-white border-2 border-emerald-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <h3 className="font-bold text-gray-900">Step 2 — Subscribe to Value Chain Roles</h3>
          </div>
          {myProfile && <button onClick={() => setStep(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>}
        </div>
        <p className="text-sm text-gray-500 mb-5">Select all roles that describe how you participate in the agricultural value chain.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {ROLES.map(role => {
            const selected = form.user_roles.includes(role);
            return (
              <button key={role} type="button" onClick={() => toggleRole(role)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-gray-200 hover:border-emerald-300 bg-white'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold capitalize ${selected ? 'text-emerald-700' : 'text-gray-800'}`}>
                    {role.replace(/_/g, ' ')}
                  </span>
                  {selected && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
                <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[role]}</p>
              </button>
            );
          })}
        </div>

        {form.user_roles.length === 0 && (
          <p className="text-xs text-amber-600 mb-3">Please select at least one role to continue.</p>
        )}

        {form.user_roles.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            <span className="text-xs text-gray-500 mr-1 self-center">Selected:</span>
            {form.user_roles.map(r => <Badge key={r} className={roleColors[r]}>{r.replace(/_/g, ' ')}</Badge>)}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleSave} disabled={saving || form.user_roles.length === 0} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            {saving ? 'Saving...' : myProfile ? '💾 Save Changes' : '✅ Complete Registration'}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}