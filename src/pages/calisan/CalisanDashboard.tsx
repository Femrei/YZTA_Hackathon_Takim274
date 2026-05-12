import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Package, AlertCircle, CheckCircle2,
  Clock, Sparkles, Bell, Info,
  AlertTriangle, Camera, Upload, Eye, Cpu, ShoppingCart,
} from 'lucide-react';
import {
  collection, query, where, onSnapshot, orderBy,
  doc, updateDoc, writeBatch,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useIndustry } from '../../contexts/IndustryContext';
import { stockItems } from '../../data/mockData';
import ReactMarkdown from 'react-markdown';

type TaskStatus = 'pending' | 'in-progress' | 'done';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'warning' | 'info' | 'success';
  read: boolean;
  createdAt: { seconds: number } | null;
}

function VisionAISection() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    // Resmi yeniden boyutlandırmak için Canvas kullanıyoruz (Büyük dosyaların çökmesini önler)
    const img = new Image();
    const reader = new FileReader();
    
    reader.onloadend = () => {
      img.src = reader.result as string;
    };
    
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // JPEG olarak %80 kaliteyle sıkıştır
      const base64Data = canvas.toDataURL('image/jpeg', 0.8);
      
      setPreview(base64Data);
      setResult(null);
    };
    
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!preview) return;
    setAnalyzing(true);
    setResult(null);
    
    try {
      const response = await fetch('http://localhost:8000/ai/vision-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: user?.companyId || 'company_1',
          image_base64: preview
        })
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setResult('AI Analizi: \n\n' + data.analysis);
      } else {
        setResult('Analiz sırasında bir hata oluştu: ' + (data.detail || data.message || 'Bilinmeyen hata'));
      }
    } catch (error: any) {
      setResult('Sunucuya bağlanırken bir hata oluştu: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <Eye className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <h2 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Görüntü İşleme Analizi (Beta)</h2>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
              Beta
            </span>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border-2 border-dashed p-6 mt-4 text-center transition-all ${
        dragOver
          ? isDark ? 'border-emerald-500 bg-emerald-900/20' : 'border-emerald-400 bg-emerald-50'
          : isDark ? 'border-slate-600 bg-slate-700/20' : 'border-slate-200 bg-slate-50'
      }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        {preview ? (
          <div className="space-y-3">
            <div className={`rounded-xl p-2 ${isDark ? 'bg-slate-900/50' : 'bg-slate-100/50'}`}>
              <img src={preview} alt="Yüklenen görsel" className="w-full max-h-64 object-contain rounded-lg mx-auto" />
            </div>
            {analyzing ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                  <Cpu className="w-5 h-5 text-amber-500" />
                </motion.div>
                <span className="text-sm text-amber-600 font-medium">AI görseli analiz ediyor...</span>
              </div>
            ) : !result ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={analyzeImage}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Yapay Zeka ile Analiz Et
                </button>
                <button
                  onClick={() => { setPreview(null); setResult(null); }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Farklı Görsel Seç
                </button>
              </div>
            ) : null}
            
            {result && !analyzing && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-sm text-left ${isDark ? 'bg-emerald-900/30 text-emerald-100 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'}`}
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1" />
                  <div className="w-full min-w-0">
                    <ReactMarkdown
                      components={{
                        strong: ({node, ...props}) => <strong className={`font-bold ${isDark ? 'text-white' : 'text-emerald-950'}`} {...props} />,
                        h3: ({node, ...props}) => <h3 className={`text-base font-bold mt-3 mb-1 ${isDark ? 'text-white' : 'text-emerald-950'}`} {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li {...props} />
                      }}
                    >
                      {result}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
            
            {result && !analyzing && (
              <button
                onClick={() => { setPreview(null); setResult(null); }}
                className={`text-xs mt-2 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} transition-colors`}
              >
                Temizle ve yeni görsel yükle
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Görsel yükleyin veya sürükleyin
            </p>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PNG, JPG, WEBP desteklenir</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mx-auto transition-all ${
                isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Camera className="w-4 h-4" />
              Görsel Seç
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        )}
      </div>

      <div className={`mt-3 flex items-start gap-2 p-3 rounded-xl ${isDark ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-100'}`}>
        <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Aktif Özellik:</span> Multimodal Yapay Zeka ile bitki hastalık teşhisi ve raf ömrü tahmini. Yapılan analizler 'Uzman AI' sohbetine otomatik aktarılır.
        </p>
      </div>
    </Card>
  );
}

export function CalisanDashboard() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { data } = useIndustry();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(true);
  const [tasks, setTasks] = useState(data.employeeTasks.map(task => ({ ...task, taskStatus: task.status as TaskStatus })));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Firestore'dan gerçek zamanlı bildirimler
  useEffect(() => {
    if (!user?.companyId) return;

    const q = query(
      collection(db, 'notifications'),
      where('companyId', '==', user.companyId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      // Çalışana ait: kişisel + role yönelik bildirimler
      const mine = all.filter(n => {
        const nd = n as Notification & { userId?: string | null; targetRole?: string };
        return nd.userId === user.id || nd.targetRole === 'employee' || (!nd.userId && !nd.targetRole);
      });
      setNotifications(mine);
      setNotifLoading(false);
    });

    return () => unsub();
  }, [user?.companyId, user?.id]);

  const markAllRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskDone = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, taskStatus: 'done' as TaskStatus } : t));
  };

  const handleSubmitStock = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(true);
    setTimeout(() => {
      setUpdateSuccess(false);
      setSelectedProduct('');
      setQuantity('');
      setNote('');
    }, 2500);
  };

  const priorityLabel: Record<string, string> = {
    high: t('highPriority'),
    medium: t('mediumPriority'),
    low: t('lowPriority'),
  };

  const notifIcon = {
    order: ShoppingCart,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
  };
  const notifColor = {
    order: 'text-blue-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  const formatTime = (ts: { seconds: number } | null) => {
    if (!ts) return '';
    const d = new Date(ts.seconds * 1000);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
    return d.toLocaleDateString('tr-TR');
  };

  const pendingTasks = tasks.filter(t => t.taskStatus !== 'done');
  const doneTasks = tasks.filter(t => t.taskStatus === 'done');
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout title={t('tasks')}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Task Queue + Stock Update + Vision AI */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-slate-500" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('dailyTaskQueue')}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {pendingTasks.length} bekliyor
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-amber-600 font-medium">AI Öncelikli</span>
              </div>
            </div>

            {loading ? <SkeletonLoader rows={5} /> : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {pendingTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                        task.taskStatus === 'in-progress'
                          ? isDark ? 'border-emerald-700/50 bg-emerald-900/20' : 'border-emerald-200 bg-emerald-50'
                          : isDark ? 'border-slate-700 hover:border-slate-600 bg-slate-700/20' : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                      }`}
                    >
                      <button
                        onClick={() => handleTaskDone(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isDark ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500'}`}
                      >
                        <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sipariş {task.orderId}</span>
                          <Badge status={task.priority} label={priorityLabel[task.priority]} />
                        </div>
                        <div className={`text-sm font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{task.action}: {task.product}</div>
                        <div className="flex items-start gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{task.aiNote}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" />{task.deadline}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {doneTasks.length > 0 && (
                  <div className={`pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tamamlanan ({doneTasks.length})</div>
                    {doneTasks.map((task) => (
                      <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl mb-1 opacity-50 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className={`text-sm line-through ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{task.action}: {task.product}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Stock Update Form */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('quickStockUpdate')}</h2>
            </div>
            {loading ? <SkeletonLoader rows={3} /> : (
              <form onSubmit={handleSubmitStock} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('selectProduct')}</label>
                    <select
                      value={selectedProduct}
                      onChange={e => setSelectedProduct(e.target.value)}
                      required
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    >
                      <option value="">{t('selectProduct')}</option>
                      {stockItems.map(item => <option key={item.id} value={item.sku}>{item.name} ({item.sku})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('quantity')}</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      required
                      min="0"
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('note')}</label>
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Hasar bildirimi, düzeltme notu..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                  />
                </div>
                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${updateSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                  >
                    {updateSuccess ? <><CheckCircle2 className="w-4 h-4" />Güncellendi!</> : <><Package className="w-4 h-4" />{t('submitUpdate')}</>}
                  </motion.button>
                  <button
                    type="button"
                    className={`px-4 py-3 rounded-xl font-semibold text-sm border transition-all flex items-center gap-2 ${isDark ? 'border-red-700 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                  >
                    <AlertCircle className="w-4 h-4" />{t('reportDamaged')}
                  </button>
                </div>
              </form>
            )}
          </Card>

          <VisionAISection />
        </div>

        {/* Notifications — Firestore'dan gerçek zamanlı */}
        <div>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('internalNotifications')}</h2>
              <span className="flex items-center gap-1 text-xs text-emerald-500 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Canlı
              </span>
              {unreadCount > 0 && (
                <span
                  onClick={markAllRead}
                  className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 cursor-pointer hover:bg-red-200 transition-colors"
                >
                  {unreadCount} yeni
                </span>
              )}
            </div>
            {notifLoading ? <SkeletonLoader rows={4} /> : (
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className={`text-xs text-center py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Henüz bildirim yok.
                  </p>
                ) : (
                  notifications.slice(0, 8).map((notif, idx) => {
                    const Icon = notifIcon[notif.type] || Info;
                    const color = notifColor[notif.type] || 'text-blue-500';
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        onClick={() => !notif.read && markRead(notif.id)}
                        className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          !notif.read
                            ? isDark ? 'border-slate-600 bg-slate-700/40 hover:bg-slate-700/60' : 'border-slate-200 bg-white hover:bg-slate-50'
                            : isDark ? 'border-slate-700/50 bg-slate-800/30 opacity-60' : 'border-slate-100 bg-slate-50/50 opacity-60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{notif.title}</p>
                          <p className={`text-xs leading-relaxed mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{notif.message}</p>
                          <span className={`text-xs mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}