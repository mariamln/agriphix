import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Mail, User } from 'lucide-react';
import { format } from 'date-fns';

export default function Messages() {
  const [showCompose, setShowCompose] = useState(false);
  const [formData, setFormData] = useState({
    recipient_email: '',
    recipient_name: '',
    subject: '',
    content: '',
    message_type: 'general'
  });

  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => api.entities.Message.list('-updated_date', 100)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.entities.User.list()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const currentUser = await api.auth.me();
      return api.entities.Message.create({
        ...data,
        sender_name: currentUser.full_name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setShowCompose(false);
      setFormData({
        recipient_email: '',
        recipient_name: '',
        subject: '',
        content: '',
        message_type: 'general'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const typeColors = {
    inquiry: 'bg-blue-100 text-blue-700',
    order: 'bg-green-100 text-green-700',
    offer: 'bg-purple-100 text-purple-700',
    general: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with stakeholders across the value chain</p>
        </div>
        <Button 
          onClick={() => setShowCompose(!showCompose)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Send className="w-4 h-4 mr-2" />
          {showCompose ? 'Cancel' : 'New Message'}
        </Button>
      </div>

      {/* Compose Form */}
      {showCompose && (
        <Card className="shadow-lg border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b">
            <CardTitle className="text-lg">Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email *</label>
                  <Input
                    type="email"
                    value={formData.recipient_email}
                    onChange={(e) => setFormData({...formData, recipient_email: e.target.value})}
                    placeholder="recipient@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                  <Input
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                    placeholder="Recipient's name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Message subject"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                  <Select value={formData.message_type} onValueChange={(val) => setFormData({...formData, message_type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquiry">Inquiry</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Type your message here..."
                  rows={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500 text-center py-12">Loading messages...</p>
        ) : messages.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No messages yet</p>
              <p className="text-gray-400 text-sm mt-2">Start a conversation with stakeholders</p>
            </CardContent>
          </Card>
        ) : (
          messages.map(message => (
            <Card key={message.id} className="shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-gray-900">{message.sender_name || 'Unknown'}</p>
                        <span className="text-gray-400">→</span>
                        <p className="text-gray-600">{message.recipient_name || message.recipient_email}</p>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{message.subject}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={typeColors[message.message_type]}>
                      {message.message_type}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {format(new Date(message.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 ml-13 whitespace-pre-wrap">{message.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}