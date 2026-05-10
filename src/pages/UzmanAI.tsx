import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, BrainCircuit, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../contexts/ThemeContext';
import { useSME, aiExpertPersonas } from '../contexts/SMEContext';

interface Msg {
  id: number;
  role: 'user' | 'ai';
  content: string;
  time: string;
}

const quickPrompts: Record<string, string[]> = {
  agriculture: [
    'Bu hafta hangi ürünler için stok artırmalıyım?',
    'Zeytinyağı fiyatlarındaki trend nedir?',
    'Organik sertifikasyon süreci nasıl işler?',
    'Sulama takvimi öner',
  ],
  technology: [
    'MRR büyütmek için en etkili strateji nedir?',
    'Churn oranını nasıl düşürebilirim?',
    'SaaS fiyatlandırma modeli öner',
    'Teknik borç nasıl yönetilir?',
  ],
  handcraft: [
    'Ürünlerimi hangi platformda satmalıyım?',
    'İhracat için hangi belgelere ihtiyacım var?',
    'Fiyatlandırma stratejisi öner',
    'Müşteri hikayesi nasıl oluşturabilirim?',
  ],
  general: [
    'Nakit akışımı nasıl iyileştirebilirim?',
    'Dijital dönüşüm için nereden başlamalıyım?',
    'Müşteri başı geliri artırmanın yolları neler?',
    'İşletme verimliliğini artırmak için öneriler?',
  ],
};

export function UzmanAI() {
  const { isDark } = useTheme();
  const { smeType } = useSME();
  const persona = aiExpertPersonas[smeType];
  const prompts = quickPrompts[smeType];

  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, role: 'ai', content: persona.greeting, time: 'Şimdi' },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const responseIdx = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: 0, role: 'ai', content: persona.greeting, time: 'Şimdi' }]);
    responseIdx.current = 0;
  }, [smeType, persona.greeting]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setMessages(p => [...p, { id: Date.now(), role: 'user', content, time: now }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      const resp = persona.responses[responseIdx.current % persona.responses.length];
      responseIdx.current++;
      setMessages(p => [...p, {
        id: Date.now() + 1, role: 'ai', content: resp,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1600);
  };

  const reset = () => {
    setMessages([{ id: 0, role: 'ai', content: persona.greeting, time: 'Şimdi' }]);
    responseIdx.current = 0;
    setInput('');
  };

  return (
    <DashboardLayout title="Uzman AI">
      <div className="flex flex-col lg:flex-row gap-6 h-full" style={{ minHeight: 600 }}>
        {/* Sidebar: persona + quick prompts */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          <div className={`rounded-2xl border p-5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{persona.title}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-600 font-medium">Çevrimiçi</span>
                </div>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Sektörünüze özel eğitilmiş AI danışmanınız. Stratejik sorular, operasyonel tavsiyeler ve iş büyütme konularında destek verir.
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Hızlı Sorular</span>
            </div>
            <div className="space-y-2">
              {prompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => send(prompt)}
                  disabled={thinking}
                  className={`w-full text-left text-xs px-3 py-2.5 rounded-xl border transition-all ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:border-amber-700/50 hover:bg-amber-900/20 hover:text-amber-300 disabled:opacity-40'
                      : 'border-slate-100 text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={reset}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Sohbeti Sıfırla
          </button>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          {/* Header */}
          <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{persona.title}</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{messages.length - 1} mesaj</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 480 }}>
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'ai'
                      ? isDark ? 'bg-amber-900/30 text-amber-100 border border-amber-800/40' : 'bg-amber-50 text-amber-900 border border-amber-100'
                      : isDark ? 'bg-slate-600 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {msg.content}
                    <div className={`text-xs mt-2 ${msg.role === 'ai' ? 'text-amber-600/60' : 'text-white/40'}`}>{msg.time}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {thinking && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className={`rounded-2xl px-4 py-3 flex items-center gap-1.5 text-sm ${
                  isDark ? 'bg-amber-900/30 text-amber-300 border border-amber-800/40' : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay }}>●</motion.span>
                  ))}
                  <span className="ml-1">AI Düşünüyor...</span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className={`px-4 py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex gap-2.5">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Uzmana bir soru sorun..."
                disabled={thinking}
                className={`flex-1 text-sm px-4 py-2.5 rounded-xl outline-none transition-all disabled:opacity-50 ${
                  isDark ? 'bg-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200'
                }`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => send()}
                disabled={!input.trim() || thinking}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
