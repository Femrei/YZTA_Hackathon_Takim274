import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, User, Bell, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

type Tab = 'address' | 'payment' | 'profile' | 'notifications';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profilim', icon: User },
  { key: 'address', label: 'Adreslerim', icon: MapPin },
  { key: 'payment', label: 'Ödeme', icon: CreditCard },
  { key: 'notifications', label: 'Bildirimler', icon: Bell },
];

interface Address {
  id: number;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  const { isDark } = useTheme();
  return (
    <div>
      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
          isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
        }`}
      />
    </div>
  );
}

export function AyarlarMusteri() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || 'Fatma Yıldız',
    email: user?.email || 'fatma.yildiz@gmail.com',
    phone: '+90 532 444 55 66',
  });

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      title: 'Ev',
      fullName: 'Fatma Yıldız',
      phone: '+90 532 444 55 66',
      address: 'Atatürk Mah. Cumhuriyet Cad. No:45 Daire:8',
      city: 'İstanbul / Kadıköy',
      isDefault: true,
    },
    {
      id: 2,
      title: 'İş',
      fullName: 'Fatma Yıldız',
      phone: '+90 532 444 55 66',
      address: 'Levent İş Merkezi A Blok No:12',
      city: 'İstanbul / Beşiktaş',
      isDefault: false,
    },
  ]);

  const [notifs, setNotifs] = useState({
    orderStatus: true,
    shipmentUpdates: true,
    promotions: false,
    aiSuggestions: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setDefault = (id: number) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const deleteAddress = (id: number) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const SaveButton = ({ label = 'Kaydet' }: { label?: string }) => (
    <div className="flex justify-end mt-6">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          saved ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        {saved ? <><CheckCircle className="w-4 h-4" /> Kaydedildi</> : <><Save className="w-4 h-4" /> {label}</>}
      </motion.button>
    </div>
  );

  return (
    <DashboardLayout title="Hesap & Ayarlar">
      <div className="space-y-6">
        {/* Tab Nav */}
        <div className={`flex gap-1 p-1 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-1 justify-center transition-all ${
                  active
                    ? isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{profile.name}</h2>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{profile.email}</div>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    Müşteri
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Ad Soyad" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                <Field label="E-posta" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} type="email" />
                <Field label="Telefon" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} />
              </div>
              <SaveButton label="Profili Güncelle" />
            </Card>
          </motion.div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {addresses.map(addr => (
              <Card key={addr.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{addr.title}</span>
                      {addr.isDefault && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                          Varsayılan
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefault(addr.id)}
                        className={`text-xs px-3 py-1 rounded-lg border transition-colors ${isDark ? 'border-slate-600 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-700'}`}
                      >
                        Varsayılan Yap
                      </button>
                    )}
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{addr.fullName}</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{addr.address}</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{addr.city}</div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{addr.phone}</div>
              </Card>
            ))}

            <button className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-colors text-sm font-medium ${
              isDark ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
            }`}>
              <Plus className="w-4 h-4" /> Yeni Adres Ekle
            </button>
          </motion.div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Kayıtlı Kartlar</h2>
              <div className="space-y-3">
                {[
                  { brand: 'Mastercard', last4: '4521', expiry: '09/27', isDefault: true },
                  { brand: 'Visa', last4: '8834', expiry: '03/26', isDefault: false },
                ].map((card, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    card.isDefault
                      ? isDark ? 'border-emerald-700/50 bg-emerald-900/20' : 'border-emerald-200 bg-emerald-50'
                      : isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-100 bg-slate-50'
                  }`}>
                    <div className={`w-12 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isDark ? 'bg-slate-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                      {card.brand.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {card.brand} •••• {card.last4}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Son kullanma: {card.expiry}</div>
                    </div>
                    {card.isDefault && (
                      <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                        Varsayılan
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <button className={`w-full mt-3 flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed transition-colors text-sm font-medium ${
                isDark ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
              }`}>
                <Plus className="w-4 h-4" /> Yeni Kart Ekle
              </button>
            </Card>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <h2 className={`font-semibold mb-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Bildirim Tercihleri</h2>
              <div className="space-y-3">
                {[
                  { key: 'orderStatus', label: 'Sipariş Durumu', desc: 'Sipariş durumu değiştiğinde bildir' },
                  { key: 'shipmentUpdates', label: 'Kargo Takibi', desc: 'Kargo konumu ve teslimat bildirimleri' },
                  { key: 'promotions', label: 'Kampanyalar', desc: 'İndirim ve özel fırsatlar' },
                  { key: 'aiSuggestions', label: 'AI Önerileri', desc: 'Sana özel ürün önerileri' },
                ].map(item => (
                  <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-100 bg-slate-50'}`}>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.label}</div>
                      <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifs] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                        notifs[item.key as keyof typeof notifs] ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        notifs[item.key as keyof typeof notifs] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
              <SaveButton label="Tercihleri Kaydet" />
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
