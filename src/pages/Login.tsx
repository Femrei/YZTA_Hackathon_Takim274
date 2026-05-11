import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Zap, Shield, ChevronRight, ChevronLeft,
  Users, Wheat, Wrench, Code, Building2, Loader2
} from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { SMEType, smeThemes } from '../contexts/SMEContext';

type DemoCategory = 'admin' | 'employee' | 'customer' | 'superadmin' | null;
type AuthMode = 'login' | 'register';
type RegisterRole = 'admin' | 'employee' | 'customer';

interface DemoOption {
  key: string;
  label: string;
  sublabel: string;
  email: string;
  route: string;
  industryType: SMEType;
}

// ── Role → Route mapping ────────────────────────────────────────────────────
const roleRoutes: Record<UserRole, string> = {
  admin: '/admin',
  employee: '/calisan',
  customer: '/musteri',
  superadmin: '/super-admin',
};

const demoCategories: { key: DemoCategory; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { key: 'admin',      label: 'Yönetici Girişi',   desc: 'DigiCoBig Pilot Panel',  icon: Users,  color: 'from-slate-700 to-slate-900' },
  { key: 'employee',   label: 'Çalışan Girişi',    desc: 'Operasyonel Panel',       icon: Wrench, color: 'from-emerald-600 to-teal-700' },
  { key: 'customer',   label: 'Müşteri Girişi',    desc: 'Şeffaflık Merkezi',       icon: Wheat,  color: 'from-blue-600 to-blue-800' },
  { key: 'superadmin', label: 'Geliştirici Paneli', desc: 'SuperAdmin Yönetimi',    icon: Code,   color: 'from-red-700 to-red-900' },
];

const industryOptions: Record<'admin' | 'employee', DemoOption[]> = {
  admin: [
    { key: 'agr', label: 'Tarım & Kooperatif',    sublabel: 'Ege Kooperatifi — İzmir', email: 'tarimyonetici@gmail.com',    route: '/admin',   industryType: 'agriculture' },
    { key: 'tec', label: 'Teknoloji',              sublabel: 'TechStart İzmir A.Ş.',   email: 'tekyonetici@gmail.com',      route: '/admin',   industryType: 'technology' },
    { key: 'hnd', label: 'El Sanatları',           sublabel: 'Kapadokya El Sanatları', email: 'elsanatyonetici@gmail.com',  route: '/admin',   industryType: 'handcraft' },
  ],
  employee: [
    { key: 'agr', label: 'Tarım Çalışanı',        sublabel: 'Ege Kooperatifi — Saha Ekibi',   email: 'tarimcalisan@gmail.com',   route: '/calisan', industryType: 'agriculture' },
    { key: 'tec', label: 'Teknoloji Çalışanı',    sublabel: 'TechStart — Operasyon Ekibi',    email: 'tekcalisan@gmail.com',     route: '/calisan', industryType: 'technology' },
    { key: 'hnd', label: 'El Sanatları Çalışanı', sublabel: 'Kapadokya — Atölye Ekibi',       email: 'elsanatcalisan@gmail.com', route: '/calisan', industryType: 'handcraft' },
  ],
};

// Yönetici kaydında industryType seçimi için seçenekler
const industryTypes: { value: SMEType; label: string }[] = [
  { value: 'agriculture', label: 'Tarım & Kooperatif' },
  { value: 'technology',  label: 'Teknoloji' },
  { value: 'handcraft',   label: 'El Sanatları' },
  { value: 'general',     label: 'Diğer' },
];

export function Login() {
  const { login, register } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [authMode, setAuthMode]         = useState<AuthMode>('login');
  const [registerRole, setRegisterRole] = useState<RegisterRole>('customer');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [fullName, setFullName]         = useState('');
  const [companyName, setCompanyName]   = useState('');
  const [businessCode, setBusinessCode] = useState('');
  const [industryType, setIndustryType] = useState<SMEType>('agriculture');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [showDemoModal, setShowDemoModal]   = useState(false);
  const [activeCategory, setActiveCategory] = useState<DemoCategory>(null);

  // ── Giriş / Kayıt submit ──────────────────────────────────────────────────
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (authMode === 'login') {
        if (!email || !password) { addToast('Lütfen e-posta ve şifre girin.', 'error'); return; }

        const loggedUser = await login(email, password);
        addToast('Giriş başarılı!', 'success');
        navigate(roleRoutes[loggedUser.role]);   // ← role'e göre yönlendir

      } else {
        // ── Kayıt validasyonu ──────────────────────────────────────────────
        if (!email || !password || !fullName) {
          addToast('Lütfen tüm zorunlu alanları doldurun.', 'error'); return;
        }
        if (password.length < 6) {
          addToast('Şifre en az 6 karakter olmalıdır.', 'error'); return;
        }
        if (registerRole === 'employee' && !businessCode.trim()) {
          addToast('Çalışan kaydı için şirket kodu zorunludur.', 'error'); return;
        }
        if (registerRole === 'admin' && !companyName.trim()) {
          addToast('Şirket adı zorunludur.', 'error'); return;
        }

        const newUser = await register({
          email,
          password,
          name: fullName,
          role: registerRole,
          industryType: registerRole === 'admin' ? industryType : 'general',
          companyId: registerRole === 'employee' ? businessCode.trim() : undefined,
          companyName: registerRole === 'admin' ? companyName.trim() : undefined,
        });

        addToast('Kayıt başarılı! Yönlendiriliyorsunuz...', 'success');
        navigate(roleRoutes[newUser.role]);
      }
    } catch (err: any) {
      // Firebase hata kodlarını Türkçeye çevir
      const msg = firebaseErrorTR(err.code) || err.message || 'Bir hata oluştu.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Demo girişi ───────────────────────────────────────────────────────────
  const handleSelectUser = async (email: string, route: string) => {
    setShowDemoModal(false);
    setActiveCategory(null);
    setSubmitting(true);
    try {
      await login(email, '123456');
      addToast('Demo girişi başarılı!', 'success');
      navigate(route);
    } catch {
      addToast('Demo hesabına girilemedi. Firebase\'de kullanıcı oluşturulduğundan emin olun.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomerLogin   = () => handleSelectUser('musteri@gmail.com', '/musteri');
  const handleSuperAdminLogin = () => handleSelectUser('admin@digicobig.com', '/super-admin');
  const closeDemoModal = () => { setShowDemoModal(false); setActiveCategory(null); };

  // ── Kayıt formunda tab değişince alanları sıfırla ─────────────────────────
  const switchRegisterRole = (role: RegisterRole) => {
    setRegisterRole(role);
    setBusinessCode('');
    setCompanyName('');
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Sol Panel ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500 rounded-full opacity-10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-16">
            <img src="/DigiCoBigLogo.png" alt="DigiCoBig" className="w-20 h-20 object-contain" />
            <div>
              <div className="text-white font-bold text-3xl tracking-tight">DigiCoBig</div>
              <div className="text-slate-400 text-sm">KOBİ Operasyonel Otopilotu</div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            İşletmenizi<br />
            <span className="text-emerald-400">Akıllı Otomasyon</span><br />
            ile Güçlendirin
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Yapay zeka destekli stok yönetimi, lojistik takibi ve müşteri ilişkileri tek platformda.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4">
          {[
            { icon: Zap,    title: 'AI Stok Tahmini',  desc: 'Talep öngörüsüyle sıfır stok sorunu' },
            { icon: Shield, title: 'Rol Hiyerarşisi',  desc: 'Kontrollü işletme ve personel erişimi' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4 bg-white/5 backdrop-blur rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">{item.title}</div>
                <div className="text-slate-400 text-xs">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sağ Panel ──────────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col items-center justify-center p-8 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {language === 'tr' ? 'EN' : 'TR'}
          </button>
          <button onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {authMode === 'login' ? 'Hoşgeldiniz' : 'Sisteme Katılın'}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {authMode === 'login' ? 'İşletmenizi akıllı otomasyon ile güçlendirin.' : 'Hesabınızı oluşturup hemen başlayın.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">

            {/* ── Kayıt Alanları ───────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {authMode === 'register' && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {/* Rol seçimi */}
                  <div className="grid grid-cols-3 gap-2">
                    {(['customer', 'admin', 'employee'] as RegisterRole[]).map((role) => (
                      <button key={role} type="button" onClick={() => switchRegisterRole(role)}
                        className={`py-2 px-1 rounded-lg text-[11px] font-bold border transition-all ${
                          registerRole === role
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                            : isDark ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}>
                        {role === 'admin' ? 'YÖNETİCİ' : role === 'employee' ? 'ÇALIŞAN' : 'MÜŞTERİ'}
                      </button>
                    ))}
                  </div>

                  {/* Ad Soyad */}
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Ad Soyad"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                    }`} />

                  {/* Yönetici: Şirket Adı + Sektör */}
                  {registerRole === 'admin' && (
                    <>
                      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                        placeholder="Şirket / Kooperatif Adı"
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                        }`} />
                      <select value={industryType} onChange={e => setIndustryType(e.target.value as SMEType)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}>
                        {industryTypes.map(it => (
                          <option key={it.value} value={it.value}>{it.label}</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg">
                        ⚠️ Yönetici kaydı için e-postanızın sisteme eklenmiş olması gerekir.
                      </p>
                    </>
                  )}

                  {/* Çalışan: Şirket Kodu */}
                  {registerRole === 'employee' && (
                    <>
                      <div className="relative">
                        <input type="text" value={businessCode} onChange={e => setBusinessCode(e.target.value.toUpperCase())}
                          placeholder="Şirket Kodu (örn: DIGI2026)"
                          className="w-full px-4 py-3 pr-11 rounded-xl border border-blue-400/60 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 bg-blue-500/5 text-blue-600 font-mono placeholder-blue-400/60 transition-all" />
                        <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 px-1">
                        Şirket kodunu yöneticinizden alın. Bu kod olmadan kayıt oluşturamazsınız.
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* E-posta */}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
              }`} />

            {/* Şifre */}
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`} />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-sm shadow-lg transition-all bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {authMode === 'login' ? t('loginButton') : 'Kayıt Ol'}
            </button>
          </form>

          {/* Alt linkler */}
          <div className="mt-5 flex flex-col gap-3">
            <button onClick={() => { setAuthMode(m => m === 'login' ? 'register' : 'login'); setEmail(''); setPassword(''); }}
              className="text-sm font-medium text-slate-500 hover:text-emerald-500 transition-colors text-center">
              {authMode === 'login' ? 'Hesabınız yok mu? Yeni kayıt oluşturun' : 'Zaten üye misiniz? Giriş yapın'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
              </div>
              <div className="relative flex justify-center">
                <span className={`text-[10px] uppercase font-bold text-slate-400 px-2 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  veya demo ile dene
                </span>
              </div>
            </div>

            <button onClick={() => setShowDemoModal(true)} disabled={submitting}
              className="w-full py-3 rounded-xl border-2 border-emerald-500/30 text-emerald-500 font-semibold text-sm hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
              <Zap className="w-4 h-4" />
              {t('demoLogin')}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Demo Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={closeDemoModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
              onClick={e => e.stopPropagation()}>

              <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <AnimatePresence mode="wait">
                  {activeCategory ? (
                    <motion.button key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setActiveCategory(null)}
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Geri
                    </motion.button>
                  ) : (
                    <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>Demo Girişi</div>
                      <div className="text-xs text-slate-500">Gerçek Firebase verileriyle giriş yapın</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {!activeCategory ? (
                    <motion.div key="cats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-2 gap-3">
                      {demoCategories.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <button key={String(cat.key)}
                            onClick={() => {
                              if (cat.key === 'customer')   handleCustomerLogin();
                              else if (cat.key === 'superadmin') handleSuperAdminLogin();
                              else setActiveCategory(cat.key);
                            }}
                            className={`flex flex-col items-start p-4 rounded-xl bg-gradient-to-br ${cat.color} text-white text-left transition-transform hover:scale-[1.02] active:scale-[0.98]`}>
                            <Icon className="w-6 h-6 mb-2 opacity-90" />
                            <div className="font-semibold text-sm">{cat.label}</div>
                            <div className="text-xs opacity-70 mt-0.5">{cat.desc}</div>
                            {(cat.key === 'admin' || cat.key === 'employee') && (
                              <div className="text-xs opacity-40 mt-1">3 sektör seçeneği</div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div key="inds" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                      <div className={`text-xs font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {activeCategory === 'admin' ? 'Yönetici rolü için sektör seçin:' : 'Çalışan rolü için sektör seçin:'}
                      </div>
                      {industryOptions[activeCategory as 'admin' | 'employee'].map(opt => {
                        const theme = smeThemes[opt.industryType];
                        return (
                          <button key={opt.key}
                            onClick={() => handleSelectUser(opt.email, opt.route)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                              isDark ? 'border-slate-700 bg-slate-700/30 hover:bg-slate-700/60' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                            }`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${theme.primaryLight}`}>
                                {theme.icon}
                              </div>
                              <div className="text-left">
                                <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{opt.label}</div>
                                <div className="text-xs text-slate-500">{opt.sublabel}</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </button>
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

// ── Firebase hata mesajlarını Türkçe'ye çevir ─────────────────────────────────
function firebaseErrorTR(code?: string): string | null {
  const map: Record<string, string> = {
    'auth/user-not-found':       'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password':       'Şifre hatalı. Lütfen tekrar deneyin.',
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
    'auth/weak-password':        'Şifre çok zayıf. En az 6 karakter kullanın.',
    'auth/invalid-email':        'Geçersiz e-posta adresi.',
    'auth/too-many-requests':    'Çok fazla deneme. Lütfen biraz bekleyin.',
    'auth/network-request-failed': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
    'auth/invalid-credential':   'E-posta veya şifre hatalı.',
  };
  return code ? (map[code] || null) : null;
}