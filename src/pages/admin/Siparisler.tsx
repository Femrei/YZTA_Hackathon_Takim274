import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Eye, TrendingUp, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';
import { useSME } from '../../contexts/SMEContext';
import { useAuth } from '../../contexts/AuthContext';

const baseOrders = [
  { id: '#NX-2847', customer: 'Fatma Yıldız', product: 'Ege Sızma Zeytinyağı x5', total: 949.50, status: 'delivered' as const, date: '8 Mayıs 2026', industry: 'agriculture' },
  { id: '#NX-2846', customer: 'Ali Çelik', product: 'Organik Domates Salçası x10', total: 345.00, status: 'shipped' as const, date: '8 Mayıs 2026', industry: 'agriculture' },
  { id: '#NX-2845', customer: 'Zeynep Kara', product: 'Organik Doğal Bal x3', total: 360.00, status: 'processing' as const, date: '7 Mayıs 2026', industry: 'agriculture' },
  { id: '#NX-2844', customer: 'Murat Yılmaz', product: 'Anatolian Kilim 2x3m', total: 7800.00, status: 'cancelled' as const, date: '7 Mayıs 2026', industry: 'agriculture' },
  { id: '#NX-2843', customer: 'Elif Şahin', product: 'Ahşap El Oyması Sehpa x1', total: 2450.00, status: 'delivered' as const, date: '6 Mayıs 2026', industry: 'handcraft' },
  { id: '#NX-2842', customer: 'Hasan Güneş', product: 'Kapadokya Çömlek Seti x2', total: 1780.00, status: 'shipped' as const, date: '6 Mayıs 2026', industry: 'handcraft' },
  { id: '#NX-2841', customer: 'Kemal Arslan', product: 'Bakır El İşi Tabak Seti x1', total: 560.00, status: 'processing' as const, date: '5 Mayıs 2026', industry: 'handcraft' },
  { id: '#NX-2840', customer: 'Selin Aktaş', product: 'Yazılım Lisansı - Yıllık', total: 12000.00, status: 'delivered' as const, date: '5 Mayıs 2026', industry: 'technology' },
  { id: '#NX-2839', customer: 'Can Özdemir', product: 'SaaS Plan Yükseltme', total: 4500.00, status: 'delivered' as const, date: '4 Mayıs 2026', industry: 'technology' },
  { id: '#NX-2838', customer: 'Deniz Yurt', product: 'API Entegrasyon Paketi', total: 8200.00, status: 'shipped' as const, date: '4 Mayıs 2026', industry: 'technology' },
];

const orderStatusConfig = {
  delivered: { label: 'Teslim Edildi', badge: 'delivered' as const, icon: CheckCircle, color: 'text-emerald-500' },
  shipped: { label: 'Kargoda', badge: 'active' as const, icon: Package, color: 'text-blue-500' },
  processing: { label: 'İşleniyor', badge: 'normal' as const, icon: Clock, color: 'text-amber-500' },
  cancelled: { label: 'İptal', badge: 'critical' as const, icon: XCircle, color: 'text-red-500' },
};

export function Siparisler() {
  const { isDark } = useTheme();
  const { smeType } = useSME();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const industryOrders = user?.industryType === 'general'
    ? baseOrders
    : baseOrders.filter(o => o.industry === (user?.industryType ?? smeType));

  const filtered = industryOrders.filter(o => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = industryOrders.filter(o => o.status === 'delivered').reduce((a, o) => a + o.total, 0);

  return (
    <DashboardLayout title="Siparişler">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Sipariş', value: industryOrders.length, icon: ShoppingCart, color: 'bg-slate-700' },
            { label: 'Teslim Edildi', value: industryOrders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'bg-emerald-600' },
            { label: 'Kargoda', value: industryOrders.filter(o => o.status === 'shipped').length, icon: Package, color: 'bg-blue-600' },
            { label: 'Toplam Gelir', value: `₺${totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'bg-amber-600' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
              </div>
            );
          })}
        </div>

        <Card padding={false}>
          <div className={`flex flex-wrap items-center gap-3 p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Sipariş Listesi</h2>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200'}`}>
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Müşteri / Sipariş Ara" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none w-40 text-sm placeholder-slate-400" />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="shipped">Kargoda</option>
                <option value="processing">İşleniyor</option>
                <option value="cancelled">İptal</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-5"><SkeletonLoader rows={6} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b text-xs font-medium ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <th className="text-left px-5 py-3">Sipariş No</th>
                    <th className="text-left px-3 py-3">Müşteri</th>
                    <th className="text-left px-3 py-3">Ürün</th>
                    <th className="text-left px-3 py-3">Tarih</th>
                    <th className="text-right px-3 py-3">Tutar</th>
                    <th className="text-center px-5 py-3">Durum</th>
                    <th className="text-center px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, idx) => {
                    const cfg = orderStatusConfig[order.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`border-b transition-colors ${isDark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-50 hover:bg-slate-50'}`}
                      >
                        <td className={`px-5 py-3.5 text-sm font-mono font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.id}</td>
                        <td className={`px-3 py-3.5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{order.customer}</td>
                        <td className={`px-3 py-3.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{order.product}</td>
                        <td className={`px-3 py-3.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{order.date}</td>
                        <td className={`px-3 py-3.5 text-sm text-right font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>₺{order.total.toLocaleString('tr-TR')}</td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge status={cfg.badge} label={cfg.label} />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className={`text-center py-12 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Eşleşen sipariş bulunamadı.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
