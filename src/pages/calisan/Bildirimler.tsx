import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, Info, Check } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';
import { useIndustry } from '../../contexts/IndustryContext';

export function Bildirimler() {
  const { isDark } = useTheme();
  const { data } = useIndustry();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(data.employeeNotifications.map(n => ({ ...n })));
  const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'warning' | 'info'>('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'success') return n.type === 'success';
    if (filter === 'warning') return n.type === 'warning';
    if (filter === 'info') return n.type === 'info';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeConfig = {
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: isDark ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-100' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: isDark ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50 border-amber-100' },
    info: { icon: Info, color: 'text-blue-500', bg: isDark ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-100' },
  };

  return (
    <DashboardLayout title="Bildirimler">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="text-2xl font-bold text-red-500">{unreadCount}</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Okunmamış</div>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="text-2xl font-bold text-amber-500">{notifications.filter(n => n.type === 'warning').length}</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Uyarı</div>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className="text-2xl font-bold text-emerald-500">{notifications.filter(n => n.type === 'success').length}</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Başarılı</div>
          </div>
        </div>

        <Card padding={false}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Bildirim Merkezi</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">{unreadCount} yeni</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-colors ${
                    isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" /> Tümünü Okundu İşaretle
                </button>
              )}
            </div>
          </div>

          {/* Filter chips */}
          <div className={`flex gap-2 px-5 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            {([['all', 'Tümü'], ['unread', 'Okunmamış'], ['warning', 'Uyarılar'], ['success', 'Başarı'], ['info', 'Bilgi']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  filter === val
                    ? isDark ? 'bg-slate-600 text-white' : 'bg-slate-800 text-white'
                    : isDark ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading ? (
              <div className="p-5"><SkeletonLoader rows={4} /></div>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((notif, idx) => {
                  const cfg = typeConfig[notif.type];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => markRead(notif.id)}
                      className={`flex gap-4 px-5 py-4 cursor-pointer transition-colors ${
                        !notif.read
                          ? isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                          : isDark ? 'opacity-50 hover:opacity-70' : 'opacity-50 hover:opacity-70'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.bg}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{notif.message}</p>
                        <span className={`text-xs mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{notif.time}</span>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            {!loading && filtered.length === 0 && (
              <div className={`text-center py-12 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Bildirim bulunamadı.
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
