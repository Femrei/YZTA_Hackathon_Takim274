import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Save, CheckCircle, Lock } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSME } from '../../contexts/SMEContext';

type Tab = 'profile' | 'notifications' | 'security';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Kişisel Bilgiler', icon: User },
  { key: 'notifications', label: 'Bildirimler', icon: Bell },
  { key: 'security', label: 'Güvenlik', icon: Shield },
];

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

export function AyarlarCalisan() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { theme } = useSME();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+90 532 111 22 33',
    department: 'Depo & Lojistik',
    startDate: '15 Ocak 2025',
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const [notifs, setNotifs] = useState({
    taskAssigned: true,
    taskReminder: true,
    stockAlert: true,
    shiftUpdate: false,
    systemUpdate: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const SaveButton = () => (
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
  );

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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${theme.primary}`}>
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{profile.name}</h2>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{profile.department}</div>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                    Çalışan
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Ad Soyad" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                <Field label="E-posta" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} type="email" />
                <Field label="Telefon" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} />
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Departman</label>
                  <div className={`px-4 py-2.5 rounded-xl border text-sm ${isDark ? 'bg-slate-700/50 border-slate-600 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    {profile.department}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>İşe Başlama Tarihi</label>
                  <div className={`px-4 py-2.5 rounded-xl border text-sm ${isDark ? 'bg-slate-700/50 border-slate-600 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    {profile.startDate}
                  </div>
                </div>
              </div>
              <SaveButton />
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
                  { key: 'taskAssigned', label: 'Yeni Görev Atandı', desc: 'Sana yeni bir görev atandığında bildirim al' },
                  { key: 'taskReminder', label: 'Görev Hatırlatıcı', desc: '30 dakika önce deadline hatırlatması' },
                  { key: 'stockAlert', label: 'Stok Uyarısı', desc: 'Kritik stok uyarıları için anlık bildirim' },
                  { key: 'shiftUpdate', label: 'Vardiya Güncellemesi', desc: 'Vardiya değişikliği bildirimleri' },
                  { key: 'systemUpdate', label: 'Sistem Güncellemeleri', desc: 'Platform yenilikleri ve duyuruları' },
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
              <SaveButton />
            </Card>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <Lock className="w-5 h-5 text-slate-400" />
                <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Şifre Değiştir</h2>
              </div>
              <div className="space-y-4 max-w-md">
                <Field label="Mevcut Şifre" value={passwords.current} onChange={v => setPasswords(p => ({ ...p, current: v }))} type="password" placeholder="••••••••" />
                <Field label="Yeni Şifre" value={passwords.new} onChange={v => setPasswords(p => ({ ...p, new: v }))} type="password" placeholder="••••••••" />
                <Field label="Yeni Şifre (Tekrar)" value={passwords.confirm} onChange={v => setPasswords(p => ({ ...p, confirm: v }))} type="password" placeholder="••••••••" />
              </div>
              <div className={`mt-5 p-4 rounded-xl ${isDark ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-100'}`}>
                <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  Şifreniz en az 8 karakter olmalı ve bir büyük harf ile rakam içermelidir.
                </p>
              </div>
              <SaveButton />
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
