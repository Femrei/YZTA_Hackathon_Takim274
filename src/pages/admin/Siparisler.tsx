import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, TrendingUp, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, orderBy,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';

interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  companyId: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: { seconds: number } | null;
}

const statusConfig = {
  pending:    { label: 'Bekliyor',      badge: 'normal' as const,    icon: Clock,       color: 'text-amber-500'   },
  processing: { label: 'İşleniyor',     badge: 'normal' as const,    icon: Clock,       color: 'text-amber-500'   },
  shipped:    { label: 'Kargoda',       badge: 'active' as const,    icon: Package,     color: 'text-blue-500'    },
  delivered:  { label: 'Teslim Edildi', badge: 'delivered' as const, icon: CheckCircle, color: 'text-emerald-500' },
  cancelled:  { label: 'İptal',         badge: 'critical' as const,  icon: XCircle,     color: 'text-red-500'     },
};

export function Siparisler() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!user?.companyId) return;
    const q = query(
      collection(db, 'orders'),
      where('companyId', '==', user.companyId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });
    return () => unsub();
  }, [user?.companyId]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (err) {
      console.error('Durum güncellenemedi:', err);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch =
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items?.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((a, o) => a + (o.totalAmount || 0), 0);

  const formatDate = (ts: { seconds: number } | null) => {
    if (!ts) return '—';
    return new Date(ts.seconds * 1000).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatItems = (items: OrderItem[]) => {
    if (!items?.length) return '—';
    return items.map(i => `${i.name} x${i.qty}`).join(', ');
  };

  return (
    <DashboardLayout title="Siparişler">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Sipariş', value: orders.length, icon: ShoppingCart, color: 'bg-slate-700' },
            { label: 'Teslim Edildi',  value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'bg-emerald-600' },
            { label: 'Kargoda',        value: orders.filter(o => o.status === 'shipped').length,   icon: Package,     color: 'bg-blue-600'    },
            { label: 'Toplam Gelir',   value: `₺${totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'bg-amber-600' },
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
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Canlı
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200'}`}>
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Müşteri / Sipariş Ara"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent outline-none w-40 text-sm placeholder-slate-400"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekliyor</option>
                <option value="processing">İşleniyor</option>
                <option value="shipped">Kargoda</option>
                <option value="delivered">Teslim Edildi</option>
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
                    <th className="text-left px-5 py-3">Sipariş ID</th>
                    <th className="text-left px-3 py-3">Müşteri</th>
                    <th className="text-left px-3 py-3">Ürünler</th>
                    <th className="text-left px-3 py-3">Tarih</th>
                    <th className="text-right px-3 py-3">Tutar</th>
                    <th className="text-center px-5 py-3">Durum</th>
                    <th className="text-center px-4 py-3">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, idx) => {
                    const cfg = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`border-b transition-colors ${isDark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-50 hover:bg-slate-50'}`}
                      >
                        <td className={`px-5 py-3.5 text-xs font-mono font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className={`px-3 py-3.5 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {order.customerName}
                        </td>
                        <td className={`px-3 py-3.5 text-xs max-w-48 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {formatItems(order.items)}
                        </td>
                        <td className={`px-3 py-3.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td className={`px-3 py-3.5 text-sm text-right font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          ₺{(order.totalAmount || 0).toLocaleString('tr-TR')}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <Badge status={cfg.badge} label={cfg.label} />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                            className={`text-xs px-2 py-1 rounded-lg border outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                          >
                            <option value="pending">Bekliyor</option>
                            <option value="processing">İşleniyor</option>
                            <option value="shipped">Kargoya Ver</option>
                            <option value="delivered">Teslim Et</option>
                            <option value="cancelled">İptal Et</option>
                          </select>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className={`text-center py-12 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {orders.length === 0 ? 'Henüz sipariş yok.' : 'Eşleşen sipariş bulunamadı.'}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}