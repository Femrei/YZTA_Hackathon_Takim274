import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, AlertTriangle, RefreshCw, MapPin, Clock } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';
import { useIndustry } from '../../contexts/IndustryContext';

export function Lojistik() {
  const { isDark } = useTheme();
  const { data } = useIndustry();
  const shipments = data.shipments;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  const statusLabel: Record<string, string> = { active: 'Aktif', delayed: 'Geciken', delivered: 'Teslim' };

  const stats = [
    { label: 'Aktif Sevkiyat', value: shipments.filter(s => s.status === 'active').length, color: 'text-blue-600' },
    { label: 'Geciken', value: shipments.filter(s => s.status === 'delayed').length, color: 'text-red-600' },
    { label: 'Teslim Edildi', value: shipments.filter(s => s.status === 'delivered').length, color: 'text-emerald-600' },
  ];

  return (
    <DashboardLayout title="Lojistik Takibi">
      <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {stats.map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
              </div>
            ))}
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-slate-500" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Aktif Sevkiyatlar</h2>
              </div>
              <button className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                <RefreshCw className="w-3 h-3" />
                Yenile
              </button>
            </div>
            {loading ? <SkeletonLoader rows={5} /> : (
              <div className="space-y-3">
                {shipments.map((shipment, idx) => (
                  <motion.div
                    key={shipment.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className={`p-4 rounded-xl border transition-colors ${
                      shipment.status === 'delayed'
                        ? isDark ? 'border-red-700/40 bg-red-900/10' : 'border-red-100 bg-red-50/50'
                        : isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>{shipment.id}</span>
                          <Badge status={shipment.status} label={statusLabel[shipment.status]} />
                        </div>
                        <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{shipment.product}</div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} justify-end mb-1`}>
                          <MapPin className="w-3 h-3" /> {shipment.destination}
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} justify-end`}>
                          <Clock className="w-3 h-3" /> ETA: {shipment.eta}
                        </div>
                      </div>
                    </div>

                    {shipment.aiReason && (
                      <div className="flex items-start gap-1.5 mb-3">
                        <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-red-500">{shipment.aiReason}</span>
                      </div>
                    )}

                    <div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${shipment.progress}%` }}
                          transition={{ duration: 1, delay: idx * 0.1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            shipment.status === 'delivered' ? 'bg-emerald-500' :
                            shipment.status === 'delayed' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{shipment.carrier}</span>
                        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{shipment.progress}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
      </div>
    </DashboardLayout>
  );
}
