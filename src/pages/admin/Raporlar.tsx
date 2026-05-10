import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';

const monthlyData = [
  { month: 'Ocak', revenue: 198000, orders: 112 },
  { month: 'Şubat', revenue: 221000, orders: 128 },
  { month: 'Mart', revenue: 245000, orders: 141 },
  { month: 'Nisan', revenue: 268000, orders: 156 },
  { month: 'Mayıs', revenue: 284500, orders: 147 },
];

const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

export function Raporlar() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout title="Raporlar & Analitik">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Bu Ay Gelir', value: '₺284.500', delta: '+12.4%', up: true },
            { label: 'Bu Ay Sipariş', value: '147', delta: '+8.2%', up: true },
            { label: 'Ortalama Sepet', value: '₺1.935', delta: '+3.7%', up: true },
            { label: 'Müşteri Memnuniyeti', value: '%94.2', delta: '+1.1%', up: true },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
              <div className={`text-xs mt-1 font-medium ${s.up ? 'text-emerald-600' : 'text-red-600'}`}>{s.delta}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-500" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Aylık Gelir</h2>
              </div>
              <button className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                <Download className="w-3 h-3" /> İndir
              </button>
            </div>
            {loading ? <SkeletonLoader rows={4} /> : (
              <div className="space-y-3">
                {monthlyData.map((d, idx) => (
                  <div key={d.month}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{d.month}</span>
                      <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>₺{d.revenue.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className={`h-7 rounded-xl overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-xl bg-gradient-to-r from-slate-600 to-slate-800 flex items-center justify-end pr-2"
                      >
                        <span className="text-white text-xs font-medium">{d.orders} sipariş</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Growth */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Büyüme Metrikleri</h2>
            </div>
            {loading ? <SkeletonLoader rows={5} /> : (
              <div className="space-y-4">
                {[
                  { label: 'Yeni Müşteri Edinimi', value: 23, target: 30, color: 'bg-emerald-500' },
                  { label: 'Tekrarlı Satış Oranı', value: 68, target: 100, color: 'bg-blue-500' },
                  { label: 'Stok Devir Hızı', value: 82, target: 100, color: 'bg-amber-500' },
                  { label: 'Zamanında Teslimat', value: 94.7, target: 100, color: 'bg-slate-700' },
                  { label: 'Müşteri Memnuniyeti', value: 94.2, target: 100, color: 'bg-teal-500' },
                ].map((metric, idx) => (
                  <div key={metric.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{metric.label}</span>
                      <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{metric.value}%</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.08, ease: 'easeOut' }}
                        className={`h-full rounded-full ${metric.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-slate-500" />
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Zamanlama Raporu</h2>
          </div>
          {loading ? <SkeletonLoader rows={3} /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b text-xs font-medium ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <th className="text-left px-4 py-3">Ay</th>
                    <th className="text-right px-4 py-3">Gelir</th>
                    <th className="text-right px-4 py-3">Sipariş</th>
                    <th className="text-right px-4 py-3">Büyüme</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((d, idx) => {
                    const prev = monthlyData[idx - 1];
                    const growth = prev ? (((d.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null;
                    return (
                      <tr key={d.month} className={`border-b transition-colors ${isDark ? 'border-slate-700/50 hover:bg-slate-700/20' : 'border-slate-50 hover:bg-slate-50'}`}>
                        <td className={`px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{d.month}</td>
                        <td className={`px-4 py-3 text-sm text-right font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>₺{d.revenue.toLocaleString('tr-TR')}</td>
                        <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{d.orders}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {growth ? <span className="text-emerald-600 font-medium">+{growth}%</span> : <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
