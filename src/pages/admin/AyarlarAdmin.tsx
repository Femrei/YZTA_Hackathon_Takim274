import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, MapPin, Globe, Save, CheckCircle, User, Shield, Bell, CreditCard } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSME } from '../../contexts/SMEContext';

type SettingsTab = 'company' | 'profile' | 'notifications' | 'billing';

const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
  { key: 'company', label: 'Şirket Profili', icon: Building2 },
  { key: 'profile', label: 'Hesap Bilgileri', icon: User },
  { key: 'notifications', label: 'Bildirimler', icon: Bell },
  { key: 'billing', label: 'Plan & Ödeme', icon: CreditCard },
];

function InputField({ label, value, onChange, type = 'text', placeholder }: {
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

export function AyarlarAdmin() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { smeConfig, theme } = useSME();
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [saved, setSaved] = useState(false);

  const [company, setCompany] = useState({
    name: user?.companyName || smeConfig.name,
    ownerName: smeConfig.ownerName,
    email: user?.email || '',
    phone: '+90 232 555 01 23',
    address: 'Kemalpaşa Cad. No:12, Bornova',
    city: smeConfig.region,
    website: 'www.egekooperatif.com.tr',
    taxId: '1234567890',
  });

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const [notifications, setNotifications] = useState({
    stockAlerts: true,
    orderUpdates: true,
    shipmentAlerts: true,
    aiInsights: true,
    weeklyReport: false,
    marketplaceSync: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const planFeatures = ['Sınırsız sipariş', 'AI öngörü motoru', 'Pazaryeri entegrasyonu (3)', 'Öncelikli teknik destek', 'Özel raporlama'];

  return (
    <DashboardLayout title="Ayarlar">
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

        {/* Company Profile Tab */}
        {activeTab === 'company' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.primary}`}>
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{company.name}</h2>
                  <div className={`text-sm flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="text-sm">{theme.icon}</span>
                    <span>{theme.label}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Şirket / Kooperatif Adı" value={company.name} onChange={v => setCompany(p => ({ ...p, name: v }))} />
                <InputField label="Yetkili Kişi" value={company.ownerName} onChange={v => setCompany(p => ({ ...p, ownerName: v }))} />
                <InputField label="E-posta Adresi" value={company.email} onChange={v => setCompany(p => ({ ...p, email: v }))} type="email" icon={Mail} />
                <InputField label="Telefon" value={company.phone} onChange={v => setCompany(p => ({ ...p, phone: v }))} type="tel" />
                <div className="md:col-span-2">
                  <InputField label="Adres" value={company.address} onChange={v => setCompany(p => ({ ...p, address: v }))} />
                </div>
                <InputField label="Şehir / İl" value={company.city} onChange={v => setCompany(p => ({ ...p, city: v }))} />
                <InputField label="Web Sitesi" value={company.website} onChange={v => setCompany(p => ({ ...p, website: v }))} />
                <InputField label="Vergi Kimlik No" value={company.taxId} onChange={v => setCompany(p => ({ ...p, taxId: v }))} />
              </div>

              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    saved ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {saved ? <><CheckCircle className="w-4 h-4" /> Kaydedildi</> : <><Save className="w-4 h-4" /> Değişiklikleri Kaydet</>}
                </motion.button>
              </div>
            </Card>

            <Card>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>İletişim Bilgileri</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Mail, label: 'E-posta', value: company.email },
                  { icon: Phone, label: 'Telefon', value: company.phone },
                  { icon: MapPin, label: 'Konum', value: `${company.city}, Türkiye` },
                  { icon: Globe, label: 'Web', value: company.website },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</div>
                        <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-700'}`}>{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${theme.primary}`}>
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{profile.name}</h2>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{profile.email}</div>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                    <Shield className="w-3 h-3" /> Yönetici
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Ad Soyad" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                <InputField label="E-posta" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} type="email" />
              </div>
              <div className={`my-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />
              <h3 className={`font-semibold mb-4 text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>Şifre Değiştir</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Mevcut Şifre" value={profile.currentPassword} onChange={v => setProfile(p => ({ ...p, currentPassword: v }))} type="password" placeholder="••••••••" />
                <InputField label="Yeni Şifre" value={profile.newPassword} onChange={v => setProfile(p => ({ ...p, newPassword: v }))} type="password" placeholder="••••••••" />
              </div>
              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    saved ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {saved ? <><CheckCircle className="w-4 h-4" /> Kaydedildi</> : <><Save className="w-4 h-4" /> Kaydet</>}
                </motion.button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <h2 className={`font-semibold mb-5 ${isDark ? 'text-white' : 'text-slate-800'}`}>Bildirim Tercihleri</h2>
              <div className="space-y-4">
                {[
                  { key: 'stockAlerts', label: 'Stok Uyarıları', desc: 'Kritik stok seviyelerinde anlık bildirim' },
                  { key: 'orderUpdates', label: 'Sipariş Güncellemeleri', desc: 'Yeni sipariş ve durum değişikliği bildirimleri' },
                  { key: 'shipmentAlerts', label: 'Kargo Bildirimleri', desc: 'Sevkiyat gecikmesi ve teslim güncellemeleri' },
                  { key: 'aiInsights', label: 'AI Öngörüleri', desc: 'Önemli iş içgörüleri ve AI tavsiyeleri' },
                  { key: 'weeklyReport', label: 'Haftalık Rapor', desc: 'Her Pazartesi özet performans raporu' },
                  { key: 'marketplaceSync', label: 'Pazaryeri Senkronizasyonu', desc: 'Trendyol, Hepsiburada, N11 sync bildirimleri' },
                ].map(item => (
                  <div key={item.key} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-100 bg-slate-50'}`}>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.label}</div>
                      <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifications] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'bg-emerald-500'
                          : isDark ? 'bg-slate-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    saved ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {saved ? <><CheckCircle className="w-4 h-4" /> Kaydedildi</> : <><Save className="w-4 h-4" /> Tercihleri Kaydet</>}
                </motion.button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>DigiCoBig Pro Plan</h2>
                  <div className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Aktif — Sonraki yenileme: 15 Haziran 2026</div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-sm font-semibold ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                  Aktif
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {planFeatures.map(f => (
                  <div key={f} className={`flex items-center gap-2.5 p-3 rounded-xl ${isDark ? 'bg-slate-700/40' : 'bg-slate-50'}`}>
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{f}</span>
                  </div>
                ))}
              </div>
              <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/20' : 'border-slate-200 bg-slate-50'}`}>
                <div>
                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Aylık ücret</div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>KDV dahil</div>
                </div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>₺1.490 <span className="text-sm font-normal text-slate-400">/ay</span></div>
              </div>
            </Card>

            <Card>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Ödeme Geçmişi</h3>
              <div className="space-y-2">
                {[
                  { date: '15 Mayıs 2026', amount: '₺1.490', status: 'Ödendi' },
                  { date: '15 Nisan 2026', amount: '₺1.490', status: 'Ödendi' },
                  { date: '15 Mart 2026', amount: '₺1.490', status: 'Ödendi' },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{row.date}</span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.amount}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>{row.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
