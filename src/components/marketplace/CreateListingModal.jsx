import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryIcon, Rocket } from '@/constants/valueChainIcons';

const CATEGORY_OPTIONS = [
  { value: 'produce', label: 'Produce' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'seeds', label: 'Seeds' },
  { value: 'other', label: 'Other' },
];

export default function CreateListingModal({ onClose }) {
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: '', category: 'produce', listing_type: 'sale', description: '',
    price: '', price_unit: 'per kg', quantity: '', quantity_unit: 'kg',
    location: '', seller_name: '', seller_email: '', seller_phone: '',
    negotiable: true, quality_grade: '', certifications: [],
    harvest_date: '', image_url: ''
  });

  useEffect(() => {
    api.auth.me().then(u => {
      if (u) {
        setUser(u);
        setForm(f => ({ ...f, seller_name: u.full_name || '', seller_email: u.email || '' }));
      }
    }).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await api.entities.MarketplaceListing.create({
      ...form,
      price: parseFloat(form.price),
      quantity: form.quantity ? parseFloat(form.quantity) : null,
      status: 'active'
    });
    qc.invalidateQueries(['marketplace_listings']);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Post a New Listing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <CategoryIcon category={value} className="w-4 h-4" />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type *</label>
              <Select value={form.listing_type} onValueChange={v => set('listing_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="exchange">Exchange / Barter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g., Fresh Matooke Bunches — 500kg Available" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your listing — quality, condition, packaging, etc." rows={3} />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (UGX) *</label>
              <Input type="number" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit</label>
              <Input value={form.price_unit} onChange={e => set('price_unit', e.target.value)} placeholder="per kg, per head, per day" />
            </div>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
              <Input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Unit</label>
              <Input value={form.quantity_unit} onChange={e => set('quantity_unit', e.target.value)} placeholder="kg, heads, crates" />
            </div>
          </div>

          {/* Location + Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="District, Region" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
              <Select value={form.quality_grade} onValueChange={v => set('quality_grade', v)}>
                <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="grade_a">Grade A</SelectItem>
                  <SelectItem value="grade_b">Grade B</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Harvest date (produce/livestock) */}
          {(form.category === 'produce' || form.category === 'livestock') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.category === 'produce' ? 'Harvest Date' : 'Available From'}
              </label>
              <Input type="date" value={form.harvest_date} onChange={e => set('harvest_date', e.target.value)} />
            </div>
          )}

          {/* Negotiable */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="neg" checked={form.negotiable} onChange={e => set('negotiable', e.target.checked)} className="rounded" />
            <label htmlFor="neg" className="text-sm text-gray-700">Price is negotiable</label>
          </div>

          {/* Seller Info */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Your Contact Details</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <Input value={form.seller_name} onChange={e => set('seller_name', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
                <Input type="email" value={form.seller_email} onChange={e => set('seller_email', e.target.value)} required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <Input value={form.seller_phone} onChange={e => set('seller_phone', e.target.value)} placeholder="+256 ..." />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={submitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              {submitting ? 'Posting...' : (<><Rocket className="w-4 h-4 mr-2" /> Post Listing</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}