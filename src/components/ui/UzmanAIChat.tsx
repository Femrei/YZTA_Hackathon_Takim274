import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useSME, aiExpertPersonas } from '../../contexts/SMEContext';
import { useTheme } from '../../contexts/ThemeContext';

interface Msg {
  id: number;
  role: 'user' | 'ai';
  content: string;
  time: string;
}

export function UzmanAIChat() {
  const { smeType } = useSME();
  const { isDark } = useTheme();
  const persona = aiExpertPersonas[smeType];

  const [open, setOpen] = useState(false);
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

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Msg = { id: Date.now(), role: 'user', content: input, time: now };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      const resp = persona.responses[responseIdx.current % persona.responses.length];
      responseIdx.current++;
      setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', content: resp, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1600);
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
          isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{persona.title}</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-600">Çevrimiçi</span>
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 340, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Messages */}
            <div className={`overflow-y-auto p-3 space-y-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} style={{ height: 280 }}>
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'ai'
                      ? isDark ? 'bg-amber-900/30 text-amber-100 border border-amber-800/40' : 'bg-amber-50 text-amber-900 border border-amber-100'
                      : isDark ? 'bg-slate-600 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {msg.content}
                    <div className="text-xs mt-1 opacity-40">{msg.time}</div>
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-3 py-2 flex items-center gap-1.5 text-xs ${
                    isDark ? 'bg-amber-900/30 text-amber-300 border border-amber-800/40' : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay }}>●</motion.span>
                    ))}
                    <span className="ml-1">AI Düşünüyor...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className={`px-3 py-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') send(); }}
                  placeholder="Uzmana sorun..."
                  className={`flex-1 text-xs px-3 py-2 rounded-xl outline-none ${
                    isDark ? 'bg-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={send}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
