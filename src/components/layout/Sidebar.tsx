import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Truck, ShoppingCart, BarChart3,
  Settings, Users, CheckSquare, Bell, BookOpen,
  LogOut, ChevronLeft, ChevronRight, Cpu, User,
  BrainCircuit, HeartHandshake, ListOrdered,
} from 'lucide-react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSME } from '../../contexts/SMEContext';

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  dividerBefore?: boolean;
}

const adminNav: NavItem[] = [
  { key: 'dashboard', label: 'Gösterge Paneli', icon: LayoutDashboard, path: '/admin' },
  { key: 'stok', label: 'Stok Yönetimi', icon: Package, path: '/admin/stok' },
  { key: 'lojistik', label: 'Lojistik', icon: Truck, path: '/admin/lojistik' },
  { key: 'siparisler', label: 'Siparişler', icon: ShoppingCart, path: '/admin/siparisler' },
  { key: 'musteriler', label: 'Müşteriler', icon: Users, path: '/admin/musteriler' },
  { key: 'raporlar', label: 'Raporlar', icon: BarChart3, path: '/admin/raporlar' },
  { key: 'uzman-ai', label: 'Uzman AI', icon: BrainCircuit, path: '/admin/uzman-ai', dividerBefore: true },
  { key: 'ayarlar', label: 'Ayarlar', icon: Settings, path: '/admin/ayarlar' },
];

const employeeNav: NavItem[] = [
  { key: 'gorevler', label: 'Görevler', icon: CheckSquare, path: '/calisan' },
  { key: 'stok', label: 'Stok Güncelle', icon: Package, path: '/calisan/stok' },
  { key: 'bildirimler', label: 'Bildirimler', icon: Bell, path: '/calisan/bildirimler' },
  { key: 'uzman-ai', label: 'Uzman AI', icon: BrainCircuit, path: '/calisan/uzman-ai', dividerBefore: true },
  { key: 'ayarlar', label: 'Ayarlar', icon: Settings, path: '/calisan/ayarlar' },
];

const customerNav: NavItem[] = [
  { key: 'siparisler', label: 'Siparişlerim', icon: ListOrdered, path: '/musteri' },
  { key: 'katalog', label: 'Ürün Kataloğu', icon: BookOpen, path: '/musteri/katalog' },
  { key: 'ayarlar', label: 'Hesap & Ayarlar', icon: Settings, path: '/musteri/ayarlar' },
];

const navByRole: Record<UserRole, NavItem[]> = {
  admin: adminNav,
  employee: employeeNav,
  customer: customerNav,
  superadmin: [],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { theme } = useSME();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showSupportTooltip, setShowSupportTooltip] = useState(false);

  if (!user || user.role === 'superadmin') return null;

  const items = navByRole[user.role] ?? [];

  const isActive = (path: string) => {
    const exactRoots = ['/admin', '/calisan', '/musteri'];
    if (exactRoots.includes(path)) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative flex-shrink-0" style={{ width: collapsed ? 72 : 256 }}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 h-screen flex flex-col border-r overflow-hidden z-20 ${
          isDark ? 'bg-slate-900/95 border-slate-700 backdrop-blur-xl' : 'bg-white/95 border-slate-200 backdrop-blur-xl'
        }`}
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.06)' }}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 py-5 border-b flex-shrink-0 cursor-pointer ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
          onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'employee' ? '/calisan' : '/musteri')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <div className={`font-bold text-base leading-none tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>DigiCo</div>
                <div className="text-xs text-slate-400 mt-0.5 whitespace-nowrap">
                  {user.companyName || 'KOBİ Operasyonel Otopilotu'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Industry badge */}
        {!collapsed && (
          <div className={`px-4 py-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${theme.primaryLight}`}>
              <span className="text-sm">{theme.icon}</span>
              <span className={`text-xs font-medium ${theme.primaryText}`}>{theme.label}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isAIItem = item.key === 'uzman-ai';
            return (
              <div key={item.key}>
                {item.dividerBefore && (
                  <div className={`my-2 mx-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />
                )}
                <Link
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 mb-0.5 ${
                    active
                      ? isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-800'
                      : isAIItem
                        ? isDark ? 'text-amber-400 hover:bg-amber-900/20' : 'text-amber-700 hover:bg-amber-50'
                        : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    active
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : isAIItem
                        ? 'text-amber-500'
                        : ''
                  }`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom: Teknik Destek (admin only) + User + Logout */}
        <div className={`border-t px-2 py-3 space-y-1 flex-shrink-0 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          {user.role === 'admin' && (
            <div className="relative">
              <Link
                to="/admin/teknik-destek"
                onMouseEnter={() => setShowSupportTooltip(true)}
                onMouseLeave={() => setShowSupportTooltip(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm mb-1 ${
                  isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-blue-400' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <HeartHandshake className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                      Teknik Destek
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              {collapsed && showSupportTooltip && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none">
                  Teknik Destek
                </div>
              )}
            </div>
          )}

          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${theme.primary}`}>
              <User className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0 overflow-hidden">
                  <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</div>
                  <div className="text-xs text-slate-400 truncate">{user.email}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {t('logout')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={`fixed top-1/2 -translate-y-1/2 z-30 w-6 h-6 rounded-full border flex items-center justify-center shadow-md transition-all ${
          isDark ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
        }`}
        style={{ left: collapsed ? 72 - 12 : 256 - 12 }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </div>
  );
}
