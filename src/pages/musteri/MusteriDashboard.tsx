import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, CheckCircle2, Truck, Package, MapPin,
  Star, Send, MessageCircle, Sparkles, Clock, X,
  Search,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { customerOrder, catalogProducts, chatMessages } from '../../data/mockData';

const stageIcons = [Package, CheckCircle2, Package, Truck, MapPin, CheckCircle2];

const aiResponses = [
  'Siparişiniz şu an dağıtım aracında ve bugün teslim edilmesi bekleniyor.',
  'Ürününüz en kaliteli ambalaj standartlarımızla paketlendi, güvenle ulaşacak.',
  'Teslimat tahmini AI sistemimiz tarafından anlık güncelleniyor. Şu an %94 olasılıkla yarın teslim!',
  'Başka bir sorunuz varsa yardımcı olmaktan memnuniyet duyarım.',
];

interface ChatMsg {
  id: number;
  role: 'user' | 'ai';
  content: string;
  time: string;
}

export function MusteriDashboard() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>(chatMessages.map(m => ({ ...m, role: m.role as 'user' | 'ai' })));
  const [input, setInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiResponseIdx = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMsg = { id: Date.now(), role: 'user', content: input, time: now };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      const aiMsg: ChatMsg = {
        id: Date.now() + 1,
        role: 'ai',
        content: aiResponses[aiResponseIdx.current % aiResponses.length],
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      aiResponseIdx.current++;
      setMessages(prev => [...prev, aiMsg]);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addToCart = (id: number) => {
    setCartItems(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const filteredProducts = catalogProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentStage = customerOrder.stages.findIndex(s => !s.completed);

  return (
    <DashboardLayout title={t('orders')}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Order Timeline */}
        <div>
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Truck className="w-5 h-5 text-slate-500" />
              <div>
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('orderTimeline')}</h2>
                <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('orderNumber')}{customerOrder.id}
                </div>
              </div>
            </div>
            {loading ? <SkeletonLoader rows={6} /> : (
              <div className="space-y-0">
                {customerOrder.stages.map((stage, idx) => {
                  const Icon = stageIcons[idx];
                  const isActive = idx === currentStage;
                  const isDone = stage.completed;

                  return (
                    <div key={stage.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isActive
                                ? isDark ? 'bg-slate-600 text-white border-2 border-emerald-500' : 'bg-white text-slate-700 border-2 border-emerald-500'
                                : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                        {idx < customerOrder.stages.length - 1 && (
                          <div className={`w-0.5 h-10 mt-1 ${
                            isDone ? 'bg-emerald-500' : isDark ? 'bg-slate-700' : 'bg-slate-200'
                          }`} />
                        )}
                      </div>
                      <div className="pb-6 min-w-0">
                        <div className={`text-sm font-semibold ${
                          isDone ? (isDark ? 'text-white' : 'text-slate-800') :
                          isActive ? 'text-emerald-600' :
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {stage.label}
                        </div>
                        <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {stage.date}
                        </div>
                        {stage.aiNote && (
                          <div className="flex items-start gap-1 mt-1">
                            <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-amber-600">{stage.aiNote}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={`mt-2 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">{t('estimatedDelivery')}:</span>
                <span className="text-emerald-600 font-semibold">{customerOrder.estimatedDelivery}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Product Catalog */}
        <div className="xl:col-span-2">
          <Card padding={false}>
            <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-slate-500" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('productCatalog')}</h2>
              </div>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    <ShoppingCart className="w-3 h-3" />
                    {cartItems.length}
                  </span>
                )}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${
                  isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <Search className="w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder={t('search')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none w-28 text-sm placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
            <div className="p-5">
              {loading ? <SkeletonLoader rows={4} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {filteredProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className={`rounded-xl border overflow-hidden group ${
                        isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <div className={`text-xs mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{product.category}</div>
                        <div className={`text-sm font-semibold mb-1 leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {product.name}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {product.rating} ({product.reviews})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            ₺{product.price.toLocaleString('tr-TR')}
                          </span>
                          {product.inStock ? (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => addToCart(product.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                cartItems.includes(product.id)
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 hover:bg-slate-700 text-white'
                              }`}
                            >
                              {cartItems.includes(product.id) ? (
                                <><CheckCircle2 className="w-3 h-3" /> Eklendi</>
                              ) : (
                                <><ShoppingCart className="w-3 h-3" /> {t('addToCart')}</>
                              )}
                            </motion.button>
                          ) : (
                            <span className={`text-xs px-3 py-1.5 rounded-xl ${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                              {t('outOfStock')}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`mb-3 w-80 rounded-2xl shadow-2xl border overflow-hidden ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
              style={{ height: 420 }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-xs font-semibold">{t('aiChatAssistant')}</div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-xs">Çevrimiçi</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ height: 300 }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === 'ai'
                        ? isDark ? 'bg-emerald-900/40 text-emerald-100 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                        : isDark ? 'bg-slate-600 text-white' : 'bg-slate-800 text-white'
                    }`}>
                      {msg.content}
                      <div className={`text-xs mt-1 opacity-50`}>{msg.time}</div>
                    </div>
                  </div>
                ))}
                {aiTyping && (
                  <div className="flex justify-start">
                    <div className={`rounded-2xl px-3 py-2 text-xs flex items-center gap-1.5 ${
                      isDark ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>●</motion.span>
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}>●</motion.span>
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}>●</motion.span>
                      <span className="ml-1">{t('aiThinking')}</span>
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
                    onKeyDown={handleKeyDown}
                    placeholder={t('typeMessage')}
                    className={`flex-1 text-xs px-3 py-2 rounded-xl outline-none transition-all ${
                      isDark ? 'bg-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(o => !o)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30"
        >
          <AnimatePresence mode="wait">
            {chatOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </DashboardLayout>
  );
}
