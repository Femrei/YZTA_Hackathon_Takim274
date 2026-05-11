import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, Send, CheckCircle, MessageSquare, Clock, AlertCircle, Paperclip } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTickets } from '../../contexts/TicketContext';

const categories = ['Teknik', 'Entegrasyon', 'Raporlama', 'Hesap', 'Performans', 'Diğer'];

const statusConfig = {
  open: { label: 'Açık', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  'in-progress': { label: 'İşlemde', color: 'bg-amber-100 text-amber-700', icon: Clock },
  resolved: { label: 'Çözüldü', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
};

export function TeknikDestek() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { addTicket, getTicketsBySme } = useTickets();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Teknik');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const myTickets = getTicketsBySme(user?.id ?? 'sme-001');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    await addTicket({
      smeId: user?.id ?? 'sme-001',
      smeName: user?.companyName ?? 'Bilinmiyor',
      subject: subject.trim(),
      category,
      message: message.trim(),
      priority,
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setMessage('');
      setPriority('medium');
      setCategory('Teknik');
      setFileName(null);
    }, 3000);
  };

  return (
    <DashboardLayout title="Teknik Destek">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className={`flex items-center gap-4 p-5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Destek Talebi Oluştur</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              DigiCoBig platform ekibi genellikle 24 saat içinde yanıt verir.
            </p>
          </div>
        </div>

        {/* Ticket Form */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-slate-400" />
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Yeni Destek Talebi</h3>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`flex flex-col items-center py-10 gap-3 ${isDark ? 'text-white' : 'text-slate-800'}`}
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="font-semibold text-lg">Talebiniz alındı!</p>
                <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Destek ekibimiz en kısa sürede size geri dönecektir.
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Konu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Sorununuzu kısaca özetleyin..."
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kategori</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-all appearance-none ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Öncelik</label>
                  <div className="flex gap-2">
                    {([['low', 'Düşük'], ['medium', 'Orta'], ['high', 'Yüksek']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPriority(val)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          priority === val
                            ? val === 'high' ? 'bg-red-500 text-white border-red-500'
                              : val === 'medium' ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-slate-600 text-white border-slate-600'
                            : isDark ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Mesaj <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Yaşadığınız sorunu veya isteğinizi detaylıca açıklayın..."
                    required
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none ${
                      isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Attachment */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ek Dosya</label>
                  <label className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed cursor-pointer transition-all ${
                    isDark ? 'border-slate-600 hover:border-slate-500 text-slate-400' : 'border-slate-200 hover:border-slate-300 text-slate-500'
                  }`}>
                    <Paperclip className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{fileName ?? 'Dosya seç veya sürükle bırak...'}</span>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf,.txt,.xlsx,.csv" />
                  </label>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                  <span className="font-medium">Gönderen:</span>
                  <span>{user?.name}</span>
                  <span>·</span>
                  <span>{user?.companyName}</span>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>

        {/* Past Tickets */}
        {myTickets.length > 0 && (
          <div>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Destek Taleplerim</h3>
            <div className="space-y-3">
              {myTickets.map(ticket => {
                const cfg = statusConfig[ticket.status];
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-xs font-mono font-medium flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{ticket.id}</span>
                        <span className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{ticket.subject}</span>
                        {ticket.category && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            {ticket.category}
                          </span>
                        )}
                      </div>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{ticket.message}</p>
                    {ticket.reply && (
                      <div className={`p-3 rounded-xl text-xs border-l-2 border-blue-500 ${isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                        <span className="font-semibold">DigiCoBig Destek: </span>{ticket.reply}
                        {ticket.repliedAt && <span className={`ml-2 ${isDark ? 'text-blue-400/60' : 'text-blue-400'}`}>· {ticket.repliedAt}</span>}
                      </div>
                    )}
                    <div className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{ticket.date}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
