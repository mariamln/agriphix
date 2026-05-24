import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, NISAB_UGX, GOLD_PRICE_UGX_PER_GRAM, NISAB_GOLD_GRAMS } from '@/utils/currency';

const ZAKAT_RATE = 0.025;

const categories = [
  { id: 'cash', label: '💵 Cash & Bank Savings', description: 'Cash on hand and in bank accounts' },
  { id: 'crops', label: '🌾 Crop Revenue', description: 'Revenue from agricultural produce (after expenses)' },
  { id: 'livestock', label: '🐄 Livestock Value', description: 'Market value of zakatable livestock' },
  { id: 'gold_silver', label: '🥇 Gold & Silver', description: 'Market value of gold and silver holdings' },
  { id: 'business', label: '🏪 Business Inventory', description: 'Value of goods held for trade' },
  { id: 'investments', label: '📈 Investments', description: 'Stocks, shares, and other investments' },
  { id: 'receivables', label: '🤝 Money Owed to You', description: 'Loans given out expected to be repaid' },
];

const deductions = [
  { id: 'debts', label: '💳 Debts & Liabilities', description: 'Money you owe others (due within the year)' },
  { id: 'expenses', label: '🧾 Business Expenses', description: 'Outstanding business expenses' },
];

export default function ZakatCalculator() {
  const [assets, setAssets] = useState({});
  const [deductionValues, setDeductionValues] = useState({});
  const [calculated, setCalculated] = useState(false);

  const totalAssets = categories.reduce((sum, c) => sum + (parseFloat(assets[c.id]) || 0), 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + (parseFloat(deductionValues[d.id]) || 0), 0);
  const netWorth = Math.max(0, totalAssets - totalDeductions);
  const zakatDue = netWorth >= NISAB_UGX ? netWorth * ZAKAT_RATE : 0;
  const nisabMet = netWorth >= NISAB_UGX;

  const handleCalculate = () => setCalculated(true);
  const handleReset = () => {
    setAssets({});
    setDeductionValues({});
    setCalculated(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
        <p className="text-amber-300 text-base font-arabic mb-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
        <h1 className="text-2xl font-bold mb-1">☪️ Zakat Calculator</h1>
        <p className="text-emerald-200 text-sm">
          Calculate your annual Zakat obligation accurately. Nisab threshold: ~{formatCurrency(NISAB_UGX)} (based on {NISAB_GOLD_GRAMS}g of gold at {formatCurrency(GOLD_PRICE_UGX_PER_GRAM)}/g).
        </p>
      </div>

      {/* Nisab Info */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">⚖️ About Nisab</p>
          <p>Zakat is obligatory if your net zakatable wealth has been at or above the Nisab for a full lunar year (Hawl). The Nisab is equivalent to 85g of gold or 595g of silver — use whichever is lower. Zakat rate is <strong>2.5%</strong> of net zakatable wealth.</p>
        </CardContent>
      </Card>

      {/* Assets */}
      <Card className="border-emerald-200">
        <CardHeader className="bg-emerald-50 border-b border-emerald-100 py-4">
          <CardTitle className="text-emerald-800 text-base">📊 Zakatable Assets</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{cat.label}</p>
                <p className="text-xs text-gray-400">{cat.description}</p>
              </div>
              <div className="w-40">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">UGX</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={assets[cat.id] || ''}
                    onChange={e => setAssets(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    className="pl-12 text-right"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="border-t border-emerald-100 pt-3 flex justify-between text-sm font-semibold">
            <span className="text-gray-700">Total Assets</span>
            <span className="text-emerald-700">{formatCurrency(totalAssets)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card className="border-red-100">
        <CardHeader className="bg-red-50 border-b border-red-100 py-4">
          <CardTitle className="text-red-700 text-base">➖ Deductions (Liabilities)</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {deductions.map(ded => (
            <div key={ded.id} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{ded.label}</p>
                <p className="text-xs text-gray-400">{ded.description}</p>
              </div>
              <div className="w-40">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">UGX</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={deductionValues[ded.id] || ''}
                    onChange={e => setDeductionValues(prev => ({ ...prev, [ded.id]: e.target.value }))}
                    className="pl-12 text-right"
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="border-t border-red-100 pt-3 flex justify-between text-sm font-semibold">
            <span className="text-gray-700">Total Deductions</span>
            <span className="text-red-600">−{formatCurrency(totalDeductions)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Calculate Button */}
      <div className="flex gap-3">
        <Button onClick={handleCalculate} className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-base py-5">
          Calculate Zakat
        </Button>
        <Button onClick={handleReset} variant="outline" className="border-gray-300">
          Reset
        </Button>
      </div>

      {/* Result */}
      {calculated && (
        <Card className={`border-2 shadow-lg ${nisabMet ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50'}`}>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-4xl">{nisabMet ? '🌙' : '📋'}</p>
            <div>
              <p className="text-sm text-gray-500 mb-1">Net Zakatable Wealth</p>
              <p className="text-3xl font-bold text-gray-800">{formatCurrency(netWorth)}</p>
            </div>
            <div className={`rounded-xl p-4 ${nisabMet ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {nisabMet ? '✅ Nisab threshold met — Zakat is obligatory' : '❌ Below Nisab threshold — Zakat not obligatory'}
              </p>
              {nisabMet && (
                <>
                  <p className="text-4xl font-bold text-emerald-700 mt-2">
                    {formatCurrency(zakatDue)}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">Zakat Due (2.5% of {formatCurrency(netWorth)})</p>
                </>
              )}
            </div>
            {nisabMet && (
              <p className="text-xs text-gray-500 italic">
                May Allah accept your Zakat and bless your wealth. Barakallahu Feekum. 🤲
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border-gray-200">
        <CardContent className="p-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-600 mb-1">📌 Disclaimer</p>
          <p>This calculator provides an estimate only. Gold prices fluctuate — verify the current Nisab with a reliable Islamic authority. For complex wealth situations (business partnerships, agricultural Ushr, etc.), consult a qualified Shari'ah scholar.</p>
        </CardContent>
      </Card>
    </div>
  );
}