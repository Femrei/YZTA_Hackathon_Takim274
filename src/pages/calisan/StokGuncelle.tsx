import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, AlertCircle, Save, RefreshCw } from 'lucide-react';
import {
  collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';

// Firestore'dan gelen ürün tipi
interface FSProduct {
  id: string;           // Firestore döküman ID'si
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  status: 'critical' | 'normal' | 'excess';
  companyId: string;
}

export function StokGuncelle() {
  const { isDark } = useTheme();
  const { user } = useAuth();

  // Firestore'dan gelen ürünler
  const [products, setProducts] = useState<FSProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Her satır için kullanıcının girdiği yeni miktar (ürün ID -> string)
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  // Her satır için not
  const [notes, setNotes] = useState<Record<string, string>>({});
  // Hangi satır kaydediliyor / kaydedildi
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  // Hata mesajı
  const [error, setError] = useState<string | null>(null);

  // Hasar bildirimi formu
  const [damageProduct, setDamageProduct] = useState('');
  const [damageQty, setDamageQty] = useState('');
  const [damageDesc, setDamageDesc] = useState('');
  const [damageSubmitting, setDamageSubmitting] = useState(false);
  const [damageDone, setDamageDone] = useState(false);

  // ─────────────────────────────────────────────
  // Firestore'dan ürünleri onSnapshot ile gerçek
  // zamanlı çek. Admin stok ekranında değişiklik
  // olunca burada da anında yansır.
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!user?.companyId) return;

    const q = query(
      collection(db, 'products'),
      where('companyId', '==', user.companyId)
    );

    // onSnapshot → anlık dinleyici (unsubscribe'ı return ediyoruz)
    const unsubscribe = onSnapshot(q, snap => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as FSProduct));
      setProducts(fetched);
      setLoading(false);

      // Başlangıç miktarlarını doldur — sadece henüz dokunulmamış satırlar için
      setQuantities(prev => {
        const updated = { ...prev };
        fetched.forEach(p => {
          if (!(p.id in updated)) {
            updated[p.id] = String(p.currentStock);
          }
        });
        return updated;
      });
    }, err => {
      console.error('Firestore onSnapshot hatası:', err);
      setError('Veriler yüklenemedi. Lütfen sayfayı yenileyin.');
      setLoading(false);
    });

    return unsubscribe; // component unmount olunca dinleyiciyi kapat
  }, [user?.companyId]);

  // ─────────────────────────────────────────────
  // Tek satır kaydet — updateDoc ile Firestore'a yaz
  // ─────────────────────────────────────────────
  const handleSaveRow = async (product: FSProduct) => {
    const newQty = parseInt(quantities[product.id] ?? String(product.currentStock), 10);

    if (isNaN(newQty) || newQty < 0) {
      setError('Lütfen geçerli bir miktar girin.');
      return;
    }
    setError(null);
    setSaving(p => ({ ...p, [product.id]: true }));

    try {
      // Yeni status hesapla
      let newStatus: FSProduct['status'] = 'normal';
      if (newQty <= product.minStockLevel) newStatus = 'critical';
      else if (newQty >= product.minStockLevel * 3) newStatus = 'excess';

      // Firestore dökümanını güncelle
      await updateDoc(doc(db, 'products', product.id), {
        currentStock: newQty,
        status: newStatus,
        lastUpdatedBy: user?.id ?? 'calisan',
        lastUpdatedByName: user?.name ?? '',
        lastUpdateNote: notes[product.id] ?? '',
        updatedAt: serverTimestamp(),
      });

      // Başarı animasyonu
      setSaved(p => ({ ...p, [product.id]: true }));
      setTimeout(() => setSaved(p => ({ ...p, [product.id]: false })), 2000);
    } catch (err) {
      console.error('updateDoc hatası:', err);
      setError('Kayıt sırasında hata oluştu. Tekrar deneyin.');
    } finally {
      setSaving(p => ({ ...p, [product.id]: false }));
    }
  };

  // ─────────────────────────────────────────────
  // Tümünü kaydet
  // ─────────────────────────────────────────────
  const handleSaveAll = async () => {
    const changed = products.filter(
      p => quantities[p.id] !== undefined && quantities[p.id] !== String(p.currentStock)
    );
    for (const p of changed) {
      await handleSaveRow(p);
    }
  };

  // ─────────────────────────────────────────────
  // Hasar bildir — products koleksiyonuna eksi kayıt
  // ─────────────────────────────────────────────
  const handleDamageReport = async () => {
    if (!damageProduct || !damageQty) {
      setError('Ürün ve miktar alanları zorunludur.');
      return;
    }
    setError(null);
    setDamageSubmitting(true);

    try {
      const product = products.find(p => p.id === damageProduct);
      if (!product) throw new Error('Ürün bulunamadı');

      const newStock = Math.max(0, product.currentStock - parseInt(damageQty, 10));
      let newStatus: FSProduct['status'] = 'normal';
      if (newStock <= product.minStockLevel) newStatus = 'critical';
      else if (newStock >= product.minStockLevel * 3) newStatus = 'excess';

      await updateDoc(doc(db, 'products', damageProduct), {
        currentStock: newStock,
        status: newStatus,
        lastUpdatedBy: user?.id ?? 'calisan',
        lastUpdateNote: `HASAR: ${damageDesc}`,
        updatedAt: serverTimestamp(),
      });

      setDamageDone(true);
      setDamageProduct('');
      setDamageQty('');
      setDamageDesc('');
      setTimeout(() => setDamageDone(false), 2500);
    } catch (err) {
      console.error('Hasar bildirimi hatası:', err);
      setError('Hasar bildirimi kaydedilemedi.');
    } finally {
      setDamageSubmitting(false);
    }
  };

  const hasChanges = products.some(
    p => quantities[p.id] !== undefined && quantities[p.id] !== String(p.currentStock)
  );

  return (
    <DashboardLayout title="Stok Güncelle">
      <div className="space-y-6">

        {/* Hata mesajı */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-500" />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Stok Miktarı Güncelle
              </h2>
              {/* Canlı göstergesi */}
              <span className="flex items-center gap-1 text-xs text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Canlı
              </span>
            </div>

            {hasChanges && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveAll}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all"
              >
                <Save className="w-4 h-4" /> Tümünü Kaydet
              </motion.button>
            )}
          </div>

          {loading ? <SkeletonLoader rows={6} /> : (
            <div className="space-y-3">
              {products.length === 0 && (
                <p className={`text-center py-8 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Henüz ürün eklenmemiş. Önce Firestore'a ürün seed'leyin.
                </p>
              )}
              {products.map((item, idx) => (
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
                  {/* Ürün bilgisi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {item.name}
                      </span>
                      {item.status === 'critical' && (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertCircle className="w-3 h-3" /> Kritik
                        </span>
                      )}
                    </div>
                    <div className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.sku} · {item.category}
                    </div>
                  </div>

                  {/* Güncelleme alanları */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Mevcut:{' '}
                      <span className={`font-semibold ${item.status === 'critical' ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-800'}`}>
                        {item.currentStock} {item.unit}
                      </span>
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

                    {/* Satır kaydet butonu */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSaveRow(item)}
                      disabled={saving[item.id]}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        saved[item.id]
                          ? 'bg-emerald-500 text-white'
                          : saving[item.id]
                          ? 'bg-slate-500 text-white cursor-not-allowed'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {saving[item.id] ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : saved[item.id] ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      {saved[item.id] ? 'Ok!' : saving[item.id] ? '...' : 'Kaydet'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Hasar Bildirimi */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Hasar Bildirimi</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Ürün</label>
              <select
                value={damageProduct}
                onChange={e => setDamageProduct(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
              >
                <option value="">Ürün seçin</option>
                {products.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Hasarlı Miktar</label>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={damageQty}
                onChange={e => setDamageQty(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Açıklama</label>
              <input
                type="text"
                placeholder="Hasar türünü açıklayın..."
                value={damageDesc}
                onChange={e => setDamageDesc(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleDamageReport}
              disabled={damageSubmitting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                damageDone
                  ? 'border-emerald-400 text-emerald-600 bg-emerald-50'
                  : 'border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              {damageDone ? (
                <><CheckCircle2 className="w-4 h-4" /> Bildirildi!</>
              ) : (
                <><AlertCircle className="w-4 h-4" /> {damageSubmitting ? 'Kaydediliyor...' : 'Hasar Bildir'}</>
              )}
            </button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}