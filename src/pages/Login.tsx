import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Eye, EyeOff, Zap, Shield, BarChart3, ChevronRight, ChevronLeft, Users, Wheat, Wrench, Code } from 'lucide-react';
import { useAuth, demoUsers, UserRole } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { SMEType, smeThemes } from '../contexts/SMEContext';

type DemoCategory = 'admin' | 'employee' | 'customer' | 'superadmin' | null;

interface DemoOption {
  key: string;
  label: string;
  sublabel: string;
  userKey: string;
  route: string;
  industryType: SMEType;
}

const roleRedirects: Record<UserRole, string> = {
  admin: '/admin',
  employee: '/calisan',
  customer: '/musteri',
  superadmin: '/super-admin',
};

const demoCategories: { key: DemoCategory; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { key: 'admin', label: 'Yönetici Girişi', desc: 'DigiCo Pilot Panel', icon: Users, color: 'from-slate-700 to-slate-900' },
  { key: 'employee', label: 'Çalışan Girişi', desc: 'Operasyonel Panel', icon: Wrench, color: 'from-emerald-600 to-teal-700' },
  { key: 'customer', label: 'Müşteri Girişi', desc: 'Şeffaflık Merkezi', icon: Wheat, color: 'from-blue-600 to-blue-800' },
  { key: 'superadmin', label: 'Geliştirici Paneli', desc: 'SuperAdmin Yönetimi', icon: Code, color: 'from-red-700 to-red-900' },
];

const industryOptions: Record<'admin' | 'employee', DemoOption[]> = {
  admin: [
    { key: 'agr', label: 'Tarım & Kooperatif', sublabel: 'Ege Kooperatifi — İzmir', userKey: 'admin_agriculture', route: '/admin', industryType: 'agriculture' },
    { key: 'tec', label: 'Teknoloji', sublabel: 'TechStart İzmir A.Ş.', userKey: 'admin_technology', route: '/admin', industryType: 'technology' },
    { key: 'hnd', label: 'El Sanatları', sublabel: 'Kapadokya El Sanatları', userKey: 'admin_handcraft', route: '/admin', industryType: 'handcraft' },
  ],
  employee: [
    { key: 'agr', label: 'Tarım Çalışanı', sublabel: 'Ege Kooperatifi — Saha Ekibi', userKey: 'employee_agriculture', route: '/calisan', industryType: 'agriculture' },
    { key: 'tec', label: 'Teknoloji Çalışanı', sublabel: 'TechStart — Operasyon Ekibi', userKey: 'employee_technology', route: '/calisan', industryType: 'technology' },
    { key: 'hnd', label: 'El Sanatları Çalışanı', sublabel: 'Kapadokya — Atölye Ekibi', userKey: 'employee_handcraft', route: '/calisan', industryType: 'handcraft' },
  ],
};

export function Login() {
  const { login } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<DemoCategory>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Kayıt sistemi yakında aktif edilecektir.', 'info');
  };

  const handleSelectUser = (userKey: string, route: string) => {
    const user = demoUsers[userKey];
    if (!user) return;
    setShowDemoModal(false);
    setActiveCategory(null);
    login(user);
    navigate(route);
  };

  const handleCustomerLogin = () => {
    handleSelectUser('customer_general', '/musteri');
  };

  const handleSuperAdminLogin = () => {
    handleSelectUser('superadmin', '/super-admin');
  };

  const closeDemoModal = () => {
    setShowDemoModal(false);
    setActiveCategory(null);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500 rounded-full opacity-10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl tracking-tight">DigiCo</div>
              <div className="text-slate-400 text-xs">KOBİ Operasyonel Otopilotu</div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            İşletmenizi<br />
            <span className="text-emerald-400">Akıllı Otomasyon</span><br />
            ile Güçlendirin
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Yapay zeka destekli stok yönetimi, lojistik takibi ve müşteri ilişkileri tek platformda.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4">
          {[
            { icon: Zap, title: 'AI Stok Tahmini', desc: 'Talep öngörüsüyle sıfır stok sorunu' },
            { icon: Shield, title: 'Güvenli & Güvenilir', desc: 'ISO 27001 sertifikalı altyapı' },
            { icon: BarChart3, title: 'Gerçek Zamanlı Analiz', desc: 'Anlık iş zekası raporları' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-4 bg-white/5 backdrop-blur rounded-xl p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{item.title}</div>
                  <div className="text-slate-400 text-xs">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel */}
      <div className={`flex-1 flex flex-col items-center justify-center p-8 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            {language === 'tr' ? 'EN' : 'TR'}
          </button>
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>DigiCo</div>
          </div>

          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Hoşgeldiniz</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 pr-11 ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}`}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
              {t('loginButton')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={`px-3 ${isDark ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>veya</span>
            </div>
          </div>

          <button
            onClick={() => setShowDemoModal(true)}
            className="w-full py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center gap-2 group"
          >
            <Zap className="w-4 h-4" />
            {t('demoLogin')}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <p className={`text-center text-xs mt-6 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            © 2026 DigiCo · White-Label SaaS Platform
          </p>
        </motion.div>
      </div>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeDemoModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', duration: 0.45 }}
              className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <AnimatePresence mode="wait">
                  {activeCategory ? (
                    <motion.button
                      key="back"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      onClick={() => setActiveCategory(null)}
                      className={`flex items-center gap-1.5 text-sm font-medium ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Geri
                    </motion.button>
                  ) : (
                    <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Demo Girişi</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rol ve sektör seçerek uygulamayı keşfet</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {/* Category selection */}
                  {!activeCategory && (
                    <motion.div
                      key="categories"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-2 gap-3"
                    >
                      {demoCategories.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <motion.button
                            key={cat.key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (cat.key === 'customer') { handleCustomerLogin(); }
                              else if (cat.key === 'superadmin') { handleSuperAdminLogin(); }
                              else { setActiveCategory(cat.key as DemoCategory); }
                            }}
                            className={`flex flex-col items-start p-4 rounded-xl bg-gradient-to-br ${cat.color} text-white text-left group`}
                          >
                            <Icon className="w-6 h-6 mb-2 opacity-90" />
                            <div className="font-semibold text-sm">{cat.label}</div>
                            <div className="text-xs opacity-70 mt-0.5">{cat.desc}</div>
                            {(cat.key === 'admin' || cat.key === 'employee') && (
                              <div className="text-xs opacity-50 mt-1">3 sektör seçeneği</div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Industry options for admin/employee */}
                  {(activeCategory === 'admin' || activeCategory === 'employee') && (
                    <motion.div
                      key="industries"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-2"
                    >
                      <div className={`text-xs font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {activeCategory === 'admin' ? 'Yönetici rolü için sektör seçin:' : 'Çalışan rolü için sektör seçin:'}
                      </div>
                      {industryOptions[activeCategory].map(opt => {
                        const t = smeThemes[opt.industryType];
                        return (
                          <motion.button
                            key={opt.key}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleSelectUser(opt.userKey, opt.route)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? 'border-slate-700 hover:border-slate-500 bg-slate-700/30 hover:bg-slate-700/60' : 'border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${t.primaryLight}`}>
                                {t.icon}
                              </div>
                              <div className="text-left">
                                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{opt.label}</div>
                                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{opt.sublabel}</div>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
