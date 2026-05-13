import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Package, Truck, DollarSign,
  Clock, CheckCircle, AlertTriangle, Sparkles, Mail,
  RefreshCw, ArrowRight, Bell, ShoppingCart, UserPlus,
  Briefcase, Send, X, ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  collection, query, where, onSnapshot, orderBy, getDocs,
  addDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSME } from '../../contexts/SMEContext';
import { useIndustry } from '../../contexts/IndustryContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

const MOCK_AI_ACTIONS = [
  { id: 1, title: 'Kritik Stok Uyarısı', description: 'Stok seviyesi kritik eşiğin altına düştü. 80 adet acil sipariş verilmesi önerilir.', priority: 'high' },
  { id: 2, title: 'Teslimat Optimizasyonu', description: 'Pazartesi teslimatlarını birleştirerek lojistik maliyeti %18 azaltabilirsiniz.', priority: 'normal' },
  { id: 3, title: 'Müşteri Memnuniyeti', description: 'Son 7 günde 3 geciken sipariş tespit edildi. Müşterilere otomatik bildirim gönderilebilir.', priority: 'normal' },
  { id: 4, title: 'Gelir Tahmini', description: 'Bu haftaki sipariş trendi geçen haftaya göre %12 artış gösteriyor. Stok hazırlığı yapılabilir.', priority: 'normal' },
];

interface FSOrder { id: string; status: string; totalAmount: number; customerName: string; items: { name: string; qty: number }[]; createdAt: { seconds: number } | null; }
interface FSProduct { id: string; name: string; status: string; currentStock: number; minStockLevel: number; }
interface FSNotif { id: string; title: string; message: string; type: string; read: boolean; createdAt: { seconds: number } | null; targetRole?: string; userId?: string; }
interface FSEmployee { id: string; name: string; email: string; role: string; }

function TaskAssignModal({ employees, companyId, onClose }: { employees: FSEmployee[]; companyId: string; onClose: () => void; }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [selectedEmp, setSelectedEmp] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [deadline, setDeadline] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleAssign = async () => {
    if (!selectedEmp || !taskTitle) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        companyId, assignedTo: selectedEmp, assignedBy: user?.id, assignedByName: user?.name || 'Admin',
        title: taskTitle, description: taskDesc, priority,
        deadline: deadline || 'Belirtilmedi', status: 'pending', createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'notifications'), {
        companyId, userId: selectedEmp, targetRole: 'employee',
        title: `Yeni Görev: ${taskTitle}`,
        message: `Admin tarafından yeni bir görev atandı. Öncelik: ${priority === 'high' ? 'Yüksek' : priority === 'medium' ? 'Orta' : 'Düşük'}${taskDesc ? ' — ' + taskDesc.slice(0, 60) : ''}`,
        type: 'info', read: false, createdAt: serverTimestamp(),
      });
      setDone(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) { console.error('Görev atama hatası:', err); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center"><UserPlus className="w-4 h-4 text-white" /></div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Görev Ata</h3>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X className="w-4 h-4" /></button>
        </div>
        {done ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Görev Atandı!</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Çalışana bildirim gönderildi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Çalışan Seç *</label>
              <div className="relative">
                <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none appearance-none ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                  <option value="">-- Çalışan seçin --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
              {employees.length === 0 && <p className="text-xs text-amber-600 mt-1">Sistemde kayıtlı çalışan bulunamadı.</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Görev Başlığı *</label>
              <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Örn: Stok sayımı yap"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'}`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Açıklama</label>
              <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows={2} placeholder="Görev detayları..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Öncelik</label>
                <div className="relative">
                  <select value={priority} onChange={e => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none appearance-none ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                    <option value="high">🔴 Yüksek</option>
                    <option value="medium">🟡 Orta</option>
                    <option value="low">🟢 Düşük</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Son Tarih</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`} />
              </div>
            </div>
            <button onClick={handleAssign} disabled={sending || !selectedEmp || !taskTitle}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
              {sending ? <><RefreshCw className="w-4 h-4 animate-spin" />Atanıyor...</> : <><Send className="w-4 h-4" />Görevi Ata</>}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, delta, icon: Icon, trend, color }: { title: string; value: string; delta: string; icon: React.ElementType; trend: 'up' | 'down'; color: string; }) {
  const { isDark } = useTheme();
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5 text-white" /></div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{delta}
        </span>
      </div>
      <div className={`text-2xl font-bold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</div>
      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</div>
    </Card>
  );
}

export function AdminDashboard() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { theme } = useSME();
  const { data } = useIndustry();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<{ id: number; title: string; description: string; priority: string }[]>([]);
  const [approvedIds, setApprovedIds] = useState<number[]>([]);
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [employees, setEmployees] = useState<FSEmployee[]>([]);
  const [orders, setOrders] = useState<FSOrder[]>([]);
  const [products, setProducts] = useState<FSProduct[]>([]);
  const [notifications, setNotifications] = useState<FSNotif[]>([]);

  useEffect(() => {
    if (!user?.companyId) return;
    const q = query(collection(db, 'orders'), where('companyId', '==', user.companyId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as FSOrder))));
  }, [user?.companyId]);

  useEffect(() => {
    if (!user?.companyId) return;
    const q = query(collection(db, 'products'), where('companyId', '==', user.companyId));
    getDocs(q).then(snap => { setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as FSProduct))); setLoading(false); });
  }, [user?.companyId]);

  useEffect(() => {
    if (!user?.companyId) return;
    const q = query(collection(db, 'notifications'), where('companyId', '==', user.companyId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as FSNotif));
      setNotifications(all.filter((n) => n.targetRole === 'admin' || n.userId === user.id || (!n.targetRole && !n.userId)));
    });
  }, [user?.companyId, user?.id]);

  useEffect(() => {
    if (!user?.companyId) return;
    const q = query(collection(db, 'users'), where('companyId', '==', user.companyId), where('role', '==', 'employee'));
    getDocs(q).then(snap => setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() } as FSEmployee))));
  }, [user?.companyId]);

  const fetchAiAdvice = async () => {
    if (!user?.companyId) return;
    setAiAdviceLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/ai/stock-advice`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: user.companyId }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      const lines = (d.advice as string).split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 10);
      const parsed = lines.slice(0, 4).map((line: string, i: number) => ({ id: Date.now() + i, title: `AI Öneri #${i + 1}`, description: line.replace(/^[-*•\d.]+\s*/, ''), priority: i === 0 ? 'high' : 'normal' }));
      setActions(parsed.length > 0 ? parsed : MOCK_AI_ACTIONS);
    } catch { setActions(MOCK_AI_ACTIONS); }
    finally { setAiAdviceLoading(false); }
  };

  useEffect(() => { if (user?.companyId) fetchAiAdvice(); }, [user?.companyId]);

  const sendTelegramReport = async (mode: 'morning' | 'evening') => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/telegram/send-daily-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: user?.companyId,
          mode: mode
        })
      });
      if(res.ok) {
        alert(mode === 'morning' ? "🌅 Sabah raporu Telegram'a başarıyla gönderildi!" : "🌙 Gün özeti Telegram'a başarıyla gönderildi!");
      } else {
        alert("❌ Gönderim başarısız oldu.");
      }
    } catch(err) {
      alert("❌ Sunucuya bağlanırken hata oluştu.");
    }
  };

  const handleApprove = (id: number) => {
    setApprovedIds(prev => [...prev, id]);
    setTimeout(() => { setActions(prev => prev.filter(a => a.id !== id)); setApprovedIds(prev => prev.filter(i => i !== id)); }, 1800);
  };

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const criticalCount = products.filter(p => p.status === 'critical').length;
  const normalCount = products.filter(p => p.status === 'normal').length;
  const excessCount = products.filter(p => p.status === 'excess').length;
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const shipmentStatusLabel: Record<string, string> = { active: t('active'), delayed: t('delayed'), delivered: t('delivered') };
  const formatTime = (ts: { seconds: number } | null) => {
    if (!ts) return '';
    const diff = (Date.now() - ts.seconds * 1000) / 1000;
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
    return new Date(ts.seconds * 1000).toLocaleDateString('tr-TR');
  };

  return (
    <DashboardLayout title={t('dashboard')}>
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-white'}`} />)}</div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Toplam Gelir" value={`₺${totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`} delta="+Firestore" icon={DollarSign} trend="up" color={theme.primary} />
            <StatCard title="Toplam Sipariş" value={String(totalOrders)} delta={`${pendingOrders} bekliyor`} icon={Package} trend="up" color="bg-emerald-600" />
            <StatCard title="Teslim Edildi" value={String(deliveredOrders)} delta={`${totalOrders - deliveredOrders} devam ediyor`} icon={CheckCircle} trend="up" color="bg-blue-600" />
            <StatCard title="Kritik Stok" value={String(criticalCount)} delta={criticalCount > 0 ? 'Dikkat!' : 'Normal'} icon={AlertTriangle} trend={criticalCount > 0 ? 'down' : 'up'} color="bg-amber-600" />
          </motion.div>
        )}

        {/* Hızlı Eylemler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => setShowTaskModal(true)}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all ${isDark ? 'border-blue-700/50 hover:border-blue-500 hover:bg-blue-900/20' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'}`}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0"><UserPlus className="w-5 h-5 text-white" /></div>
            <div className="text-left">
              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Çalışana Görev Ata</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Çalışan paneline anında düşer</div>
            </div>
          </button>
          
          <button onClick={() => sendTelegramReport('morning')}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all ${isDark ? 'border-sky-700/50 hover:border-sky-500 hover:bg-sky-900/20' : 'border-sky-200 hover:border-sky-400 hover:bg-sky-50'}`}>
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0"><Send className="w-5 h-5 text-white" /></div>
            <div className="text-left">
              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Sabah Raporu</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kargolar ve stok (Telegram)</div>
            </div>
          </button>

          <button onClick={() => sendTelegramReport('evening')}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all ${isDark ? 'border-indigo-700/50 hover:border-indigo-500 hover:bg-indigo-900/20' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'}`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 text-white" /></div>
            <div className="text-left">
              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Gün Özeti</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Günlük satışlar (Telegram)</div>
            </div>
          </button>

          <Link to="/admin/is-ilanlari"
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all ${isDark ? 'border-emerald-700/50 hover:border-emerald-500 hover:bg-emerald-900/20' : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'}`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0"><Briefcase className="w-5 h-5 text-white" /></div>
            <div className="text-left">
              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>İş İlanı İncele</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tüm başvurular</div>
            </div>
          </Link>
        </div>

        {/* AI Insights */}
        <Card>
          <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-amber-500" /><h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('aiInsights')}</h2></div>
          {loading ? <SkeletonLoader rows={3} /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.aiInsights.map(insight => {
                const trendColors = { positive: { card: 'from-emerald-500/10 to-teal-500/10 border-emerald-200', icon: 'text-emerald-600 bg-emerald-100' }, neutral: { card: 'from-blue-500/10 to-slate-500/10 border-blue-200', icon: 'text-blue-600 bg-blue-100' }, negative: { card: 'from-red-500/10 to-orange-500/10 border-red-200', icon: 'text-red-600 bg-red-100' } };
                const colors = trendColors[insight.trend];
                return (
                  <div key={insight.titleKey} className={`rounded-2xl border bg-gradient-to-br p-5 ${colors.card} ${isDark ? 'border-slate-600' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}><TrendingUp className="w-5 h-5" /></div>
                      <div>
                        <div className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{insight.title}</div>
                        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{insight.insight}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /><span className="text-xs text-amber-600 font-medium">AI Öngörüsü</span></div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Package className="w-5 h-5 text-slate-500" /><h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Stok Durumu</h2></div>
                <Link to="/admin/stok" className={`flex items-center gap-1 text-xs font-medium ${theme.primaryText} hover:opacity-80`}>Stok Yönetimi <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
              {loading ? <SkeletonLoader rows={2} /> : (
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-xl p-3 ${isDark ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-100'}`}><div className="text-xl font-bold text-red-600">{criticalCount}</div><div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kritik Stok</div></div>
                  <div className={`rounded-xl p-3 ${isDark ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-100'}`}><div className="text-xl font-bold text-emerald-600">{normalCount}</div><div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Normal Stok</div></div>
                  <div className={`rounded-xl p-3 ${isDark ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-100'}`}><div className="text-xl font-bold text-amber-600">{excessCount}</div><div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fazla Stok</div></div>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-slate-500" /><h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Son Siparişler</h2><span className="flex items-center gap-1 text-xs text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Canlı</span></div>
                <Link to="/admin/siparisler" className={`flex items-center gap-1 text-xs font-medium ${theme.primaryText} hover:opacity-80`}>Tümünü Gör <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
              {loading ? <SkeletonLoader rows={3} /> : (
                <div className="space-y-2">
                  {orders.slice(0, 4).map((order, idx) => {
                    const statusColor: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', processing: 'bg-amber-100 text-amber-700', shipped: 'bg-blue-100 text-blue-700', delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };
                    const statusLabel: Record<string, string> = { pending: 'Bekliyor', processing: 'İşleniyor', shipped: 'Kargoda', delivered: 'Teslim', cancelled: 'İptal' };
                    return (
                      <motion.div key={order.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.customerName}</div>
                          <div className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{order.items?.map(i => `${i.qty}x ${i.name}`).join(', ')}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>₺{(order.totalAmount || 0).toLocaleString('tr-TR')}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[order.status] || 'bg-slate-100 text-slate-600'}`}>{statusLabel[order.status] || order.status}</span>
                          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatTime(order.createdAt)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                  {orders.length === 0 && <div className={`text-center py-6 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Henüz sipariş yok.</div>}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-slate-500" /><h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('logisticsTracker')}</h2></div>
                <div className="flex items-center gap-2">
                  <Link to="/admin/lojistik" className={`flex items-center gap-1 text-xs font-medium ${theme.primaryText} hover:opacity-80`}>Tümünü Gör <ArrowRight className="w-3.5 h-3.5" /></Link>
                  <button className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-xl transition-all ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}><RefreshCw className="w-3 h-3" /></button>
                </div>
              </div>
              {loading ? <SkeletonLoader rows={4} /> : (
                <div className="space-y-3">
                  {data.shipments.slice(0, 3).map((shipment, idx) => (
                    <motion.div key={shipment.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${shipment.status === 'delayed' ? isDark ? 'border-red-700/40 bg-red-900/10' : 'border-red-100 bg-red-50/50' : isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-semibold font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{shipment.id}</span>
                          <Badge status={shipment.status} label={shipmentStatusLabel[shipment.status]} />
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{shipment.product} → {shipment.destination}</div>
                        {shipment.aiReason && <div className="flex items-start gap-1 mt-1"><AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" /><span className="text-xs text-red-500">{shipment.aiReason}</span></div>}
                      </div>
                      <div className="flex-shrink-0 w-20">
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${shipment.progress}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                            className={`h-full rounded-full ${shipment.status === 'delivered' ? 'bg-emerald-500' : shipment.status === 'delayed' ? 'bg-red-500' : 'bg-blue-500'}`} />
                        </div>
                        <div className={`text-xs text-right mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{shipment.progress}%</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('aiActionCenter')}</h2>
                  {actions.length > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{actions.length} öneri</span>}
                </div>
                <button onClick={fetchAiAdvice} disabled={aiAdviceLoading}
                  className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'} disabled:opacity-40`}>
                  <RefreshCw className={`w-3.5 h-3.5 ${aiAdviceLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              {(loading || aiAdviceLoading) ? <SkeletonLoader rows={3} /> : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {actions.map((action) => (
                      <motion.div key={action.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, overflow: 'hidden' }} transition={{ duration: 0.3 }}
                        className={`p-4 rounded-xl border ${action.priority === 'high' ? isDark ? 'border-amber-700/50 bg-amber-900/20' : 'border-amber-200 bg-amber-50' : isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="flex items-start gap-2 mb-2">
                          <Mail className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                          <div className="min-w-0">
                            <div className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{action.title}</div>
                            <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{action.description}</div>
                          </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => handleApprove(action.id)} disabled={approvedIds.includes(action.id)}
                          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${approvedIds.includes(action.id) ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                          <CheckCircle className="w-3.5 h-3.5" />{approvedIds.includes(action.id) ? t('approved') : t('approveAndSend')}
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {actions.length === 0 && <div className={`text-center py-6 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{aiAdviceLoading ? 'AI analiz yapıyor...' : 'Yenile butonuna tıklayın.'}</div>}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-slate-500" /><h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Bildirimler</h2>
                <span className="flex items-center gap-1 text-xs text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Canlı</span>
                {unreadNotifs > 0 && <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{unreadNotifs} yeni</span>}
              </div>
              <div className="space-y-2">
                {notifications.length === 0 ? <p className={`text-xs text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Henüz bildirim yok.</p> : (
                  notifications.slice(0, 5).map((notif, idx) => (
                    <motion.div key={notif.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                      className={`flex gap-2 p-3 rounded-xl border ${!notif.read ? isDark ? 'border-slate-600 bg-slate-700/40' : 'border-blue-100 bg-blue-50/50' : isDark ? 'border-slate-700/50 opacity-60' : 'border-slate-100 opacity-60'}`}>
                      <ShoppingCart className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${notif.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{notif.title}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{notif.message}</p>
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{formatTime(notif.createdAt)}</span>
                      </div>
                      {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTaskModal && <TaskAssignModal employees={employees} companyId={user?.companyId || ''} onClose={() => setShowTaskModal(false)} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}