import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Search, Filter, Download, Sparkles, RefreshCw,
  CheckCircle, Loader2, Store,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';
import { useSME } from '../../contexts/SMEContext';
import { useIndustry } from '../../contexts/IndustryContext';
import api from '../../services/api';

const marketplaces = [
  { id: 'trendyol', name: 'Trendyol', color: 'bg-orange-500', logo: '🛍️' },
  { id: 'hepsiburada', name: 'Hepsiburada', color: 'bg-orange-600', logo: '🏪' },
  { id: 'n11', name: 'N11', color: 'bg-blue-600', logo: '🛒' },
];

type SyncState = 'idle' | 'syncing' | 'success' | 'error';

export function StokYonetimi() {
  const { isDark } = useTheme();
  const { theme } = useSME();
  const { data } = useIndustry();
  const stockItems = data.stockItems;
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStates, setSyncStates] = useState<Record<string, SyncState>>({});
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleMarketplaceSync = async (marketplaceId: string) => {
    setSyncStates(p => ({ ...p, [marketplaceId]: 'syncing' }));
    try {
      await api.post('/marketplace-sync', { marketplace: marketplaceId, items: selectedItems.length > 0 ? selectedItems : stockItems.map(i => i.id) });
    } catch {
      // simulated — always succeed
    }
    setTimeout(() => {
      setSyncStates(p => ({ ...p, [marketplaceId]: 'success' }));
      setTimeout(() => setSyncStates(p => ({ ...p, [marketplaceId]: 'idle' })), 3000);
    }, 2000);
  };

  const toggleSelect = (id: number) => {
    setSelectedItems(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  };

  const filteredStock = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusLabel: Record<string, string> = { critical: 'Kritik', normal: 'Normal', excess: 'Fazla' };
  const criticalCount = stockItems.filter(i => i.status === 'critical').length;
  const normalCount = stockItems.filter(i => i.status === 'normal').length;
  const excessCount = stockItems.filter(i => i.status === 'excess').length;

  return (
    <DashboardLayout title="Stok Yönetimi">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Kritik Stok', value: criticalCount, color: 'text-red-600', bg: isDark ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-100' },
              { label: 'Normal Stok', value: normalCount, color: 'text-emerald-600', bg: isDark ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-100' },
              { label: 'Fazla Stok', value: excessCount, color: 'text-amber-600', bg: isDark ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50 border-amber-100' },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Pazaryeri Gönder */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Pazaryerlerine Gönder</h2>
              {selectedItems.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme.primaryLight} ${theme.primaryText}`}>
                  {selectedItems.length} ürün seçili
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {marketplaces.map(m => {
                const state = syncStates[m.id] ?? 'idle';
                return (
                  <motion.button
                    key={m.id}
                    whileHover={{ scale: state === 'idle' ? 1.02 : 1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => state === 'idle' && handleMarketplaceSync(m.id)}
                    disabled={state === 'syncing'}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      state === 'success'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : state === 'syncing'
                          ? isDark ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-100 text-slate-400 border-slate-200'
                          : isDark ? 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {state === 'syncing' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : state === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-base">{m.logo}</span>
                    )}
                    <span>{state === 'success' ? 'Gönderildi!' : state === 'syncing' ? 'Gönderiliyor...' : m.name}</span>
                  </motion.button>
                );
              })}
            </div>
            <p className={`text-xs mt-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Ürün seçmeden göndermek tüm aktif stoku senkronize eder.
            </p>
          </Card>

          {/* Stock Table */}
          <Card padding={false}>
            <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-500" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Stok Kontrol Matrisi</h2>
                {selectedItems.length > 0 && (
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Seçimi temizle
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm ${
                  isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <Search className="w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none w-32 text-sm placeholder-slate-400"
                  />
                </div>
                <button className={`p-1.5 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  <Filter className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
                <button className={`p-1.5 rounded-xl ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  <Download className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
              </div>
            </div>
            {loading ? (
              <div className="p-5"><SkeletonLoader rows={6} /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b text-xs font-medium ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                      <th className="text-left px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === stockItems.length}
                          onChange={e => setSelectedItems(e.target.checked ? stockItems.map(i => i.id) : [])}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left px-3 py-3">Ürün Adı</th>
                      <th className="text-left px-3 py-3">SKU</th>
                      <th className="text-left px-3 py-3">Kategori</th>
                      <th className="text-right px-3 py-3">Fiyat</th>
                      <th className="text-right px-3 py-3">Mevcut Stok</th>
                      <th className="text-right px-3 py-3">AI Önerilen Sipariş</th>
                      <th className="text-center px-4 py-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.map((item, idx) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => toggleSelect(item.id)}
                        className={`border-b transition-colors cursor-pointer ${
                          selectedItems.includes(item.id)
                            ? isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-emerald-50/50 border-emerald-100'
                            : isDark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-50 hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded"
                          />
                        </td>
                        <td className={`px-3 py-3.5 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {item.name}
                        </td>
                        <td className={`px-3 py-3.5 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.sku}
                        </td>
                        <td className={`px-3 py-3.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.category}
                        </td>
                        <td className={`px-3 py-3.5 text-sm text-right font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          ₺{item.price.toLocaleString('tr-TR')}
                        </td>
                        <td className={`px-3 py-3.5 text-sm text-right font-semibold ${
                          item.status === 'critical' ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-800'
                        }`}>
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-right">
                          {item.aiRecommendedOrder > 0 ? (
                            <span className="flex items-center justify-end gap-1.5">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span className="font-semibold text-emerald-600">{item.aiRecommendedOrder} {item.unit}</span>
                            </span>
                          ) : (
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Badge status={item.status} label={statusLabel[item.status]} />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Stok Özeti</h3>
            </div>
            <div className="space-y-2">
              <div className={`flex justify-between text-xs py-2 border-b ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-600'}`}>
                <span>Toplam SKU</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stockItems.length}</span>
              </div>
              <div className={`flex justify-between text-xs py-2 border-b ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-600'}`}>
                <span>Toplam Değer</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  ₺{stockItems.reduce((acc, i) => acc + i.price * i.currentStock, 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className={`flex justify-between text-xs py-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>Son Güncelleme</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Bugün 09:30</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
