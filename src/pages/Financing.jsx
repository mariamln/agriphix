import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Globe, ClipboardList, FolderOpen, BookOpen, Scale, Moon } from 'lucide-react';
import { ValueChainSegmentIcon } from '@/constants/valueChainIcons';
import { format } from 'date-fns';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';
import ValueChainSelector, { VALUE_CHAIN_SEGMENTS } from '../components/financing/ValueChainSelector';
import InstrumentGuide from '../components/financing/InstrumentGuide';
import ApplicationForm from '../components/financing/ApplicationForm';
import { useTranslation } from '@/i18n/LanguageContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  disbursed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  repaid: 'bg-gray-100 text-gray-700',
};

const instrumentColors = {
  Murabaha: 'bg-teal-100 text-teal-700',
  Ijara: 'bg-blue-100 text-blue-700',
  Musharaka: 'bg-emerald-100 text-emerald-700',
  Mudaraba: 'bg-purple-100 text-purple-700',
  Salam: 'bg-green-100 text-green-700',
  Istisna: 'bg-indigo-100 text-indigo-700',
  Takaful: 'bg-amber-100 text-amber-700',
  Sukuk: 'bg-orange-100 text-orange-700',
  'Qard Hasan': 'bg-pink-100 text-pink-700',
};

export default function Financing() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['financeRequests'],
    queryFn: () => api.entities.FinanceRequest.list('-updated_date', 100),
  });

  const seg = VALUE_CHAIN_SEGMENTS.find(s => s.id === selectedSegment);

  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === filterStatus);

  const totalFinanced = requests
    .filter(r => ['approved', 'disbursed'].includes(r.status))
    .reduce((s, r) => s + (r.amount_requested || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
        <p className="text-amber-300 text-base font-arabic mb-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Moon className="w-6 h-6" /> {t('financing.title')}
        </h1>
        <p className="text-emerald-200 text-sm">{t('financing.subtitle')}</p>
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{requests.length}</p>
            <p className="text-emerald-200 text-xs mt-0.5">{t('financing.applications')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-300">{formatCompactCurrency(totalFinanced)}</p>
            <p className="text-emerald-200 text-xs mt-0.5">{t('financing.approved')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-300">
              {requests.filter(r => ['approved', 'disbursed'].includes(r.status)).length}
            </p>
            <p className="text-emerald-200 text-xs mt-0.5">{t('financing.funded')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'explore', label: 'Explore Value Chain', icon: Globe },
          { id: 'apply', label: 'Apply for Financing', icon: ClipboardList },
          { id: 'applications', label: `My Applications (${requests.length})`, icon: FolderOpen },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Explore */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          <ValueChainSelector selected={selectedSegment} onSelect={setSelectedSegment} />

          {seg ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <InstrumentGuide instruments={seg.instruments} />
              </div>
              <div className="space-y-4">
                <Card className="border-emerald-200">
                  <CardContent className="p-5">
                    <ValueChainSegmentIcon segment={seg.id} className="w-8 h-8 text-emerald-700 mb-2" />
                    <h3 className="font-bold text-emerald-800 text-lg">{seg.label}</h3>
                    <p className="text-sm text-gray-600 mt-1 mb-4">{seg.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {seg.instruments.map(i => (
                        <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">{i}</span>
                      ))}
                    </div>
                    <Button
                      className="w-full bg-emerald-700 hover:bg-emerald-800"
                      onClick={() => setActiveTab('apply')}
                    >
                      Apply for {seg.label} Financing
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                      <Scale className="w-4 h-4" /> Shari&apos;ah Reminder
                    </p>
                    <p className="text-xs text-amber-700">
                      All financing on Agriphix is structured to be Riba-free. No interest is charged — profit comes from trade, lease, or partnership arrangements. Always consult a qualified Shari'ah scholar for large transactions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-dashed border-2 border-emerald-200">
              <CardContent className="py-12 text-center">
                <ValueChainSegmentIcon segment={null} className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Select a value chain segment above</p>
                <p className="text-gray-400 text-sm mt-1">to see recommended Islamic finance instruments</p>
              </CardContent>
            </Card>
          )}

          <div>
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" /> All Islamic Finance Instruments Reference
            </h3>
            <InstrumentGuide instruments={['Murabaha', 'Ijara', 'Musharaka', 'Mudaraba', 'Salam', 'Istisna', 'Takaful', 'Sukuk', 'Qard Hasan']} />
          </div>
        </div>
      )}

      {/* TAB: Apply */}
      {activeTab === 'apply' && (
        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Islamic Finance Application
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Fill in your details and get an AI-powered Shari'ah-compliant structure recommendation.</p>
          </CardHeader>
          <CardContent className="p-6">
            <ApplicationForm
              preselectedSegment={selectedSegment}
              onSuccess={() => setActiveTab('applications')}
            />
          </CardContent>
        </Card>
      )}

      {/* TAB: Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'under_review', 'approved', 'disbursed', 'rejected', 'repaid'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                size="sm"
                className={filterStatus === status ? 'bg-emerald-700' : ''}
              >
                {status === 'all' ? 'All' : status.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-center text-gray-500 py-12">Loading...</p>
          ) : filteredRequests.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="py-12 text-center">
                <FolderOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No applications found</p>
                <Button className="mt-4 bg-emerald-700 hover:bg-emerald-800" onClick={() => setActiveTab('apply')}>
                  Submit First Application
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRequests.map(req => {
                const segInfo = VALUE_CHAIN_SEGMENTS.find(s => s.id === req.value_chain_segment);
                return (
                  <Card key={req.id} className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-emerald-600">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {segInfo && <span className="text-lg">{segInfo.icon}</span>}
                            <h3 className="font-bold text-gray-900">{req.crop_type}</h3>
                          </div>
                          {segInfo && <p className="text-xs text-gray-500 mb-2">{segInfo.label}</p>}
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>
                              {req.status.replace(/_/g, ' ')}
                            </span>
                            {req.islamic_instrument && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${instrumentColors[req.islamic_instrument] || 'bg-gray-100 text-gray-600'}`}>
                                {req.islamic_instrument}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-700">{formatCurrency(req.amount_requested)}</p>
                          <p className="text-xs text-gray-400">requested</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        {req.land_area > 0 && (
                          <div><p className="text-xs text-gray-400">Land</p><p className="font-medium">{req.land_area} ha</p></div>
                        )}
                        {req.expected_revenue && (
                          <div><p className="text-xs text-gray-400">Exp. Revenue</p><p className="font-medium text-emerald-600">{formatCurrency(req.expected_revenue)}</p></div>
                        )}
                        {req.repayment_period && (
                          <div><p className="text-xs text-gray-400">Repayment</p><p className="font-medium">{req.repayment_period} months</p></div>
                        )}
                        {req.farm_location && (
                          <div><p className="text-xs text-gray-400">Location</p><p className="font-medium">{req.farm_location}</p></div>
                        )}
                      </div>

                      {req.purpose && (
                        <p className="text-xs text-gray-600 border-t border-gray-100 pt-2 mb-2">{req.purpose}</p>
                      )}

                      {req.application_date && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Applied {format(new Date(req.application_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}