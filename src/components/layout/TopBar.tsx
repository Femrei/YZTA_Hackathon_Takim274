import { Moon, Sun, Globe, Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  title: string;
}

const roleBadge: Record<string, { label: string; color: string }> = {
  admin: { label: 'Yönetici', color: 'bg-slate-700 text-white' },
  employee: { label: 'Çalışan', color: 'bg-emerald-100 text-emerald-800' },
  customer: { label: 'Müşteri', color: 'bg-blue-100 text-blue-800' },
};

// DigiCoBig white-label platform

export function TopBar({ title }: Props) {
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  return (
    <header className={`h-16 flex items-center justify-between px-6 border-b ${
      isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'
    }`}>
      <div>
        <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
            isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          {language.toUpperCase()}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isDark ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
          isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Role Badge */}
        {user && (
          <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${roleBadge[user.role]?.color}`}>
            {roleBadge[user.role]?.label}
          </span>
        )}
      </div>
    </header>
  );
}
