import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Star, MapPin, ShoppingBag } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';

const customers = [
  { id: 1, name: 'Fatma Yıldız', email: 'fatma@gmail.com', city: 'İzmir', orders: 12, totalSpent: 4890, vip: true },
  { id: 2, name: 'Ali Çelik', email: 'ali.celik@firma.com', city: 'İstanbul', orders: 8, totalSpent: 2340, vip: false },
  { id: 3, name: 'Zeynep Kara', email: 'zeynep.k@hotmail.com', city: 'Ankara', orders: 21, totalSpent: 9120, vip: true },
  { id: 4, name: 'Murat Yılmaz', email: 'myilmaz@yahoo.com', city: 'Bursa', orders: 5, totalSpent: 1560, vip: false },
  { id: 5, name: 'Elif Şahin', email: 'elif.sahin@gmail.com', city: 'Antalya', orders: 15, totalSpent: 6780, vip: true },
  { id: 6, name: 'Hasan Güneş', email: 'hgunes@firma.net', city: 'Konya', orders: 3, totalSpent: 890, vip: false },
  { id: 7, name: 'Ayşe Demir', email: 'ademir@posta.com', city: 'İzmir', orders: 9, totalSpent: 3450, vip: false },
  { id: 8, name: 'Kemal Arslan', email: 'k.arslan@email.com', city: 'İstanbul', orders: 18, totalSpent: 8230, vip: true },
];

export function Musteriler() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Müşteriler">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Müşteri', value: customers.length, color: 'text-slate-700' },
            { label: 'VIP Müşteri', value: customers.filter(c => c.vip).length, color: 'text-amber-600' },
            { label: 'Ortalama Sipariş', value: Math.round(customers.reduce((a, c) => a + c.orders, 0) / customers.length), color: 'text-emerald-600' },
            { label: 'Toplam Ciro (₺)', value: customers.reduce((a, c) => a + c.totalSpent, 0).toLocaleString('tr-TR'), color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
            </div>
          ))}
        </div>

        <Card padding={false}>
          <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Müşteri Listesi</h2>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200'}`}>
              <Search className="w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none w-36 text-sm placeholder-slate-400"
              />
            </div>
          </div>
          {loading ? <div className="p-5"><SkeletonLoader rows={6} /></div> : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map((customer, idx) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {customer.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{customer.name}</span>
                      {customer.vip && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{customer.email}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <MapPin className="w-3 h-3" />{customer.city}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <ShoppingBag className="w-3 h-3" />{customer.orders} sipariş
                  </div>
                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    ₺{customer.totalSpent.toLocaleString('tr-TR')}
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
