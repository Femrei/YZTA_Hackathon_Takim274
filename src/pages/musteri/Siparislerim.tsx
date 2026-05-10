import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, Search, Eye, MapPin, XCircle, ShoppingBag } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';

interface Order {
  id: string;
  product: string;
  date: string;
  total: number;
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  carrier?: string;
  trackingNo?: string;
  estimatedDelivery?: string;
}

const myOrders: Order[] = [
  { id: '#NX-2847', product: 'Ege Sızma Zeytinyağı x5', date: '8 Mayıs 2026', total: 949.50, status: 'shipped', carrier: 'Aras Kargo', trackingNo: 'AK987654321', estimatedDelivery: 'Yarın 14:00' },
  { id: '#NX-2831', product: 'Organik Doğal Bal x2', date: '2 Mayıs 2026', total: 240.00, status: 'delivered', carrier: 'Yurtiçi Kargo', trackingNo: 'YK123456789' },
  { id: '#NX-2819', product: 'Türk Bademli Lokum x3', date: '25 Nisan 2026', total: 135.00, status: 'delivered', carrier: 'PTT Kargo', trackingNo: 'PT456789012' },
  { id: '#NX-2808', product: 'Organik Domates Salçası x5', date: '18 Nisan 2026', total: 172.50, status: 'delivered' },
  { id: '#NX-2795', product: 'Anatolian Kilim 2x3m', date: '10 Nisan 2026', total: 7800.00, status: 'cancelled' },
];

const statusConfig = {
  delivered: { label: 'Teslim Edildi', badge: 'delivered' as const, icon: CheckCircle, color: 'text-emerald-500' },
  shipped: { label: 'Kargoda', badge: 'active' as const, icon: Truck, color: 'text-blue-500' },
  processing: { label: 'Hazırlanıyor', badge: 'normal' as const, icon: Clock, color: 'text-amber-500' },
  cancelled: { label: 'İptal Edildi', badge: 'critical' as const, icon: XCircle, color: 'text-red-500' },
};

export function Siparislerim() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = myOrders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const totalSpent = myOrders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + o.total, 0);

  return (
    <DashboardLayout title="Siparişlerim">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Sipariş', value: myOrders.length, icon: ShoppingBag, color: 'bg-slate-700' },
            { label: 'Teslim Edildi', value: myOrders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'bg-emerald-600' },
            { label: 'Kargoda', value: myOrders.filter(o => o.status === 'shipped').length, icon: Truck, color: 'bg-blue-600' },
            { label: 'Toplam Harcama', value: `₺${totalSpent.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`, icon: Package, color: 'bg-amber-600' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Active order */}
        {myOrders.find(o => o.status === 'shipped') && (
          <div className={`rounded-2xl border p-5 ${isDark ? 'bg-blue-900/20 border-blue-700/40' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Aktif Kargo: {myOrders.find(o => o.status === 'shipped')?.id}</div>
                <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{myOrders.find(o => o.status === 'shipped')?.product}</div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    <MapPin className="w-3 h-3" /> Tahmini teslimat: {myOrders.find(o => o.status === 'shipped')?.estimatedDelivery}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Takip No: {myOrders.find(o => o.status === 'shipped')?.trackingNo}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card padding={false}>
          <div className={`flex flex-wrap items-center gap-3 p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Sipariş Geçmişi</h2>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200'}`}>
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input type="text" placeholder="Sipariş ara" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none w-32 text-sm placeholder-slate-400" />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <option value="all">Tümü</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="shipped">Kargoda</option>
                <option value="processing">Hazırlanıyor</option>
                <option value="cancelled">İptal</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-5"><SkeletonLoader rows={5} /></div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map((order, idx) => {
                const cfg = statusConfig[order.status];
                const StatusIcon = cfg.icon;
                const isExpanded = expanded === order.id;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className={`px-5 py-4 transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          order.status === 'delivered' ? 'bg-emerald-100' :
                          order.status === 'shipped' ? 'bg-blue-100' :
                          order.status === 'cancelled' ? 'bg-red-100' : 'bg-amber-100'
                        }`}>
                          <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-sm font-mono font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.id}</span>
                            <Badge status={cfg.badge} label={cfg.label} />
                          </div>
                          <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{order.product}</div>
                          <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{order.date}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>₺{order.total.toLocaleString('tr-TR')}</div>
                          <button
                            onClick={() => setExpanded(isExpanded ? null : order.id)}
                            className={`flex items-center gap-1 text-xs mt-1 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                          >
                            <Eye className="w-3 h-3" /> Detay
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            {order.carrier && (
                              <div>
                                <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>Kargo Firması</div>
                                <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{order.carrier}</div>
                              </div>
                            )}
                            {order.trackingNo && (
                              <div>
                                <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>Takip No</div>
                                <div className={`font-medium font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{order.trackingNo}</div>
                              </div>
                            )}
                            {order.estimatedDelivery && (
                              <div>
                                <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>Tahmini Teslimat</div>
                                <div className="font-medium text-emerald-600">{order.estimatedDelivery}</div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
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
