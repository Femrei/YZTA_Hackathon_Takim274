import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, Info, Check, ShoppingCart } from 'lucide-react';
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, writeBatch, orderBy,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';

interface Notification {
  id: string;
  companyId: string;
  userId: string | null;
  targetRole?: string;
  title: string;
  message: string;
  type: 'order' | 'warning' | 'info' | 'success';
  read: boolean;
  createdAt: { seconds: number } | null;
}

const typeConfig = {
  order:   { icon: ShoppingCart,  color: 'text-blue-500',    bg: (dark: boolean) => dark ? 'bg-blue-900/20 border-blue-800/30'       : 'bg-blue-50 border-blue-100'       },
  success: { icon: CheckCircle2,  color: 'text-emerald-500', bg: (dark: boolean) => dark ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-100' },
  warning: { icon: AlertTriangle, color: 'text-amber-500',   bg: (dark: boolean) => dark ? 'bg-amber-900/20 border-amber-800/30'     : 'bg-amber-50 border-amber-100'     },
  info:    { icon: Info,          color: 'text-blue-500',    bg: (dark: boolean) => dark ? 'bg-blue-900/20 border-blue-800/30'       : 'bg-blue-50 border-blue-100'       },
};

export function Bildirimler() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'warning' | 'info'>('all');

  useEffect(() => {
    if (!user?.companyId) return;

    const q = query(
      collection(db, 'notifications'),
      where('companyId', '==', user.companyId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      // Çalışana ait: kişisel bildirimler + role yönelik bildirimler
      const mine = all.filter(n =>
        n.userId === user.id ||
        n.targetRole === 'employee' ||
        (!n.userId && !n.targetRole)
      );
      setNotifications(mine);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.companyId, user?.id]);

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

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

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'order') return n.type === 'order';
    if (filter === 'warning') return n.type === 'warning';
    if (filter === 'info') return n.type === 'info';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (ts: { seconds: number } | null) => {
    if (!ts) return '';
    const d = new Date(ts.seconds * 1000);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
    return d.toLocaleDateString('tr-TR');
  };

  return (
    <DashboardLayout title="Bildirimler">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Toplam',   value: notifications.length,                                  color: 'bg-slate-600' },
            { label: 'Okunmadı', value: unreadCount,                                           color: 'bg-amber-600' },
            { label: 'Sipariş',  value: notifications.filter(n => n.type === 'order').length,  color: 'bg-blue-600'  },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color} mb-2`}>
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
            </div>
          ))}
        </div>

        <Card padding={false}>
          <div className={`flex flex-wrap items-center gap-3 p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Bildirimler</h2>
              {unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Canlı
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {(['all', 'unread', 'order', 'warning', 'info'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    filter === f
                      ? isDark ? 'bg-slate-600 text-white' : 'bg-slate-800 text-white'
                      : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {{ all: 'Tümü', unread: 'Okunmadı', order: 'Sipariş', warning: 'Uyarı', info: 'Bilgi' }[f]}
                </button>
              ))}
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isDark ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-5"><SkeletonLoader rows={5} /></div>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
              <AnimatePresence>
                {filtered.map((notif, idx) => {
                  const cfg = typeConfig[notif.type] || typeConfig.info;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => !notif.read && markRead(notif.id)}
                      className={`flex gap-4 p-5 cursor-pointer transition-colors ${
                        !notif.read
                          ? isDark ? 'bg-slate-700/40 hover:bg-slate-700/60' : 'bg-blue-50/50 hover:bg-blue-50'
                          : isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.bg(isDark)}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {notif.title}
                          </p>
                          <span className={`text-xs flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className={`text-center py-12 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {notifications.length === 0 ? 'Henüz bildirim yok.' : 'Bu filtrede bildirim bulunamadı.'}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}