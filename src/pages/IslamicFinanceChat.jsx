import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import ChatMessage from '../components/islamicfinance/ChatMessage';
import TopicButton from '../components/islamicfinance/TopicButton';

const TOPICS = [
  { label: '🌍 Land (Ijara/Musharaka)', prompt: 'How can Islamic finance be used for agricultural land acquisition through Ijara or Musharaka?' },
  { label: '🌱 Farming Inputs (Murabaha)', prompt: 'Explain how Murabaha financing works for purchasing farming inputs like seeds, fertilizers, and pesticides.' },
  { label: '🚜 Machinery (Ijara)', prompt: 'How does Islamic Ijara financing work for acquiring agricultural machinery and equipment?' },
  { label: '🧠 Advisory Services', prompt: 'What Islamic finance structures support agricultural advisory and consulting services for farmers?' },
  { label: '🚚 Logistics & Storage', prompt: 'How can Islamic finance support agricultural logistics, warehousing, and cold storage?' },
  { label: '📦 Delivery & Distribution', prompt: 'What Islamic financing models are suitable for agricultural delivery and distribution networks?' },
  { label: '🏭 Suppliers & Processors', prompt: 'How can agricultural suppliers and food processors access Islamic financing?' },
  { label: '🔍 Traceability Systems', prompt: 'How can Islamic finance support investment in agricultural traceability and blockchain systems?' },
  { label: '🌐 Export Markets', prompt: 'What Islamic finance instruments support farmers targeting export markets?' },
  { label: '⚖️ Shari\'ah Compliance', prompt: 'What are the key Shari\'ah principles agricultural finance structures must comply with?' },
  { label: '🌾 Salam (Pre-Harvest)', prompt: 'Explain how Salam contracts work as forward financing for crop production before harvest.' },
  { label: '🤝 Mudaraba Partnership', prompt: 'How can Mudaraba profit-sharing arrangements finance farming operations in Uganda?' },
];

const SYSTEM_CONTEXT = `You are the Agriphix Islamic Agriculture Advisor — a knowledgeable, warm, and Shari'ah-compliant assistant for Uganda's halal agricultural platform.

Begin every response with "Bismillah" or an appropriate Islamic greeting where relevant.
Use respectful Islamic language naturally (e.g., "Insha'Allah", "Alhamdulillah", "Barakallahu Feekum").

Your expertise covers:

1. ISLAMIC FINANCE INSTRUMENTS for Agriculture:
   - Murabaha: Cost-plus financing (inputs, equipment, goods)
   - Ijara: Lease financing (land, machinery)
   - Musharaka: Partnership (joint ventures, co-farming)
   - Mudaraba: Profit-sharing (farming operations)
   - Salam: Forward contracts (pre-harvest crop financing)
   - Istisna: Construction contracts (processing facilities)
   - Takaful: Islamic mutual insurance (crop/livestock protection)
   - Sukuk: Islamic bonds (infrastructure)
   - Qard Hasan: Benevolent loans (smallholder farmers)

2. AGRICULTURAL VALUE CHAIN:
   - Land: acquisition, leasing, development
   - Farming Inputs: seeds, fertilizers, pesticides
   - Machinery & Equipment: tractors, irrigation
   - Advisory: agronomists, consultants, technology
   - Logistics & Storage: warehouses, cold chain, silos
   - Delivery & Distribution: transport, last-mile
   - Suppliers & Processors: aggregators, food processors
   - Traceability: blockchain, QR, halal certification
   - Export Markets: export financing, trade facilitation

3. HALAL AGRICULTURE GUIDANCE:
   - Halal certification requirements for crops and produce
   - Avoiding haram inputs (prohibited chemicals, GMOs debate in Islam)
   - Zakat on agricultural produce (Ushr — 10% or 5% based on irrigation)
   - Ethical and sustainable farming aligned with Islamic values
   - Fair trade and justice in pricing (no exploitation — la dharar)

4. SHARI'AH COMPLIANCE:
   - Prohibition of Riba (interest) — always suggest riba-free alternatives
   - Prohibition of Gharar (excessive uncertainty)
   - Prohibition of Maysir (speculation/gambling)
   - Emphasis on mutual consent, transparency, and fairness

Always provide:
- Practical advice for Uganda's agricultural context
- Clear Islamic finance structures with step-by-step guidance
- Shari'ah compliance notes
- Encouragement rooted in Islamic values

Be warm, concise, and use Islamic expressions naturally.`;

export default function IslamicFinanceChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n\n**Assalamu Alaikum Wa Rahmatullahi Wa Barakatuh!** ☪️\n\nWelcome to the **Agriphix Islamic Agriculture Advisor**.\n\nAlhamdulillah, I am here to help you with:\n- 🌾 **Shari'ah-compliant financing** across the full agricultural value chain\n- ✅ **Halal agriculture** practices & certification\n- 📊 **Zakat** on agricultural produce\n- 🤝 **Islamic partnerships** (Musharaka, Mudaraba) for farming\n\nSelect a topic below or ask me anything about halal, riba-free agriculture. Insha'Allah, I will guide you well.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const userMessage = { role: 'user', content: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Advisor'}: ${m.content}`)
        .join('\n\n');

      const prompt = `${SYSTEM_CONTEXT}\n\n--- Conversation History ---\n${history}\n\nUser: ${userText}\n\nAdvisor:`;

      const response = await api.integrations.Core.InvokeLLM({ prompt });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Astaghfirullah, I encountered an error. Please try again. Insha\'Allah it will work.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      content: `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\n\n**Assalamu Alaikum Wa Rahmatullahi Wa Barakatuh!** ☪️\n\nWelcome to the **Agriphix Islamic Agriculture Advisor**.\n\nAlhamdulillah, I am here to help you with:\n- 🌾 **Shari'ah-compliant financing** across the full agricultural value chain\n- ✅ **Halal agriculture** practices & certification\n- 📊 **Zakat** on agricultural produce\n- 🤝 **Islamic partnerships** (Musharaka, Mudaraba) for farming\n\nSelect a topic below or ask me anything about halal, riba-free agriculture. Insha'Allah, I will guide you well.`,
      timestamp: new Date()
    }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-h-[900px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-5 mb-4 text-white shadow-xl">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-amber-300 text-base font-arabic mb-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">☪️</div>
              <div>
                <h1 className="text-xl font-bold">Islamic Agriculture Advisor</h1>
                <p className="text-emerald-200 text-xs">Halal · Riba-Free · Shari'ah-Compliant</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 border border-white/30 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> New Chat
          </Button>
        </div>

        {/* Topic Quick-Start Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((topic) => (
            <TopicButton
              key={topic.label}
              label={topic.label}
              onClick={() => sendMessage(topic.prompt)}
              disabled={loading}
            />
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">☪️</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span className="text-xs text-emerald-600">Thinking... Insha'Allah</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-3 flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about halal financing, Zakat, Shari'ah-compliant agriculture..."
          className="flex-1 resize-none border-0 outline-none text-sm text-gray-800 placeholder-gray-400 min-h-[44px] max-h-[120px] leading-relaxed"
          rows={1}
          disabled={loading}
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="bg-emerald-700 hover:bg-emerald-800 rounded-xl h-10 w-10 p-0 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">
        ☪️ General guidance only. Consult a qualified Shari'ah scholar for formal rulings. JazakAllahu Khayran.
      </p>
    </div>
  );
}