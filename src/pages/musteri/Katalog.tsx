import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Star, CheckCircle2, Filter, X, Loader2 } from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { useTheme } from '../../contexts/ThemeContext';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  image: string;
  rating: number;
  reviews: number;
  companyId: string;
  sku: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

export function Katalog() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');
  const [showCart, setShowCart] = useState(false);

  // Firestore'dan tüm ürünleri çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        const items = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Product))
        setProducts(items);
      } catch (err) {
        console.error('Ürünler yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['Tümü', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products
    .filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'Tümü' || p.category === activeCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const isInCart = (productId: string) => cart.some(i => i.product.id === productId);

  // Sipariş tamamla: şirket başına ayrı order + otomatik bildirimler
  const handleCompleteOrder = async () => {
    if (cart.length === 0 || !user) return;
    setOrdering(true);
    try {
      // Sepeti şirketlere göre grupla
      const byCompany: Record<string, CartItem[]> = {};
      for (const item of cart) {
        const cid = item.product.companyId;
        if (!byCompany[cid]) byCompany[cid] = [];
        byCompany[cid].push(item);
      }

      for (const [companyId, items] of Object.entries(byCompany)) {
        const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);

        // 1) Siparişi yaz
        const orderRef = await addDoc(collection(db, 'orders'), {
          companyId,
          customerId: user.id,
          customerName: user.name,
          items: items.map(i => ({
            productId: i.product.sku,
            name: i.product.name,
            qty: i.qty,
            price: i.product.price,
          })),
          totalAmount: total,
          status: 'pending',
          createdAt: serverTimestamp(),
        });

        // 2) Admin bildirimi
        await addDoc(collection(db, 'notifications'), {
          companyId,
          userId: null,
          targetRole: 'admin',
          title: 'Yeni sipariş geldi',
          message: `${user.name} — ${items.map(i => `${i.qty}x ${i.product.name}`).join(', ')}`,
          type: 'order',
          orderId: orderRef.id,
          read: false,
          createdAt: serverTimestamp(),
        });

        // 3) Çalışan bildirimi
        await addDoc(collection(db, 'notifications'), {
          companyId,
          userId: null,
          targetRole: 'employee',
          title: 'Yeni sipariş hazırlanacak',
          message: `${user.name} siparişi: ${items.map(i => `${i.qty}x ${i.product.name}`).join(', ')}`,
          type: 'order',
          orderId: orderRef.id,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setCart([]);
      setShowCart(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3500);
    } catch (err) {
      console.error('Sipariş hatası:', err);
    } finally {
      setOrdering(false);
    }
  };

  return (
    <DashboardLayout title="Ürün Kataloğu">
      <div className="space-y-5">

        {/* Başarı mesajı */}
        <AnimatePresence>
          {orderSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Siparişiniz alındı! Çalışan ve yönetici bilgilendirildi.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border flex-1 min-w-48 ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200'
          }`}>
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Ürün veya kategori ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm placeholder-slate-400"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className={`px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            <option value="default">Varsayılan Sıralama</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="rating">En Yüksek Puan</option>
          </select>
          {cart.length > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              Sepet ({cart.reduce((s, i) => s + i.qty, 0)})
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? isDark ? 'bg-slate-600 text-white' : 'bg-slate-800 text-white'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <Card><SkeletonLoader rows={6} /></Card>
        ) : (
          <>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filtered.length} ürün gösteriliyor
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-2xl border overflow-hidden group flex flex-col ${
                    isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-full">Stokta Yok</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{product.category}</div>
                    <div className={`text-sm font-semibold mb-2 leading-tight flex-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {product.name}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {product.rating} ({product.reviews} değerlendirme)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        ₺{product.price.toLocaleString('tr-TR')}
                      </span>
                      {product.inStock ? (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => addToCart(product)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isInCart(product.id)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          {isInCart(product.id) ? (
                            <><CheckCircle2 className="w-3 h-3" /> Sepette</>
                          ) : (
                            <><ShoppingCart className="w-3 h-3" /> Ekle</>
                          )}
                        </motion.button>
                      ) : (
                        <span className={`text-xs px-3 py-1.5 rounded-xl ${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                          Stokta Yok
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Eşleşen ürün bulunamadı.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col shadow-2xl ${
                isDark ? 'bg-slate-900' : 'bg-white'
              }`}
            >
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-800'}`} />
                  <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Sepetim</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    {cart.reduce((s, i) => s + i.qty, 0)}
                  </span>
                </div>
                <button onClick={() => setShowCart(false)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(({ product, qty }) => (
                  <div key={product.id} className={`flex gap-3 p-3 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50'}`}>
                    <img src={product.image} alt={product.name} className="w-16 h-14 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{product.name}</div>
                      <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Adet: {qty}</div>
                      <div className={`text-sm font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        ₺{(product.price * qty).toLocaleString('tr-TR')}
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className={`p-1 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className={`p-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Toplam</span>
                  <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    ₺{cartTotal.toLocaleString('tr-TR')}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompleteOrder}
                  disabled={ordering}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {ordering ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> İşleniyor...</>
                  ) : (
                    'Siparişi Tamamla'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}