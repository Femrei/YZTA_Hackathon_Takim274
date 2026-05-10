import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';
import { useIndustry } from '../../contexts/IndustryContext';

export function StokGuncelle() {
  const { isDark } = useTheme();
  const { data } = useIndustry();
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [globalSuccess, setGlobalSuccess] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      const initial: Record<number, string> = {};
      data.stockItems.forEach(i => { initial[i.id] = String(i.currentStock); });
      setQuantities(initial);
    }, 900);
    return () => clearTimeout(t);
  }, [data]);

  const handleSaveRow = (id: number) => {
    setSaved(p => ({ ...p, [id]: true }));
    setTimeout(() => setSaved(p => ({ ...p, [id]: false })), 2000);
  };

  const handleSaveAll = () => {
    setGlobalSuccess(true);
    setTimeout(() => setGlobalSuccess(false), 2500);
  };

  const hasChanges = data.stockItems.some(item => quantities[item.id] !== String(item.currentStock));

  return (
    <DashboardLayout title="Stok Güncelle">
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Stok Miktarı Güncelle</h2>
            </div>
            {hasChanges && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveAll}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  globalSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {globalSuccess ? <><CheckCircle2 className="w-4 h-4" /> Kaydedildi!</> : <><Save className="w-4 h-4" /> Tümünü Kaydet</>}
              </motion.button>
            )}
          </div>

          {loading ? <SkeletonLoader rows={6} /> : (
            <div className="space-y-3">
              {data.stockItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border ${
                    item.status === 'critical'
                      ? isDark ? 'border-red-800/40 bg-red-900/10' : 'border-red-100 bg-red-50/50'
                      : isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-100 bg-slate-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name}</span>
                      {item.status === 'critical' && (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertCircle className="w-3 h-3" /> Kritik
                        </span>
                      )}
                    </div>
                    <div className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.sku} · {item.category}</div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Mevcut: <span className={`font-semibold ${item.status === 'critical' ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-800'}`}>{item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <label className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Yeni:</label>
                      <input
                        type="number"
                        min="0"
                        value={quantities[item.id] ?? item.currentStock}
                        onChange={e => setQuantities(p => ({ ...p, [item.id]: e.target.value }))}
                        className={`w-20 px-2.5 py-1.5 rounded-xl border text-sm text-center outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                          isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.unit}</span>
                    </div>
                    <input
                      type="text"
                      value={notes[item.id] ?? ''}
                      onChange={e => setNotes(p => ({ ...p, [item.id]: e.target.value }))}
                      placeholder="Not (opsiyonel)"
                      className={`hidden sm:block w-32 px-2.5 py-1.5 rounded-xl border text-xs outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
                      }`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSaveRow(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        saved[item.id] ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {saved[item.id] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                      {saved[item.id] ? 'Ok' : 'Kaydet'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Hasar Bildirimi</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ürün</label>
              <select className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <option value="">Ürün seçin</option>
                {data.stockItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Miktar</label>
              <input type="number" min="1" placeholder="0" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`} />
            </div>
            <div className="sm:col-span-2">
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Açıklama</label>
              <input type="text" placeholder="Hasar türünü açıklayın..." className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-all">
              <AlertCircle className="w-4 h-4" /> Hasar Bildir
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
