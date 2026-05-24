import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { useQueryClient } from '@tanstack/react-query';
import { X, MapPin, Phone, Mail, Send, Tag, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency';

const categoryEmoji = { produce: '🌽', equipment: '🚜', livestock: '🐄', seeds: '🌱', other: '📦' };
const typeColors = { sale: 'bg-emerald-100 text-emerald-700', rent: 'bg-blue-100 text-blue-700', exchange: 'bg-amber-100 text-amber-700' };
const msgTypeColors = { inquiry: 'bg-blue-50 border-blue-200', offer: 'bg-emerald-50 border-emerald-200', counter_offer: 'bg-amber-50 border-amber-200', accept: 'bg-green-50 border-green-200', decline: 'bg-red-50 border-red-200', general: 'bg-gray-50 border-gray-200' };

import SellerBadge from './SellerBadge';

export default function ListingDetailModal({ listing, sellerProfile, messages, onClose }) {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [msgType, setMsgType] = useState('inquiry');
  const [message, setMessage] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.auth.me().then(u => {
      if (u) { setUser(u); setBuyerName(u.full_name || ''); setBuyerEmail(u.email || ''); }
    }).catch(() => {});
    // Mark messages as read
    messages.filter(m => !m.read && m.recipient_email).forEach(m => {
      api.entities.MarketplaceMessage.update(m.id, { read: true }).catch(() => {});
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !buyerName || !buyerEmail) return;
    setSending(true);
    await api.entities.MarketplaceMessage.create({
      listing_id: listing.id,
      listing_title: listing.title,
      sender_name: buyerName,
      sender_email: buyerEmail,
      recipient_email: listing.seller_email,
      recipient_name: listing.seller_name,
      message: message.trim(),
      message_type: msgType,
      offered_price: offeredPrice ? parseFloat(offeredPrice) : null,
      read: false
    });
    qc.invalidateQueries(['marketplace_messages_all']);
    setSending(false);
    setSent(true);
    setMessage('');
    setOfferedPrice('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryEmoji[listing.category]}</span>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">{listing.title}</h2>
              <div className="flex gap-2 mt-0.5">
                <Badge className={typeColors[listing.listing_type]}>{listing.listing_type}</Badge>
                {listing.negotiable && <Badge className="bg-amber-100 text-amber-700">Negotiable</Badge>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Listing Info Panel */}
          <div className="md:w-72 shrink-0 border-r bg-gray-50 p-5 overflow-y-auto space-y-4">
            {listing.image_url && (
              <img src={listing.image_url} alt={listing.title} className="w-full h-32 object-cover rounded-xl" />
            )}

            <div>
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(listing.price)}</p>
              {listing.price_unit && <p className="text-sm text-gray-500">/ {listing.price_unit}</p>}
            </div>

            {listing.quantity > 0 && (
              <p className="text-sm text-gray-700"><span className="font-semibold">{listing.quantity} {listing.quantity_unit}</span> available</p>
            )}

            {listing.description && (
              <p className="text-sm text-gray-600">{listing.description}</p>
            )}

            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{listing.location}</div>
              {listing.harvest_date && <div className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-gray-400" />Available: {format(new Date(listing.harvest_date), 'MMM d, yyyy')}</div>}
              {listing.quality_grade && <p className="font-medium capitalize">{listing.quality_grade.replace('_', ' ')}</p>}
            </div>

            {listing.certifications?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {listing.certifications.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
              </div>
            )}

            <div className="border-t pt-3 space-y-1.5 text-sm">
              <p className="font-semibold text-gray-800">{listing.seller_name}</p>
              <SellerBadge profile={sellerProfile} listing={listing} size="lg" />
              {listing.seller_email && <div className="flex items-center gap-1.5 text-gray-600"><Mail className="w-3.5 h-3.5" />{listing.seller_email}</div>}
              {listing.seller_phone && <div className="flex items-center gap-1.5 text-gray-600"><Phone className="w-3.5 h-3.5" />{listing.seller_phone}</div>}
            </div>
          </div>

          {/* Messages + Send Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-xs text-gray-400 text-center font-medium uppercase tracking-wide">
                <MessageSquare className="w-3.5 h-3.5 inline mr-1" />Negotiation Thread
              </p>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-4xl mb-2">💬</p>
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`rounded-xl border p-3 text-sm ${msgTypeColors[msg.message_type] || 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-800">{msg.sender_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{msg.message_type?.replace('_', ' ')}</Badge>
                        <span className="text-xs text-gray-400">{format(new Date(msg.created_date), 'MMM d, HH:mm')}</span>
                      </div>
                    </div>
                    {msg.offered_price > 0 && (
                      <p className="text-emerald-700 font-bold mb-1">Offered: {formatCurrency(msg.offered_price)} / {listing.price_unit}</p>
                    )}
                    <p className="text-gray-700">{msg.message}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send form */}
            <div className="border-t p-4 bg-white shrink-0">
              {sent && (
                <div className="mb-3 flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                  <CheckCircle className="w-4 h-4" /> Message sent!
                </div>
              )}
              <form onSubmit={handleSend} className="space-y-3">
                {/* Sender info if not logged in */}
                {!user && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Your name *" value={buyerName} onChange={e => setBuyerName(e.target.value)} required />
                    <Input type="email" placeholder="Your email *" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} required />
                  </div>
                )}

                <div className="flex gap-2">
                  <Select value={msgType} onValueChange={setMsgType}>
                    <SelectTrigger className="w-40 shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquiry">Inquiry</SelectItem>
                      <SelectItem value="offer">Make Offer</SelectItem>
                      <SelectItem value="counter_offer">Counter Offer</SelectItem>
                      <SelectItem value="accept">Accept Price</SelectItem>
                      <SelectItem value="decline">Decline</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  {(msgType === 'offer' || msgType === 'counter_offer') && (
                    <Input type="number" step="0.01" placeholder={`Offer price (UGX / ${listing.price_unit})`} value={offeredPrice} onChange={e => setOfferedPrice(e.target.value)} className="w-44 shrink-0" />
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={2}
                    className="flex-1 resize-none"
                    required
                  />
                  <Button type="submit" disabled={sending} className="bg-emerald-600 hover:bg-emerald-700 h-full px-4">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}